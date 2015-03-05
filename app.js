//express app
var express = require('express');
var app = express();
var session = require('express-session');

var metaTicToeGame = require('./metatictactoe');
var cookieSecret = "secretPhrase";
var memoryStore = session.MemoryStore;
var sessionStore = new memoryStore();

//database for the users
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
//middle ware
var bodyParser = require('body-parser');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
mongoose.connect('mongodb://localhost');
app.use(cookieParser("secretPhrase"));
app.use(session(
 {
  secret: cookieSecret,
  store: sessionStore,
  saveUninitialized: false,
  resave: false
 } ));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

//routes
var routes = require('./routes/index');
var login = require('./routes/login');
var user = require('./routes/user');
var register = require('./routes/register');

app.use('/', routes);
app.use('/', user);
app.use('/', login);
app.use('/', register);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.sessionStore = sessionStore;

// io.use(function(socket, next) {
//     var req = socket.handshake;
//     var res = {};
//     console.log("hhey");
//     cookieParser(req, res, function(err) {
//         if (err) return next(err);
//         session(req, res, next);
//     });
// });

module.exports = app;
