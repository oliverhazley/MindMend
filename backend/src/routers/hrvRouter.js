import express from 'express';
import {addHRVReading, getHRVReadings} from '../controllers/hrvController.js';

const hrvRouter = express.Router();

hrvRouter.post('/', addHRVReading);
hrvRouter.get('/', getHRVReadings);

export default hrvRouter;
