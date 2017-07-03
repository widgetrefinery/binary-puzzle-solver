var assert = require("chai").assert;
var Cells = require("../../src/js/cells.js");
var Config = require("../../src/js/config.js");

var nilFlag = Config.cellFlag.nil;
var userFlag = Config.cellFlag.user;
var solvedFlag = Config.cellFlag.solved;

var unknownState = Config.cellState.unknown;
var zeroState = Config.cellState.zero;
var oneState = Config.cellState.one;

describe("cells", function() {
	it("~at", function() {
		var cells = Cells.create(2);
		assert.strictEqual(Cells.at(cells, 0, 0), cells.all[0]);
		assert.strictEqual(Cells.at(cells, 1, 0), cells.all[1]);
		assert.strictEqual(Cells.at(cells, 0, 1), cells.all[2]);
		assert.strictEqual(Cells.at(cells, 1, 1), cells.all[3]);
	});

	it("~get", function() {
		var cells = Cells.create(2);
		cells.all[0].state = unknownState;
		cells.all[1].state = zeroState;
		cells.all[2].state = oneState;
		cells.all[3].state = unknownState;

		assert.strictEqual(Cells.get(cells, 0, 0), unknownState);
		assert.strictEqual(Cells.get(cells, 1, 0), zeroState);
		assert.strictEqual(Cells.get(cells, 0, 1), oneState);
		assert.strictEqual(Cells.get(cells, 1, 1), unknownState);
	});

	it("~set", function() {
		var cells = Cells.create(2);
		Cells.set(cells, 1, 0, zeroState);
		Cells.set(cells, 0, 1, oneState);

		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, zeroState, solvedFlag);
		checkCell(cells, 0, 1, oneState, solvedFlag);
		checkCell(cells, 1, 1, unknownState, nilFlag);
		assert.deepEqual(cells.solved, [cells.all[1], cells.all[2]]);
	});

	it("~rotate", function() {
		var cells = Cells.create(2);

		// rotate the cell at (1,0)
		Cells.rotate(cells, 1, 0);
		checkCell(cells, 1, 0, zeroState, userFlag);
		Cells.rotate(cells, 1, 0);
		checkCell(cells, 1, 0, oneState, userFlag);
		Cells.rotate(cells, 1, 0);
		checkCell(cells, 1, 0, unknownState, nilFlag);
		Cells.rotate(cells, 1, 0);
		checkCell(cells, 1, 0, zeroState, userFlag);
		Cells.rotate(cells, 1, 0);
		checkCell(cells, 1, 0, oneState, userFlag);

		// rotate the cell at (1,1)
		Cells.rotate(cells, 1, 1);
		checkCell(cells, 1, 1, zeroState, userFlag);

		// check cells
		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, oneState, userFlag);
		checkCell(cells, 0, 1, unknownState, nilFlag);
		checkCell(cells, 1, 1, zeroState, userFlag);
	});

	it("~clearSolvedFlag", function() {
		var cells = Cells.create(2);
		Cells.rotate(cells, 1, 0);
		Cells.set(cells, 0, 1, oneState);
		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, zeroState, userFlag);
		checkCell(cells, 0, 1, oneState, solvedFlag);
		checkCell(cells, 1, 1, unknownState, nilFlag);
		assert.deepEqual(cells.solved, [cells.all[2]]);

		Cells.clearSolvedFlag(cells);
		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, zeroState, userFlag);
		checkCell(cells, 0, 1, oneState, nilFlag);
		checkCell(cells, 1, 1, unknownState, nilFlag);
		assert.deepEqual(cells.solved, []);
	});

	it("~reset", function() {
		var cells = Cells.create(2);
		Cells.rotate(cells, 1, 0);
		Cells.set(cells, 0, 1, oneState);
		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, zeroState, userFlag);
		checkCell(cells, 0, 1, oneState, solvedFlag);
		checkCell(cells, 1, 1, unknownState, nilFlag);
		assert.deepEqual(cells.solved, [cells.all[2]]);

		Cells.reset(cells);
		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, zeroState, userFlag);
		checkCell(cells, 0, 1, unknownState, nilFlag);
		checkCell(cells, 1, 1, unknownState, nilFlag);
		assert.deepEqual(cells.solved, []);
	});

	it("~import", function() {
		var cells = Cells.create(2);

		// input data matches board size
		Cells.import(cells,
			" 0\n" +
			"1 ");
		checkCell(cells, 0, 0, unknownState, nilFlag);
		checkCell(cells, 1, 0, zeroState, userFlag);
		checkCell(cells, 0, 1, oneState, userFlag);
		checkCell(cells, 1, 1, unknownState, nilFlag);

		// input data does not match board size
		Cells.import(cells,
			"1\n" +
			" 01\n" +
			"10"
		);
		checkCell(cells, 0, 0, oneState, userFlag);
		checkCell(cells, 1, 0, unknownState, nilFlag);
		checkCell(cells, 0, 1, unknownState, nilFlag);
		checkCell(cells, 1, 1, zeroState, userFlag);
	});

	it("~export", function() {
		var cells = Cells.create(2);
		Cells.set(cells, 1, 0, zeroState);
		Cells.set(cells, 0, 1, oneState);
		assert.strictEqual(Cells.export(cells),
			" 0\n" +
			"1 ");
	});
});

function checkCell(cells, x, y, state, flags) {
	var cell = Cells.at(cells, x, y);
	assert.strictEqual(cell.state, state);
	assert.strictEqual(cell.flags, flags);
}
