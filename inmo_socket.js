var ims = function(http) {
	var io = require('socket.io')(http);

	/* SOCKET*/
	var gameList = {};

	io.on("connection", function(socket) {

		console.log("_____________ " + socket.id);

		var idGame = "";
		var isServer = false;

		socket.on("register game", function() {
			idGame = makeid();

			socket.join(idGame);
			gameList[idGame] = socket;

			isServer = true;

			socket.emit("register success", idGame);
			console.log("server register", idGame);
		});

		socket.on("register player", function(obj) {
			idGame = obj.kode;

			if (gameList[idGame] != undefined) {
				socket.emit("register success", {kode: socket.id, name: obj.name});
				socket.join(idGame);

				io.to(idGame).emit("player new", {kode: socket.id, name: obj.name});
			} else {
				socket.emit("register fail", "tidak ada game dengan kode " + idGame);
			}

			console.log("client connect with", idGame);
		})

		socket.on("player lose", function(id) {
			console.log(id + " lose");
			io.to(idGame).emit("player lose", {kode: id});
		});

		socket.on("player play", function(id) {
			console.log(id + " play");
			io.to(idGame).emit("player play", {kode: id});
		});

		socket.on("move", function (arah) {
			if (gameList[idGame] != undefined) {
				gameList[idGame].emit("move", {kode: socket.id, arah: arah});
			} else {
				socket.disconnect();
			}
		});

		socket.on("disconnect", function() {
			if (isServer) {
				gameList[idGame] = undefined;

				console.log("disconnect server -", idGame);
			} else if (idGame != "") {
				if (gameList[idGame] != undefined) {
					io.to(idGame).emit("player remove", {kode: socket.id});
				}

				console.log("disconnect client -", idGame);
			}
		});

	});
	function makeid(num) {
		num = num || 5;
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz23456780";

		for( var i=0; i < num; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		if (gameList[text] != undefined)
			text = makeid();

		return text;
	}
}

module.exports = ims;