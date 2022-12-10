import asyncHandler from "express-async-handler";
import {
    findCourseInPurchasedCourses,
    findCourseInWishListCourses,
} from "../utils/helperFunctions.js";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import Instructor from "../models/Instructor.js";

//@ desc Remove all courses
//@ route /course/remove
//@ access Private testing only
const removeAllCourses = asyncHandler(async (req, res) => {
    req.student.coursesTaken = [];
    await req.student.save();

    res.status(200).send("DELETED");
});

//@ desc Purchase a course
//@ route /course/id/purchase
//@ access Private
const purchaseCourse = asyncHandler(async (req, res) => {
    const found = req.student.coursesTaken.some((r) =>
        req.body.data.includes(r.toString())
    );
    if (found) {
        res.status(400);
        throw new Error("Can not purcase twice");
    }

    let date = new Date().toLocaleString("en-us", {
        month: "short",
        year: "numeric",
    });

    const course = await Course.find({ _id: { $in: req.body.data } });
    if (course.length === 0) {
        res.status(400);
        throw new Error("Course not found.");
    }

    if (course.length !== req.body.data.length) {
        res.status(400);
        throw new Error("Course not correct.");
    }

    const getInstructor = course.map((e) => {
        return {
            date,
            instructorId: e.createdBy,
            amount: e.prc,
        };
    });
    for (const dataNew of getInstructor) {
        const final = await Instructor.findOneAndUpdate(
            { _id: dataNew.instructorId },
            {
                $push: {
                    income: {
                        date: dataNew.date,
                        amount: dataNew.amount,
                    },
                },
            }
        );
        if (!final) {
            res.status(400);
            throw new Error("Course not correct.");
        }
    }

    req.student.coursesTaken.push(...req.body.data);

    await req.student.save();

    res.status(200).json({ message: "Course purchased successfully" });
});

//@ desc Refund a course
//@ route /course/id/refund
//@ access Private
const refundCourse = asyncHandler(async (req, res) => {
    const purchased = findCourseInPurchasedCourses(req.student, req.params.id);

    if (!purchased) {
        res.status(404);
        throw new Error("Cannot refund course");
    }

    const student = await Student.findByIdAndUpdate(req.student._id, {
        $pull: { coursesTaken: req.params.id },
    });

    res.status(200).json({ message: "Refund successful" });
});

//@ desc WishList a course
//@ route /course/id/wishlist
//@ access Private
const wishListCourse = asyncHandler(async (req, res) => {
    const isWishListed = findCourseInWishListCourses(
        req.student,
        req.params.id
    );

    if (isWishListed) {
        res.status(404);
        throw new Error("Could not wishlist course");
    }

    req.student.wishList.push(req.params.id);

    await req.student.save();
    res.status(200).json({ message: "Course wishlisted." });
});

const getWishListedCourses = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id.toString())
        .populate("wishList", [
            "title",
            "price",
            "description",
            "authorName",
            "numOfStudents",
            "avgRating",
            "numOfRatings",
        ])
        .exec();

    res.status(200).json(student.wishList);
});

//@ desc Remove course from WishList
//@ route /course/id/wishlist
//@ access Private
const removeCourseFromWishList = asyncHandler(async (req, res) => {
    const wishListed = findCourseInWishListCourses(req.student, req.params.id);

    if (!wishListed) {
        res.status(404);
        throw new Error("Cannot remove course");
    }

    const student = await Student.findByIdAndUpdate(req.student._id, {
        $pull: { wishList: req.params.id },
    });

    res.status(200).json({ message: "Removed Successfully" });
});

export {
    wishListCourse,
    getWishListedCourses,
    removeCourseFromWishList,
    purchaseCourse,
    removeAllCourses,
    refundCourse,
};
