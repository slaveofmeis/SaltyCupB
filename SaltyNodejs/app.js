var express = require('express'), http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://localhost:27017/saltydb');
var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();
var server = http.createServer(app);
var port = 3007;
//var io = require('socket.io').listen(server);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon('./public/images/drop.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    req.db = db;
    //    req.io = io;
    //    req.client_room = client_room;
    next();
});

app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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

module.exports = app;
server.listen(port);

/*
io.sockets.on('connection', function (socket) {
	//	socket.emit('message', { message: 'welcome' });
	socket.on('send', function (data) {
		//socket.broadcast.emit('message', data);
		io.sockets.in(data.guid).emit('message', data);
	    });
	socket.on('join', function (data) {
		socket.join(data.guid);
	    });
	socket.on('script_end', function (data) {
		io.sockets.in(data.guid).emit('script_end_ack', data);
            });
   });
*/
