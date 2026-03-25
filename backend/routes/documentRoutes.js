const express = require('express');
const router = express.Router();
const { uploadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/:caseId/upload', protect, upload.single('document'), uploadDocument);
router.delete('/:caseId/doc/:docId', protect, deleteDocument);

module.exports = router;