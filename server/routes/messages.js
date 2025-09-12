const express = require('express');
const {
  getMessages,
  sendMessage,
  getConversations
} = require('../controllers/messageController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/conversations/:userId', getConversations);
router.get('/:matchId', getMessages);
router.post('/:matchId', sendMessage);

module.exports = router;