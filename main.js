
//GameBoard code below
function randomInt(n) {
	return Math.floor(Math.random() * n);
}

function rgb(r, g, b) {
	return "rgb(" + r + "," + g + "," + b + ")";
}


var Parameters = function () {
	this.max_hits = 50;
	this.genome = .5;
	this.pop_size = 100;
	this.green_bound = .1;
	this.red_bound = .2;
	this.death_rate = .01;
	this.growth_rate = .03;
	this.decay_rate = .001;
	this.pause = 0;
}

function Agent(game, x, y, agent) {
	if (agent) {
		var bit = randomInt(2)
		this.genome = agent.genome + Math.pow(-1, bit) * Math.random() * 0.1;
		if (this.genome < 0) this.genome = 0;
		if (this.genome > 1) this.genome = 1;
		console.log(this.genome);
	}
	else {
		this.genome = Parameters.genome;
	}

	var val = Math.floor(256 * this.genome);
	this.color = rgb(val,val,val);

	this.maxHits = Parameters.max_hits;
	this.hits = this.maxHits;

	Entity.call(this, game, x, y);
}

Agent.prototype = new Entity();
Agent.prototype.constructor = Agent;

Agent.prototype.update = function () {
	var cell = this.game.board.board[this.x][this.y];

	//console.log(cell.color);
	// resolve cell
	if (cell.color === "Red") {
		if (Math.random() > this.genome) {
			if (this.hits < this.maxHits) this.hits++;
			//cell.color = "Black";
			cell.color = "White";
		}
		else this.hits--;
	} else if (cell.color === "Green") {
		if (Math.random() < this.genome) {
			if (this.hits < this.maxHits) this.hits++;
			//cell.color = "Black";
			cell.color = "White";
		}
		else this.hits--;
		//else cell.color = "Black";
	} else if (cell.color === "White") {
		if (Math.random() < 0.10) {
			var agent = new Agent(this.game, this.x, this.y, this);
			this.game.board.agents.push(agent);
		}
		cell.color = "Black";
	} else if (cell.color === "Black") {
		// safe
	}

	// did I die?
	if (this.hits < 1 || Math.random() < Parameters.death_rate) {
		this.dead = true;
	}

	// move
	if (!this.dead) {
		var newX = (this.x + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;
		var newY = (this.y + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;

		var newCell = this.game.board.board[newX][newY];

		this.x = newX;
		this.y = newY;
	}
}

function Cell(game,x,y) {
	this.x = x;
	this.y = y;
	this.game = game;

	var color = Math.random();
	var green = Parameters.green_bound;
	var red = Parameters.red_bound;
	if (color < green) this.color = "Green";
	else if (color < red) this.color = "Red";
	else this.color = "Black";
}

Cell.prototype = new Entity();
Cell.prototype.constructor = Cell;

Cell.prototype.update = function () {
	var growthRate = Parameters.growth_rate;
	var decayRate = Parameters.decay_rate;
	if (this.color !== "Black" && this.color !== "White" && (Math.random() < growthRate)) {
		var newX = (this.x + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;
		var newY = (this.y + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;

		if (this.game.board.board[newX][newY].color === "Black") this.game.board.board[newX][newY].color = this.color;
	}
	if (this.color !== "Black" && Math.random() < decayRate) this.color = "Black";
}


function Automata(game) {
	this.dimension = 100;
	this.populationSize = Parameters.pop_size;
	this.agents = [];
	// create board
	this.board = [];
	for (var i = 0; i < this.dimension; i++) {
		this.board.push([]);
		for (var j = 0; j < this.dimension; j++) {
			this.board[i].push(new Cell(game,i,j));
		}

	}

	// add agents
	while (this.agents.length < this.populationSize) {
		var x = randomInt(100);
		var y = randomInt(100);

		var agent = new Agent(game, x, y);
		this.agents.push(agent);
	}

	Entity.call(this, game, 0, 0);
};

Automata.prototype = new Entity();
Automata.prototype.constructor = Automata;

Automata.prototype.update = function () {
	for (var i = 0; i < this.agents.length; i++) {
		this.agents[i].update();
	}

	for (var i = this.agents.length - 1; i >= 0; i--) {
		if (this.agents[i].dead) {
			this.agents.splice(i, 1);
		}
	}

	//while (this.agents.length < this.populationSize) {
	//    var parent = this.agents[randomInt(this.agents.length)];
	//    var agent = new Agent(this.game, parent.x, parent.y, parent);
	//    this.agents.push(agent);
	//}

	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			this.board[i][j].update();
		}
	}

};

Automata.prototype.draw = function (ctx) {
	var size = 8;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var cell = this.board[i][j];

			ctx.fillStyle = cell.color;
			ctx.fillRect(i * size, j * size, size, size);
		}
	}

	for (var i = 0; i < this.agents.length; i++) {
		ctx.fillStyle = this.agents[i].color;
		ctx.beginPath();
		ctx.arc((this.agents[i].x * size) + (size / 2), (this.agents[i].y * size) + (size / 2), (size / 2), 0, 2 * Math.PI, false);
		ctx.fill();
	}


};

Parameters.set = function () {
	Parameters.pop_size = document.getElementById("pop_size");
	Parameters.green_bound = document.getElementById("green_bound");
	Parameters.red_bound = document.getElementById("red_bound");
	Parameters.death_rate = document.getElementById("death_rate");
	Parameters.growth_rate = document.getElementById("growth_rate");
	Parameters.decay_rate = document.getElementById("decay_rate");
}

var Pause = function () {
	if (Parameters.pause) {
		Parameters.pause = 0;
		gameEngine.pause = false;
	} else {
		Parameters.pause = 1;
		gameEngine.pause = true;
	}
}
//the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
	console.log("starting up da sheild");
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	
	var statCanvas = document.getElementById('statCanvas');
	var statCtx = statCanvas.getContext('2d');
	
	var gameEngine = new GameEngine();
	var automata = new Automata(gameEngine);

	
	gameEngine.addEntity(automata);
	gameEngine.board = automata;
	gameEngine.init(ctx, statCtx);
	gameEngine.start();

});
