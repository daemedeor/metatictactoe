var mongoose = require('mongoose');
/***********************************
        * Mongoose Schemas
************************************/

var newUserSchema = new mongoose.Schema({

  username    : String,
  email       : String,
  password    : String,
  password2 	: String,
  wins				: Number,
  loses				: Number,
  ties				: Number,
  marker			: String,
  admin				: Boolean

});

/***********************************
        * Mongoose Models
************************************/

var user = mongoose.model('users', newUserSchema );

/***********************************
        * App Dependencies
************************************/

module.exports.AppUser = user;
