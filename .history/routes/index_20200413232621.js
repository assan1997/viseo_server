userController = require('../controller/user_controller');
const { profil } = require('../controller/upload');

userMediaControler = require('../controller/user_media_controller');

module.exports = (app) => {
  app.post('/user/create/', userController.create);
  app.post('/user/connect/', userController.connect);
  app.get('/user/all/', userController.getAllUsers);
  app.post('/user/addNew/', userController.addNewContact);
  app.post('/user/updateProfil', profil, async (req, res) => {
    let data = {};
    data.user = req.body.user;
    data.file = req.file.filename;
    console.log(req.file.filename);
    let output = await userMediaControler.updateUserProfil(data);
    res.json(output);
  });
  app.post('/contact/all/', userController.getAllContacts);
};
