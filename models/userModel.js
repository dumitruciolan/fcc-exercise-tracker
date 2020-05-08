"use strict";

const shortid = require("shortid"),
  mongoose = require("mongoose");

// set user schema & model
const userSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    username: {
      type: String,
      required: true,
      minlength: [2, "username too short"],
      maxlength: [20, "username too long"],
      trim: true
    },
    exercises: [
      {
        userId: String,
        description: {
          type: String,
          required: true,
          minlength: [3, "description too short"],
          maxlength: [20, "description too long"],
          trim: true
        },
        duration: {
          type: Number,
          required: true,
          min: [1, "duration too short"],
          max: [1000, "duration too long"],
          trim: true
        },
        date: {
          type: Date,
          default: Date.now,
          trim: true
        }
      }
    ]
  }),
  User = mongoose.model("User", userSchema);

// export it so we can access it from other places
module.exports = mongoose.model("User", userSchema);
