import express from "express";
import { addQuiz, getQuizById, getScoreQuiz } from "../controllers/quiz.js";
const router = express.Router();

router.route("/quiz/:id").post(addQuiz);
router.route("/quiz/:id").get(getQuizById);
router.route("/correct-quiz/:id").post(getScoreQuiz);

export default router;
