const express = require('express');
const router = express.Router();
const { getCases, createCase, updateCase, deleteCase, getCaseById } = require('../controllers/caseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getCases);
router.post('/', createCase);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;