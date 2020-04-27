"use strict";

// basic configuration
const express = require("express"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  shortid = require("shortid"),
  cors = require("cors"),
  app = express();

// connect to the database
mongoose.connect(process.env.MLAB_URI || "mongodb://localhost/exercise-track", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// parse the POST bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// check db connection status
mongoose.connection.once("open", () =>
  console.log("DB Connection Successful!")
);

// set user schema & model
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      minlength: 3,
      trim: true
    },
    _id: String
  }),
  User = mongoose.model("User", userSchema);

// set exercise schema & model
const exerciseSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date }
  }),
  Exercise = mongoose.model("Exercise", exerciseSchema);

// route to main HTML page
app.use(express.static("public"));
app.get("/", (_, res) => res.sendFile(`${__dirname}/views/index.html`));

// saving the username in the database
app.post("/api/exercise/new-user", (req, res, next) => {
  const { username } = req.body,
    // create a new user instance & generate the user id
    newUser = new User({ username, _id: shortid.generate() });
  let data;

  User.find()
    .then(entries => {
      data = entries;
      // check if already in the db
      data = data.filter(obj => obj["username"] === username);
      if (data.length === 0) {
        newUser // add it if not there
          .save()
          // and return the required JSON structure
          .then(result =>
            res.json({ username: newUser.username, _id: newUser._id })
          )
          .catch(err => res.status(400).json(`Error: ${err}`));
      }
      // if it exists, return error message
      else next({ message: "Username already taken." });
    })
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// retrieving all entries from the db
app.get("/api/exercise/users", (req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// I can add an exercise to any user by posting form data
// userId(_id), description, duration, and optionally date to /api/exercise/add.
// If no date supplied it will use current date. App will return the user object
// with the exercise fields added.

app.post("/api/exercise/add", (req, res) => {
  const { username, description } = req.body,
    duration = Number(req.body.duration),
    date = Date.parse(req.body.date);

  const newExercise = new Exercise({
    username,
    description,
    duration,
    date
  });

  newExercise
    .save()
    .then(() => res.json("Exercise added!"))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// I can retrieve a full exercise log of any user by getting /api/exercise/log 
// with a parameter of userId(_id). App will return the user object with 
// added array log and count (total exercise count).
// I can retrieve part of the log of any user by also passing along 
// optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
app.get("/api/exercise/log", (req, res) => {
  Exercise.find()
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "Not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  // mongoose validation error
  if (err.errors) {
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  }
  // generic or custom error
  else {
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }

  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

// starting the server and port listening
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

// /api/exercise/users should display only username and id
