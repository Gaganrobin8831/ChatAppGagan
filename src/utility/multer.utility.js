const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});


const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
  
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      
    } else {
      cb(new Error('Only image files are allowed!'), false);
     
    }
  },
});

module.exports = upload;
