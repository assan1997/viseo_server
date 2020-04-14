userController = require('../controller/user_controller');
//const { profil } = require('../controller/upload');

userMediaControler = require('../controller/user_media_controller');

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './ImageProfil',
  filename: function (req, file, cb) {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  },
});
const profil = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
}).single('profil');

module.exports = (app) => {
  app.post('/user/create/', userController.create);
  app.post('/user/connect/', userController.connect);
  app.get('/user/all/', userController.getAllUsers);
  app.post('/user/addNew/', userController.addNewContact);
  app.post('/user/updateProfil', profil, (req, res) => {});
  app.post('/contact/all/', userController.getAllContacts);
};
