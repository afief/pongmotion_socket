var splash = function() {

	var _ = this;

	this.preload = function() {

	}
	this.create = function() {
		_.game.state.start("play");
	}

}