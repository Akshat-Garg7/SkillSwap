const express = require('express');
const {
  getProfile,
  updateProfile,
  getUserById,
  updateUserById,
  addEndorsement,
  searchUsers,
  uploadProfilePicture
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', uploadProfilePicture, updateProfile);
router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.post('/endorse', addEndorsement);

module.exports = router;