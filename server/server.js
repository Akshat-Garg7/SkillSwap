require('dotenv').config();
const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// const fileRoutes = require('./routes/file.routes');
// const userroutes = require('./routes/user.routes');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');
const auth = require('./middleware/auth');
const User = require('./models/User');   

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI);



// Routes


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
app.post('/api/users/profile/picture', auth, upload.single('picture'), async (req, res) => {
  try {
    // --- START DEBUGGING ---
    console.log('--- TRYING TO UPLOAD PICTURE ---');
    console.log('User object from auth middleware:', req.user);
    console.log('File object from multer:', req.file);
    // --- END DEBUGGING ---

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error, user not found in token.' });
    }
    
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    user.profilePicture = filePath;
    await user.save();

    console.log('--- UPLOAD SUCCESSFUL ---');
    res.json({
      message: 'Profile picture uploaded successfully!',
      filePath: filePath
    });

  } catch (error) {
    // --- CATCH BLOCK LOGGING ---
    console.error('--- ERROR IN UPLOAD ROUTE ---');
    console.error(error); // This will print the exact error to your terminal
    // --- END CATCH BLOCK LOGGING ---
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

const connectedUsers = new Map();


const activeUsers = new Map();
const typingUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (userId) => {
    activeUsers.set(userId, {
      socketId: socket.id,
      lastSeen: new Date()
    });
    socket.userId = userId;
    
    socket.broadcast.emit('user_status_change', {
      userId,
      isOnline: true,
      lastSeen: new Date()
    });
  });

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
  });

  socket.on('leave_match', (matchId) => {
    socket.leave(`match_${matchId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const message = new Message({
        sender: data.senderId,
        recipient: data.recipientId,
        match: data.matchId,
        content: data.content
      });
      
      await message.save();
      await message.populate('sender', 'name profilePicture');
      
      io.to(`match_${data.matchId}`).emit('receive_message', {
        ...message.toObject(),
        timestamp: new Date()
      });
      
      const recipientInfo = activeUsers.get(data.recipientId);
      if (!recipientInfo) {
        console.log(`User ${data.recipientId} is offline, could send push notification`);
      }
    } catch (error) {
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('typing_start', (data) => {
    const typingKey = `${data.matchId}_${socket.userId}`;
    typingUsers.set(typingKey, {
      userId: socket.userId,
      matchId: data.matchId,
      timestamp: new Date()
    });
    
    socket.to(`match_${data.matchId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const typingKey = `${data.matchId}_${socket.userId}`;
    typingUsers.delete(typingKey);
    
    socket.to(`match_${data.matchId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      
      // Clean up typing indicators
      for (const [key, value] of typingUsers.entries()) {
        if (value.userId === socket.userId) {
          typingUsers.delete(key);
          socket.to(`match_${value.matchId}`).emit('user_typing', {
            userId: socket.userId,
            isTyping: false
          });
        }
      }
      
      // Broadcast user offline status
      socket.broadcast.emit('user_status_change', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Clean up old typing indicators every 30 seconds
setInterval(() => {
  const now = new Date();
  for (const [key, value] of typingUsers.entries()) {
    if (now - value.timestamp > 30000) { // 30 seconds
      typingUsers.delete(key);
    }
  }
}, 30000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});