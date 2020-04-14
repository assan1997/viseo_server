const User = require('../models/users');
class updateUserProfil {
  static updateUserProfil(data) {
    return new Promise((resolve, reject) => {
      User.findOne({ login: data.user });
    });
  }
}

module.exports = updateUserProfil;
