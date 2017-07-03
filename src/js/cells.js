/** @module cells */

var Config = require("./config.js");

var nilFlag = Config.cellFlag.nil;
var userFlag = Config.cellFlag.user;
var solvedFlag = Config.cellFlag.solved;

var unknownState = Config.cellState.unknown;
var zeroState = Config.cellState.zero;
var oneState = Config.cellState.one;

/**
 * Keeps track of the state for a single cell on a board.
 * @typedef {Object} Cell
 * @property {!module:config~CellState} state - cell state
 * @property {!module:config~CellFlag} flags - cell flags
 */

/**
 * Holds the cells for a board.
 * @typedef {Object} Cells
 * @property {!number} size - board size
 * @property {!module:cells~Cell[]} all - board cells
 * @property {!module:cells~Cell[]} solved - cells with the solved flag
 */

/**
 * Create the cells for a board.
 * @param {!number} boardSize - board size; assumed to be a positive, even number
 * @return {!module:cells~Cells} cells for the board
 */
function createCells(boardSize) {
	var cells = new Array(boardSize * boardSize);
	for (var i = 0; i < cells.length; i++) {
		cells[i] = {
			state: unknownState,
			flags: nilFlag
		};
	}
	return {
		size: boardSize,
		all: cells,
		solved: []
	};
}

/**
 * Get a cell from a board.
 * @param {!module:cells~Cells} cells - cells on a board
 * @param {!number} x - x-coordinate for the cell
 * @param {!number} y - y-coordinate for the cell
 * @return {!module:cells~Cell} the requestd cell
 */
function getCell(cells, x, y) {
	return cells.all[cells.size * y + x];
}

/**
 * Get the state for a cell.
 * @param {!module:cells~Cells} cells - cells on a board
 * @param {!number} x - x-coordinate for the cell
 * @param {!number} y - y-coordinate for the cell
 * @return {!module:config~CellState} the requested cell state
 */
function getState(cells, x, y) {
	return getCell(cells, x, y).state;
}

/**
 * Set the state for a cell. This function implies the state is set by the engine.
 * @param {!module:cells~Cells} cells - cells on a board
 * @param {!number} x - x-coordinate for the cell
 * @param {!number} y - y-coordinate for the cell
 * @param {!module:config~CellState} state - cell state to store
 */
function setState(cells, x, y, state) {
	var cell = getCell(cells, x, y);
	cell.state = state;
	if (solvedFlag !== cell.flags) {
		cell.flags = solvedFlag;
		cells.solved.push(cell);
	}
}

/**
 * Rotate a cell through the possible states. This function implies the state is set by the user.
 * @param {!module:cells~Cells} cells - cells on a board
 * @param {!number} x - x-coordinate for the cell
 * @param {!number} y - y-coordinate for the cell
 */
function rotateState(cells, x, y) {
	var cell = getCell(cells, x, y);
	if (unknownState === cell.state) {
		cell.state = zeroState;
		cell.flags = userFlag;
	} else if (zeroState === cell.state) {
		cell.state = oneState;
		cell.flags = userFlag;
	} else {
		cell.state = unknownState;
		cell.flags = nilFlag;
	}
}

/**
 * Remove the solved flag from all cells.
 * @param {!module:cells~Cells} cells - cells on a board
 */
function clearSolvedFlag(cells) {
	for (var i = 0; i < cells.solved.length; i++) {
		var cell = cells.solved[i];
		if (solvedFlag === cell.flags) {
			cell.flags = nilFlag;
		}
	}
	cells.solved = [];
}

/**
 * Reset all non-user cells to the unknown state.
 * @param {!module:cells~Cells} cells - cells on a board
 */
function resetStates(cells) {
	for (var i = 0; i < cells.all.length; i++) {
		var cell = cells.all[i];
		if (userFlag !== cell.flags) {
			cell.state = unknownState;
			cell.flags = nilFlag;
		}
	}
	cells.solved = [];
}

/**
 * Import the cell states for a board. Each line in the input data represents a row on the board.
 * Each character on a line represents the state for a cell. The possible characters are:
 * <ul>
 *   <li>"0" - zero state</li>
 *   <li>"1" - one state</li>
 *   <li>other - unknown state</li>
 * </ul>
 * If the input data is smaller than the board size, the remaining cells will default to the unknown
 * state. Any cells set by this function will be marked as set by the user.
 * @param {!module:cells~Cells} cells - cells on a board
 * @param {!string} data - string describing the cell states
 */
function importStates(cells, data) {
	var lines = data.split("\n", cells.size);
	for (var y = 0; y < cells.size; y++) {
		for (var x = 0; x < cells.size; x++) {
			var cell = getCell(cells, x, y);
			var state = y < lines.length && x < lines[y].length ? lines[y][x] : " ";
			if ("0" === state) {
				cell.state = zeroState;
				cell.flags = userFlag;
			} else if ("1" === state) {
				cell.state = oneState;
				cell.flags = userFlag;
			} else {
				cell.state = unknownState;
				cell.flags = nilFlag;
			}
		}
	}
	cells.solved = [];
}

/**
 * Export the cell states for a board. Each line in the output data represents a row on the board.
 * Each character on a line represents the state for a cell. The possible characters are:
 * <ul>
 *   <li>"0" - zero state</li>
 *   <li>"1" - one state</li>
 *   <li>" " - unknown state</li>
 * </ul>
 * @param {!module:cells~Cells} cells - cells on a board
 * @return {!string} string describing the cell states
 */
function exportStates(cells) {
	var output = "";
	for (var y = 0; y < cells.size; y++) {
		if (0 < y) {
			output += "\n";
		}
		for (var x = 0; x < cells.size; x++) {
			var state = getState(cells, x, y);
			if (zeroState === state) {
				output += "0";
			} else if (oneState === state) {
				output += "1";
			} else {
				output += " ";
			}
		}
	}
	return output;
}

module.exports = {
	create: createCells,
	at: getCell,
	get: getState,
	set: setState,
	rotate: rotateState,
	clearSolvedFlag: clearSolvedFlag,
	reset: resetStates,
	import: importStates,
	export: exportStates
};
