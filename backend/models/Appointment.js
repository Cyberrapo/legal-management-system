const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  clientName:  { type: String, required: true },
  date:        { type: Date, required: true },
  time:        { type: String, required: true },
  status:      { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  notes:       { type: String },
  lawyer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);