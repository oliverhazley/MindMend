import express from 'express';
import {addHRVReading, getHRVReadings} from '../controllers/hrvController.js';

const hrvRouter = express.Router();

/**
 * @api {post} /api/hrv Add HRV Reading
 * @apiName AddHRVReading
 * @apiGroup HRV
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint allows users to add a new HRV (Heart Rate Variability) reading.
 *
 * @apiBody {Number} user_id The ID of the user for whom the HRV reading is being recorded.
 * @apiBody {Number} hrv_value The HRV value.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "user_id": 1,
 *       "hrv_value": 65.5
 *     }
 *
 * @apiSuccess {String} message Confirmation message.
 * @apiSuccess {Number} hrv_id The ID of the newly inserted HRV reading.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "HRV reading stored",
 *       "hrv_id": 123
 *     }
 *
 * @apiError (400 Bad Request) BadRequest Invalid input: user_id and hrv_value required.
 * @apiErrorExample {json} Error-Response (Bad Request - Invalid Input):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Invalid input: user_id and hrv_value required"
 *     }
 * @apiError (500 Internal Server Error) ServerError Error storing the HRV reading.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Server error storing HRV",
 *       "error": "Database insert failed"
 *     }
 */
hrvRouter.post('/', addHRVReading);

/**
 * @api {get} /api/hrv Get HRV Readings
 * @apiName GetHRVReadings
 * @apiGroup HRV
 * @apiVersion 1.0.0
 *
 * @apiDescription This endpoint retrieves all HRV readings for a specific user, ordered by the most recent.
 *
 * @apiParam {Number} user_id The ID of the user whose HRV readings are to be fetched (sent as a query parameter).
 *
 * @apiParamExample {url} Request-Example:
 *     /api/hrv?user_id=1
 *
 * @apiSuccess {Object[]} readings List of HRV readings.
 * @apiSuccess {String} readings.reading_time Timestamp of the HRV reading.
 * @apiSuccess {Number} readings.hrv_value The HRV value.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "reading_time": "2025-05-08T10:30:00.000Z",
 *         "hrv_value": 65.5
 *       },
 *       {
 *         "reading_time": "2025-05-07T18:15:00.000Z",
 *         "hrv_value": 70.2
 *       }
 *     ]
 *
 * @apiError (400 Bad Request) BadRequest Missing user_id in query.
 * @apiErrorExample {json} Error-Response (Bad Request - Missing user_id):
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "Missing user_id in query"
 *     }
 * @apiError (500 Internal Server Error) ServerError Error fetching HRV readings.
 * @apiErrorExample {json} Error-Response (Server Error):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Server error fetching HRV readings"
 *     }
 */
hrvRouter.get('/', getHRVReadings);

export default hrvRouter;
