const express = require('express');
const {
  createSkill,
  getUserSkills,
  getSkillById,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth); // All skill routes require authentication

router.post('/', createSkill);
router.get('/', getUserSkills);
router.get('/:id', getSkillById);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router;