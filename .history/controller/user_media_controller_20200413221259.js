const User = require('../models/users');
class updateUserProfil {
  static async updateUserProfil(data) {
    return new Promise((resolve, reject) => {
      let res = User.updateOne({ login: data.user }, { profil: data.file });
      if (res !== null) resolve(res);
    });
  }
}

module.exports = updateUserProfil;
