import mongoose from "mongoose";

const { Schema } = mongoose;
const courseReviewSchema = new Schema(
	{
		reviewText: {
			type: String,
		},
		rating: {
			type: Number,
			max: 5,
			min: 0,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Student",
		},
	},
	{
		timestamps: true,
	},
);

export default courseReviewSchema;
