import express from "express";
import { createMidtransTransaction } from "../controllers/payment/midtransController.js";

const midtransRouter = express.Router();

midtransRouter.post("/", createMidtransTransaction);

export default midtransRouter;