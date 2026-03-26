const express = require('express')
const router = express.Router()
const { chat, generateDocument } = require('../controllers/chatController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, chat)
router.post('/generate-document', protect, generateDocument)

module.exports = router