import mongoose from "mongoose";

const { Schema } = mongoose;

const InstructorSchema = new Schema({
	profession: {
		type: String,
		required: true,
		maxlength: 20,
	},
	aboutMe: {
		type: String,
	},
	studentID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Student",
		required: true,
		unique: true,
	},
	courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
	],
	numberOfCourses: {
		type: Number,
		default: 0,
	},
	numberOfReviews: {
		type: Number,
		default: 0,
	},
	avgRating: {
		type: Number,
		min: 0,
		max: 5,
		default: 0,
	},
	numberOfStudent: {
		type: Number,
		default: 0,
	},
});

const Instructor = mongoose.model("Instructor", InstructorSchema);

export default Instructor;
