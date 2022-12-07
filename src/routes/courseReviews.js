import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { addReview, deleteAllReviews } from "../controllers/courseReviews.js";
const router = express.Router();

router.route("/course/:id/reviews").post(authMiddleware, addReview);

router.route("/course/reviews/:id").delete(deleteAllReviews);

export default router;
