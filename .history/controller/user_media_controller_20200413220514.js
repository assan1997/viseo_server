const User = require('../models/users');
class updateUserProfil {
  static updateUserProfil() {
    return new Promise((resolve, reject) => {
      User.findOne({});
    });
  }
}

module.exports = updateUserProfil;
