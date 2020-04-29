// basic configuration
const express = require("express"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  app = express();

// connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// parse the POST bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// route to main HTML page
app.use(express.static("public"));
app.get("/", (_, res) => res.sendFile(`${__dirname}/views/index.html`));

// import the api routes
app.use("/api/exercise", require("./routes/api"));

// Not found middleware
app.use((_, __, next) => next({ status: 404, message: "Not found" }));

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
  // generic / custom error
  else {
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }

  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

// display the date format using tosubtstring / slice?
// finish models/exercises.js