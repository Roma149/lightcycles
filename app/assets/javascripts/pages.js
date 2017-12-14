$(function () { // execute when the page has finished loading

	if ($("#game").length > 0) {

		// listen for clicks on various buttons
		$("#start-button").click(function (e) {
			if (GAME.finished) 
				GAME.resetGame();

			GAME.startGame();
		});

		$("#pause-button").click(function (e) {
			GAME.pauseGame();
		});

		$("#reset-button").click(function (e) {
			GAME.resetGame();
		});

		$("#test-button").click(function () {
			rect = GAME.svg_root.rect(40,80);
			rect.center(200, 100);
			rect.radius(5);

		});

		// listen for key press events and change the cycle's orientation accordingly
		// Key codes: 87 = W, 65 = A, S = 83, D = 68, Q = 81, E = 69, 
		//            arrow-up = 38, arrow-left = 37, arrow-down = 40, arrow-right = 39, M = 77, N = 78
		$("body").keydown(function (e) {
			if (!GAME.running) return;
			
			switch (e.keyCode) {
				// CYCLE 1
				case 87: // W
					cycle1.turn("up");
					break;
				case 65: // A
					cycle1.turn("left");
					break;
				case 83: // S
					cycle1.turn("down");
					break;
				case 68: // D
					cycle1.turn("right");
					break;
				case 69: // E
					cycle1.toggleWall();
					break;
				case 81: // Q
					cycle1.useBoost();
					break;
				// CYCLE 2
				case 38: // UP
					cycle2.turn("up");
					break;
				case 37: // LEFT
					cycle2.turn("left");
					break;
				case 40: // DOWN
					cycle2.turn("down");
					break;
				case 39: // RIGHT
					cycle2.turn("right");
					break;
				case 77: // M
					cycle2.toggleWall();
					break;
				case 78: // N
					cycle2.useBoost();
			}
		});

	}

});