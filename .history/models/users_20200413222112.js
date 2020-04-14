const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: { type: String },
  login: { type: String },
  password: { type: String },
  profil: { type: String },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'user' }],
});
const User = mongoose.model('user', UserSchema);
module.exports = User;
