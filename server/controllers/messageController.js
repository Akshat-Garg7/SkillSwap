const Message = require('../models/Message');
const Match = require('../models/Match');

exports.getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;

    // Verify user is part of the match
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.user._id }, { user2: req.user._id }]
    }).populate('user1').populate('user2');;
    console.log("From backend:",match)

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const messages = await Message.find({ match: matchId })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { match: matchId, recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ messages,match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;

    // Verify user is part of the match
    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1: req.user._id }, { user2: req.user._id }]
    });

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Determine recipient
    const recipientId = match.user1.toString() === req.userId.toString()
      ? match.user2
      : match.user1;

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      match: matchId,
      content
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');

    // Add message to match
    match.messages.push(message._id);
    await match.save();

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify the requesting user is authorized to view these conversations
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $ne: 'rejected' }
    })
      .populate('user1', 'name profilePicture')
      .populate('user2', 'name profilePicture')
      .populate('user1Skill', 'name')
      .populate('user2Skill', 'name')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 });

    // Transform matches to conversation format
    const conversations = matches.map(match => {
      const otherUser = match.user1.toString() === userId
        ? match.user2
        : match.user1;

      const lastMessage = match.messages.length > 0 ? match.messages[0] : null;

      return {
        _id: match._id,
        userId: otherUser._id,
        user: {
          _id: otherUser._id,
          name: otherUser.name,
          profilePicture: otherUser.profilePicture
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.sender._id,
          createdAt: lastMessage.createdAt
        } : null,
        unreadCount: 0 // Will be calculated below
      };
    });

    // Get unread message counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          match: conversation._id,
          recipient: userId,
          isRead: false
        });

        return {
          ...conversation,
          unreadCount
        };
      })
    );

    res.json(conversationsWithUnread);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};