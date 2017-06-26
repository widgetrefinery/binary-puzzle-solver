var config = require("./config.js");

var unknown = config.cell.unknown;
var zero = config.cell.zero;
var one = config.cell.one;

/**
 * Create an object to hold the state for the cells on the puzzle board.
 *
 * @param {!number} size - board size; assumed to be a positive, even number
 * @return {!object} cell states
 */
function createCells(size) {
	var values = new Array(size * size);
	for (var i = 0; i < values.length; i++) {
		values[i] = {
			value: unknown,
			queued: false
		};
	}
	return {
		size: size,
		values: values
	};
}

/**
 * Get the state for a single cell. This will return undefined if the coordinates are out of bounds.
 *
 * @param {!object} cells - cell states
 * @param {!number} x - x-axis coordinate for the cell
 * @param {!number} y - y-axis coordinate for the cell
 * @return {?object} cell state or undefined
 */
function getCell(cells, x, y) {
	if (0 <= x && x < cells.size && 0 <= y && y < cells.size) {
		return cells.values[cells.size * y + x];
	}
	return undefined;
}

/**
 * Get the value for a single cell. This will return unknown if the coordinates are out of bounds.
 *
 * @param {!object} cells - cell states
 * @param {!number} x - x-axis coordinate for the cell
 * @param {!number} y - y-axis coordinate for the cell
 * @return {!string} zero, one, or unknown
 */
function getValue(cells, x, y) {
	if (0 <= x && x < cells.size && 0 <= y && y < cells.size) {
		return cells.values[cells.size * y + x].value;
	}
	return unknown;
}

/**
 * Toggle the value for a single cell. It will cycle through zero, one, unknown.
 *
 * @param {!object} cells - cell states
 * @param {!number} x - x-axis coordinate for the cell; assumed to be within bounds
 * @param {!number} y - y-axis coordinate for the cell; assumed to be within bounds
 */
function toggleValue(cells, x, y) {
	var cell = getCell(cells, x, y);
	if (unknown === cell.value) {
		cell.value = zero;
	} else if (zero === cell.value) {
		cell.value = one;
	} else {
		cell.value = unknown;
	}
}

/**
 * Try to infer the value for a cell by inspecting its neighbors.
 *
 * @param {!object} cells - cell states
 * @param {!number} x - x-axis coordinate for the cell; assumed to be within bounds
 * @param {!number} y - y-axis coordinate for the cell; assumed to be within bounds
 * @return {!string} cell value
 */
function inferValue(cells, x, y) {
	var cell = getCell(cells, x, y);
	// check the 2 cells to the left
	var left2 = getValue(cells, x - 2, y);
	var left1 = getValue(cells, x - 1, y);
	if (inferValueFromNeighbors(cell, left2, left1)) {
		return cell.value;
	}
	// check the cells immediately to the left and right
	var right1 = getValue(cells, x + 1, y);
	if (inferValueFromNeighbors(cell, left1, right1)) {
		return cell.value;
	}
	// check the 2 cells to the right
	var right2 = getValue(cells, x + 2, y);
	if (inferValueFromNeighbors(cell, right1, right2)) {
		return cell.value;
	}
	// check the 2 cells above
	var above2 = getValue(cells, x, y - 2);
	var above1 = getValue(cells, x, y - 1);
	if (inferValueFromNeighbors(cell, above1, above2)) {
		return cell.value;
	}
	// check the cells immediately above and below
	var below1 = getValue(cells, x, y + 1);
	if (inferValueFromNeighbors(cell, above1, below1)) {
		return cell.value;
	}
	// check the 2 cells below
	var below2 = getValue(cells, x, y + 2);
	if (inferValueFromNeighbors(cell, below1, below2)) {
		return cell.value;
	}
	// not enough information to determine value
	return unknown;
}

/**
 * Try to infer the value for a cell by inspecting the given neighbors.
 *
 * @param {!object} cell - cell state
 * @param {!string} neighbor1 - value from the first neighbor
 * @param {!string} neighbor2 - value from the second neighbor
 * @return {!boolean} true if the cell value is now set
 */
function inferValueFromNeighbors(cell, neighbor1, neighbor2) {
	if (unknown !== neighbor1 && neighbor1 === neighbor2) {
		cell.value = zero === neighbor1 ? one : zero;
		return true;
	}
	return false;
}

/**
 * Test if any of the immediate neighbors around a cell are set.
 *
 * @param {!object} cells - cell states
 * @param {!number} x - x-axis coordinate for the cell
 * @param {!number} y - y-axis coordinate for the cell
 * @return {!boolean} true if any immediate neighbors are set
 */
function hasNeighbor(cells, x, y) {
	return unknown !== getValue(cells, x - 1, y) ||
		unknown !== getValue(cells, x + 1, y) ||
		unknown !== getValue(cells, x, y - 1) ||
		unknown !== getValue(cells, x, y + 1);
}

module.exports = {
	create: createCells,
	get: getCell,
	value: getValue,
	toggle: toggleValue,
	infer: inferValue,
	hasNeighbor: hasNeighbor
};
