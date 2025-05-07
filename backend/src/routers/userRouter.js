import express from 'express';
import * as userController from '../controllers/userController.js';
import authenticate from '../middlewares/authentication.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/auth/register', userController.registerUser);
router.post('/auth/login', userController.loginUser);

// Protected routes (authentication required)
router.get('/', authenticate, userController.getAllUsers);
router.post('/auth/change-password', authenticate, userController.changePassword);
router.get('/profile/:userId', authenticate, userController.getUserProfile);
router.delete('/auth/delete/:userId', authenticate, userController.deleteUser);

export default router;


