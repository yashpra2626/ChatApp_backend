const express = require("express");
const router = express.Router();
const myUserController= require("../controllers/myUserController");
const { check } = require("express-validator");
const checkAuth = require("../middlewares/authcheck");
router.use(checkAuth);

router.get("/", myUserController.getUsers);

router.get("/:uid/chat", myUserController.getChats);

router.post(
  "/:uid/chat",
  [
    check("message").not().isEmpty(), 
  ],
  myUserController.newChat
);

router.patch(
    "/:uid",
    [check("name").not().isEmpty(), check("status").not().isEmpty()],
    myUserController.updateProfileByUserId
  );
  
router.delete("/:uid", myUserController.deleteProfileByUserId);

module.exports = router;











