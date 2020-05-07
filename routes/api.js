//import user schemas, shortid and Express router
const User = require("../models/userModel"),
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
  // Create new instance to push into exercise array in db
  const { userId, description, duration, date } = req.body;
  const exercise = {
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  };

  // check if the required fields are filled
  if (!userId || !description || !duration)
    res.send("Please insert userID, description & duration.");

  // Find user in the db
  User.findByIdAndUpdate(
    userId, // push exercise into array
    { $push: { exercises: exercise } },
    (err, user) => {
      // error handling
      if (err) return console.log("Error: ", err);

      // return data in the required format
      res.json({
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        _id: user._id,
        date: exercise.date
      });
    }
  );
});

// retrieve & filter the exercise log
router.get("/log", (req, res, next) => {
  const { userId, limit } = req.query;
  const from = req.query.from && Date.parse(req.query.from);
  const to = req.query.to && Date.parse(req.query.to);

  // no userId provided?
  if (!userId) return res.type("txt").send("Unknown userId");

  User.findById(userId, (err, user) => {
    // error handling
    if (err) return err;
    if (!user) return res.type("txt").send("User not found");

    const log = user.exercises
      .filter(exercise => {
        const date = Date.parse(exercise.date);

        if (from && to) {
          return date >= from && date <= to;
        } else if (!from && to) {
          return date <= to;
        } else if (!to && from) {
          return date >= from;
        } else {
          return true;
        }
      })
      .slice(0, limit || user.exercises.length);

    res.json({
      _id: user._id,
      username: user.username,
      log: log,
      count: user.exercises.length
    });
  });
});

module.exports = router;
