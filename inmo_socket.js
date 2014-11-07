var ims = function(http) {
	var io = require('socket.io')(http);

	/* SOCKE T*/
	var serverList = {};
	var serverIdList = new Array();

	io.on("connection", function(socket) {

		console.log("_____________________________________");

		var newId = "";
		var kode = "";
		var isServer = false;

		socket.on("register game", function() {
			newId = makeid();

			serverList[newId] = socket;
			serverIdList.push(newId);
			isServer = true;

			socket.emit("register success", newId);
			console.log("server register", newId);
		});

		socket.on("register player", function(obj) {
			newId = obj.kode;
			kode = makeid();

			if (serverList[newId] != undefined) {
				socket.emit("register success", newId);
				serverList[newId].emit("new player", {kode: kode});
			} else {
				socket.emit("register fail", "tidak ada game dengan kode " + newId);
			}

			console.log("client connect with", newId);
		})

		socket.on("move", function (arah) {
			if (serverList[newId] != undefined) {
				serverList[newId].emit("move", {kode: kode, arah: arah});
			} else {
				socket.emit("game_disconnect");
			}
		});

		socket.on("disconnect", function() {
			if (isServer) {
				serverList[newId] = undefined;
				serverIdList.splice(serverIdList.indexOf(newId), 1);

				console.log("disconnect server -", newId);
			} else if (newId != "") {
				if (serverList[newId] != undefined)
					serverList[newId].emit("remove player", {kode: kode});

				console.log("disconnect client -", newId);
			}
		});

	});
function makeid() {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz";

	for( var i=0; i < 5; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	if (serverList[text] != undefined)
		text = makeid();

	return text;
}
}

module.exports = ims;