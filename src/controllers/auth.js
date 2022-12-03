import Student from "../models/Student.js";
import asyncHandler from "express-async-handler";
import Instructor from "../models/Instructor.js";

// @desc Get all students
// @route /
// @access Public for now
const getAllStudentProfile = asyncHandler(async (req, res) => {
	const students = await Student.find({});
	
	if (students.length === 0) {
		res.status(404);
		throw new Error("No Students found");
	}
	res.json({ students });
});

// @desc Register Student
// @route /signup
// @access Public
const createStudent = asyncHandler(async (req, res) => {
	const { name, email, password, headline, isInstructor, profession, aboutMe } =
		req.body;

	if (!name && !email && !password) {
		res.status(404);
		throw new Error("Fields is required");
	}

	const isStudent = await Student.findOne({ email });

	if (isStudent) {
		res.status(404);
		throw new Error("Email already exists.");
	}

	const student = new Student({
		name,
		email,
		password,
		isInstructor,
		headline: headline ? headline : "",
	});

	if (isInstructor) {
		const instructor = new Instructor({
			name: student.name,
			studentID: student._id,
			profession,
			aboutMe,
		});

		await instructor.save();
	}

	const token = await student.generateAuthToken();

	res.status(201).json({ name, email, headline, token });
});

// @desc Register Instructor
// @route /signup
// @access Public
const createInstructor = asyncHandler(async (req, res) => {
	const { profession, aboutMe } = req.body;
	const studentId = req.student._id

	if (!profession && !aboutMe) {
		res.status(404);
		throw new Error("Fields required");
	}


	const isStudent = await Student.findByIdAndUpdate(studentId, {
		isInstructor: true
	});
	if (!isStudent) {
		res.status(404);
		throw new Error("Can't update data");
	}
	
	try {
		const instructorData = new Instructor({
			studentID: studentId,
			profession,
			aboutMe,
		})
		await instructorData.save()
	} catch (error) {
		return res.status(201).json(error);
	}

	res.status(201).json({message: "Success add data"});
});


// @desc Login Student
// @route /login
// @access Public
const loginStudent = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const student = await Student.findStudentByCredentials(email, password);

	if (!student) {
		res.status(404);
		throw new Error("Please enter correct email and password.");
	}
	
	const token = await student.generateAuthToken();

	res.status(200).json({
		name: student.name,
		email: student.email,
		headline: student.headline,
		token,
	});
});

//@desc Get Student Profile
//@route /profile/me
//@access private
const getStudentProfile = asyncHandler(async (req, res) => {
	const student = await Student.findById(req.student._id);

	if (!student) {
		res.status(404);
		throw new Error("Can't get student profile");
	}

	res.json({
		_id: student._id,
		name: student.name,
		email: student.email,
		headline: student.headline,
		isInstructor: student.isInstructor,
	});
});

//@desc Update Student Profile
//@route /profile/me
//@access private
const updateStudentProfile = asyncHandler(async (req, res) => {
	const student = await Student.findById(req.student._id);

	const { name, email, headline, isInstructor, profession, aboutMe } = req.body;

	if (student) {
		student.name = name || student.name;
		student.email = email || student.email;
		student.headline = headline || student.headline;

		if (req.body.password) {
			student.password = req.body.password;
		}

		if (isInstructor) {
			student.isInstructor = true;

			const instructor = new Instructor({
				name: student.name,
				profession,
				aboutMe,
				studentID: student._id,
			});

			await instructor.save();
		}

		await student.save();
		res.status(200).json({
			_id: student._id,
			name: student.name,
			email: student.email,
			headline: student.headline,
			isInstructor: student.isInstructor,
		});
	} else {
		res.status(404);
		throw new Error("Student not found");
	}
});

//@desc Update Student Image
//@route /profile/me
//@access private
const updateStudentImg = asyncHandler(async (req, res) => {
	if (!req.body) {
		res.status(404);
		throw new Error("Fields is required");
	}

	let uploadRes;
	try {
		uploadRes = await cloudinary.v2.uploader.upload(req.body.image, {
			folder: "image",
			resource_type: "auto",
		});
	} catch (error) {
		return res.status(400).json({ message: error });
	}

	const student = await Student.findByIdAndUpdate(req.student._id, {
		set$:{
			"imgProfil.public_id": uploadRes.public_id,
            "imgProfil.url": uploadRes.secure_url,
		}
	});

	if(!student){
		res.status(404);
		throw new Error("Student not found");
	}

	res.status(200).json({message: "Success update data"});
});

// @desc Logout Student
// @route /logout
// @access Private
const logoutStudent = asyncHandler(async (req, res) => {
	req.student.tokens = req.student.tokens.filter((token) => {
		return token.token != req.token;
	});

	await req.student.save();
	res.status(200).send();
});

// @desc Logout Student From all devices
// @route /logout/all
// @access Private
const logoutStudentFromAllDevices = async (req, res) => {
	req.student.tokens = [];
	await req.student.save();
	res.status(200).send();
};

export {
	getAllStudentProfile,
	createStudent,
	getStudentProfile,
	updateStudentProfile,
	loginStudent,
	logoutStudent,
	logoutStudentFromAllDevices,
	createInstructor,
	updateStudentImg
};
