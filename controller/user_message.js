const User = require('../models/users');
class UserMessage {
  static addMessage(data) {
    return new Promise(async (resolve, reject) => {
      if (data !== null) {
        let receiver = await User.findOne({ _id: data.header.receiver });
        let emitter = await User.findOne({ _id: data.header.emitter });
        let response = {};
        response.emitter = await this.insertMessage({
          data: data,
          user_onupdate: emitter,
          user_onupdate_id: data.header.emitter,
          peer: receiver,
          msgtype: 'send',
        });
        response.receiver = await this.insertMessage({
          data: data,
          user_onupdate: receiver,
          user_onupdate_id: data.header.receiver,
          peer: emitter,
          msgtype: 'receive',
        });
        resolve(response);
      }
    });
  }

  static insertMessage(o) {
    return new Promise(async (resolve, reject) => {
      let body = { ...o.data, msg_type: `${o.msgtype}` };
      let message = {
        peer: o.peer,
        body: [body],
      };
      let output;
      if (o.user_onupdate.messages.length !== 0) {
        let dialog = o.user_onupdate.messages.find((p) =>
          p.peer.equals(o.peer._id)
        );
        if (dialog !== undefined) {
          dialog.body.push(body);
          o.user_onupdate.messages = o.user_onupdate.messages.filter(
            (m) => !o.peer.equals(m.peer)
          );
          output = await this.updateMessage(o.user_onupdate_id, [
            ...o.user_onupdate.messages,
            dialog,
          ]);
        } else {
          output = await this.updateMessage(o.user_onupdate_id, [
            ...o.user_onupdate.messages,
            message,
          ]);
        }
      } else {
        output = this.updateMessage(o.user_onupdate_id, [message]);
      }
      resolve(output);
    });
  }

  static getAllMessages(user) {
    return new Promise(async (resolve, reject) => {
      let allMessages = [];
      let result = await User.findOne({ _id: user });
      if (result !== null) {
        result.messages.forEach(async (item, index, array) => {
          let allItems = {};
          let res = await User.findOne({ _id: item.peer });
          allItems = {
            item: {
              body: item.body.slice(item.body.length - 8, item.body.length),
              _id: item._id,
              peer: item.peer,
            },
            user: res,
          };
          allMessages.push(allItems);
          if (result.messages.length - 1 === index) resolve(allMessages);
        });
      }
    });
  }
  static updateMessage(userId, data) {
    return new Promise(async (resolve, reject) => {
      await User.updateOne({ _id: userId }, { messages: data });
      let res = this.getAllMessages(userId);
      resolve(res);
    });
  }
  static deleteMessage(data) {
    return new Promise(async (resolve, reject) => {
      let user = await User.findOne({ _id: data.user });
      let dialog = user.messages.find((d) => d._id == data.dialog_id);

      dialog.body = dialog.body.filter((m) => m._id != data.msg);
      //console.log(dialog);

      let messages = user.messages.filter((m) => m._id != data.dialog_id);
      // console.log(messages);
      messages = [...messages, dialog];
      await this.updateMessage(data.user, messages);
      let output = await this.getAllMessages(data.user);
      //console.log(msg);

      resolve(output);
    });
  }
}
module.exports = UserMessage;
