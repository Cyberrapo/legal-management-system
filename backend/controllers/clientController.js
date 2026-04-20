const User = require('../models/User')
const Case = require('../models/Case')
const Appointment = require('../models/Appointment')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

// Lawyer creates a client account
const createClient = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body
        const exists = await User.findOne({ email })
        if (exists) return res.status(400).json({ message: 'Client already exists' })
        const hashed = await bcrypt.hash(password, 10)
        const client = await User.create({
            name, email, password: hashed,
            phone, address,
            role: 'client',
            lawyerId: req.user._id
        })
        res.status(201).json({
            _id: client._id, name: client.name,
            email: client.email, role: client.role,
            phone: client.phone, address: client.address
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Get all clients for this lawyer
const getClients = async (req, res) => {
    try {
        const clients = await User.find({
            role: 'client', lawyerId: req.user._id
        }).select('-password').sort({ createdAt: -1 })
        res.json(clients)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Update client
const updateClient = async (req, res) => {
    try {
        const { name, phone, address } = req.body
        const client = await User.findByIdAndUpdate(
            req.params.id, { name, phone, address }, { new: true }
        ).select('-password')
        res.json(client)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Delete client
const deleteClient = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.json({ message: 'Client removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Link a case to a client
const linkCaseToClient = async (req, res) => {
    try {
        const { clientId } = req.body
        const c = await Case.findByIdAndUpdate(
            req.params.caseId,
            { clientId },
            { new: true }
        )
        res.json(c)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// CLIENT LOGIN
const clientLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const client = await User.findOne({ email, role: 'client' })
        if (!client) return res.status(400).json({ message: 'Invalid credentials' })
        const match = await bcrypt.compare(password, client.password)
        if (!match) return res.status(400).json({ message: 'Invalid credentials' })
        res.json({
            _id: client._id, name: client.name,
            email: client.email, role: client.role,
            lawyerId: client.lawyerId,
            token: generateToken(client._id)
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// CLIENT — get their own cases
const getClientCases = async (req, res) => {
    try {
        const cases = await Case.find({ clientId: req.user._id })
            .sort({ createdAt: -1 })
        res.json(cases)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// CLIENT — get their own appointments
const getClientAppointments = async (req, res) => {
    try {
        const appts = await Appointment.find({ clientId: req.user._id })
            .sort({ date: 1 })
        res.json(appts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// CLIENT — get their lawyer info
const getClientLawyer = async (req, res) => {
    try {
        const client = await User.findById(req.user._id)
        if (!client.lawyerId) return res.json(null)
        const lawyer = await User.findById(client.lawyerId).select('-password')
        res.json(lawyer)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

module.exports = {
    createClient, getClients, updateClient, deleteClient,
    linkCaseToClient, clientLogin,
    getClientCases, getClientAppointments, getClientLawyer
}