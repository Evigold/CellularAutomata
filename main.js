
//GameBoard code below
function randomInt(n) {
	return Math.floor(Math.random() * n);
}

function rgb(r, g, b) {
	return "rgb(" + r + "," + g + "," + b + ")";
}


var gameEngine = new GameEngine();

var pop_hist = [];
var red_hist = [];
var green_hist = [];
var cycles = 0;

function download(filename) {
	var pom = document.createElement('a');

	var megaArray = [];
	megaArray.push(pop_hist.join(','));
	megaArray.push(red_hist.join(','));
	megaArray.push(green_hist.join(','));

	var blob = new Blob([megaArray.join('\n')], {type: 'text/csv'});
	var url = window.URL.createObjectURL(blob);
	pom.setAttribute('href', url);
	pom.setAttribute('download', filename);
	pom.click();
}

function parametersObject(hits, genome, pop, green, red, death, growth, decay, birth) {
	this.max_hits=hits;
	this.genome=genome;
	this.pop_size=pop;
	this.green_bound=green;
	this.red_bound=red;
	this.death_rate=death;
	this.growth_rate=growth;
	this.decay_rate=decay;
	this.birth_rate=birth;
	this.button_clicked= 0;
}

//Array for setting parameters.
var parameters_array = [];
//Set array values here, 0th index is starting settings.
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(5, .5, 100, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(500, .5, 100, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .25, 100, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .75, 100, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 10, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 1000, .1, .2, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .3, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .2, .3, .01, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .001, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .1, .03, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .003, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .3, .001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .03, .0001, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .03, .01, .1));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .03, .001, .01));
parameters_array.push(new parametersObject(50, .5, 100, .1, .2, .01, .03, .001, .2));

var index = 1;

var parameters = parameters_array[0];

function Agent(game, x, y, agent) {
	if (agent) {
		var bit = randomInt(2)
		this.genome = agent.genome + Math.pow(-1, bit) * Math.random() * 0.1;
		if (this.genome < 0) this.genome = 0;
		if (this.genome > 1) this.genome = 1;
		//console.log(this.genome);
	}
	else {
		this.genome = parameters.genome;
	}

	var val = Math.floor(256 * this.genome);
	this.color = rgb(val,val,val);

	this.maxHits = parameters.max_hits;
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
		if (Math.random() < parameters.birth_rate) {
			var agent = new Agent(this.game, this.x, this.y, this);
			this.game.board.agents.push(agent);
		}
		cell.color = "Black";
	} else if (cell.color === "Black") {
		// safe
	}
	// did I die?
	if (this.hits < 1 || Math.random() < parameters.death_rate) {
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
	var green = parameters.green_bound;
	var red = parameters.red_bound;
	if (color < green) this.color = "Green";
	else if (color < red) this.color = "Red";
	else this.color = "Black";
}

Cell.prototype = new Entity();
Cell.prototype.constructor = Cell;

Cell.prototype.update = function () {
	var growthRate = parameters.growth_rate;
	var decayRate = parameters.decay_rate;
	if (this.color !== "Black" && this.color !== "White" && (Math.random() < growthRate)) {
		var newX = (this.x + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;
		var newY = (this.y + randomInt(3) - 1 + this.game.board.dimension) % this.game.board.dimension;

		if (this.game.board.board[newX][newY].color === "Black") this.game.board.board[newX][newY].color = this.color;
	}
	if (this.color !== "Black" && Math.random() < decayRate) this.color = "Black";
}


function Automata(game) {
	this.dimension = 100;
	this.populationSize = parameters.pop_size;
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

	if (cycles % 100 == 0 && document.getElementById("download").checked && this.agents.length <= 0) {
		var filename = "CellularAutomata";
		var currentDate = new Date();
		filename+=(cycles.toString() + currentDate.getDay() + (currentDate.getMonth() + 1) 
				+ currentDate.getFullYear() + ".csv");
		download(filename);

	} else {
		cycles++;
		for (var i = 0; i < this.agents.length; i++) {
			this.agents[i].update();
		}
		for (var i = this.agents.length - 1; i >= 0; i--) {
			if (this.agents[i].dead) {
				this.agents.splice(i, 1);
			}
		}
		for (var i = 0; i < this.dimension; i++) {
			for (var j = 0; j < this.dimension; j++) {
				this.board[i][j].update();
			}
		}
	}

};

Automata.prototype.draw = function (ctx) {
	var size = 8;
	var colors = [];
	var red_count = 0;
	var green_count = 0;
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var cell = this.board[i][j];

			ctx.fillStyle = cell.color;
			if (cell.color == "Red") {
				red_count++;
			} else if (cell.color == "Green") {
				green_count++;
			}
			ctx.fillRect(i * size, j * size, size, size);
		}
	}
	red_hist.push(red_count / 10);
	green_hist.push(green_count / 10);
	for (var i = 0; i < this.agents.length; i++) {
		ctx.fillStyle = this.agents[i].color;
		ctx.beginPath();
		ctx.arc((this.agents[i].x * size) + (size / 2), (this.agents[i].y * size) + (size / 2), (size / 2), 0, 2 * Math.PI, false);
		ctx.fill();
		colors.push(this.agents[i].color);
	}

	colors.sort();

	//Population graphing section.
	var start_x = 800;
	var start_y = 0;
	var graph_height = 400;
	var graph_width = 200;
	var size = 10;
	var row = 0;
	var col = 0;
	var count = 200;

	//Update history array.
	pop_hist.push(this.agents.length);

	//Set up graphing areas.
	//Paint background of information area white.
	ctx.fillStyle = "white";
	ctx.fillRect(start_x, start_y, 400, 800);
	ctx.beginPath();

	//Information print out area outline.
	ctx.strokeStyle = "black";
	ctx.rect(start_x + 210, start_y, 190, 800);
	ctx.stroke();

	//Population over time graph area outline.
	ctx.strokeStyle = "black";
	ctx.rect(start_x, 400, 210, 400);
	ctx.stroke();

	//Graph population by color
	for (var i = 0; i < colors.length; i++) {
		//Make filled in rectangle.
		ctx.fillStyle = colors[i];
		ctx.fillRect(start_x + (row * size), start_y + (col * size), size, size);
		//Add border.
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.rect(start_x + (row * size), start_y + (col * size), size, size);
		ctx.stroke();
		row++;
		if (row > (graph_width / size)) {
			col++;
			row = 0;
		}
	}

	//Print information.
	ctx.font = "15px Arial";
	ctx.fillStyle = "black";
	ctx.fillText("Population Size: " + this.agents.length, start_x + 220, start_y + 15);
	ctx.fillText("Cycles: " + cycles, start_x + 220, start_y + 60);
	ctx.fillText("Birth Rate: " + parameters.birth_rate, start_x + 220, start_y + 75);
	ctx.fillText("Population Over Time", start_x + 220, start_y + 415);
	ctx.fillStyle = "red";
	ctx.fillText("Red Food: " + red_hist[cycles - 1], start_x + 220, start_y + 30);
	ctx.fillText("Red Food Over Time", start_x + 220, start_y + 430);
	ctx.fillStyle = "green";
	ctx.fillText("Green Food: " + green_hist[cycles - 1], start_x + 220, start_y + 45);
	ctx.fillText("Green Food Over Time", start_x + 220, start_y + 445);
	//Graph population over time. Bound to increments 200 or less.
	graph(ctx, pop_hist, 400, count, start_x, start_y + 400, graph_width, graph_height, "black");
	//Graph green food over time. Bound to increments 200 or less.
	graph(ctx, green_hist, 400, count, start_x, start_y + 400, graph_width, graph_height, "green");
	//Graph red food over time. Bound to increments 200 or less.
	graph(ctx, red_hist, 400, count, start_x, start_y + 400, graph_width, graph_height, "red");


};
function buttonClicked() {
	parameters.button_clicked = 1;
	setParameters();
}

function setParameters() {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');

	var automata = new Automata(gameEngine);
	if (parameters.button_clicked) {
		parameters.pop_size = parseInt(document.getElementById("pop_size").value);
		parameters.max_hits = parseInt(document.getElementById("max_hits").value);
		parameters.green_bound = parseFloat(document.getElementById("green_bound").value);
		parameters.red_bound = parseFloat(document.getElementById("red_bound").value);
		parameters.death_rate = parseFloat(document.getElementById("death_rate").value);
		parameters.growth_rate = parseFloat(document.getElementById("growth_rate").value);
		parameters.decay_rate = parseFloat(document.getElementById("decay_rate").value);
		parameters.birth_rate = parseFloat(document.getElementById("birth_rate").value);
		parameters.button_clicked = 0;
	} else {
		parameters = parameters_array[index];
		index++;
		pop_hist = [];
		red_hist = [];
		green_hist = [];
		cycles = 0;
	}
	

	gameEngine.entities = [];
	gameEngine.addEntity(automata);
	gameEngine.board = automata;

}

function graph(ctx, arr, max, count, x, y, width, height, style, text) {

	if(text && arr.length > 0) {
		ctx.fillStyle = "Black";
		var current = parseFloat(arr[arr.length - 1].toFixed(3));
		ctx.fillText(text + ": " + current + " Max: " + parseFloat(max.toFixed(3)), x, y + 10);
	}

	ctx.strokeStyle = style;
	var px = 0;

	var step = width / count;
	var range = max/height;
	var startY = y + height;

	var i = Math.max(0, arr.length - count); //display the last (max) events
	ctx.moveTo(x, startY - arr[i]/height);
	ctx.beginPath();
	while(i < arr.length) {
		ctx.lineTo(x + px++ * step, startY - arr[i]/range);
		i++;
	}
	ctx.stroke();
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
	setParameters();
	gameEngine.init(ctx);
	gameEngine.start();
});



