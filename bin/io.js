var app = require('../app');
var io = require('socket.io').listen();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var sessionStore = new session.MemoryStore();

var COOKIE_SECRET = 'secret';
var COOKIE_NAME = 'sid';

app.use(cookieParser(COOKIE_SECRET));
app.use(session({
    name: COOKIE_NAME,
    store: sessionStore,
    secret: COOKIE_SECRET,
    saveUninitialized: true,
    resave: true,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: null
    }
}));

//Socket Connection
io.on('connection', function(err, socket, session){
  console.log("connected");
  metaTicToeGame.initGame(socket, io);
});

io.use(function(socket, next) {
    console.log("starting socket.io");
    try {
        var data = socket.handshake || socket.request;
        if (! data.headers.cookie) {
            return next(new Error('Missing cookie headers'));
        }
        console.log('cookie header ( %s )', JSON.stringify(data.headers.cookie));
        var cookies = cookie.parse(data.headers.cookie);
        console.log('cookies parsed ( %s )', JSON.stringify(cookies));
        if (! cookies[COOKIE_NAME]) {
            return next(new Error('Missing cookie ' + COOKIE_NAME));
        }
        var sid = cookieParser.signedCookie(cookies[COOKIE_NAME], COOKIE_SECRET);
        if (! sid) {
            return next(new Error('Cookie signature is not valid'));
        }
        console.log('session ID ( %s )', sid);
        data.sid = sid;
        sessionStore.get(sid, function(err, session) {
            if (err) return next(err);
            if (! session) return next(new Error('session not found'));
            data.session = session;
            next();
        });
    } catch (err) {
        console.error(err.stack);
        next(new Error('Internal server error'));
    }
});

module.exports = io;
//expctw41803