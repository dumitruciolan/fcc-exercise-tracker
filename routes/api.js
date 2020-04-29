//import user schemas, shortid and Express router
const Users = require("../models/users"),
  Exercises = require("../models/exercises"),
  router = require("express").Router();

// saving the username in the database
router.post("/new-user", (req, res, next) => {
  const { username } = req.body,
    // create a new user instance & generate the user id
    newUser = new Users({ username });
  let data;

  Users.find()
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
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(400).json(`Error: ${err}`));
});

router.post("/add", (req, res) => {
  const { username, description } = req.body,
    duration = Number(req.body.duration),
    date = Date.parse(req.body.date);

  const newExercise = new Exercises({
    username,
    description,
    duration,
    date
  });

  newExercise
    .save()
    .then(exercise => res.json(newExercise))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// getting exercise log with userId, from, to & limit (/log?userId={userId})
router.get("/log", (req, res, next) => {
  Exercises.find()
    .then(exercises => res.json(exercises))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

module.exports = router;
