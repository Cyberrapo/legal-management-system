const express = require('express')
const router = express.Router()
const {
  createClient, getClients, updateClient,
  deleteClient, linkCaseToClient
} = require('../controllers/clientController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)
router.get('/', getClients)
router.post('/', createClient)
router.put('/:id', updateClient)
router.delete('/:id', deleteClient)
router.post('/link-case/:caseId', linkCaseToClient)

module.exports = router