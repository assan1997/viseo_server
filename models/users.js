const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String },
  login: { type: String },
  password: { type: String },
  profil: { type: String },
  isOnline: { type: Boolean, default: false },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  messages: [
    {
      peer: { type: Schema.Types.ObjectId, ref: 'user' },
      body: [
        {
          msg_type: { type: String },
          content: { type: String },
          created_at: { type: String },
        },
      ],
    },
  ],
});
const User = mongoose.model('user', UserSchema);
module.exports = User;
