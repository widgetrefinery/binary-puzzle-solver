/** @module config */

/**
 * Defines the flags for a cell. The possible values are:
 * <ul>
 *   <li>0 - nothing special about the cell</li>
 *   <li>1 - the cell was set by the user</li>
 *   <li>2 - the cell was just solved by the engine</li>
 * </ul>
 * @typedef {number} CellFlag
 */

/**
 * Defines the state for a cell. The possible values are:
 * <ul>
 *   <li>"0" - zero state</li>
 *   <li>"1" - one state</li>
 *   <li>"" - unknown state</li>
 * </ul>
 * @typedef {string} CellState
 */

module.exports = {
	boardSizes: [6, 8, 10, 12, 14],
	cellFlag: {
		nil: 0,
		user: 1,
		solved: 2
	},
	cellState: {
		unknown: "",
		zero: "0",
		one: "1"
	},
	engineSpeed: 200
};
