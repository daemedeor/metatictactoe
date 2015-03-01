var express = require('express');
var app = module.exports = express();
var mongoose = require('mongoose');
var schemas = require('../models/schemas');


/*****************************
 * app.get('/register')
 ******************************/

// Instantiates a model for New Users to allow posting
// var Userdb = mongoose.model('users', newUserSchema);


// Shows the Register Page //
showRegisterPage = function(req, res) {

    res.render('register');

};

/*****************************
 * app.post('/register')
 ******************************/

newRegisterUser = function(req, res) {

    var newUser = req.body.username;
    var newUserPw = req.body.password;
    var newUserPw2 = req.body.password_conf;
    var newUserEmail = req.body.email;
    var newUserType = req.body.userType;
    var errors = [];

    // checks email for  a "@" and ".com" //
    function validateEmail(email) {

        var re = /\S+@\S+\.\S+/;
        return re.test(email);

    }

    // Verifies the form is not blank
    if (newUser === '') {
        errors.push("Please choose a User Name");
    }
    if (newUserPw === '') {
        errors.push("Please choose a password");
    }
    if (newUserPw2 === '') {
        errors.push("Please confirm password");
    }
    if (newUserEmail === '') {
        errors.push("Please input your email");
    }
    if (errors.length === 0) {

        // Verifies the username is not taken //
        schemas.AppUser.findOne({

            username: newUser

        }, function(err, user) {

            if (err) {
                console.log("Error : " + err);
            }
            if (user !== null && newUser === user.username) {
                errors.push("That User Name is already taken...");
            }
            if (!validateEmail(newUserEmail)) {
                errors.push("Email is not valid");
            }
            if (newUserPw !== newUserPw2) {
                errors.push("Passwords do not match");
            }

            if (errors.length > 0) {
                res.send(errors.join("<br/>"));

            } else {

                schemas.AppUser.findOne({
                        email: newUserEmail
                    },
                    function(err, user) {

                        if (err) {
                            console.log("Error: " + err);
                        }
                        if (user !== null && newUserEmail === user.email) {
                            errors.push("That email is already tied to an existing account");
                        }
                        if (errors.length === 0) {

                            // if everything is good, save 
                            // Saves new user to DB //
                            var registeredNewUser = new schemas.AppUser({

                                username: newUser,
                                email: newUserEmail,
                                password: newUserPw,
                                userType: newUserType,
                                created_at: {

                                    type: Date,
                                    default: Date.now()

                                }

                            });

                            // saves new registered user to DB //
                            registeredNewUser.save(function(err) {

                                if (err) {

                                    console.log("ERROR: Did not save to DB");

                                }

                                res.send({
                                    redirect: '/login'
                                });

                            });

                        } else {

                            res.send(errors.join("<br/>"));

                        }
                    }

                );

            }

        });

    } else { // Handle errors, invalid form

        res.send(errors.join("<br/>"));

    }

}; // ends newRegisterUser


/*****************************
 * app.get('/logout')
 ******************************/

destroySession = function(req, res) {

    req.session.destroy();
    res.send({
        redirect: '/'
    });

};

// connecting to app.js //
module.exports = function() {

    app.get('/register', this.showRegisterPage);
    app.post('/register', this.newRegisterUser);

    return app;

}();
the 