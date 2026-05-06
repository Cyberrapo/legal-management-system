const Case = require('../models/Case')

const getCases = async (req, res) => {
  try {
    const cases = await Case.find({ lawyer: req.user._id }).sort({ createdAt: -1 })
    res.json(cases)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const createCase = async (req, res) => {
  try {
    const { title, description, clientName, caseType,
            hearingDate, hearingTime, hearingNotes } = req.body

    if (!title || !clientName)
      return res.status(400).json({ message: 'Title and client name are required' })

    if (hearingDate) {
      const hDate = hearingTime
        ? new Date(`${hearingDate}T${hearingTime}`)
        : new Date(hearingDate)
      const now = new Date()
      if (!hearingTime) now.setHours(0, 0, 0, 0)
      if (hDate < now)
        return res.status(400).json({ message: 'Hearing date cannot be in the past' })
    }

    const newCase = await Case.create({
      title, description, clientName, caseType,
      hearingDate: hearingDate || undefined,
      hearingTime: hearingTime || undefined,
      hearingNotes: hearingNotes || undefined,
      lawyer: req.user._id,
      timeline: [{
        action:      'Case Created',
        description: `Case "${title}" was created for client ${clientName}`,
        type:        'created',
        performedBy: req.user.name
      }]
    })
    res.status(201).json(newCase)
  } catch (err) {
    console.error('Create case error:', err)
    res.status(500).json({ message: err.message })
  }
}

const updateCase = async (req, res) => {
  try {
    const existing = await Case.findById(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Case not found' })

    if (req.body.hearingDate) {
      const hDate = req.body.hearingTime
        ? new Date(`${req.body.hearingDate}T${req.body.hearingTime}`)
        : new Date(req.body.hearingDate)
      const now = new Date()
      if (!req.body.hearingTime) now.setHours(0, 0, 0, 0)
      if (hDate < now)
        return res.status(400).json({ message: 'Hearing date cannot be in the past' })
    }

    const timelineEntries = []

    if (req.body.status && req.body.status !== existing.status) {
      timelineEntries.push({
        action:      'Status Changed',
        description: `Status changed from "${existing.status}" to "${req.body.status}"`,
        type:        'status',
        performedBy: req.user.name
      })
    }

    if (req.body.hearingDate &&
        req.body.hearingDate !== existing.hearingDate?.toISOString().split('T')[0]) {
      timelineEntries.push({
        action:      'Hearing Scheduled',
        description: `Hearing set to ${new Date(req.body.hearingDate).toLocaleDateString('en-IN')}${req.body.hearingTime ? ` at ${req.body.hearingTime}` : ''}`,
        type:        'hearing',
        performedBy: req.user.name
      })
    }

    if (req.body.title && req.body.title !== existing.title) {
      timelineEntries.push({
        action:      'Case Updated',
        description: `Case title updated to "${req.body.title}"`,
        type:        'updated',
        performedBy: req.user.name
      })
    }

    if (timelineEntries.length === 0) {
      timelineEntries.push({
        action:      'Case Updated',
        description: 'Case details were updated',
        type:        'updated',
        performedBy: req.user.name
      })
    }

    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { ...req.body, $push: { timeline: { $each: timelineEntries } } },
      { new: true }
    )
    res.json(updated)
  } catch (err) {
    console.error('Update case error:', err)
    res.status(500).json({ message: err.message })
  }
}

const deleteCase = async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id)
    res.json({ message: 'Case deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const getCaseById = async (req, res) => {
  try {
    const c = await Case.findById(req.params.id)
    res.json(c)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const getUpcomingHearings = async (req, res) => {
  try {
    const now = new Date()
    const next7Days = new Date()
    next7Days.setDate(next7Days.getDate() + 7)
    const cases = await Case.find({
      lawyer:      req.user._id,
      hearingDate: { $gte: now, $lte: next7Days },
      status:      { $ne: 'Closed' }
    }).sort({ hearingDate: 1 })
    res.json(cases)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const addTimelineNote = async (req, res) => {
  try {
    const { note } = req.body
    if (!note?.trim()) return res.status(400).json({ message: 'Note cannot be empty' })
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { $push: { timeline: { action: 'Note Added', description: note, type: 'note', performedBy: req.user.name } } },
      { new: true }
    )
    res.json(updated)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = {
  getCases, createCase, updateCase, deleteCase,
  getCaseById, getUpcomingHearings, addTimelineNote
}