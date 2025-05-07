import express from "express";
import { addHRVReading, getHRVReadings } from "../controllers/hrvController.js";


const hrvRouter = express.Router();

//HRV routes are public for now - we would make these private if we actually published the app for use
hrvRouter.post("/", addHRVReading);
hrvRouter.get("/", getHRVReadings);

export default hrvRouter;


