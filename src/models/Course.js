import mongoose from "mongoose";
import courseReviewSchema from "./CourseReview.js";

const { Schema } = mongoose;

const CourseSchema = new Schema({
	ttl: {
		type: String,
		required: true,
		unique: true,
	},
	desc: {
		type: String,
		required: true,
	},
	fullDesc: {
		type: String,
		required: true,
	},
	courseRequirements: [String],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Instructor",
		required: true,
	},
	img: {
		public_id: String,
		url: String,
	},
	languageOfCourse: {
		type: String,
		default: "english",
	},
	enrolled: {
		type: Number,
		default: 0,
	},
	avgRating: {
		type: Number,
		min: 0,
		max: 5,
		default: 0,
	},
	numOfRatings: {
		type: Number,
		default: 0,
	},
	category: {
		type: String,
		required: true,
	},
	badge: {
		type: String,
	},
	prc: {
		type: Number,
		required: true,
	},
	newPrc: {
		type: Number,
		required: true,
	},
	disc: {
		type: Number,
		required: true,
	},
	courseReviews: [courseReviewSchema],
});

const Course = mongoose.model("Course", CourseSchema);

export default Course;
