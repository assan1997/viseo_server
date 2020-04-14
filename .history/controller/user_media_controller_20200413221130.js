const User = require('../models/users');
class updateUserProfil {
  static async updateUserProfil(data) {
    return new Promise((resolve, reject) => {
      let res = User.updateOne({ login: data.user });
      if (res !== null) resolve(res);
    });
  }
}

module.exports = updateUserProfil;
