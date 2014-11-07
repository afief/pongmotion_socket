

var play = function() {
	var _ = this;

	var players = new Array();
	var playerData = {};

	var isGameOver = false;

	var Player = function(game, x, y) {
		Phaser.Sprite.call(this, game, 0, 0, 'box');

		this.anchor.setTo(0.5,0.5);
		this.x = x;
		this.y = y;

		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.velocity.x = 0;
		this.body.immovable = true;

		var tekanan = 0;

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
					getWinner(2);
				} else if (this.y > game.canvas.height) {
					getWinner(1);
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

		socketInit();
	}
	function reset() {
		player1 = new Player(_.game, _.game.canvas.width/2, 60);
		_.add.existing(player1);

		player2 = new Player(_.game, _.game.canvas.width/2, _.game.canvas.height - 60);
		_.add.existing(player2);

		ball = new Ball(_.game, _.game.canvas.width/2, _.game.canvas.height/2);
		_.add.existing(ball);
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
	}
	function gameOver() {
		isGameOver = true;
		player1.matikan();
		player2.matikan();
		ball.matikan();
	}
	function getWinner(pemainKe) {
		con.green("WINNER : " + pemainKe);
		gameOver();
	}

	function socketInit() {
		var socket = io();

		socket.on("connect", function() {
			con.green("connected");
			socket.emit("register game");
		});

		socket.on("register success", function(kode) {
			con.l("register code", kode);
		});

		socket.on("new player", function(obj) {
			con.l("new player " + obj.kode);

			players.push(obj.kode);
			playerData[obj.kode] = obj;
		});

		socket.on("remove player", function(obj) {
			con.l("remove player", obj.kode);
			if (players.indexOf(obj.kode) >= 0) {
				if (players.indexOf(obj.kode) == 0) {
					getWinner(2);
				} else if (players.indexOf(obj.kode) == 1) {
					getWinner(1);
				}

				players.splice(players.indexOf(obj.kode), 1);
				playerData[obj.kode] = undefined;
			}
		});

		socket.on("move", function(obj) {

			// con.l(obj, players.indexOf(obj.kode));

			if (players.indexOf(obj.kode) == 0) {
				if (obj.arah > 0) {
					player1.toRight();
				} else if (obj.arah < 0) {
					player1.toLeft();
				}
			}
			if (players.indexOf(obj.kode) == 1) {
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
