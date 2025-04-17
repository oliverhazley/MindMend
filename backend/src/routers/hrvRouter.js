import express from "express";
import { addHRVReading } from "../controllers/hrvController.js";


const hrvRouter = express.Router();

hrvRouter.post("/", addHRVReading);

export default hrvRouter;
