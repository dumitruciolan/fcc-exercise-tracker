"use strict";

const shortid = require("shortid");
const mongoose = require("mongoose");

// set user schema & model
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      minlength: [3, "username too short"],
      maxlength: [20, "username too long"],
      trim: true
    },
    _id: {
      type: String,
      default: shortid.generate
    }
  }),
  User = mongoose.model("User", userSchema);

// export it so we can access it from elsewhere
module.exports = mongoose.model("Users", userSchema);
