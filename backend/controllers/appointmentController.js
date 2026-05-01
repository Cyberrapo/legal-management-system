const Appointment = require('../models/Appointment')

const getAppointments = async (req, res) => {
  const appointments = await Appointment.find({ lawyer: req.user._id }).sort({ date: 1 })
  res.json(appointments)
}

const createAppointment = async (req, res) => {
  try {
    const { title, clientName, date, time, notes, status } = req.body

    // ── Validate past date ──
    const selectedDate = new Date(`${date}T${time}`)
    if (selectedDate < new Date()) {
      return res.status(400).json({ message: 'Cannot book an appointment in the past' })
    }

    // ── Check duplicate date + time ──
    const duplicate = await Appointment.findOne({
      lawyer: req.user._id,
      date: new Date(date),
      time: time
    })
    if (duplicate) {
      return res.status(400).json({
        message: `You already have an appointment on this date at ${time}. Please choose a different time.`
      })
    }

    const appt = await Appointment.create({
      title, clientName, date, time, notes, status,
      lawyer: req.user._id
    })
    res.status(201).json(appt)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateAppointment = async (req, res) => {
  try {
    const { date, time } = req.body

    // ── Validate past date ──
    if (date && time) {
      const selectedDate = new Date(`${date}T${time}`)
      if (selectedDate < new Date()) {
        return res.status(400).json({ message: 'Cannot set an appointment in the past' })
      }

      // ── Check duplicate date + time (exclude current appointment) ──
      const duplicate = await Appointment.findOne({
        lawyer: req.user._id,
        date: new Date(date),
        time: time,
        _id: { $ne: req.params.id }
      })
      if (duplicate) {
        return res.status(400).json({
          message: `You already have an appointment on this date at ${time}. Please choose a different time.`
        })
      }
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    )
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const deleteAppointment = async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id)
  res.json({ message: 'Appointment deleted' })
}

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment }