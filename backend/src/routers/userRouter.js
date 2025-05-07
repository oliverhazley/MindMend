import express from 'express';
import * as userController from '../controllers/userController.js';
import {authenticate} from '../middlewares/authentication.js';
import {authorizeSelf} from '../middlewares/authorization.js';

const userRouter = express.Router();

userRouter.get('/', authenticate, userController.getAllUsers);
userRouter.post('/auth/register', userController.registerUser);
userRouter.post('/auth/login', userController.loginUser);
userRouter.post(
  '/auth/change-password',
  authenticate,
  userController.changePassword,
);
userRouter.get(
  '/profile/:userId',
  authenticate,
  authorizeSelf,
  userController.getUserProfile,
);
userRouter.delete(
  '/auth/delete/:userId',
  authenticate,
  authorizeSelf,
  userController.deleteUser,
);

export default userRouter;
