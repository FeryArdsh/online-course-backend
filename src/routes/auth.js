import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
	getAllStudentProfile,
	createStudent,
	getStudentProfile,
	updateStudentProfile,
	loginStudent,
	logoutStudent,
	logoutStudentFromAllDevices,
	createInstructor,
	updateStudentImg,
} from "../controllers/auth.js";
import upload from "../middleware/multerUpload.js";

const router = express.Router();

router.get("/all", getAllStudentProfile);
router.post("/signup", createStudent);
router.post("/login", loginStudent);
router.post("/add-instructor",authMiddleware, createInstructor);
router.post("/logout", authMiddleware, logoutStudent);
router.post("/logout/all", authMiddleware, logoutStudentFromAllDevices);
router
	.route("/profile/me")
	.get(authMiddleware, getStudentProfile)
	.put(authMiddleware, updateStudentProfile);
router.put("/profile/me/img", authMiddleware, upload.single("myFile"), updateStudentImg)
export default router;
