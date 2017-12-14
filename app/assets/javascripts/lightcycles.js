// This file contains the constructor and function definitions for lightcycles
// it contains most of the game logic

var Cycle = function (color) {
	this.color = color;

	this.orientation = "up";
	this.position = {
		x: 0,
		y: 0
	};
	this.velocity = 100; // pixels/second

	this.currentWall = {};
	this.wallColor = "#ffffff";
	this.makingWall = false;
	this.wallMakingActivated = true; // flag to let the user toggle making a wall or not
	this.walls = []; // array to hold all walls created by this cycle

	this.remainingBoosts = 3;
	this.boostTime = 0;
	this.boosted = false;

	this.collided = false;
	this.collided_against = null;

	this.player_type = "human"; // or "computer"

	this.disabled = false;

	this.current_image = null;
	this.images = {};
	this.images.up = null;
	this.images.down = null;
	this.images.left = null;
	this.images.right = null;
}

Cycle.prototype = {};

// function to turn the cycle in a new orientation
// TODO: change strings for global variables or object properties, and use compass names (east, etc.)
Cycle.prototype.turn = function (new_orientation) {
	if (this.orientation === new_orientation) return; // if already going that way, do nothing
	if (opposite_orientations(this.orientation, new_orientation)) return; // can't turn backwards

	var disp = GAME.cycle_length / 2 - GAME.cycle_width / 2;

	// turn cycle by pivoting on the back
	if (this.orientation === "right" || new_orientation === "right")
		this.position.x += disp;
	else if (this.orientation === "left" || new_orientation === "left")
		this.position.x -= disp;
	else
		throw new Error("Invalid orientation in turn function.");

	if (this.orientation === "down" || new_orientation === "down")
		this.position.y += disp;
	else if (this.orientation === "up" || new_orientation === "up")
		this.position.y -= disp;
	else
		throw new Error("Invalid orientation in turn function.");

	// replace the image for the one corresponding to the new direction
	this.current_image.hide();
	this.current_image = this.images[new_orientation].show();
	this.current_image.center(this.position.x, this.position.y);

	// stop making the current wall
	if (this.makingWall) this.cutWall();

	// set the new orientation
	this.orientation = new_orientation;

	// start a new wall
	if (!this.makingWall && this.wallMakingActivated) this.startWall();
}

function opposite_orientations(or1, or2) {
	return (or1 === "left" && or2 === "right" ) || (or1 === "right" && or2 === "left") || (or1 === "up" && or2 === "down") || (or1 === "down" && or2 === "up");
}

// function to update the cycle's position on each iteration, according to the time that has passed (dt)
Cycle.prototype.move = function (dt) {
	if (this.orientation === "up") {
		this.position.y -= this.velocity*dt;
	}
	else if (this.orientation === "down") {
		this.position.y += this.velocity*dt;
	}
	else if (this.orientation === "right") {
		this.position.x += this.velocity*dt;
	}
	else if (this.orientation === "left") {
		this.position.x -= this.velocity*dt;
	}

	this.updatePosition(); // move the image to the new position
};

// function to move the cycle's image to the new position
Cycle.prototype.updatePosition = function () {
	this.current_image.center(this.position.x, this.position.y);
};

Cycle.prototype.startWall = function () {
	if (this.makingWall) return;
	this.makingWall = true;

	var wall_orientation = this.orientation;

	// determine the wall's initial stats depending on orientation
	if (wall_orientation === "left") {
		var center_axe = this.position.y;
		var starting_position = this.position.x + GAME.cycle_length / 2 - 1;

	} else if (wall_orientation === "right") {
		var center_axe = this.position.y;
		var starting_position = this.position.x - GAME.cycle_length / 2 + 1;

	} else if (wall_orientation === "up") {
		var center_axe = this.position.x;
		var starting_position = this.position.y + GAME.cycle_length / 2 - 1;

	} else if (wall_orientation === "down") {
		var center_axe = this.position.x;
		var starting_position = this.position.y - GAME.cycle_length / 2 + 1;
	}

	// create a 'rect' to represent the wall, don't dimension it properly yet
	var rect = GAME.svg_root.rect(1, 1).attr({ fill: this.wallColor }); // TODO: change color by cycle

	// create and initialize a new wall
	var wall = new Wall();
	wall.orientation = wall_orientation;
	wall.start_position = starting_position;
	wall.end_position = starting_position;
	wall.center_axe = center_axe;
	wall.current_image = rect;

	// assign the new wall to the cycle
	this.currentWall = wall;

	// add the wall to the cycle's list
	this.walls.push(wall);
};

Cycle.prototype.growWall = function () {
	if (!this.makingWall) return; // if not making a wall, do nothing
	var wall = this.currentWall;

	if (wall.orientation === "up") {
		wall.end_position = this.position.y + GAME.cycle_width / 2;

	} else if (wall.orientation === "down") {
		wall.end_position = this.position.y - GAME.cycle_width / 2;

	} else if (wall.orientation === "left") {
		wall.end_position = this.position.x + GAME.cycle_width / 2;

	} else if (wall.orientation === "right") {
		wall.end_position = this.position.x - GAME.cycle_width / 2;
	}
}

// stop growing the wall
Cycle.prototype.cutWall = function () {
	if (!this.makingWall) return; // if not making a wall, do nothing

	var wall = this.currentWall;

	// make last update to the wall's bounds
	if (wall.orientation === "up") {
		wall.end_position = this.position.y - GAME.cycle_width / 2 + 1;

	} else if (wall.orientation === "down") {
		wall.end_position = this.position.y + GAME.cycle_width / 2 - 1;

	} else if (wall.orientation === "left") {
		wall.end_position = this.position.x - GAME.cycle_width / 2 + 1;

	} else if (wall.orientation === "right") {
		wall.end_position = this.position.x + GAME.cycle_width / 2 - 1;
	}

	this.drawWall(wall); // redraw the wall
	
	this.currentWall = null; // empty the current wall property
	this.makingWall = false; // not making a wall any more, set the flag
};

Cycle.prototype.drawCurrentWall = function () {
	if (!this.makingWall) return;
	this.drawWall(this.currentWall);
};

Cycle.prototype.drawWall = function (wall) {
	var rect = wall.current_image;

	if (wall.orientation === "up") { // vertical wall
		rect.width(GAME.wall_width); // set the wall's width to a predefined constant
		rect.height(wall.length()); // he wall's length is the difference between its endpoints
		rect.cx(wall.center_axe); // align the wall's center
		rect.y(wall.end_position); // set the wall's position depending on its orientation

	} else if (wall.orientation === "down") { // vertical wall
		rect.width(GAME.wall_width);
		rect.height(wall.length());
		rect.cx(wall.center_axe);
		rect.y(wall.start_position);

	} else if (wall.orientation === "left") { // horizontal wall
		rect.width(wall.length());
		rect.height(GAME.wall_width);
		rect.cy(wall.center_axe);
		rect.x(wall.end_position);

	} else if (wall.orientation === "right") { // horizontal wall
		rect.width(wall.length());
		rect.height(GAME.wall_width);
		rect.cy(wall.center_axe);
		rect.x(wall.start_position);
	}

};

Cycle.prototype.collide = function (description) {
	console.log(this.color + ": crashed into something! (" + description + ")");
	this.collided = true;
	this.collided_against = description;
};

Cycle.prototype.turnWallOff = function () {
	this.wallMakingActivated = false;
	this.cutWall();
};

Cycle.prototype.turnWallOn = function () {
	this.wallMakingActivated = true;
};

Cycle.prototype.toggleWall = function () {
	console.log("toggling wall");
	this.wallMakingActivated ? this.turnWallOff() : this.turnWallOn();
}

Cycle.prototype.useBoost = function () {
	if (this.remainingBoosts <= 0) return;
	this.velocity *= GAME.boostFactor;
	this.remainingBoosts -= 1;
	this.boostTime = (new Date()).getTime();
	this.boosted = true;
};

Cycle.prototype.checkBoost = function () {
	if (!this.boosted) return;
	if ((new Date()).getTime() - this.boostTime >= GAME.boostDuration) {
		this.velocity /= GAME.boostFactor;
		this.boosted = false;
	}
};

// detect collisions between this lightcycle and its own walls, the other cycle's walls, the other cycle, and the field's edges
Cycle.prototype.detectCollisions = function (other_cycle) {

	var wall;
	
	if (this.orientation === "up") {
		var collision_point = this.position.y - GAME.cycle_length / 2;

		// check collision with own walls
		for (var i = 0; i < this.walls.length; i++) {
			wall = this.walls[i];

			if (wall.isHorizontal()) {
				if ((collision_point <= wall.center_axe + GAME.wall_width / 2) && (collision_point >= wall.center_axe - GAME.wall_width / 2) && this.position.x >= wall.smallerBound() && this.position.x <= wall.largerBound()) {
					this.collide("own wall");
				}
			} else {
				if (collision_point >= wall.smallerBound() && collision_point <= wall.largerBound() && Math.abs(this.position.x - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle's walls
		for (var j = 0; j < other_cycle.walls.length; j++) {
			wall = other_cycle.walls[j];

			if (wall.isHorizontal()) {
				if ((collision_point <= wall.center_axe + GAME.wall_width / 2) && (collision_point >= wall.center_axe - GAME.wall_width / 2) && (this.position.x >= wall.smallerBound()) && (this.position.x <= wall.largerBound())) {
					this.collide("other cycle's wall");
				}
			} else {
				if (collision_point >= wall.smallerBound() && collision_point <= wall.largerBound() && Math.abs(this.position.x - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) {
					this.collide("other cycle's wall");
				}
			}
		}

		// check collision with other cycle
		if (other_cycle.orientation === "left" || other_cycle.orientation === "right") {
			if ((collision_point <= other_cycle.position.y + GAME.cycle_width / 2) && (collision_point >= other_cycle.position.y - GAME.cycle_width / 2) && (Math.abs(this.position.x - other_cycle.position.x) <= GAME.cycle_length / 2) ) {
				this.collide("other cycle");
			}
		} else {
			if ((collision_point <= other_cycle.position.y + GAME.cycle_length / 2) && (collision_point >= other_cycle.position.y - GAME.cycle_length / 2) && (Math.abs(this.position.x - other_cycle.position.x) <= GAME.cycle_width / 2) ) {
				this.collide("other cycle");
			}
		}

		// check collision with edge
		if (collision_point <= 0) {
			this.collide("edge");
		}
	} else if (this.orientation === "down") {
		var collision_point = this.position.y + GAME.cycle_length / 2;

		// check collision with own walls
		for (var i = 0; i < this.walls.length; i++) {
			wall = this.walls[i];

			if (wall.isHorizontal()) { //center axe+6?
				if ((collision_point >= wall.center_axe - GAME.wall_width / 2) && (collision_point <= wall.center_axe + GAME.wall_width / 2) && (this.position.x >= wall.smallerBound()) && (this.position.x <= wall.largerBound())) {
					this.collide("own wall");
				}
			} else {
				if (collision_point >= wall.smallerBound() && collision_point <= wall.largerBound() && Math.abs(this.position.x - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle's walls
		for (var j = 0; j < other_cycle.walls.length; j++) {
			wall = other_cycle.walls[j];

			if (wall.isHorizontal()) {
				if ((collision_point >= wall.center_axe - GAME.wall_width / 2) && (collision_point <= wall.center_axe + GAME.wall_width / 2) && (this.position.x >= wall.smallerBound()) && (this.position.x <= wall.largerBound())) {
					this.collide("own wall");
				}
			} else {
				if (collision_point >= wall.smallerBound() && collision_point <= wall.largerBound() && Math.abs(this.position.x - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle
		if (other_cycle.orientation === "left" || other_cycle.orientation === "right") {
			if ((collision_point >= other_cycle.position.y - GAME.cycle_width / 2) && (collision_point <= other_cycle.position.y + GAME.cycle_width / 2) && (Math.abs(this.position.x - other_cycle.position.x) <= GAME.cycle_length / 2) ) {
				this.collide("other cycle");
			}
		} else {
			if ((collision_point >= other_cycle.position.y - GAME.cycle_length / 2) && (collision_point <= other_cycle.position.y + GAME.cycle_length / 2) && (Math.abs(this.position.x - other_cycle.position.x) <= GAME.cycle_width / 2) ) {
				this.collide("other cycle");
			}
		}

		// check collision with edge
		if (collision_point >= GAME.field_height) {
			this.collide("edge");
		}
	} else if (this.orientation === "left") {
		var collision_point = this.position.x - GAME.cycle_length / 2;

		// check collision with own walls
		for (var i = 0; i < this.walls.length; i++) {
			wall = this.walls[i];

			if (wall.isHorizontal()) {
				if ((Math.abs(this.position.y - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) && (collision_point >= wall.smallerBound()) && (collision_point <= wall.largerBound())) { // go through? check both bounds?
					this.collide("own wall");
				}
			} else {
				if ((collision_point <= wall.center_axe + GAME.wall_width / 2) && (collision_point >= wall.center_axe - GAME.wall_width / 2) && (this.position.y - GAME.cycle_width / 2 >= wall.smallerBound()) && (this.position.y + GAME.cycle_width / 2 <= wall.largerBound())) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle's walls
		for (var j = 0; j < other_cycle.walls.length; j++) {
			wall = other_cycle.walls[j];

			if (wall.isHorizontal()) {
				if ((Math.abs(this.position.y - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) && (collision_point >= wall.smallerBound()) && (collision_point <= wall.largerBound())) { // go through? check both bounds?
					this.collide("own wall");
				}
			} else {
				if ((collision_point <= wall.center_axe + GAME.wall_width / 2) && (collision_point >= wall.center_axe - GAME.wall_width / 2) && (this.position.y - GAME.cycle_width / 2 >= wall.smallerBound()) && (this.position.y + GAME.cycle_width / 2 <= wall.largerBound())) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle
		if (other_cycle.orientation === "left" || other_cycle.orientation === "right") { // TODO: generalize
			if ((collision_point <= other_cycle.position.x + GAME.cycle_length / 2) && (collision_point >= other_cycle.position.x - GAME.cycle_length / 2) && (Math.abs(this.position.y - other_cycle.position.y) <= GAME.cycle_length / 2) ) {
				this.collide("other cycle");
			}
		} else {
			if ((collision_point <= other_cycle.position.x + GAME.cycle_width / 2) && (collision_point >= other_cycle.position.x - GAME.cycle_width / 2) && (Math.abs(this.position.y - other_cycle.position.y) <= GAME.cycle_width / 2) ) {
				this.collide("other cycle");
			}
		}

		// check collision with edge
		if (collision_point <= 0) {
			this.collide("edge");
		}
	} else if (this.orientation === "right") {
		var collision_point = this.position.x + GAME.cycle_length / 2;

		// check collision with own walls
		for (var i = 0; i < this.walls.length; i++) {
			wall = this.walls[i];

			if (wall.isHorizontal()) {
				if ((Math.abs(this.position.y - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) && (collision_point >= wall.smallerBound()) && (collision_point <= wall.largerBound())) {
					this.collide("own wall");
				}
			} else {
				if ((collision_point >= wall.center_axe - GAME.wall_width / 2) && (collision_point <= wall.center_axe + GAME.wall_width / 2) && (this.position.y + GAME.cycle_width / 2 >= wall.smallerBound()) && (this.position.y - GAME.cycle_width / 2 <= wall.largerBound())) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle's walls
		for (var j = 0; j < other_cycle.walls.length; j++) {
			wall = other_cycle.walls[j];

			if (wall.isHorizontal()) {
				if ((Math.abs(this.position.y - wall.center_axe) <= GAME.wall_width / 2 + GAME.cycle_width / 2) && (collision_point >= wall.smallerBound()) && (collision_point <= wall.largerBound())) {
					this.collide("own wall");
				}
			} else {
				if ((collision_point >= wall.center_axe - GAME.wall_width / 2) && (collision_point <= wall.center_axe + GAME.wall_width / 2) && (this.position.y + GAME.cycle_width / 2 >= wall.smallerBound()) && (this.position.y - GAME.cycle_width / 2 <= wall.largerBound())) {
					this.collide("own wall");
				}
			}
		}

		// check collision with other cycle
		if (other_cycle.orientation === "left" || other_cycle.orientation === "right") { // TODO: generalize
			if ((collision_point >= other_cycle.position.x - GAME.cycle_length / 2) && (collision_point <= other_cycle.position.x + GAME.cycle_length / 2) && (Math.abs(this.position.y - other_cycle.position.y) <= GAME.cycle_width / 2) ) {
				this.collide("other cycle");
			}
		} else {
			if ((collision_point >= other_cycle.position.x - GAME.cycle_width / 2) && (collision_point <= other_cycle.position.x + GAME.cycle_width / 2) && (Math.abs(this.position.y - other_cycle.position.y) <= GAME.cycle_length / 2) ) {
				this.collide("other cycle");
			}
		}

		// check collision with edge
		if (collision_point >= GAME.field_width) {
			this.collide("edge");
		}
	}
};

/* functions useful for debugging, remove when no longer needed
Cycle.prototype.print = function () {
	return "Cycle1. X: " + this.position.x + " Y: " + this.position.y + " Ori: " + this.orientation;
};

Cycle.prototype.printWall = function (wall) {
	return "Wall. Orientation: " + wall.orientation + " CenterAxe: " + wall.center_axe + " StartPos: " + wall.start_position + " EndPos: " + wall.end_position;
};
*/