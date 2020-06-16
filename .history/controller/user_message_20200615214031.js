const User = require('../models/users');
const Chat = require('../models/messages');
const ChatGroup = require('../models/messageGroup');
class UserMessage {
  static addMessage(data) {
    return new Promise(async (resolve, reject) => {
      if (data !== null) {
        let chat = await Chat.findOne({
          $or: [
            { emitter: data.header.emitter, receiver: data.header.receiver },
            { emitter: data.header.receiver, receiver: data.header.emitter },
          ],
        });
        if (chat === null) {
          let ct = await new Chat({
            emitter: data.header.emitter,
            receiver: data.header.receiver,
            messageGroup: [],
          });
          ct.save().then(async (ctr) => {
            await new ChatGroup({
              chat_id: ctr._id,
              date: date,
              body: [
                {
                  sendBy: data.header.emitter,
                  content: data.content,
                  time: data.created_at,
                },
              ],
            })
              .save()
              .then((s) => {
                ctr.messageGroup.push(s._id);
                ctr.save();
              });
          });
        } else {
          console.log(chat);
          let month = new Date().getMonth() + 1,
            day = new Date().getDate();
          let date =
            new Date().getFullYear() +
            (month < 10 ? '0' + month : month) +
            (day < 10 ? '0' + day : day);

          let chatG = ChatGroup.findOne({ chat_id: chat._id, date: date }).then(
            (r) => r
          );
          if (chatG !== null) {
            chatG.body.push({
              sendBy: data.header.emitter,
              content: data.content,
              time: data.created_at,
            });
            chatG.save();
          } else {
            await new ChatGroup({
              chat_id: chat._id,
              date: date,
              body: [
                {
                  sendBy: data.header.emitter,
                  content: data.content,
                  time: data.created_at,
                },
              ],
            })
              .save()
              .then((s) => {
                chat.messageGroup.push(s._id);
                chat.save();
              });
          }
        }
      }
    });
  }
  static getAllMessages(user) {
    return new Promise(async (resolve, reject) => {
      await Chat.findOne({
        $or: [{ emitter: user }, { receiver: user }],
      })
        .populate('messageGroup')
        .then((c) => resolve(c));
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
