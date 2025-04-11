import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getAllUsers);

router.post('/auth/register', userController.registerUser);

router.post('/auth/login', userController.loginUser);

router.delete('/auth/delete/:userId', userController.deleteUser);

export default router;
