const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User registration
router.post('/users/register', userController.registerUser);

// Get all users
router.get('/users', userController.getAllUsers);

// Get single user by ID
router.get('/users/:id', userController.getUserById);

// Update user
router.put('/users/:id', userController.updateUser);

// Delete user
router.delete('/users/:id', userController.deleteUser);

// Get complete analytics
router.get('/users/analytics', userController.getHobbyAnalytics);

// Get just hobby distribution for graphs
router.get('/users/analytics/hobbies', userController.getHobbyDistribution);

// Get dashboard statistics
router.get('/users/stats/dashboard', userController.getDashboardStats);

module.exports = router;