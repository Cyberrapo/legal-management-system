const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  clientName:  { type: String, required: true },
  caseType:    { type: String, enum: ['Civil', 'Criminal', 'Family', 'Corporate', 'Other'], default: 'Other' },
  status:      { type: String, enum: ['Open', 'In Progress', 'Closed'], default: 'Open' },
  lawyer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documents:   [{ url: String, publicId: String, name: String }],
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);