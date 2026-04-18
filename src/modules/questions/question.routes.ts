import { Router } from "express";
import {
  createQuestionHandler,
  getQuestionsHandler,
} from "./question.controller";

const router = Router();

router.post("/", createQuestionHandler);
router.get("/", getQuestionsHandler);

export default router;