const Case = require('../models/Case')

const getCases = async (req, res) => {
  const cases = await Case.find({ lawyer: req.user._id }).sort({ createdAt: -1 })
  res.json(cases)
}

const createCase = async (req, res) => {
  const { title, description, clientName, caseType, hearingDate, hearingTime, hearingNotes } = req.body
  const newCase = await Case.create({
    title, description, clientName, caseType,
    hearingDate, hearingTime, hearingNotes,
    lawyer: req.user._id
  })
  res.status(201).json(newCase)
}

const updateCase = async (req, res) => {
  const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
}

const deleteCase = async (req, res) => {
  await Case.findByIdAndDelete(req.params.id)
  res.json({ message: 'Case deleted' })
}

const getCaseById = async (req, res) => {
  const c = await Case.findById(req.params.id)
  res.json(c)
}

const getUpcomingHearings = async (req, res) => {
  const now = new Date()
  const next7Days = new Date()
  next7Days.setDate(next7Days.getDate() + 7)

  const cases = await Case.find({
    lawyer: req.user._id,
    hearingDate: { $gte: now, $lte: next7Days },
    status: { $ne: 'Closed' }
  }).sort({ hearingDate: 1 })

  res.json(cases)
}

module.exports = { getCases, createCase, updateCase, deleteCase, getCaseById, getUpcomingHearings }