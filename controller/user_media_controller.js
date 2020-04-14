const User = require('../models/users');
class updateUserProfil {
  static updateUserProfil(data) {
    return new Promise(async (resolve, reject) => {
      let res = await User.updateOne(
        { login: data.user },
        { profil: data.file }
      );
      if (res !== null) {
        let result = await User.findOne({ login: data.user });
        if (result !== null) resolve(result);
      }
    });
  }
}
module.exports = updateUserProfil;
