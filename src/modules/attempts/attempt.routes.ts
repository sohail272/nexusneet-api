import { Router } from "express";
import {
  getAttemptResultHandler,
  saveAttemptAnswersHandler,
  startAttemptHandler,
  submitAttemptHandler,
} from "./attempt.controller";

const router = Router();

router.post("/tests/:testId/start", startAttemptHandler);
router.post("/:attemptId/answers", saveAttemptAnswersHandler);
router.post("/:attemptId/submit", submitAttemptHandler);
router.get("/:attemptId/result", getAttemptResultHandler);

export default router;
