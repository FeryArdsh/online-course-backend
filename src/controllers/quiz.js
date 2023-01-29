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

    const foo = 1;
    let output = 0;
    switch (foo) {
        case 0:
            output = 0;
            break;
        case 1:
            output = 20;
            break;
        case 2:
            output = 40;
            break;
        case 3:
            output = 60;
            break;
        case 4:
            output = 80;
            break;
        default:
            output = 100;
    }

    res.status(200).json("Hasil");
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
