var express = require('express');
var app = express();
var http = require('http').Server(app);

var inmo_template	= require('./inmo_template.js')(app);
var inmo_socket		= require('./inmo_socket.js')(http);

app.use('/pong/images', express.static(__dirname + '/pong/images'));
app.use('/pong/script', express.static(__dirname + '/pong/script'));
app.use('/pong/control', express.static(__dirname + '/pong/control'));

// app.set("views", "./pong")
app.get("/", function(req, res) {
	res.sendFile(__dirname + "/pong/index.html");
});
app.get("/control", function(req, res) {
	res.sendFile(__dirname + "/pong/control/index.html");
});

app.get("/pong/scss/:file", function(req, res) {
	app.set("view engine", "scss");
	res.type("css");
	res.render(__dirname + "/pong/scss/" + req.params.file);
});

http.listen(80, function() {
	console.log("listen to 80");
});