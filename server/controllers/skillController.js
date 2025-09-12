const Skill = require('../models/Skill');
const User = require('../models/User');

exports.createSkill = async (req, res) => {
  try {
    const skillData = {
      ...req.body,
      owner: req.user._id  // ✅ user comes from auth middleware
    };

    const skill = new Skill(skillData);
    await skill.save();

    const user = await User.findById(req.user._id);
    if (skill.isOffered) {
      user.skillsOffered.push(skill._id);
    } else {
      user.skillsWanted.push(skill._id);
    }
    await user.save();

    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getUserSkills = async (req, res) => {
  try {
    // const { type } = req.query; // 'offered' or 'wanted'

    let skills;
    // if (type === 'offered') {
      skills = await Skill.find({ owner: req.user._id});
    // } else if (type === 'wanted') {
    //   skills = await Skill.find({ owner: req.user._id, isOffered: false });
    // } else {
    //   skills = await Skill.find({ owner: req.user._id });
    // }

    res.json({ skills });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findById(id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne({ _id: id, owner: req.user._id });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    Object.assign(skill, req.body);
    await skill.save();

    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne({ _id: id, owner: req.user._id });

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    await skill.deleteOne();

    // Remove from user's skill arrays
    const user = await User.findById(req.user._id);
    user.skillsOffered.pull(id);
    user.skillsWanted.pull(id);
    await user.save();

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};