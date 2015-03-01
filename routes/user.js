var express  = require('express');
var app      = module.exports = express();
var mongoose = require('mongoose');
var userSchema = require('../models/schema');
var user = userSchema.AppUser;

createNewUser = function (req, res) {

  // store inputs into variables //
  var new_username         = req.body.username;
  var new_password         = req.body.password;
  var new_password2				 = req.body.password2;
  var new_email   				 = req.body.email;
  var new_marker           = req.body.marker;
  var admin  = false;

  if(new_email === "k.just.wong@gmail.com"){
    admin = true;
  }

  // create new user from model users //
  var new_user = new user({

    username    : new_username,
    email       : new_email,
    password    : new_password,
    password2 	: new_password2,
    wins				: 0,
    loses				: 0,
    ties				: 0,
    marker			: marker,
    admin       : admin

  });


  // save new user into database(mongoDB) //
  new_user.save( function (err) {

    if (err) console.log("Error : " + err);

  });

  res.send({ redirect: '/login' });

};

userRegistration = function (req, res) {

  res.render('register');

};

editProfile = function (req, res) {

  var userId = req.params.id;

  user.findOne({ _id: userId },

    function (err, user) {

      if (err) console.log('Error : ' + err);

      res.render('editProfile', { user : user});

    }

  );

};

savedEditedProfile = function (req, res) {

  var userId = req.params.id;
  var updatedUser = req.params.user;

  user.findByIdAndUpdate( userId, updatedUser,

    function (err, user) {

      if (err) console.log('Error : ' + err);

      res.render('editProfile', { user : user, message: "Updated Profile!"});

    }

  );

};

userProfilePage = function (req, res) {

  var userId = user.id;
  console.log(userId);
  user.findOne({ _id: userId },

    function (err, user) {
      console.log("currentUser below");
      console.log(user);

    }

  );
  res.render('profile', { current : true });

}; 


module.exports = function() {
  app.post('/user', this.createNewUser);
  app.get('/user/new', this.userRegistration);
  app.post('/user/edit/:id', this.savedEditedProfile);
  app.get('/user/edit/:id', this.editProfile);
  app.get('/user/:id', this.userProfilePage);
  return app;

}();