// src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import questionRoutes from "./modules/questions/question.routes";

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("NexusNEET API running 🚀");
});

/* -------------------- ROUTES -------------------- */
app.use("/questions", questionRoutes);

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});