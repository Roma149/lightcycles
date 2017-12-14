// This file contains the game loop and some functions to win/pause/reset the game

// starts the game by running the game loop
GAME.startGame = function () {
	if (this.running) return; // can't start the game if it's already active
	this.running = true; // set the game to running

	// set up variables to calculate time difference
	var last_time = (new Date()).getTime();
	var dt = 0, new_time = 0;

	// start game loop
	this.loop_id = setInterval(function () { // maybe move according to the time that has actually passed

		// calculate dt to normalize for time differences between iterations (to smoothen out the animation)
		new_time = (new Date()).getTime(); // current date in milliseconds
		dt = (new_time-last_time)/1000; // time passed since last iteration (in seconds)
		last_time = new_time; // set the time for the next iteration

		if (!cycle1.makingWall && cycle1.wallMakingActivated) cycle1.startWall();
		if (!cycle2.disabled && !cycle2.makingWall && cycle2.wallMakingActivated) cycle2.startWall();

		cycle1.move(dt);
		if (!cycle2.disabled) cycle2.move(dt);

		cycle1.detectCollisions(cycle2);
		if (!cycle2.disabled) cycle2.detectCollisions(cycle1);

		cycle1.growWall();
		if (!cycle2.disabled) cycle2.growWall();

		cycle1.drawCurrentWall();
		if (!cycle2.disabled) cycle2.drawCurrentWall();

		cycle1.checkBoost();
		if (!cycle2.disabled) cycle2.checkBoost();
		
		GAME.checkForWinner();
	}, 10);
};

// pause the game by stopping the game loop, everything else is left in its previous state
GAME.pauseGame = function () {
	if (this.running && this.loop_id !== undefined) {
		clearTimeout(this.loop_id);
		this.running = false;
	}
};

GAME.checkForWinner = function () {
	if (cycle1.collided && cycle2.collided)
		GAME.draw();

	else if (cycle1.collided)
		GAME.winGame(cycle2);

	else if (cycle2.collided)
		GAME.winGame(cycle1);
};

GAME.winGame = function (winner) {
	GAME.pauseGame();
	var text = GAME.svg_root.text(winner.color.toUpperCase() + " WINS!")
	text.font({ family: 'Helvetica', size: 60 });
	text.center(GAME.field_width / 2, GAME.field_height * 0.2);
	
	if (winner.color === "blue")
		text.fill({ color: "#0000ff" });
	else
		text.fill({ color: "#ff0000" });

	if (winner === cycle1) { // player 1 won
		$("#wins-player1").html(parseInt($("#wins-player1").html()) + 1);
		$("#losses-player2").html(parseInt($("#losses-player2").html()) + 1)
		
		$.post("/users/update_stats", { wins: 1, losses: 0, draws: 0 }, function (data) {});
	}
	else { // player 2 won
		$("#wins-player2").html(parseInt($("#wins-player2").html()) + 1);
		$("#losses-player1").html(parseInt($("#losses-player1").html()) + 1)

		$.post("/users/update_stats", { wins: 0, losses: 1, draws: 0 }, function (data) {});
	}

	this.finished = true;
	this.running = false;
};

GAME.draw = function () {
	GAME.pauseGame();
	var text = GAME.svg_root.text("DRAW!")
	text.font({ family: 'Helvetica', size: 60 });
	text.center(GAME.field_width / 2, GAME.field_height * 0.2);
	text.fill({ color: "#000000" });

	$("#draws-player1").html(parseInt($("#draws-player1").html()) + 1);
	$("#draws-player2").html(parseInt($("#draws-player2").html()) + 1);

	$.post("/users/update_stats", { wins: 0, losses: 0, draws: 1}, function (data) {});

	this.finished = true;
	this.running = false;
};

// function to reset the field by removing the svg parent element and reinitializing everything
GAME.resetGame = function () {
	$("#game").empty();
	this.initGame();
	if ($("#disable_red").is(":checked"))
		cycle2.disabled = true;
};
