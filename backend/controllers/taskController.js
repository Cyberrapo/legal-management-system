const Task = require('../models/Task')

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ lawyer: req.user._id }).sort({ dueDate: 1 })
    res.json(tasks)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, caseRef } = req.body

    // ── Validate due date is not in the past ──
    if (dueDate) {
      const due = new Date(dueDate)
      due.setHours(23, 59, 59) // allow selecting today
      if (due < new Date()) {
        return res.status(400).json({ message: 'Due date cannot be in the past' })
      }
    }

    const task = await Task.create({
      title, description, dueDate, priority, status, caseRef,
      lawyer: req.user._id
    })
    res.status(201).json(task)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const updateTask = async (req, res) => {
  try {
    // ── Validate due date is not in the past ──
    if (req.body.dueDate) {
      const due = new Date(req.body.dueDate)
      due.setHours(23, 59, 59)
      if (due < new Date()) {
        return res.status(400).json({ message: 'Due date cannot be in the past' })
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    )
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: 'Task deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    task.status = task.status === 'Completed' ? 'Pending' : 'Completed'
    await task.save()
    res.json(task)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { getTasks, createTask, updateTask, deleteTask, toggleTask }