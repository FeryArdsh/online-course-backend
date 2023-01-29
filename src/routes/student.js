import express from "express";
import {
    purchaseCourse,
    removeAllCourses,
    wishListCourse,
    refundCourse,
    removeCourseFromWishList,
    getWishListedCourses,
    courseTakenStudent,
    certificateCourse,
} from "../controllers/student.js";
import { authMiddleware } from "../middleware/auth.js";
const router = express.Router();

router.route("/course/purchase").post(authMiddleware, purchaseCourse);
router.route("/certificate/:id").post(authMiddleware, certificateCourse);
router.route("/course/:id/refund").post(authMiddleware, refundCourse);
router
    .route("/course/:id/wishlist")
    .post(authMiddleware, wishListCourse)
    .delete(authMiddleware, removeCourseFromWishList);
router.route("/course/all/wishlist").get(authMiddleware, getWishListedCourses);
router.route("/course/remove").delete(authMiddleware, removeAllCourses);
router.route("/student/taken").get(authMiddleware, courseTakenStudent);

export default router;
