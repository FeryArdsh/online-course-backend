import Course from "../models/Course.js";
import asyncHandler from "express-async-handler";
import Instructor from "../models/Instructor.js";
import cloudinary from "../config/cloudinary.js";

//@ desc Get all courses
//@ route /courses
//@ access Public/ for testing only
const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().select("-videos");

    if (courses.length === 0) {
        res.status(404);
        throw new Error("No courses found");
    }

    res.status(200).json({ courses });
});

//@ desc Create new course
//@ route /course
//@ access Private
const createCourse = asyncHandler(async (req, res) => {
    const {
        ttl,
        desc,
        fullDesc,
        languageOfCourse,
        level,
        category,
        prc,
        img,
        courseRequirements,
    } = req.body;

    if (!ttl && !desc && !fullDesc && !img) {
        res.status(400);
        throw new Error("Fields is required");
    }

    const titleExist = await Course.findOne({ ttl });
    if (titleExist) {
        res.status(400);
        throw new Error("Title already exist");
    }

    const instructor = await Instructor.findOne({ studentID: req.student._id });

    if (!instructor) {
        res.status(400);
        throw new Error("Could not find Instructor");
    }

    let uploadRes;
    try {
        uploadRes = await cloudinary.v2.uploader.upload(img, {
            folder: "courseImg",
            resource_type: "auto",
        });
    } catch (error) {
        return res.status(400).json({ message: error });
    }

    const course = new Course({
        createdBy: instructor._id,
        ttl,
        desc,
        fullDesc,
        languageOfCourse,
        category,
        prc,
        newPrc: prc,
        level,
        courseRequirements,
        enrolled: 1,
        img: {
            public_id: uploadRes.public_id,
            url: uploadRes.secure_url,
        },
    });

    instructor.courses.push(course._id);
    req.student.coursesTaken.push(course._id);
    instructor.numberOfCourses++;

    await instructor.save();
    await req.student.save();
    await course.save();

    res.status(201).json({ message: "success add course", course });
});

//@ desc Add course videos
//@ route /course/id/videos
//@ access Private
const addCourseVideos = asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.id, {
        $push: {
            videos: { $each: req.body },
        },
    });

    if (!course) {
        res.status(404);
        throw new Error("Course not exists");
    }

    const getCourse = await Course.findById(req.params.id);
    if (!getCourse) {
        res.status(400);
        throw new Error("Could not find course");
    }

    getCourse.videos.forEach(async function (dur) {
        let totSection = dur.video.reduce(function (item, elem) {
            return item + elem.duration;
        }, 0);
        dur.sectionDuration = totSection;
    });
    await getCourse.save();

    let tot = 0;
    getCourse.videos.forEach((dur) => {
        tot += dur.sectionDuration;
    });
    getCourse.totalDuration = tot;
    getCourse.publish = true;
    await getCourse.save();
    res.status(201).json({
        message: "Videos added successfully.",
    });
});

//@ desc Update course videos
//@ route /course/id/videos
//@ access Private
const updateCourseVideos = asyncHandler(async (req, res) => {
    const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                "videos.$[outer].section": req.body.titleSection,
                "videos.$[outer].video.$[inner].title": req.body.title,
                "videos.$[outer].video.$[inner].url": req.body.url,
                "videos.$[outer].video.$[inner].duration": req.body.duration,
            },
        },
        {
            arrayFilters: [
                { "outer._id": req.body.idSection },
                { "inner._id": req.body.idVideo },
            ],
        }
    );

    if (!course) {
        res.status(404);
        throw new Error("Course not exists");
    }
    await course.save();

    const getCourse = await Course.findById(req.params.id);
    if (!getCourse) {
        res.status(400);
        throw new Error("Could not find course");
    }

    getCourse.videos.forEach(async function (dur) {
        let totSection = dur.video.reduce(function (item, elem) {
            return item + elem.duration;
        }, 0);
        dur.sectionDuration = totSection;
    });
    await getCourse.save();

    let tot = 0;
    getCourse.videos.forEach((dur) => {
        tot += dur.sectionDuration;
    });
    getCourse.totalDuration = tot;
    await getCourse.save();

    res.status(201).json({
        message: "Videos added successfully.",
        data: course,
    });
});

//@ desc Get A specific course
//@ route /course/id
//@ access Public
const getCourse = asyncHandler(async (req, res) => {
    const getCourse = await Course.findById(req.params.id);
    if (!getCourse) {
        res.status(400);
        throw new Error("Could not find course");
    }

    getCourse.videos.forEach(async function (dur) {
        let totSection = dur.video.reduce(function (item, elem) {
            return item + elem.duration;
        }, 0);
        dur.sectionDuration = totSection;
    });
    await getCourse.save();

    let tot = 0;
    getCourse.videos.forEach((dur) => {
        tot += dur.sectionDuration;
    });
    getCourse.totalDuration = tot;
    await getCourse.save();

    const course = await Course.findById(req.params.id)
        .populate({
            path: "createdBy",
            populate: [
                {
                    path: "studentID",
                    select: ["name", "imgProfil"],
                },
                {
                    path: "courses",
                    select: ["-videos", "-courseReviews"],
                },
            ],
        })
        .exec();

    if (!course) {
        res.status(400);
        throw new Error("Could not find course");
    }

    res.status(200).json({ course });
});

export {
    getAllCourses,
    createCourse,
    getCourse,
    addCourseVideos,
    updateCourseVideos,
};
