"use strict";

const mongoose = require("mongoose");

// set exercise schema & model
const exerciseSchema = new mongoose.Schema({
    description: {
      type: String,
      required: true,
      maxlength: [20, "description too long"]
    },
    duration: {
      type: Number,
      required: true,
      min: [1, "duration too short"]
    },
    date: {
      type: Date,
      default: Date.now
    },
    username: String,
    userId: {
      type: String,
      ref: "Users"
    }
  }),
  Exercise = mongoose.model("Exercise", exerciseSchema);

// export it so we can access it from elsewhere
module.exports = mongoose.model("Exercises", exerciseSchema);
