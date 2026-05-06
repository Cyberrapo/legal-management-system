const Case = require('../models/Case')
const { cloudinary } = require('../config/cloudinary')

const uploadDocuments = async (req, res) => {
  try {
    const c = await Case.findById(req.params.caseId)
    if (!c) return res.status(404).json({ message: 'Case not found' })
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' })

    const newDocs = req.files.map(file => ({
      url:        file.path,
      publicId:   file.filename,
      name:       file.originalname,
      fileType:   file.mimetype,
      uploadedAt: new Date()
    }))

    const docNames = req.files.map(f => f.originalname).join(', ')
    c.documents.push(...newDocs)
    c.timeline.push({
      action:      'Documents Uploaded',
      description: `${req.files.length} document(s) added: ${docNames}`,
      type:        'document',
      performedBy: req.user?.name || 'Lawyer'
    })
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

    const docName = doc.name

    // Delete from Cloudinary
    try {
      const isVideo = doc.fileType?.startsWith('video/')
      const isImage = doc.fileType?.startsWith('image/')
      const resType = isVideo ? 'video' : isImage ? 'image' : 'raw'
      await cloudinary.uploader.destroy(doc.publicId, {
        resource_type: resType
      })
    } catch (cloudErr) {
      console.log('Cloudinary delete note:', cloudErr.message)
    }

    c.documents.pull({ _id: req.params.docId })
    c.timeline.push({
      action:      'Document Removed',
      description: `Document "${docName}" was removed`,
      type:        'document',
      performedBy: req.user?.name || 'Lawyer'
    })
    await c.save()
    res.json({ message: 'Document deleted', case: c })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { uploadDocuments, deleteDocument }