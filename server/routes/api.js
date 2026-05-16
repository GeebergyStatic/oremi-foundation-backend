// my-app/server/routes/api.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  uploadFileToR2,
  getSignedUrl,
  deleteFileFromR2
} = require('../utils/uploadToR2');

const uri = process.env.uri;

// =========================
// CONNECT TO MONGODB
// =========================

async function connectToMongoDB() {

  try {

    await mongoose.connect(uri);

    console.log('Connected to MongoDB');

  } catch (error) {

    console.error('Error connecting to MongoDB', error);
  }
}

connectToMongoDB();

// =========================
// MULTER
// =========================

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({

  storage: multer.diskStorage({

    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },

    filename: function (req, file, cb) {

      const uniqueName =
        Date.now() +
        '-' +
        Math.round(Math.random() * 1E9) +
        path.extname(file.originalname);

      cb(null, uniqueName);
    }
  }),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 30
  },

  fileFilter: (req, file, cb) => {

    if (!file.mimetype.startsWith('image/')) {

      return cb(
        new Error('Only image uploads are allowed'),
        false
      );
    }

    cb(null, true);
  }
});

// =========================
// EVENT SCHEMA
// =========================

const eventSchema = new mongoose.Schema({

  description: {
    type: String,
    required: true
  },

  // stores R2 FILE PATHS
  images: [{
    type: String
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Event = mongoose.model('Event', eventSchema);

// =========================
// ADMIN LOGIN
// =========================

router.post('/oremi-admin-login', async (req, res) => {

  try {

    const { email, password } = req.body;

    if (
      email !== process.env.OREMI_ADMIN_EMAIL ||
      password !== process.env.OREMI_ADMIN_PASSWORD
    ) {

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      userId: 'oremi-admin'
    });

  } catch (err) {

    console.error('Login error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// =========================
// UPLOAD NEW EVENT
// =========================

router.post(
  '/upload-events',
  upload.array('images'),
  async (req, res) => {

    try {

      const { description } = req.body;

      if (!description) {

        return res.status(400).json({
          error: 'Description is required'
        });
      }

      if (!req.files || !req.files.length) {

        return res.status(400).json({
          error: 'No images uploaded'
        });
      }

      const uploadedImages = [];

      for (const file of req.files) {

        try {

          const filePath = await uploadFileToR2(file);

          uploadedImages.push(filePath);

          // cleanup temp file
          fs.unlinkSync(file.path);

        } catch (uploadErr) {

          console.error(
            'R2 Upload Error:',
            uploadErr
          );
        }
      }

      const newEvent = new Event({
        description,
        images: uploadedImages
      });

      await newEvent.save();

      res.status(201).json({
        success: true,
        message: 'Event uploaded successfully'
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });
    }
  }
);
// =========================
// RETRIEVE EVENTS
// =========================

router.get('/retrieve-events', async (req, res) => {

  try {

    const events = await Event.find()
      .sort({ _id: -1 });

    const formattedEvents = await Promise.all(

      events.map(async (event) => {

        const signedImages = await Promise.all(

          event.images.map(async (imgPath) => {

            return await getSignedUrl(imgPath);
          })
        );

        return {
          ...event.toObject(),

          // signed URLs for frontend display
          images: signedImages,

          // original R2 paths for deletion
          imagePaths: event.images
        };
      })
    );

    res.json(formattedEvents);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =========================
// EDIT DESCRIPTION
// =========================

router.post('/edit-event', async (req, res) => {

  try {

    const {
      eventId,
      newDescription
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {

      return res.status(404).json({
        message: 'Event not found'
      });
    }

    event.description = newDescription;

    await event.save();

    res.json({
      success: true,
      message: 'Description updated'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =========================
// DELETE SINGLE IMAGE
// =========================

router.post('/delete-image', async (req, res) => {

  try {

    const {
      eventId,
      imagePath
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {

      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // DELETE FROM R2
    await deleteFileFromR2(imagePath);

    // REMOVE FROM MONGODB
    event.images = event.images.filter(
      img => img !== imagePath
    );

    await event.save();

    res.json({
      success: true,
      message: 'Image deleted'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =========================
// DELETE ENTIRE EVENT
// =========================

router.delete('/delete-event', async (req, res) => {

  try {

    const { eventId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {

      return res.status(404).json({
        message: 'Event not found'
      });
    }

    // DELETE ALL IMAGES FROM R2
    for (const imagePath of event.images) {

      try {

        await deleteFileFromR2(imagePath);

      } catch (err) {

        console.error(
          'Failed to delete image from R2:',
          imagePath
        );
      }
    }

    // DELETE EVENT
    await Event.findByIdAndDelete(eventId);

    res.json({
      success: true,
      message: 'Event deleted'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// =========================
// ADD MORE IMAGES
// =========================

router.post(
  '/add-images',
  upload.array('images'),
  async (req, res) => {

    try {

      const { eventId } = req.body;

      if (!eventId) {

        return res.status(400).json({
          error: 'Event ID required'
        });
      }

      if (!req.files || !req.files.length) {

        return res.status(400).json({
          error: 'No images uploaded'
        });
      }

      const event = await Event.findById(eventId);

      if (!event) {

        return res.status(404).json({
          error: 'Event not found'
        });
      }

      const uploadedImages = [];

      for (const file of req.files) {

        const filePath = await uploadFileToR2(file);

        uploadedImages.push(filePath);

        // cleanup temp file
        fs.unlinkSync(file.path);
      }

      event.images.push(...uploadedImages);

      await event.save();

      res.json({
        success: true,
        message: 'Images added successfully'
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: err.message
      });
    }
  }
);

router.use((err, req, res, next) => {

  console.error(err);

  if (err instanceof multer.MulterError) {

    if (err.code === 'LIMIT_FILE_SIZE') {

      return res.status(400).json({
        error: 'One or more files exceed 10MB'
      });
    }

    return res.status(400).json({
      error: err.message
    });
  }

  res.status(500).json({
    error: err.message
  });
});

module.exports = router;