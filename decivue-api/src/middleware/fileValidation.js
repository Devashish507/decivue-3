const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

module.exports = function validateFile(req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Allowed: PDF, JPEG, PNG, DOC, DOCX"), false);
    }

    // Size limit checked by multer limits, but added here for double safety if needed
    // Molter handles this better via 'limits' option in its own config

    cb(null, true);
};
