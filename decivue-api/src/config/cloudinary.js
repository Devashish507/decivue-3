const cloudinary = require("cloudinary").v2;

const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (!isConfigured) {
    console.warn('⚠️ Cloudinary credentials are missing in .env. File uploads will fail.');
}

cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
});

module.exports = cloudinary;
