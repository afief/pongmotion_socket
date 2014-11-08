

var play = function() {
	var _ = this;

	var players = new Array();
	var playerData = {};

	var isGameOver = true;
	var socket;

	var Player = function(game, x, y, name) {
		Phaser.Sprite.call(this, game, 0, 0, 'box');

		this.anchor.setTo(0.5,0.5);
		this.x = x;
		this.y = y;

		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.velocity.x = 0;
		this.body.immovable = true;

		var tekanan = 0;

		this.kode = "";
		this.name = name;

		this.toLeft = function() {			
			if ((tekanan > -250) && (this.x > (this.width/2))) {
				tekanan -= 50;
			}
		}
		this.toRight = function() {
			if ((tekanan < 250) && (this.x < (game.canvas.width - (this.width/2)))) {
				tekanan += 50;
			}
		}

		this.update = function() {
			
			if (tekanan != 0) {
				this.body.velocity.x = tekanan;
				if (tekanan < -2) {
					tekanan += 10;
				} else if (tekanan > 2) {
					tekanan -= 10;
				} else {
					tekanan = 0;
				}
			} else {
				this.body.velocity.x = 0;
			}
		}
		this.matikan = function() {
			this.update = function(){};
			this.kill();
		}
	}
	Player.prototype = Object.create(Phaser.Sprite.prototype);
	Player.prototype.constructor = Player;

	var Ball = function(game, x, y) {
		Phaser.Sprite.call(this, game, 0, 0, 'ball');
		this.anchor.setTo(0.5,0.5);
		this.x = x;
		this.y = y;

		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.velocity.x = 0;
		this.body.velocity.y = 0;

		var speed = 500;
		var isPlay = false;

		this.arah = {x: 0, y: 0};
		this.start = function() {
			isPlay = true;
		}
		this.stop = function() {
			isPlay = false;
		}
		this.invertX = function() {
			this.arah.x = 0 - this.arah.x;
		}
		this.invertY = function() {
			this.arah.y = 0 - this.arah.y;
		}
		this.update = function() {
			if (isPlay) {
				this.body.velocity.x = this.arah.x * speed;
				this.body.velocity.y = this.arah.y * speed;

				if ((this.x > (game.canvas.width - (this.width/2))) && (this.arah.x > 0)) {
					this.invertX();
				} else if ((this.x < (this.width/2)) && (this.arah.x < 0)) {
					this.invertX();					
				}

				/*MENENTUKAN PEMENANG*/
				if (this.y < 0) {
					socket.emit("player lose", player1.kode);
					setLoser(player1);
					setWinner(player2);
				} else if (this.y > game.canvas.height) {
					socket.emit("player lose", player2.kode);
					setLoser(player2);
					setWinner(player1);
				}
			}
		}
		this.matikan = function() {
			this.update = function() {};
			isPlay = false;
			this.kill();
		}
	}
	Ball.prototype = Object.create(Phaser.Sprite.prototype);
	Ball.prototype.constructor = Ball;

	var player1;
	var player2;
	var ball;

	this.preload = function() {
		con.blue("PLAY preload");

		_.game.stage.disableVisibilityChange = true;

		_.game.loadImage("box");
		_.game.loadImage("ball");
	}
	this.create = function() {
		con.blue("PLAY create");

		// reset();
		setInfo("Wainting For Users");

		socketInit();
	}
	function reset() {
		ball.arah = {x: 0.5, y: 0.5};
		ball.start();

		isGameOver = false;
	}

	/*GAME UPDATE*/
	this.update = function() {
		if (!isGameOver) {

			_.game.physics.arcade.collide(player1, ball, collisionHandler, null, this);
			_.game.physics.arcade.collide(player2, ball, collisionHandler, null, this);

			if (_.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
				player2.toLeft();
			}
			if (_.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
				player2.toRight();
			}
			if (_.game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
				player1.toLeft();
			}
			if (_.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
				player1.toRight();
			}

		}
	}

	function collisionHandler (obj1, obj2) {
		ball.invertY();
	}
	function play() {
		ball.arah.y = -0.5;
		ball.arah.x = -0.5;
		ball.start();

		isGameOver = false;
	}
	function gameOver() {
		if (isGameOver) return;

		isGameOver = true;
		ball.matikan();
		ball = undefined;
	}
	function setLoser(pemain) {
		if (player1 && (pemain.kode == player1.kode)) {
			pemain.matikan();
			player1 = undefined;
		}
		if (player2 && (pemain.kode == player2.kode)) {
			pemain.matikan();
			player2 = undefined;
		}
	}
	function setWinner(pemain) {
		con.green("WINNER : " + pemain.name);

		setInfo("<i>WINNER</i> <b>" + pemain.name + "</b>");

		window.setTimeout(cekPlayer, 2000);

		gameOver();
	}
	function setInfo(txt) {
		info.innerHTML = txt;
	}

	function cekPlayer() {
		var rebornDetect = false;
		if (players.length > 0) {
			if (player1 == undefined) {
				player1 = new Player(_.game, _.game.canvas.width/2, 60, playerData[players[0]].name);
				player1.kode = playerData[players[0]].kode;
				_.add.existing(player1);

				players.splice(0,1);
				rebornDetect = true;
			}
		}

		if (players.length > 0) {
			if (player2 == undefined) {
				player2 = new Player(_.game, _.game.canvas.width/2, _.game.canvas.height - 60, playerData[players[0]].name);
				player2.kode = playerData[players[0]].kode;
				_.add.existing(player2);

				players.splice(0,1);
				rebornDetect = true;
			}
		}

		if ((player1 != undefined) && (player2 != undefined) && rebornDetect) {
			ball = new Ball(_.game, _.game.canvas.width/2, _.game.canvas.height/2);
			_.add.existing(ball);

			socket.emit("player play", player1.kode);
			socket.emit("player play", player2.kode);

			window.setTimeout(play, 3000);
		}

		setInfo(((player1 != undefined)?player1.name:" [waiting] ") + " vs " + ((player2 != undefined)?player2.name:" [waiting] "));
		updateList();
	}
	function updateList() {
		antrian.innerHTML = "";

		var newEl;
		for (var i = 0; i < players.length; i++) {
			newEl = document.createElement("li");
			newEl.innerHTML = playerData[players[i]].name;

			antrian.appendChild(newEl);
		}
	}

	function socketInit() {
		socket = io();

		socket.on("connect", function() {
			con.green("connected");
			socket.emit("register game");
		});

		socket.on("register success", function(kode) {
			con.l("register code", kode);

			gameCodeEl.innerHTML = kode;
		});

		socket.on("player new", function(obj) {
			con.l("player new" + obj.kode);

			obj.socket = socket;

			players.push(obj.kode);
			playerData[obj.kode] = obj;

			cekPlayer();
		});

		socket.on("player remove", function(obj) {
			con.l("player remove", obj.kode);
			if (playerData[obj.kode] != undefined) {
				if (player1 && (player1.kode == obj.kode)) {
					if (player2 != undefined)
						setWinner(player2);
				} else if (player2 && (player2.kode == obj.kode)) {
					if (player1 != undefined)
						setWinner(player1);	
				} else {
					players.splice(players.indexOf(obj.kode), 1);
				}
				playerData[obj.kode] = undefined;

				window.setTimeout(cekPlayer, 2000);
			}
		});

		socket.on("move", function(obj) {

			// con.l(obj, players.indexOf(obj.kode));

			if (player1 && (player1.kode == obj.kode)) {
				if (obj.arah > 0) {
					player1.toRight();
				} else if (obj.arah < 0) {
					player1.toLeft();
				}
			}
			if (player2 && (player2.kode == obj.kode)) {
				if (obj.arah > 0) {
					player2.toRight();
				} else if (obj.arah < 0) {
					player2.toLeft();
				}
			}

		});

		socket.on("disconnect", function() {
			con.err("DISCONNECT");
		});

		socket.on("error", function() {
			con.err("ERROR");
		});
	}

}
