const multer = require('multer');
const path = require('path');

// Configure storage engine and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './../../uploads/'),
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({storage});

module.exports = upload;
