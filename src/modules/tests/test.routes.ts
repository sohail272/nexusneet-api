import { Router } from "express";
import {
  createTestHandler,
  getTestByIdHandler,
  listTestsHandler,
  publishTestHandler,
} from "./test.controller";

const router = Router();

router.post("/", createTestHandler);
router.get("/", listTestsHandler);
router.get("/:id", getTestByIdHandler);
router.post("/:id/publish", publishTestHandler);

export default router;
