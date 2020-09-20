const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  status:{type:String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  message:[{ type: mongoose.Types.ObjectId, ref: "myUser", required: true }]
});
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
