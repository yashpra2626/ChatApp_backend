const express = require("express");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const myUsersRoute = require("./routes//myUsersRoute");
const userRoute = require("./routes/userRoute");
const Pusher = require("pusher");
const app = express();
// const pusher = new Pusher({
//   app_id: "1072697",
//   key: "951df5bf123c0460974d",
//   secret: "8f915e2fe6c8cc4dbae2",
//   cluster: "ap2",
//   encrypted: true,
// });
app.use(bodyParser.json());
app.use(fileUpload());
app.use("/uploads", express.static(path.join("uploads")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X_Requested_With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "PATCH,POST,GET,DELETE");
  next();
});

// const db = mongoose.connection;

// db.once("open", () => {
//   const msgCollection = db.collection("myusers");
//   const changeStream = msgCollection.watch();

//   changeStream.on("change", (change) => {
//     if (change.operationType === "insert") {
//       const messageDetails = change.fullDocument;
//       pusher.trigger("messages", "inserted", messageDetails);
//     }
//   });
// });

app.use("/api/myusers", myUsersRoute);
app.use("/api/user", userRoute);

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dxdci.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(url)
  .then(() => {
    app.listen(5000);
    console.log("Connection Success");
  })
  .catch((err) => {
    console.log("Mongoose Database Error", err);
  });
