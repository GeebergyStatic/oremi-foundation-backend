const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} = require('@aws-sdk/client-s3');

const { getSignedUrl: awsGetSignedUrl } = require('@aws-sdk/s3-request-presigner');

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

async function uploadFileToR2(fileObj = {}) {
    if (!fileObj) throw new Error('No file object provided');

    const ext =
        path.extname(fileObj.originalname || '') ||
        '.jpg';

    const dest = `events/${Date.now()}-${uuidv4()}${ext}`;

    let body;

    if (fileObj.buffer) {
        body = fileObj.buffer;
    } else if (fileObj.path) {
        body = await fs.readFile(fileObj.path);
    } else {
        throw new Error('No buffer/path found');
    }

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: dest,
        Body: body,
        ContentType: fileObj.mimetype,
    });

    await r2Client.send(command);

    return dest;
}

async function getSignedUrl(filePath, expiresInSeconds = 3600) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
    });

    return await awsGetSignedUrl(r2Client, command, {
        expiresIn: expiresInSeconds,
    });
}

async function deleteFileFromR2(filePath) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
    });

    await r2Client.send(command);
}

module.exports = {
    uploadFileToR2,
    getSignedUrl,
    deleteFileFromR2,
};