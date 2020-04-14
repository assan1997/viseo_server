const User = require('../models/users');
class updateUserProfil {
  static updateUserProfil(data) {
    return new Promise(async (resolve, reject) => {
      let res = User.updateOne({ login: data.user }, { profil: data.file });
      if (res !== null) {
        let profil = await User.finOne({ login: data.user });
        resolve(res);
      }
    });
  }
}

module.exports = updateUserProfil;
