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
    const isPDF = file.mimetype === 'application/pdf'
    return {
      folder: 'legal-docs',
      allowed_formats: ['jpg', 'png', 'pdf', 'docx'],
      resource_type: isPDF ? 'raw' : 'image',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    }
  }
})

const upload = multer({ storage })
module.exports = { cloudinary, upload }