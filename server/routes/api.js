// my-app/server/routes/api.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const multer = require('multer');

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

const upload = multer({
  storage: multer.memoryStorage(),
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

        const filePath = await uploadFileToR2(file);

        uploadedImages.push(filePath);
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

      const event = await Event.findById(eventId);

      if (!event) {

        return res.status(404).json({
          message: 'Event not found'
        });
      }

      if (!req.files || !req.files.length) {

        return res.status(400).json({
          error: 'No images uploaded'
        });
      }

      const uploadedImages = [];

      for (const file of req.files) {

        const filePath = await uploadFileToR2(file);

        uploadedImages.push(filePath);
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

module.exports = router;