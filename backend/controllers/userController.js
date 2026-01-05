const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, age, hobbies } = req.body;

    // Validate hobbies array
    let hobbiesArray = [];
    if (Array.isArray(hobbies)) {
      hobbiesArray = hobbies;
    } else if (typeof hobbies === 'string') {
      hobbiesArray = hobbies.split(',').map(hobby => hobby.trim()).filter(hobby => hobby);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      age: parseInt(age),
      hobbies: hobbiesArray
    });

    const savedUser = await newUser.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to register user', 
      message: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, hobbies } = req.body;

    // Validate hobbies array
    let hobbiesArray = [];
    if (Array.isArray(hobbies)) {
      hobbiesArray = hobbies;
    } else if (typeof hobbies === 'string') {
      hobbiesArray = hobbies.split(',').map(hobby => hobby.trim()).filter(hobby => hobby);
    }

    // Check if email exists for another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists for another user' });
      }
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(age && { age: parseInt(age) }),
      ...(hobbies && { hobbies: hobbiesArray }),
      updatedAt: Date.now()
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    res.status(500).json({ 
      error: 'Failed to update user', 
      message: error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete user', 
      message: error.message 
    });
  }
};

// Get hobby analytics
exports.getHobbyAnalytics = async (req, res) => {
  try {
    const users = await User.find();
    
    // Calculate hobby distribution
    const hobbyCounts = {};
    
    users.forEach(user => {
      user.hobbies.forEach(hobby => {
        const hobbyName = hobby.trim();
        if (hobbyCounts[hobbyName]) {
          hobbyCounts[hobbyName]++;
        } else {
          hobbyCounts[hobbyName] = 1;
        }
      });
    });
    
    // Convert to array format
    const hobbyData = Object.keys(hobbyCounts).map(hobby => ({
      hobby: hobby,
      user_count: hobbyCounts[hobby]
    })).sort((a, b) => b.user_count - a.user_count);
    
    // Calculate overall statistics
    const totalUsers = users.length;
    const averageAge = users.reduce((sum, user) => sum + user.age, 0) / totalUsers || 0;
    const totalHobbies = users.reduce((sum, user) => sum + user.hobbies.length, 0);
    
    res.status(200).json({
      total_users: totalUsers,
      average_age: averageAge.toFixed(1),
      total_hobbies: totalHobbies,
      hobby_distribution: hobbyData
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics', 
      message: error.message 
    });
  }
};

// Get just the hobby distribution for the graphs component
exports.getHobbyDistribution = async (req, res) => {
  try {
    const users = await User.find();
    
    const hobbyCounts = {};
    
    users.forEach(user => {
      user.hobbies.forEach(hobby => {
        const hobbyName = hobby.trim();
        hobbyCounts[hobbyName] = (hobbyCounts[hobbyName] || 0) + 1;
      });
    });
    
    const hobbyData = Object.keys(hobbyCounts).map(hobby => ({
      hobby: hobby,
      user_count: hobbyCounts[hobby]
    })).sort((a, b) => b.user_count - a.user_count);
    
    res.status(200).json(hobbyData);
  } catch (error) {
    console.error('Error fetching hobby distribution:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hobby distribution', 
      message: error.message 
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const users = await User.find();
    
    const totalUsers = users.length;
    const averageAge = users.reduce((sum, user) => sum + user.age, 0) / totalUsers || 0;
    const totalHobbies = users.reduce((sum, user) => sum + user.hobbies.length, 0);
    
    res.status(200).json({
      total_users: totalUsers,
      average_age: parseFloat(averageAge.toFixed(1)),
      total_hobbies: totalHobbies,
      system_status: 'Active'
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics', 
      message: error.message 
    });
  }
};