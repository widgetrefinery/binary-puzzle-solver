/** @module rows */

var Config = require("./config.js");

var unknownState = Config.cellState.unknown;
var zeroState = Config.cellState.zero;
var oneState = Config.cellState.one;

var zeroCell = 1;
var oneCell = 2;

/**
 * {@link module:rows~computePermutations} caches all computed permutations here. The cache key is
 * the row size while the cache value is the list of permutations.
 * @var {Object<number,module:rows~Permutation[]>}
 */
var permutationCache = {};

/**
 * Represents the cell states for a row. Every 2 bits in the integer represents the state for one
 * cell on the row. The possible values for a cell are:
 * <ul>
 *   <li>01 - zero state</li>
 *   <li>10 - one state</li>
 *   <li>other - unknown state (only occurs for merged permutations)</li>
 * </ul>
 * @typedef {number} Permutation
 */

/**
 * Keeps track of the valid permutations for a row (or column) of cells on a board.
 * @typedef {Object} Row
 * @property {!module:rows~Permutation[]} raw - list of valid permutations
 * @property {!module:rows~Permutation} merged - merged permutation value
 * @property {!boolean} dirty - true if raw and merged are out of sync
 */

/**
 * Holds the rows (or columns) for a board.
 * @typedef {module:rows~Row[]} Rows
 */

/**
 * Create the rows for a board.
 * @param {!number} boardSize - board size; assumed to be a positive, even number
 * @return {!module:rows~Rows} rows for the board
 */
function createRows(boardSize) {
	var rows = new Array(boardSize);
	var rawPermutations = computePermutations(boardSize);
	var mergedPermutation = mergePermutations(rawPermutations);
	for (var i = 0; i < rows.length; i++) {
		rows[i] = {
			raw: rawPermutations.slice(),
			merged: mergedPermutation,
			dirty: false
		};
	}
	return rows;
}

/**
 * Compute the valid permutations for a row with the given size.
 * @param {!number} rowSize - row size; assumed to be a positive, even number
 * @return {!module:rows~Permutation[]} list of permutations
 */
function computePermutations(rowSize) {
	if (!permutationCache[rowSize]) {
		var rawPermutations = [];
		permutationCache[rowSize] = rawPermutations;
		// create initial permutation with ones in the lower half and zeroes in the upper half
		var rawPermutation = 0;
		var cellPair = (zeroCell << rowSize) | oneCell;
		for (var offset = 0; offset < rowSize; offset += 2) {
			rawPermutation |= cellPair << offset;
		}
		// save initial permutation if valid
		if (isPermutationValid(rawPermutation)) {
			rawPermutations.push(rawPermutation);
		}
		// generate remaining permutations by shuffling the one cells up the row
		while (true) {
			// seek to the first cell that contains a one
			var firstOneOffset = 0;
			while (oneCell !== ((rawPermutation >>> firstOneOffset) & 0x3)) {
				firstOneOffset += 2;
			}
			// stop when all the ones have migrated to the upper half of the row
			if (firstOneOffset >= rowSize) {
				break;
			}
			// seek to the next zero cell
			var nextZeroOffset = firstOneOffset + 2;
			while (zeroCell !== ((rawPermutation >>> nextZeroOffset) & 0x3)) {
				nextZeroOffset += 2;
			}
			// move the upper one cell up by one position, move the remaining one cells to the bottom
			rawPermutation ^= ((0x4 << (nextZeroOffset - firstOneOffset)) - 1) << firstOneOffset;
			rawPermutation ^= (0x1 << (nextZeroOffset - firstOneOffset - 2)) - 1;
			// save the permutation if valid
			if (isPermutationValid(rawPermutation)) {
				rawPermutations.push(rawPermutation);
			}
		}
	}
	return permutationCache[rowSize];
}

/**
 * Test if the permutation is valid. A permutation is valid if it contains no more than two
 * consecutive cells with the same state.
 * @param {!module:rows~Permutation} permutation - permutation to test
 * @return {!boolean} true if the permutation is valid
 */
function isPermutationValid(rawPermutation) {
	var priorCell = undefined;
	var count = 0;
	while (0 !== rawPermutation) {
		var currentCell = rawPermutation & 0x3;
		if (currentCell === priorCell) {
			count++;
			if (2 < count) {
				return false;
			}
		} else {
			priorCell = currentCell;
			count = 1;
		}
		rawPermutation >>>= 2;
	}
	return true;
}

/**
 * Merge a list of permutations into a single permutation. The output permutation will contain an
 * unknown state for any cells that have conflicting states from the input permutations. Otherwise,
 * the output permutation will contain a zero or one state for a cell to indicate that all input
 * permutations agreed to that state.
 * @param {!module:rows~Permutation[]} rawPermutations - list of permutations for a row
 * @return {!module:rows~Permutation} merged permutation
 */
function mergePermutations(rawPermutations) {
	var mergedPermutation = 0;
	for (var i = 0; i < rawPermutations.length; i++) {
		mergedPermutation |= rawPermutations[i];
	}
	return mergedPermutation;
}

/**
 * Test if a row is dirty.
 * @param {!module:rows~Rows} rows - rows on a board
 * @param {!number} rowOffset - identifies the row on the board
 * @return {!boolean} true if the row is dirty
 */
function isRowDirty(rows, rowOffset) {
	return rows[rowOffset].dirty;
}

/**
 * Get the state for a cell. This will update the row if it is dirty.
 * @param {!module:rows~Rows} rows - rows on a board
 * @param {!number} rowOffset - identifies the row on the board
 * @param {!number} cellOffset - identifies the cell on the row
 * @return {!module:config~CellState} the requested cell state
 */
function getState(rows, rowOffset, cellOffset) {
	var row = rows[rowOffset];
	if (row.dirty) {
		row.dirty = false;
		row.merged = mergePermutations(row.raw);
		cleanupPermutations(rows, row);
	}
	var cell = (row.merged >>> (cellOffset * 2)) & 0x3;
	if (zeroCell === cell) {
		return zeroState;
	}
	if (oneCell === cell) {
		return oneState;
	}
	return unknownState;
}

/**
 * Set the state for a cell.
 * @param {!module:rows~Rows} rows - rows on a board
 * @param {!number} rowOffset - identifies the row on the board
 * @param {!number} cellOffset - identifies the cell on the row
 * @param {!module:config~CellState} state - cell state to store
 * @return {!boolean} true if any rows were modified
 */
function setState(rows, rowOffset, cellOffset, state) {
	var modified = false;
	var row = rows[rowOffset];
	cellOffset *= 2;
	var expectedCell = zeroState === state ? zeroCell : oneCell;
	var rawPermutations = row.raw;
	for (var i = rawPermutations.length - 1; 0 <= i; i--) {
		var actualCell = (rawPermutations[i] >>> cellOffset) & 0x3;
		if (actualCell !== expectedCell) {
			rawPermutations.splice(i, 1);
			row.dirty = true;
			modified = true;
		}
	}
	if (modified) {
		cleanupPermutations(rows, row);
	}
	return modified;
}

/**
 * If the given row contains a single permutation, remove that permutation from the other rows.
 * @param {!module:rows~Rows} rows - rows on a board
 * @param {!module:rows~Row} row - row to cleanup
 */
function cleanupPermutations(rows, row) {
	if (1 !== row.raw.length) {
		return;
	}
	var rawPermutation = row.raw[0];
	for (var i = 0; i < rows.length; i++) {
		var otherRow = rows[i];
		if (row === otherRow) {
			continue;
		}
		var j = otherRow.raw.indexOf(rawPermutation);
		if (-1 !== j) {
			otherRow.raw.splice(j, 1);
			otherRow.dirty = true;
		}
	}
}

module.exports = {
	create: createRows,
	dirty: isRowDirty,
	get: getState,
	set: setState,
	// these are only exported for unit tests
	_isPermutationValid: isPermutationValid
};
