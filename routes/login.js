var express = require('express');
var app = module.exports = express();
var mongoose = require('mongoose');
var schemas = require('../models/schema');


/*
 * Show login page
 */
showLoginPage = function(req, res) {
    res.render('login');
};

/***************************
 * app.post('/login')
 ****************************/

checkLogin = function(req, res) {

    var input_email = req.body.email;
    var input_pass = req.body.password;

    if (input_email == '') {

        res.send("Please enter a username");
        return;

    }
    if (input_pass == '') {

        res.send("Please enter a password");
        return;

    }

    //validate username and password
    schemas.AppUser.findOne({
            email : input_email
        },
        function(err, user) {

            if (err) {

                console.log("Error: " + err);
                return;

            }
            if (user === null) {
                res.send("User not found");
                return;

            }
            if (input_pass !== user.password) {

                res.send("Password is wrong");
                return;

            }
            if (input_pass === user.password) {
            
                req.session.id = req.sessionID;
                req.session.user = user;
                data = {
                    admin: user.admin,
                    currentSession: req.sessionID,
                    currentUser: user._id,
                    marker: user.marker,
                    email: user.email,
                    login: true
                };

                res.render("index",data);
                return;

            }

        }

    );

};



/***************************
 * app.get('/logout')
 ****************************/

destroySession = function(req, res) {

    req.session.destroy();
    res.redirect('/');

};



module.exports = function() {

    app.get('/login', this.showLoginPage);
    app.post('/login', this.checkLogin);
    app.get('/logout', this.destroySession);
    return app;

}();