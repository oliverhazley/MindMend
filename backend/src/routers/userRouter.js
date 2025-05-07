import express from 'express';
import * as userController from '../controllers/userController.js';
import {authenticate} from '../middlewares/authentication.js';
import {authorizeSelf} from '../middlewares/authorization.js';

const userRouter = express.Router();

/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer YOUR_ACCESS_TOKEN"
 *     }
 */

/**
 * @api {get} /api/users Get All Users
 * @apiName GetAllUsers
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiUse AuthHeader
 *
 * @apiDescription Retrieves a list of all users. Requires authentication.
 *
 * @apiSuccess {Object[]} users List of user objects.
 * @apiSuccess {Number} users.user_id User's unique ID.
 * @apiSuccess {String} users.name User's name.
 * @apiSuccess {String} users.email User's email.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "user_id": 1,
 *         "name": "John Doe",
 *         "email": "john.doe@example.com"
 *       },
 *       {
 *         "user_id": 2,
 *         "name": "Jane Smith",
 *         "email": "jane.smith@example.com"
 *       }
 *     ]
 *
 * @apiError (401 Unauthorized) Unauthorized No token provided or token is invalid/expired.
 * @apiErrorExample {json} Error-Response (Unauthorized):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Access denied. No token provided."
 *     }
 * @apiError (500 Internal Server Error) ServerError Error fetching users.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error"
 *     }
 */
userRouter.get('/', authenticate, userController.getAllUsers);

/**
 * @api {post} /api/users/auth/register Register User
 * @apiName RegisterUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiDescription Registers a new user.
 *
 * @apiBody {String} name User's full name.
 * @apiBody {String} email User's email address.
 * @apiBody {String} password User's password (will be hashed).
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "John Doe",
 *       "email": "john.doe@example.com",
 *       "password": "securepassword123"
 *     }
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccess {Object} user User details.
 * @apiSuccess {Number} user.userId The ID of the newly registered user.
 * @apiSuccess {String} user.name The name of the user.
 * @apiSuccess {String} user.email The email of the user.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "User registered successfully",
 *       "user": {
 *         "userId": 1,
 *         "name": "John Doe",
 *         "email": "john.doe@example.com"
 *       }
 *     }
 *
 * @apiError (400 Bad Request) BadRequest Missing fields or user already exists.
 * @apiErrorExample {json} Error-Response (Missing Fields):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Please provide username, email and password"
 *     }
 * @apiErrorExample {json} Error-Response (User With Email Exists):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "User with this email already exists"
 *     }
 * @apiError (500 Internal Server Error) ServerError Error registering user.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error"
 *     }
 */
userRouter.post('/auth/register', userController.registerUser);

/**
 * @api {post} /api/users/auth/login Login User
 * @apiName LoginUser
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiDescription Logs in an existing user and returns a JWT token.
 *
 * @apiBody {String} email User's email address.
 * @apiBody {String} password User's password.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "john.doe@example.com",
 *       "password": "securepassword123"
 *     }
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccess {String} token JWT token for authentication.
 * @apiSuccess {Object} user User details.
 * @apiSuccess {Number} user.userId User's ID.
 * @apiSuccess {String} user.name User's name.
 * @apiSuccess {String} user.email User's email.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Login successful",
 *       "token": "YOUR_JWT_TOKEN",
 *       "user": {
 *         "userId": 1,
 *         "name": "John Doe",
 *         "email": "john.doe@example.com"
 *       }
 *     }
 *
 * @apiError (400 Bad Request) BadRequest Missing email or password.
 * @apiErrorExample {json} Error-Response (Missing Fields):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Please provide email and password"
 *     }
 * @apiError (401 Unauthorized) Unauthorized Invalid email or password.
 * @apiErrorExample {json} Error-Response (Invalid Credentials):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid email or password"
 *     }
 * @apiError (500 Internal Server Error) ServerError Error logging in user.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error"
 *     }
 */
userRouter.post('/auth/login', userController.loginUser);

/**
 * @api {post} /api/users/auth/change-password Change Password
 * @apiName ChangePassword
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiUse AuthHeader
 *
 * @apiDescription Changes the password for an authenticated user.
 *
 * @apiBody {Number} userId User's ID.
 * @apiBody {String} currentPassword User's current password.
 * @apiBody {String} newPassword User's new password.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "userId": 1,
 *       "currentPassword": "oldsecurepassword",
 *       "newPassword": "newsecurepassword123"
 *     }
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Password updated"
 *     }
 *
 * @apiError (400 Bad Request) BadRequest Missing required fields.
 * @apiErrorExample {json} Error-Response (Missing Fields):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Missing fields"
 *     }
 * @apiError (401 Unauthorized) Unauthorized Wrong current password or invalid token.
 * @apiErrorExample {json} Error-Response (Wrong Password):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Wrong password"
 *     }
 * @apiErrorExample {json} Error-Response (Unauthorized - Token):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Access denied. No token provided."
 *     }
 * @apiError (500 Internal Server Error) ServerError Internal error during password update.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal error"
 *     }
 */
userRouter.post(
  '/auth/change-password',
  authenticate,
  userController.changePassword,
);

/**
 * @api {get} /api/users/profile/:userId Get User Profile
 * @apiName GetUserProfile
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiUse AuthHeader
 *
 * @apiDescription Retrieves the profile information for a specific user.
 * Requires authentication and user can only access their own profile.
 *
 * @apiParam {Number} userId User's unique ID (passed in URL).
 *
 * @apiParamExample {url} Request-Example:
 *     /api/users/profile/1
 *
 * @apiSuccess {Number} user_id User's unique ID.
 * @apiSuccess {String} name User's name.
 * @apiSuccess {String} email User's email.
 * @apiSuccess {String} created_at Timestamp of user creation.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user_id": 1,
 *       "name": "John Doe",
 *       "email": "john.doe@example.com",
 *       "created_at": "2025-05-08T10:00:00.000Z"
 *     }
 *
 * @apiError (400 Bad Request) BadRequest Missing user ID.
 * @apiErrorExample {json} Error-Response (Missing ID):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Missing user ID"
 *     }
 * @apiError (401 Unauthorized) Unauthorized No token provided or token is invalid/expired.
 * @apiErrorExample {json} Error-Response (Unauthorized):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Access denied. No token provided."
 *     }
 * @apiError (403 Forbidden) Forbidden User is trying to access another user's data.
 * @apiErrorExample {json} Error-Response (Forbidden):
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Forbidden: You can only access your own data."
 *     }
 * @apiError (404 Not Found) NotFound User with the given ID not found.
 * @apiErrorExample {json} Error-Response (Not Found):
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "User not found"
 *     }
 * @apiError (500 Internal Server Error) ServerError Internal server error.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error" // Or specific error from controller
 *     }
 */
userRouter.get(
  '/profile/:userId',
  authenticate,
  authorizeSelf,
  userController.getUserProfile,
);

/**
 * @api {delete} /api/users/auth/delete/:userId Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiUse AuthHeader
 *
 * @apiDescription Deletes a specific user.
 * Requires authentication and user can only delete their own account.
 *
 * @apiParam {Number} userId User's unique ID (passed in URL).
 *
 * @apiParamExample {url} Request-Example:
 *     /api/users/auth/delete/1
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "User deleted successfully"
 *     }
 *
 * @apiError (400 Bad Request) BadRequest Missing user ID.
 * @apiErrorExample {json} Error-Response (Missing ID):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Please provide user ID"
 *     }
 * @apiError (401 Unauthorized) Unauthorized No token provided or token is invalid/expired.
 * @apiErrorExample {json} Error-Response (Unauthorized):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Access denied. No token provided."
 *     }
 * @apiError (403 Forbidden) Forbidden User is trying to delete another user's account.
 * @apiErrorExample {json} Error-Response (Forbidden):
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Forbidden: You can only access your own data."
 *     }
 * @apiError (500 Internal Server Error) ServerError Internal server error during deletion.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Internal server error"
 *     }
 */
userRouter.delete(
  '/auth/delete/:userId',
  authenticate,
  authorizeSelf,
  userController.deleteUser,
);

export default userRouter;
