var express  = require('express');
var app      = module.exports = express();
var mongoose = require('mongoose');
var userSchema = require('../models/schema');
var user = userSchema.AppUser;

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

  var userId = req.params.id;
  user.findOne({ _id: userId },

    function (err, user) {
      res.render('profile', {user: user});

    }

  );

}; 


module.exports = function() {
  
  app.post('/user/edit/:id', this.savedEditedProfile);
  app.get('/user/edit/:id', this.editProfile);
  app.get('/user/:id', this.userProfilePage);
  return app;

}();