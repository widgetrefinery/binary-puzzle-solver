/** @module engine */

var Cells = require("./cells.js");
var Config = require("./config.js");
var Rows = require("./rows.js");

var boardSizes = Config.boardSizes;

var unknownState = Config.cellState.unknown;
var zeroState = Config.cellState.zero;
var oneState = Config.cellState.one;

var engineSpeed = Config.engineSpeed;

/**
 * Holds the data for the puzzle solver engine.
 * @typedef {Object} Engine
 * @property {number} size - board size
 * @property {module:cells~Cells} cells - manages the cells on the board
 * @property {module:rows~Rows} rows - manages the rows on the board
 * @property {module:rows~Rows} cols - manages the columns on the board
 * @property {number} position - tracks the next row or column to process
 * @property {boolean} dirty - true if the user modified the board state
 * @property {number} timer - return value from {@link setTimeout}
 */

/**
 * Create an engine for solving puzzle boards with the given size.
 * @param {!number} boardSize - board size; assumed to be a positive, even number
 * @return {!module:engine~Engine} engine for solving puzzles
 */
function createEngine(boardSize) {
	return {
		size: boardSize,
		cells: Cells.create(boardSize),
		rows: undefined,
		cols: undefined,
		position: 0,
		dirty: true,
		timer: undefined
	};
}

/**
 * Process the puzzle board. It will iterate over the board until it finds the answer to an unsolved
 * cell. The engine processes an entire row or column at a time so it may solve more than one cell
 * before returning.
 * @param {!module:engine~Engine} engine - solver engine
 * @return {!boolean} true if it solved at least one cell
 */
function step(engine) {
	if (engine.dirty) {
		engine.dirty = false;
		initializeEngine(engine);
	}
	var maxPosition = engine.size * 2;
	var position = engine.position;
	var modified = false;
	Cells.clearSolvedFlag(engine.cells);
	do {
		position = (position + 1) % maxPosition;
		if (position < engine.size) {
			modified = checkRow(engine, position);
		} else {
			modified = checkColumn(engine, position - engine.size);
		}
	} while (!modified && position !== engine.position);
	engine.position = position;
	return modified;
}

/**
 * Initialize the rows and columns used by the engine.
 * @param {!module:engine~Engine} engine - solver engine
 */
function initializeEngine(engine) {
	engine.rows = Rows.create(engine.size);
	engine.cols = Rows.create(engine.size);
	for (var y = 0; y < engine.size; y++) {
		for (var x = 0; x < engine.size; x++) {
			var state = Cells.get(engine.cells, x, y);
			if (unknownState !== state) {
				Rows.set(engine.rows, y, x, state);
				Rows.set(engine.cols, x, y, state);
			}
		}
	}
}

/**
 * Process a row looking for answers to any unsolved cells.
 * @param {!module:engine~Engine} engine - solver engine
 * @param {!number} y - identifies the row to proces
 * @return {!boolean} true if at least one cell was solved
 */
function checkRow(engine, y) {
	if (!Rows.dirty(engine.rows, y)) {
		return false;
	}
	var modified = false;
	for (var x = 0; x < engine.size; x++) {
		var state = Cells.get(engine.cells, x, y);
		if (unknownState !== state) {
			continue;
		}
		state = Rows.get(engine.rows, y, x);
		if (unknownState !== state) {
			Cells.set(engine.cells, x, y, state, false);
			Rows.set(engine.cols, x, y, state);
			modified = true;
		}
	}
	return modified;
}

/**
 * Process a column looking for answers to any unsolved cells.
 * @param {!module:engine~Engine} engine - solver engine
 * @param {!number} x - identifies the column to process
 * @return {!boolean} true if at least one cell was solved
 */
function checkColumn(engine, x) {
	if (!Rows.dirty(engine.cols, x)) {
		return false;
	}
	var modified = false;
	for (var y = 0; y < engine.size; y++) {
		var state = Cells.get(engine.cells, x, y);
		if (unknownState !== state) {
			continue;
		}
		state = Rows.get(engine.cols, x, y);
		if (unknownState !== state) {
			Cells.set(engine.cells, x, y, state, false);
			Rows.set(engine.rows, y, x, state);
			modified = true;
		}
	}
	return modified;
}

/**
 * Start processing the puzzle board. It will periodically call {@link module:engine~step} to
 * advance the board state until it cannot solve any more cells.
 * @param {!module:engine~Engine} engine - solver engine
 * @param {?function} callback - invoked on every engine tick
 */
function start(engine, callback) {
	if (!engine.timer) {
		run();
	}

	function run() {
		engine.timer = undefined;
		if (step(engine)) {
			engine.timer = setTimeout(run, engineSpeed);
		}
		if (callback) {
			callback();
		}
	}
}

/**
 * Stop processing the puzzle board.
 * @param {!module:engine~Engine} engine - solver engine
 */
function stop(engine) {
	if (engine.timer) {
		clearTimeout(engine.timer);
		engine.timer = undefined;
	}
}

/**
 * Create a solver engine for the puzzle board defined by the serialized cell states. The board size
 * is determined by counting the number of characters on the first line. It must match one of the
 * valid board sizes or the import will fail.
 * @param {!string} data - string describing the cell states
 * @return {?module:engine~Engine} solver engine or undefined
 * @see {module:cells~importStates}
 */
function importData(data) {
	var size = undefined;
	for (var i = 0; i < data.length; i++) {
		if ("\n" === data[i]) {
			size = i;
			break;
		}
	}
	if (-1 === boardSizes.indexOf(size)) {
		return undefined;
	}
	var engine = createEngine(size);
	Cells.import(engine.cells, data);
	engine.dirty = true;
	return engine;
}

/**
 * Export the cell states from a solver engine.
 * @param {!module:engine~Engine} engine - solver engine
 * @return {!string} string describing the cell states
 * @see {module:cells~exportStates}
 */
function exportData(engine) {
	return Cells.export(engine.cells);
}

module.exports = {
	create: createEngine,
	step: step,
	start: start,
	stop: stop,
	import: importData,
	export: exportData
};
