var mongoose = require('mongoose');
/***********************************
        * Mongoose Schemas
************************************/

var newUserSchema = new mongoose.Schema({

  username    : String,
  password    : String,
  password2 	: String,
  wins				: Number,
  loses				: Number,
  ties				: Number,
  email       : String,
  marker			: String,
  admin				: Boolean,
  created_at  : {
    type: Date,
    default: Date.now()
  }
});

/***********************************
        * Mongoose Models
************************************/

var user = mongoose.model('users', newUserSchema );

/***********************************
        * App Dependencies
************************************/

module.exports.AppUser = user;
