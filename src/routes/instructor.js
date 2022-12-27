import express from "express";
import { authMiddleware, instructorMiddleware } from "../middleware/auth.js";
import {
    getInstructorProfile,
    getAllInstructors,
    deleteInstructorProfile,
    updateInstructorProfile,
    getInstructorCoursesById,
} from "../controllers/instructor.js";
import { getInstructorCourses } from "../controllers/instructor.js";

const router = express.Router();

router.get("/instructors", getAllInstructors);
router
    .route("/profile/instructor")
    .get(authMiddleware, instructorMiddleware, getInstructorProfile);

router
    .route("/profile/instructor/:id")
    .put(authMiddleware, instructorMiddleware, updateInstructorProfile)
    .delete(authMiddleware, instructorMiddleware, deleteInstructorProfile);

router
    .route("/courses/instructor")
    .get(authMiddleware, instructorMiddleware, getInstructorCourses);

router.route("/course-instructor/:id").get(getInstructorCoursesById);

export default router;
