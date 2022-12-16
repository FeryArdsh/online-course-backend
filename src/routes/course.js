import express from "express";
import { authMiddleware, instructorMiddleware } from "../middleware/auth.js";
import {
    getAllCourses,
    createCourse,
    getCourse,
    addCourseVideos,
    updateCourseVideos,
} from "../controllers/course.js";
import upload from "../middleware/multerUpload.js";
const router = express.Router();

router.get("/courses", getAllCourses);

router
    .route("/course")
    .post(authMiddleware, instructorMiddleware, createCourse);

router
    .route("/course/:id/videos")
    .post(
        authMiddleware,
        instructorMiddleware,
        upload.single("myFile"),
        addCourseVideos
    )
    .put(authMiddleware, instructorMiddleware, updateCourseVideos);

router.route("/course/:id").get(getCourse);

export default router;
