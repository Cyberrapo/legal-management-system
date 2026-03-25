const express = require('express')
const router = express.Router()
const { uploadDocuments, deleteDocument } = require('../controllers/documentController')
const { protect } = require('../middleware/authMiddleware')
const { upload } = require('../config/cloudinary')

router.post('/:caseId/upload', protect, upload.array('documents', 10), uploadDocuments)
router.delete('/:caseId/doc/:docId', protect, deleteDocument)

module.exports = router