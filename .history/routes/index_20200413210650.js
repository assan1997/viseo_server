userController = require('../controller/user_controller');
module.exports = (app) => {
  app.post('/user/create/', userController.create);
  app.post('/user/connect/', userController.connect);
  app.get('/user/all/', userController.getAllUsers);
  app.post('/user/addNew/', userController.addNewContact);
  app.post('/user/updateProfil', userController.updateProfil);
  app.post('/contact/all/', userController.getAllContacts);
};
