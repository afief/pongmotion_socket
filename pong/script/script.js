var maingame;

var ___ = function() {
	var assetUrl = "";
	var dimensi = {width: 480, height: 750};

	Phaser.Game.prototype.loadImage = loadImage;

	maingame = new Phaser.Game(dimensi.width, dimensi.height, Phaser.CANVAS, 'game', null, true);
	
	maingame.state.add("boot", boot);
	maingame.state.add("splash", splash);
	maingame.state.add("play", play);

	maingame.state.start("boot");

	var loadedImages = new Array();
	function loadImage(judul, tipe) {
		if (loadedImages.indexOf(judul) > 0) {
			con.err("udah load : " + judul);
			return;
		}

		loadedImages.push(judul);

		tipe = tipe || "png";

		if (judul.substr(0, 4) != "http")
			maingame.load.image(judul, assetUrl + "/pong/images/" + judul + "." + tipe);
		else
			maingame.load.image(tipe, judul);

	}
}

window.addEventListener("load", ___);