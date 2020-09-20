const mongoose = require("mongoose");

const placesSchema = new mongoose.Schema({
  
  message: { type: String, required: true },
  creatorId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  receiverId:{type: String ,required: true}
});

module.exports = mongoose.model("myUser", placesSchema);
