import * as userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    if (!userId) return res.status(400).json({message: 'Missing user ID'});

    const user = await userModel.getUserById(userId);
    if (!user) return res.status(404).json({message: 'User not found'});

    return res.json(user);
  } catch (err) {
    next(err);
  }
};

const registerUser = async (req, res) => {
  const {name, email, password} = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({message: 'Please provide username, email and password'});
    }

    // Check if the user already exists
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({message: 'User with this email already exists'});
    }

    // Create user
    const newUser = await userModel.createUser({name, email, password});
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
};

const loginUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({message: 'Please provide email and password'});
    }

    // Find user by email
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({message: 'Invalid email or password'});
    }

    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      return res.status(401).json({message: 'Invalid email or password'});
    }

    const token = jwt.sign(
      {userId: user.user_Id, email: user.email},
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      },
    );

    // Respond with user data and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
};

const changePassword = async (req, res) => {
  try {
    const {userId, currentPassword, newPassword} = req.body;
    if (!userId || !currentPassword || !newPassword)
      return res.status(400).json({message: 'Missing fields'});

    const user = await userModel.getUserById(userId);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({message: 'Wrong password'});

    await userModel.updatePassword(userId, newPassword);
    res.json({message: 'Password updated'});
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Internal error'});
  }
};

const deleteUser = async (req, res) => {
  const {userId} = req.params;

  try {
    // Validate input
    if (!userId) {
      return res.status(400).json({message: 'Please provide user ID'});
    }

    // Delete user
    await userModel.deleteUser(userId);
    res.status(200).json({message: 'User deleted successfully'});
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
};

export {
  getAllUsers,
  getUserProfile,
  registerUser,
  loginUser,
  changePassword,
  deleteUser,
};
