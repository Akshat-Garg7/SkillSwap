const User = require('../models/User');



exports.uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const user = await User.findById(req.user.id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.profilePicture = `/api/files/${req.file.filename}`;
    
    await user.save();

    res.status(200).json({
      message: 'Profile picture updated successfully!',
      filePath: user.profilePicture // Send the new path back to the frontend
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
};