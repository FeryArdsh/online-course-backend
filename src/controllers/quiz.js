import asyncHandler from "express-async-handler";
import Quiz from "../models/Quiz.js";

const getQuizById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const quiz = await Quiz.findOne({ idCourse: id });

    res.status(200).json(quiz);
});

const getScoreQuiz = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const quiz = await Quiz.findOne({ idCourse: id });
    const correctQuiz = quiz.question.map((e) => {
        return e.correct;
    });

    const result = correctQuiz.reduce(
        (count, value, index) => count + (value === data[index]),
        0
    );

    let grade = 0;
    switch (result) {
        case 0:
            grade = 0;
            break;
        case 1:
            grade = 20;
            break;
        case 2:
            grade = 40;
            break;
        case 3:
            grade = 60;
            break;
        case 4:
            grade = 80;
            break;
        case 5:
            grade = 100;
            break;
        default:
            grade = "Terjadi Kesalahan";
    }

    res.status(200).json({
        grade,
    });
});

const addQuiz = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const quiz = new Quiz({
        idCourse: id,
        question: data,
    });

    await quiz.save();
    res.status(200).json("Berhasil Menambah Quiz");
});

export { addQuiz, getQuizById, getScoreQuiz };
