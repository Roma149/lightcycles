// This file declares the constructor and functions for walls

var Wall = function () {
	this.orientation = "";
	this.start_position = 0;
	this.end_position = 0;
	this.center_axe = 0;
	this.svg_element = "";
};

Wall.prototype = {};

Wall.prototype.length = function () {
	return Math.abs(this.end_position - this.start_position);
};

Wall.prototype.isVertical = function () {
	return this.orientation === "up" || this.orientation === "down";
};

Wall.prototype.isHorizontal = function () {
	return this.orientation === "left" || this.orientation === "right";
};

Wall.prototype.smallerBound = function () {
	return this.start_position < this.end_position ? this.start_position : this.end_position;
};

Wall.prototype.largerBound = function () {
	return this.start_position > this.end_position ? this.start_position : this.end_position;
};