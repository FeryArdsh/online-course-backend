import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import instructorRouter from "./routes/instructor.js";
import courseRouter from "./routes/course.js";
import studentRouter from "./routes/student.js";
import reviewRouter from "./routes/courseReviews.js";
import quizRouter from "./routes/quiz.js";
import { errorMiddleware, notFound } from "./middleware/errorMiddleware.js";

const PORT = 5000 || process.env.PORT;

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(authRouter);
app.use(courseRouter);
app.use(instructorRouter);
app.use(studentRouter);
app.use(reviewRouter);
app.use(quizRouter);

app.use(notFound);
app.use(errorMiddleware);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running in PORT ${PORT}`);
    });
});
