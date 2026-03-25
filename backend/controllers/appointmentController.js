const Appointment = require('../models/Appointment');

const getAppointments = async (req, res) => {
  const appointments = await Appointment.find({ lawyer: req.user._id }).sort({ date: 1 });
  res.json(appointments);
};

const createAppointment = async (req, res) => {
  const { title, clientName, date, time, notes } = req.body;
  const appt = await Appointment.create({ title, clientName, date, time, notes, lawyer: req.user._id });
  res.status(201).json(appt);
};

const updateAppointment = async (req, res) => {
  const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

const deleteAppointment = async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: 'Appointment deleted' });
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };