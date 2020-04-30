"use strict";

const shortid = require("shortid");
const mongoose = require("mongoose");

// set user schema & model
const dataSchema = new mongoose.Schema({
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
    exercise: [
      {
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
        }
      }
    ]
  }),
  Data = mongoose.model("Data", dataSchema);

// export it so we can access it from elsewhere
module.exports = mongoose.model("Data", dataSchema);
