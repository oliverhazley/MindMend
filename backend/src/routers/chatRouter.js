// src/routes/chatRouter.js
import express from 'express';
import {handleChatMessage} from '../controllers/chatController.js';
import {authenticate} from '../middlewares/authentication.js';

const chatRouter = express.Router();

/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization Bearer token for authentication.
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer YOUR_ACCESS_TOKEN"
 *     }
 */
chatRouter.use(authenticate);

/**
 * @api {post} /api/chat/ Send Chat Message
 * @apiName PostChatMessage
 * @apiGroup Chat
 * @apiVersion 1.0.0
 *
 * @apiUse AuthHeader
 *
 * @apiDescription This endpoint allows authenticated users to send a chat message.
 * The message content should be provided in the request body.
 *
 * @apiBody {String} message The text content of the chat message.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "message": "Hi, Im feeling very stressed."
 *     }
 *
 * @apiSuccess {Object} data The response from the chat handler.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "reply": "I'm sorry to hear that you're feeling stressed. Would you like to try a short meditation or some breathing exercises?"
 *     }
 *
 * @apiError (401 Unauthorized) Unauthorized The user is not authenticated.
 * @apiErrorExample {json} Error-Response (Unauthorized):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "error": "Access denied. No token provided."
 *     }
 *
 * @apiError (400 Bad Request) BadRequest The request body is missing the message or is malformed.
 * @apiErrorExample {json} Error-Response (Bad Request):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Message is required"
 *     }
 */
chatRouter.post('/', handleChatMessage);

export default chatRouter;
