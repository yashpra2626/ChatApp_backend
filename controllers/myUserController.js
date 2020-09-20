const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const myUser = require("../models/myUser");
const User = require("../models/user");
const mongoose = require("mongoose");
const fs = require("fs");
//const pusher = require("../pusher");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  } catch (err) {
    return next(new Error(err.message));
  }
};

const getChats = async (req, res, next) => {
  const receiverId = req.params.uid;
  const userId = req.userData.userId;
  let messages;
  try {
    messages = await myUser.find().populate("creatorId");
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }

  if (!messages) {
    return next(new Error("message does not exist with given userId"));
  }
  let mess;
  mess = messages.filter(
    (m) =>
      (userId === m.creatorId._id.toString() && m.receiverId === receiverId) ||
      (m.receiverId === userId && receiverId === m.creatorId._id.toString())
  );

  res.json({ chats: mess });
};

const newChat = async (req, res, next) => {
  const receiverId = req.params.uid;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new Error("Invalid user input"));
  }
  const { message } = req.body;
  let user;
  try {
    user = await User.findById(req.userData.userId);
    if (!user) {
      return next(new Error("User does not exist for given Id"));
    }
  } catch (err) {
    return next(new Error(err));
  }

  const newMessage = new myUser({
    message,
    creatorId: user.id,
    receiverId: receiverId,
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await newMessage.save({ session: sess });

    await sess.commitTransaction();
    //pusher.trigger("messages", "inserted", newMessage);
  } catch (err) {
    const error = new Error(err.message);
    return next(error);
  }
   res.json(newMessage);
};

const updateProfileByUserId = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error("Invalid user input");
  }
  const userId = req.params.uid;
  const { name, status } = req.body;

  let profile;
  try {
    profile = await User.findById(userId);
  } catch (err) {
    return next(new Error(err.message));
  }
  if (!profile) {
    return next(new Error("Requested place does not exist"));
  }

  if (profile.id !== req.userData.userId) {
    return next(new Error("Not Authorized to Update"));
  }

  profile.name = name;
  profile.status = status;

  try {
    await profile.save();
  } catch (error) {
    return next(new Error(error.message));
  }
  res.json({ users: profile.toObject({ getters: true }) });
};

const deleteProfileByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let profile;

  try {
    profile = await User.findById(userId);
  } catch (err) {
    return next(new Error(err.message));
  }

  if (!profile) {
    return res.json({ message: "Place does not exist" });
  }
  if (profile.id !== req.userData.userId) {
    return next(new Error("Not Authorized to Delete"));
  }

  const imagePath = profile.image;
  const user = profile.id;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await profile.remove({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    return next(new Error(err.message));
  }

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
    }
  });
  res.json({ message: "Successfully delete the place" });
};

exports.getUsers = getUsers;
exports.getChats = getChats;
exports.newChat = newChat;
exports.updateProfileByUserId = updateProfileByUserId;
exports.deleteProfileByUserId = deleteProfileByUserId;
