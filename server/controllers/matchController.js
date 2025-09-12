const Match = require('../models/Match');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Matching algorithm to calculate compatibility score
const calculateMatchScore = (userSkill, targetSkill) => {
  let score = 0;

  // Base score for skill match
  if (userSkill.category === targetSkill.category) {
    score += 40;
  }

  // Level compatibility (beginner teaching intermediate gets higher score)
  const levelScores = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
  const userLevel = levelScores[userSkill.level];
  const targetLevel = levelScores[targetSkill.level];

  if (userLevel >= targetLevel) {
    score += 30;
  } else if (userLevel === targetLevel - 1) {
    score += 20;
  }

  // Mode compatibility
  if (userSkill.mode === targetSkill.mode ||
    userSkill.mode === 'Both' ||
    targetSkill.mode === 'Both') {
    score += 20;
  }

  // Tag similarity
  const userTags = userSkill.tags || [];
  const targetTags = targetSkill.tags || [];
  const commonTags = userTags.filter(tag => targetTags.includes(tag));
  score += Math.min(commonTags.length * 2, 10);

  return Math.min(score, 100);
};

exports.findMatches = async (req, res) => {
  try {
    const {skillId}=req.query;
    if(!skillId)
      return res.status(400).json({message:"Skill Id is required"});
    // console.log(
    //   "finding matches for skillId:",skillId,"and userId:",req.user._id
    // )


    let userSkill;
    let searchCriteria;

    if (skillId) {
      userSkill = await Skill.findOne({ _id: skillId, owner: req.user._id });
      if (!userSkill) {
        return res.status(404).json({ message: 'Skill not found' });
      }

      // If user offers a skill, find users who want it
      // If user wants a skill, find users who offer it
      searchCriteria = {
        isOffered: !userSkill?.isOffered,
        owner: { $ne: req.user._id },
        isActive: true
      };
    } 
    const potentialMatches = await Skill.find(searchCriteria)
      .populate('owner', 'name email profilePicture location')
      .lean();
    // Calculate match scores if specific skill provided
    let matches = potentialMatches;
    if (userSkill) {
      matches = potentialMatches.map(match => ({
        ...match,
        matchScore: calculateMatchScore(userSkill, match)
      })).sort((a, b) => b.matchScore - a.matchScore);
    }
    // console.log("From backend",matches);
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { user2Id, user1SkillId, user2SkillId } = req.body;

    const existingMatch = await Match.findOne({
      $or: [
        {
          $and: [
            { user1: req.user._id },
            { user2: user2Id },
            { user1Skill: user1SkillId },
            { user2Skill: user2SkillId }
          ]
        },
        {
          $and: [
            { user1: user2Id },
            { user2: req.user._id },
            { user1Skill: user2SkillId },
            { user2Skill: user1SkillId }
          ]
        }
      ]
    });

    if (existingMatch) {
      return res.status(400).json({ message: 'Match already exists' });
    }

    // Verify skills exist and belong to correct users
    const user1Skill = await Skill.findOne({ _id: user1SkillId, owner: req.user._id });
    const user2Skill = await Skill.findOne({ _id: user2SkillId, owner: user2Id });

    if (!user1Skill || !user2Skill) {
      return res.status(400).json({ message: 'Invalid skills provided' });
    }

    // Calculate match score
    const matchScore = calculateMatchScore(user1Skill, user2Skill);

    const match = new Match({
      user1: req.user._id,
      user2: user2Id,
      user1Skill: user1SkillId,
      user2Skill: user2SkillId,
      matchScore,
      initiatedBy: req.user._id
    });

    await match.save();
    await match.populate(['user1', 'user2', 'user1Skill', 'user2Skill']);

    res.status(201).json({ message: 'Match created successfully', match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserMatches = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {
      $or: [{ user1: req.user._id }, { user2: req.user._id }]
    };

    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('user1', 'name email profilePicture')
      .populate('user2', 'name email profilePicture')
      .populate('user1Skill', 'name description category level')
      .populate('user2Skill', 'name description category level')
      .sort({ createdAt: -1 });

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateMatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const match = await Match.findOne({
      _id: id,
      $or: [{ user1: req.user._id }, { user2: req.user._id }]
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only the non-initiator can accept/reject, or either can mark as completed
    if (status === 'accepted' || status === 'rejected') {
      if (match.initiatedBy.toString() === req.user._id.toString()) {
        return res.status(403).json({ message: 'Cannot accept/reject your own match request' });
      }
    }

    match.status = status;
    await match.save();

    res.json({ message: 'Match status updated', match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.respondToMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response. Must be "accepted" or "rejected"' });
    }

    const match = await Match.findOne({
      _id: id,
      user2: req.user._id, // Only user2 can respond to match requests
      status: 'pending'
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found or cannot be responded to' });
    }

    match.status = response;
    await match.save();

    res.json({ message: `Match ${response}`, match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};