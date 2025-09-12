const User = require('../models/User');
const Skill = require('../models/Skill');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

exports.uploadProfilePicture = upload.single('profilePicture');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('skillsOffered', 'name description category level')
      .populate('skillsWanted', 'name description category level')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Add profile picture if uploaded
    if (req.file) {
      updates.profilePicture = req.file.path.replace(/\\/g, '/'); // Normalize path
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('skillsOffered', 'name description category level tags')
      .populate('skillsWanted', 'name description category level tags')
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
    // console.log("From backensssd Controller:",user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addEndorsement = async (req, res) => {
  try {
    const { userId, skillId, comment, rating } = req.body;

    if (userId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot endorse yourself' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if skill belongs to the user
    const skill = await Skill.findOne({ _id: skillId, owner: userId });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Check if already endorsed
    const existingEndorsement = user.endorsements.find(
      e => e.fromUser.toString() === req.userId.toString() &&
        e.skill.toString() === skillId
    );

    if (existingEndorsement) {
      return res.status(400).json({ message: 'Already endorsed this skill' });
    }

    user.endorsements.push({
      fromUser: req.userId,
      skill: skillId,
      comment,
      rating
    });

    await user.save();

    res.json({ message: 'Endorsement added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Only allow users to update their own profile
    if (id !== req.userId.toString()) {
      return res.status(403).json({ message: 'Can only update your own profile' });
    }

    // Remove sensitive fields that shouldn't be updated
    delete updates.password;
    delete updates.email;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query, category, location } = req.query;

    let searchCriteria = { _id: { $ne: req.userId } };

    if (location) {
      searchCriteria.location = new RegExp(location, 'i');
    }

    let users;

    if (query || category) {
      // Search in skills
      let skillQuery = {};

      if (query) {
        skillQuery.$text = { $search: query };
      }

      if (category) {
        skillQuery.category = category;
      }

      const skills = await Skill.find(skillQuery).distinct('owner');
      searchCriteria._id = { $in: skills, $ne: req.userId };
    }

    users = await User.find(searchCriteria)
      .populate('skillsOffered', 'name category level')
      .populate('skillsWanted', 'name category level')
      .select('name profilePicture location bio')
      .limit(20);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};