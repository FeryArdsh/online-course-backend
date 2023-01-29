import mongoose from "mongoose";

const { Schema } = mongoose;
const QuizSchema = new Schema({
    idCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    question: [
        {
            title: String,
            a: String,
            b: String,
            c: String,
            d: String,
            correct: String,
        },
    ],
});

const Quiz = mongoose.model("Quiz", QuizSchema);
export default Quiz;
