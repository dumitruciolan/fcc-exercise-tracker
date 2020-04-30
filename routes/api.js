//import user schemas, shortid and Express router
const User = require("../models/user"),
  router = require("express").Router();

// saving the username in the database
router.post("/new-user", (req, res, next) => {
  const { username } = req.body,
    // create a new user instance
    newUser = new User({ username });
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

// retrieving all users from the database
router.get("/users", (req, res) => {
  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// adding a new exercise in the db
router.post("/add", (req, res) => {
  const { userId, username, description } = req.body,
    date = new Date(req.body.date).toDateString(),
    duration = Number(req.body.duration);

  // check if the required fields are filled
  if (!userId || !description || !duration)
    res.send("Insert userID, description & duration.");

  // Create new instance to push into exercise array in db
  let newExercise = { username, description, duration, date };

  // Find user in the db
  User.findByIdAndUpdate(
    userId, // push exercise into array
    { $push: { exercise: newExercise } },
    (err, user) => {
      if (err) return console.log("Error: ", err);
      // return data in the required format
      res.json({
        username: user.username,
        description: newExercise.description,
        duration: newExercise.duration,
        _id: user._id,
        date: newExercise.date
      });
    } // error handling
  ).catch(err => res.status(400).json(`Error: ${err}`));
});

// retrieve & filter the exercise log
router.get("/log", (req, res, next) => {
  const { userId, limit } = req.query;
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  // retrieve exercises log
  User.find()
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

module.exports = router;
