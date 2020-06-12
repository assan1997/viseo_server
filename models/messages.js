const Schema = mongoose.Schema;
const MessageSchama = new Schema({
  emitter: { type: Schema.Types.ObjectId, ref: 'user' },
  receiver: { type: Schema.Types.ObjectId, ref: 'user' },
  body: [{ type: Schema.Types.ObjectId, ref: 'messagebody' }],
});
const Message = mongoose.model('message', MessageSchama);
module.exports = Message;
