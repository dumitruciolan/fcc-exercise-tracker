//import user schemas, shortid and Express router
const User = require("../models/userModel"),
  router = require("express").Router();

// saving the username in the database
router.post("/new-user", (req, res, next) => {
  // create a new user instance
  const { username } = req.body,
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
router.get("/users", (_, res) => {
  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.status(400).json(`Error: ${err}`));
});

// adding a new exercise in the db
router.post("/add", (req, res) => {
  const { userId, description, duration, date } = req.body;
  // Create new instance to push into exercise array in db
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
router.get("/log", (req, res) => {
  const from = req.query.from && new Date(req.query.from),
    to = req.query.to && new Date(req.query.to),
    { userId, limit } = req.query;

  // no userId provided?
  if (!userId) return res.status(400).send("Unknown userId");

  User.findById(userId, (err, user) => {
    // error handling
    if (err) throw err;
    if (!user) return res.status(404).send("User not found");

    // handle to & from filters
    const log = user.exercises
      .filter(exercise => {
        const date = new Date(exercise.date);

        switch (true) {
          // both are used
          case from && to:
            return date >= from && date <= to;
          // only to used
          case !from && to:
            return date <= to;
          // only from used
          case !to && from:
            return date >= from;
          // none used
          default:
            return true;
        }
      }) // limit filter impementation
      .slice(0, limit || user.exercises.length);

    // return the required data
    res.json({
      _id: user._id,
      username: user.username,
      log,
      count: user.exercises.length
    });
  });
});

module.exports = router;
