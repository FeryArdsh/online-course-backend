import Course from "../models/Course.js";
import asyncHandler from "express-async-handler";
import Instructor from "../models/Instructor.js";
import {
    findCourseInPurchasedCourses,
    findReviewedCourses,
} from "../utils/helperFunctions.js";

//@ desc Review a course
//@ route /course/id/reviews
//@ access Private
const addReview = asyncHandler(async (req, res) => {
    const { reviewText, rating } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error("No Course");
    }

    const purchasedCourse = findCourseInPurchasedCourses(
        req.student,
        req.params.id
    );

    if (!purchasedCourse) {
        res.status(404);
        throw new Error("Buy the course to review it.");
    }

    const reviewed = findReviewedCourses(course, req.student._id);

    if (reviewed) {
        res.status(404);
        throw new Error("Cannot review more than once");
    }

    const review = {
        reviewText,
        rating,
        user: req.student._id,
    };

    const instructor = await Instructor.findById(course.createdBy);

    if (!instructor) {
        res.status(404);
        throw new Error("Instructor profile not found");
    }

    course.courseReviews.push(review);

    course.avgRating =
        course.courseReviews.reduce((acc, review) => {
            return review.rating + acc;
        }, 0) / course.courseReviews.length;

    course.numOfRatings++;
    instructor.numberOfReviews += 1;

    await course.save();
    await instructor.save();

    const getTotalRating = await Instructor.findById(course.createdBy).populate(
        "courses",
        "avgRating"
    );
    const divide = getTotalRating.courses.filter((rating) => {
        return rating.avgRating >= 1;
    });

    getTotalRating.avgRating =
        getTotalRating.courses.reduce((acc, review) => {
            return review.avgRating + acc;
        }, 0) / divide.length;

    await getTotalRating.save();
    res.status(201).json({ message: "Course Reviewed" });
});

//@ desc updated a Review
//@ route /course/id/reviews
//@ access Private
const updateReview = asyncHandler(async (req, res) => {
    const { reviewText, rating } = req.body;

    const course = await Course.findOneAndUpdate(
        {
            _id: req.params.id,
        },
        {
            $set: {
                "courseReviews.$[outer].reviewText": reviewText,
                "courseReviews.$[outer].rating": rating,
            },
        },
        {
            arrayFilters: [{ "outer.user": req.student._id }],
        }
    );
    if (!course) {
        res.status(404);
        throw new Error("No Course");
    }

    const newCourse = await Course.findById(req.params.id);

    newCourse.avgRating =
        newCourse.courseReviews.reduce((acc, review) => {
            return review.rating + acc;
        }, 0) / course.courseReviews.length;

    await newCourse.save();

    const getTotalRating = await Instructor.findById(course.createdBy).populate(
        "courses",
        "avgRating"
    );
    const divide = getTotalRating.courses.filter((rating) => {
        return rating.avgRating >= 1;
    });

    getTotalRating.avgRating =
        getTotalRating.courses.reduce((acc, review) => {
            return review.avgRating + acc;
        }, 0) / divide.length;

    await getTotalRating.save();
    res.status(201).json({ message: "Course Review updated" });
});

//@ desc Remove a Review
//@ route /course/id/reviews
//@ access Private
// const deleteReview = asyncHandler(async (req, res) => {
//     const purchasedCourse = findCourseInPurchasedCourses(
//         req.student,
//         req.params.id
//     );

//     if (!purchasedCourse) {
//         res.status(404);
//         throw new Error("Buy the course to review it.");
//     }

//     const course = await Course.findByIdAndUpdate(
//         req.params.id,
//         {
//             $pull: { courseReviews: { user: req.student._id } },
//         },
//         { new: true }
//     );

//     await course.save();

//     const newCourse = await Course.findById(req.params.id);

//     if (course.courseReviews.length >= 1) {
//         newCourse.avgRating =
//             newCourse.courseReviews.reduce((acc, review) => {
//                 return review.rating + acc;
//             }, 0) / course.courseReviews.length;
//         await newCourse.save();

//         const getTotalRating = await Instructor.findById(
//             newCourse.createdBy
//         ).populate("courses", "avgRating");
//         const divide = getTotalRating.courses.filter((rating) => {
//             return rating.avgRating >= 1;
//         });

//         getTotalRating.avgRating =
//             getTotalRating.courses.reduce((acc, review) => {
//                 return review.avgRating + acc;
//             }, 0) / divide.length;

//         await getTotalRating.save();
//         return res.status(200).json({ message: "Deleted Successfully" });
//     }

//     newCourse.avgRating = 0;
//     await newCourse.save();
//     const getTotalRating = await Instructor.findById(course.createdBy).populate(
//         "courses",
//         "avgRating"
//     );
//     const divide = getTotalRating.courses.filter((rating) => {
//         return rating.avgRating >= 1;
//     });

//     getTotalRating.avgRating =
//         getTotalRating.courses.reduce((acc, review) => {
//             return review.avgRating + acc;
//         }, 0) / divide.length;

//     await getTotalRating.save();
//     res.status(200).json({ message: "Deleted Successfully" });
// });

//@ desc Remove all reviews
//@ route /course/reviews
//@ access public for now
const deleteAllReviews = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    course.courseReviews = [];
    await course.save();
});

export { addReview, deleteAllReviews, updateReview };
