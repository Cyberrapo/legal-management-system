const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isRaw = file.mimetype.includes('wordprocessing') || 
                  file.mimetype.includes('spreadsheet') ||
                  file.mimetype.includes('presentation') ||
                  file.mimetype.includes('text') ||
                  file.originalname.endsWith('.docx') ||
                  file.originalname.endsWith('.doc')
    return {
      folder: 'legal-docs',
      resource_type: isRaw ? 'raw' : 'auto',
      public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')}`,
    }
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

module.exports = { cloudinary, upload }