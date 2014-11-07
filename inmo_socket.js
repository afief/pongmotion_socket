var ims = function(http) {
	var io = require('socket.io')(http);

	/* SOCKE T*/
	var serverList = {};
	var serverIdList = new Array();
	var playerList = new Array();

	io.on("connection", function(socket) {

		console.log("_____________________________________");

		var newId = "";
		var kode = "";
		var isServer = false;

		socket.on("register game", function() {
			newId = 'aaaaa';//makeid();
			socket.join(newId);

			serverList[newId] = socket;
			serverIdList.push(newId);
			isServer = true;

			socket.emit("register success", newId);
			console.log("server register", newId);
		});

		socket.on("register player", function(obj) {
			newId = obj.kode;
			kode = makeid(6);

			if (serverList[newId] != undefined) {
				socket.emit("register success", newId);
				socket.join(newId);

				playerList[kode] = socket;

				// serverList[newId].emit("new player", {kode: kode, name: obj.name});
				io.to(newId).emit("new player", {kode: kode, name: obj.name});
			} else {
				socket.emit("register fail", "tidak ada game dengan kode " + newId);
			}

			console.log("client connect with", newId);
		})

		socket.on("lose", function(kd) {
			console.log(kode + " lose");
			if (playerList[kd] != undefined)
				playerList[kd].disconnect();
		});

		socket.on("move", function (arah) {
			if (serverList[newId] != undefined) {
				serverList[newId].emit("move", {kode: kode, arah: arah});
			} else {
				socket.disconnect();
			}
		});

		socket.on("disconnect", function() {
			if (isServer) {
				serverList[newId] = undefined;
				serverIdList.splice(serverIdList.indexOf(newId), 1);

				console.log("disconnect server -", newId);
			} else if (newId != "") {
				if (serverList[newId] != undefined) {
					// serverList[newId].emit("remove player", {kode: kode});
					io.to(newId).emit("remove player", {kode: kode});
				}
				if (playerList[kode] != undefined) {
					playerList[kode] = undefined;
				}

				console.log("disconnect client -", newId);
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

		if (serverList[text] != undefined)
			text = makeid();

		return text;
	}
}

module.exports = ims;