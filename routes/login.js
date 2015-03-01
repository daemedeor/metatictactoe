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

    var input_user = req.body.username;
    var input_pass = req.body.password;

    if (input_user == '') {

        res.send("Please enter a username");
        return;

    }
    if (input_pass == '') {

        res.send("Please enter a password");
        return;

    }

    //validate username and password
    schemas.AppUser.findOne({
            username: input_user
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

                req.session.name = user.username;
                req.session.currentSession = true;
                req.session.
                data = {

                    redirect: '/user/edit/' + user._id,
                    user: req.session.userType,
                    currentSession: req.session.currentSession,
                    currentUser: req.session.userId,
                    current: true

                };

                res.send(data);
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