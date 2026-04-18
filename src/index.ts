// src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import questionRoutes from "./modules/questions/question.routes";
import testRoutes from "./modules/tests/test.routes";
import attemptRoutes from "./modules/attempts/attempt.routes";

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (_req, res) => {
  res.send("NexusNEET API running 🚀");
});

/* -------------------- ROUTES -------------------- */
app.use("/questions", questionRoutes);
app.use("/tests", testRoutes);
app.use("/attempts", attemptRoutes);

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
