const express = require('express');
const {
  findMatches,
  createMatch,
  getUserMatches,
  updateMatchStatus,
  respondToMatch
} = require('../controllers/matchController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/find', findMatches);
router.post('/', createMatch);
router.get('/', getUserMatches);
router.patch('/:id/status', updateMatchStatus);
router.patch('/:id/respond', respondToMatch);

module.exports = router;