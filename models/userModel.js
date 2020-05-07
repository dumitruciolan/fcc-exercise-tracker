"use strict";

const shortid = require("shortid");
const mongoose = require("mongoose");

// set user schema & model
const userSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    username: {
      type: String,
      required: true,
      minlength: [3, "username too short"],
      maxlength: [20, "username too long"],
      trim: true
    },
    exercises: [
      {
        userId: String,
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
          required: false,
          default: Date.now
        }
      }
    ]
  }),
  User = mongoose.model("User", userSchema);

// export it so we can access it from other places
module.exports = mongoose.model("User", userSchema);
