import multer from "multer";

const storage = multer.diskStorage({});

let upload = multer({
    storage,
});

export default upload
