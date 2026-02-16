const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const validateFile = require('../middleware/fileValidation');
const { Attachment, Decision } = require('../models');

// Mock Auth Middleware
const authenticateUser = (req, res, next) => {
    // Reverted to mock auth as login feature was removed
    if (!req.user) {
        req.user = { id: '00000000-0000-0000-0000-000000000000', name: 'Anonymous' };
    }
    next();
};

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'decivue/attachments',
        resource_type: 'auto',
    },
});

const upload = multer({
    storage: storage,
    fileFilter: validateFile,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload Attachment
router.post('/decisions/:id/attachments', authenticateUser, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            const status = err.http_code || 500;
            const message = err.message || 'File upload failed at storage provider';
            return res.status(status).json({
                success: false,
                error: "Upload failed",
                message: message,
                details: err.http_code === 401 ? 'Cloudinary credentials are invalid. Please check your .env file.' : err.message
            });
        }
        next();
    });
}, async (req, res) => {
    try {
        const decisionId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type' });
        }

        const newAttachment = await Attachment.create({
            decision_id: decisionId,
            file_name: req.file.originalname,
            file_url: req.file.path,
            public_id: req.file.filename,
            resource_type: req.file.mimetype.split('/')[0],
            file_size: req.file.size,
            uploaded_by: req.user.id
        });

        res.status(201).json({
            success: true,
            data: newAttachment
        });

    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ success: false, error: "Database save failed", message: err.message });
    }
});

// Get Attachments for a Decision
router.get('/decisions/:id/attachments', authenticateUser, async (req, res) => {
    try {
        const decisionId = req.params.id;
        const attachments = await Attachment.findAll({
            where: { decision_id: decisionId },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: attachments
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch attachments" });
    }
});

// Delete Attachment
router.delete('/attachments/:attachmentId', authenticateUser, async (req, res) => {
    try {
        const attachment = await Attachment.findByPk(req.params.attachmentId);

        if (!attachment) {
            return res.status(404).json({ success: false, message: "Attachment not found" });
        }

        // Authorization check (Owner or Admin)
        // if (attachment.uploaded_by !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(403).json({ error: "Unauthorized" });
        // }

        // Remove from Cloudinary
        await cloudinary.uploader.destroy(attachment.public_id, {
            resource_type: attachment.resource_type === 'image' ? 'image' : 'raw'
        });

        // Remove from DB
        await attachment.destroy();

        res.json({ success: true, message: "Deleted successfully" });

    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ success: false, error: "Delete failed" });
    }
});

module.exports = router;
