const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './Images',
  filename: function (req, file, cb) {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  },
});
const profil = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
}).single('profil');
const msgimage = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
}).single('photo');
const msgvideo = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
}).single('video');

function addStorage(storagePath, fileStartName) {
  const storage = multer.diskStorage({
    destination: `./${storagePath}`,
    filename: function (req, file, cb) {
      cb(
        null,
        `${fileStartName}-` + Date.now() + path.extname(file.originalname)
      );
    },
  });
  return storage;
}
