const Case = require('../models/Case')
const { cloudinary } = require('../config/cloudinary')

const uploadDocuments = async (req, res) => {
  try {
    const c = await Case.findById(req.params.caseId)
    if (!c) return res.status(404).json({ message: 'Case not found' })

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' })

    const newDocs = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      name: file.originalname,
      fileType: file.mimetype,
      uploadedAt: new Date()
    }))

    c.documents.push(...newDocs)
    await c.save()
    res.json(c)
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ message: err.message })
  }
}

const deleteDocument = async (req, res) => {
  try {
    const c = await Case.findById(req.params.caseId)
    if (!c) return res.status(404).json({ message: 'Case not found' })

    const doc = c.documents.id(req.params.docId)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    await cloudinary.uploader.destroy(doc.publicId)
    c.documents.pull({ _id: req.params.docId })
    await c.save()
    res.json({ message: 'Document deleted', case: c })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { uploadDocuments, deleteDocument }