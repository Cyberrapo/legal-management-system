const User = require('../models/User')
const Case = require('../models/Case')
const bcrypt = require('bcryptjs')

const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body
    const client = await User.create({
      name, email: email || `client_${Date.now()}@internal.com`,
      password: await bcrypt.hash('placeholder', 10),
      phone, address, notes,
      role: 'client',
      lawyerId: req.user._id
    })
    res.status(201).json({
      _id: client._id, name: client.name, email: client.email,
      phone: client.phone, address: client.address,
      notes: client.notes, role: client.role
    })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const getClients = async (req, res) => {
  try {
    const clients = await User.find({
      role: 'client', lawyerId: req.user._id
    }).select('-password').sort({ createdAt: -1 })
    res.json(clients)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const updateClient = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body
    const client = await User.findByIdAndUpdate(
      req.params.id, { name, phone, address, notes }, { new: true }
    ).select('-password')
    res.json(client)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const deleteClient = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Client removed' })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

const linkCaseToClient = async (req, res) => {
  try {
    const { clientId } = req.body
    const c = await Case.findByIdAndUpdate(
      req.params.caseId, { clientId }, { new: true }
    )
    res.json(c)
  } catch (err) { res.status(500).json({ message: err.message }) }
}

module.exports = { createClient, getClients, updateClient, deleteClient, linkCaseToClient }