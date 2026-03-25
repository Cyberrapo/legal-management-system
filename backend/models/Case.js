const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  url:        { type: String, required: true },
  publicId:   { type: String, required: true },
  name:       { type: String, required: true },
  fileType:   { type: String, default: 'application/octet-stream' },
  uploadedAt: { type: Date, default: Date.now }
})

const caseSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String },
  clientName:   { type: String, required: true },
  caseType:     { type: String, enum: ['Civil', 'Criminal', 'Family', 'Corporate', 'Other'], default: 'Other' },
  status:       { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
  hearingDate:  { type: Date },
  hearingTime:  { type: String },
  hearingNotes: { type: String },
  lawyer:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documents:    [documentSchema],
}, { timestamps: true })

module.exports = mongoose.model('Case', caseSchema)