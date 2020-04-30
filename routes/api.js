//import user schemas, shortid and Express router
const Data = require("../models/data"),
  // Exercises = require("../models/exercises"),
  router = require("express").Router();

// saving the username in the database
router.post("/new-user", (req, res, next) => {
  const { username } = req.body,
    // create a new user instance
    newUser = new Data({ username });
  let data;

  Data.find()
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

// retrieving all users from the database
router.get("/users", (req, res) => {
  Data.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// adding a new exercise
router.post("/add", (req, res) => {
  const { _id, username, description } = req.body,
    duration = Number(req.body.duration),
    date = Date.parse(req.body.date);

  const newExercise = new Data({
    username,
    description,
    duration,
    _id,
    date
  });

  newExercise
    .save()
    .then(exercise => res.json(exercise))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// getting exercise log with userId, from, to & limit (/log?userId={userId})
router.get("/log", (req, res, next) => {
  const { userId, limit } = req.query;
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  // retrieve exercises log
  Data.find()
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

module.exports = router;

// ID for testing: Acmeo9o7W
