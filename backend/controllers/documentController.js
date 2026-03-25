const Case = require('../models/Case');
const { cloudinary } = require('../config/cloudinary');

const uploadDocument = async (req, res) => {
  const c = await Case.findById(req.params.caseId);
  if (!c) return res.status(404).json({ message: 'Case not found' });
  c.documents.push({ url: req.file.path, publicId: req.file.filename, name: req.file.originalname });
  await c.save();
  res.json(c);
};

const deleteDocument = async (req, res) => {
  const c = await Case.findById(req.params.caseId);
  const doc = c.documents.id(req.params.docId);
  await cloudinary.uploader.destroy(doc.publicId);
  doc.remove();
  await c.save();
  res.json({ message: 'Document deleted' });
};

module.exports = { uploadDocument, deleteDocument };