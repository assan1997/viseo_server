const User = require('../models/users');
module.exports = {
  async getAllUsers(req, res) {
    User.find().then((users) => {
      res.json(users);
    });
  },
  async create(req, res) {
    let data = req.body;
    const newUser = new User({
      login: data.login,
      email: data.email,
      password: data.password,
    });
    let user = await User.findOne({ login: data.login });
    if (user !== null) {
      res.json({ err: 'err' });
    } else {
      newUser.save();
    }
  },
  async connect(req, res) {
    if (req.body && req.body !== null) {
      let data = req.body;
      let result = await User.findOne({
        email: data.email,
        password: data.password,
      });
      if (result !== null) {
        res.json(result);
      } else {
        res.json({ err: 'connection failed' });
      }
    }
  },
  async addNewContact(req, res) {
    let data = req.body;
    if (data.pseudo !== data.user_pseudo) {
      let contact = await User.findOne({ login: data.pseudo });
      let user = await User.findOne({ login: data.user_pseudo });
      if (contact !== null) {
        let result = user.contacts.find((c) => c.login === data.pseudo);
        let index = user.contacts.findIndex((c) => c.login === data.pseudo);
        if (result !== null) {
          user.contacts.splice(user.contacts(indexOf(index), contact));
          await User.updateOne(
            { login: data.user_pseudo },
            { contacts: [...user.contacts, contact] }
          );
          let output = await User.findOne({ login: data.user_pseudo }).populate(
            'contacts'
          );
          res.json(output);
        }
        
      }
      function saveContact(params,contact==null) {
        await User.updateOne(
          { login: data.user_pseudo },
          { contacts: [...user.contacts, contact] }
        );
        let output = await User.findOne({ login: data.user_pseudo }).populate(
          'contacts'
        );
        res.json(output);
      }
    }
  },
  async getAllContacts(req, res) {
    let output = await User.findOne({ login: req.body.login }).populate(
      'contacts'
    );
    res.json(output);
  },
};
