import Course from '../models/Course.js';
import asyncHandler from 'express-async-handler';
import Instructor from '../models/Instructor.js';
import cloudinary from '../config/cloudinary.js';

//@ desc Get all courses
//@ route /courses
//@ access Public/ for testing only
const getAllCourses = asyncHandler(async (req, res) => {
	const courses = await Course.find();

	if (courses.length === 0) {
		res.status(404);
		throw new Error('No courses found');
	}

	res.status(200).json({ courses });
});

//@ desc Create new course
//@ route /course
//@ access Private
const createCourse = asyncHandler(async (req, res) => {
	const { ttl, desc, fullDesc, languageOfCourse, level, category, prc, img, courseRequirements } = req.body;

	if (!ttl && !desc && !fullDesc && !img) {
		res.status(400);
		throw new Error('Fields is required');
	}

	const instructor = await Instructor.findOne({ studentID: req.student._id });

	if (!instructor) {
		res.status(400);
		throw new Error('Could not find Instructor');
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
		img: {
			public_id: uploadRes.public_id,
			url: uploadRes.secure_url
		}
	});

	instructor.courses.push(course._id);
	req.student.coursesTaken.push(course._id);
	instructor.numberOfCourses++;

	await instructor.save();
	await req.student.save();
	await course.save();

	res.status(201).json({ course });
});

//@ desc Add course videos
//@ route /course/id/videos
//@ access Private
const addCourseVideos = asyncHandler(async (req, res) => {
	const course = await Course.findByIdAndUpdate(req.params.id, {
		$push: {
			videos: { $each: req.body }
		}
	});
	
	if (!course) {
		res.status(404);
		throw new Error('Course not exists');
	}

	const totalDuration = await Course.findById(req.params.id)
	let tot = 0
	totalDuration.videos.forEach((dur)=>{
		tot += dur.sectionDuration
	})

	totalDuration.totalDuration = tot
	await totalDuration.save();
	res.status(201).json({ message: 'Videos added successfully.', data: totalDuration });
});

//@ desc Update course videos
//@ route /course/id/videos
//@ access Private
const updateCourseVideos = asyncHandler(async (req, res) => {
	const course = await Course.findByIdAndUpdate(req.params.id, {
		$set: {
			"videos.$[outer].section": req.body.titleSection,
			"videos.$[outer].video.$[inner].title": req.body.title,
			"videos.$[outer].video.$[inner].url": req.body.url,
			"videos.$[outer].video.$[inner].duration": req.body.duration,
		}
	}, {
		arrayFilters: [
			{"outer._id": req.body.idSection},
			{"inner._id": req.body.idVideo}
		]
	});

	if (!course) {
		res.status(404);
		throw new Error('Course not exists');
	}
	await course.save();

	const totalDuration = await Course.findById(req.params.id)
	let tot = 0
	totalDuration.videos.forEach((dur)=>{
		tot += dur.sectionDuration
	})

	totalDuration.totalDuration = tot
	await totalDuration.save();
	res.status(201).json({ message: 'Videos added successfully.', data: course });
});

//@ desc Get A specific course
//@ route /course/id
//@ access Public
const getCourse = asyncHandler(async (req, res) => {
	const sumTotalDur = await Course.aggregate([
		{
			$group: {
				_id: null,
				totalDuration: {
					$sum: {$sum: videos.sectionDuration}
				}
			}
		}
	])

	console.log(sumTotalDur)
	const course = await Course.findById(req.params.id)
		.populate('createdBy', [
			'name',
			'profession',
			'aboutMe',
			'numberOfCourses',
			'numberOfReviews',
		]) // 2nd argument is to return specified elements of the object
		.exec();

	if (!course) {
		res.status(400);
		throw new Error('Could not find course');
	}

	res.status(200).json({ course });
});

export { getAllCourses, createCourse, getCourse, addCourseVideos, updateCourseVideos };
