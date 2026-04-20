const express = require('express')
const router = express.Router()
const {
    createClient, getClients, updateClient, deleteClient,
    linkCaseToClient, clientLogin,
    getClientCases, getClientAppointments, getClientLawyer
} = require('../controllers/clientController')
const { protect } = require('../middleware/authMiddleware')

// Public
router.post('/login', clientLogin)

// Lawyer manages clients (protected)
router.get('/', protect, getClients)
router.post('/', protect, createClient)
router.put('/:id', protect, updateClient)
router.delete('/:id', protect, deleteClient)
router.post('/link-case/:caseId', protect, linkCaseToClient)

// Client portal routes (protected)
router.get('/portal/cases', protect, getClientCases)
router.get('/portal/appointments', protect, getClientAppointments)
router.get('/portal/lawyer', protect, getClientLawyer)

module.exports = router