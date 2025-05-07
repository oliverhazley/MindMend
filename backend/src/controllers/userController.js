import * as userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const getAllUsers = async (req, res) => {
  try {
    // this is kind of placeholder - not sure if we need it in future - the security on this could be better
    const users = await userModel.getAllUsers();
    // Remove sensitive information like passwords
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    // Get the authenticated user's ID from the token
    const authenticatedUserId = req.user.userId;
    // Get the requested user ID from params
    const requestedUserId = parseInt(req.params.userId);

    // Ensure users can only access their own profile
    if (authenticatedUserId !== requestedUserId) {
      return res.status(403).json({message: 'Access denied. You can only view your own profile.'});
    }

    const user = await userModel.getUserById(requestedUserId);
    if (!user) return res.status(404).json({message: 'User not found'});

    // Remove sensitive data
    const { password, ...safeUser } = user;

    return res.json(safeUser);
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

    // Generate JWT token
    const token = jwt.sign(
      {userId: user.user_id, email: user.email},
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
    // Get authenticated user ID from token
    const authenticatedUserId = req.user.userId;

    const {userId, currentPassword, newPassword} = req.body;

    // Ensure the authenticated user can only change their own password
    if (parseInt(userId) !== authenticatedUserId) {
      return res.status(403).json({message: 'Access denied. You can only update your own password.'});
    }

    if (!userId || !currentPassword || !newPassword)
      return res.status(400).json({message: 'Missing fields'});

    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

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
  try {
    // Get authenticated user ID from token
    const authenticatedUserId = req.user.userId;

    // Get requested user ID from params
    const requestedUserId = parseInt(req.params.userId);

    // Ensure users can only delete their own account
    if (authenticatedUserId !== requestedUserId) {
      return res.status(403).json({message: 'Access denied. You can only delete your own account.'});
    }

    // Delete user
    const result = await userModel.deleteUser(requestedUserId);

    if (!result) {
      return res.status(404).json({message: 'User not found'});
    }

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

