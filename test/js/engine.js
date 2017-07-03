var assert = require("chai").assert;
var Cells = require("../../src/js/cells.js");
var Config = require("../../src/js/config.js");
var Engine = require("../../src/js/engine.js");
var puzzles = require("./puzzles.json");

var solvedFlag = Config.cellFlag.solved;

describe("engine", function() {
	it("~step", function() {
		var engine = Engine.import(
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"00 1  \n" +
			" 1  00");

		checkStep(engine, [
				defineSolvedCell(0, 1),
				defineSolvedCell(1, 1),
				defineSolvedCell(4, 1)
			],
			"1  0  \n" +
			"010011\n" +
			" 00  1\n" +
			"      \n" +
			"00 1  \n" +
			" 1  00");

		checkStep(engine, [
				defineSolvedCell(0, 2),
				defineSolvedCell(3, 2),
				defineSolvedCell(4, 2)
			],
			"1  0  \n" +
			"010011\n" +
			"100101\n" +
			"      \n" +
			"00 1  \n" +
			" 1  00");

		checkStep(engine, [
				defineSolvedCell(2, 4),
				defineSolvedCell(4, 4),
				defineSolvedCell(5, 4)
			],
			"1  0  \n" +
			"010011\n" +
			"100101\n" +
			"      \n" +
			"001101\n" +
			" 1  00");

		checkStep(engine, [
				defineSolvedCell(0, 5),
				defineSolvedCell(2, 5),
				defineSolvedCell(3, 5)
			],
			"1  0  \n" +
			"010011\n" +
			"100101\n" +
			"      \n" +
			"001101\n" +
			"110100");

		checkStep(engine, [
				defineSolvedCell(0, 3)
			],
			"1  0  \n" +
			"010011\n" +
			"100101\n" +
			"0     \n" +
			"001101\n" +
			"110100");

		checkStep(engine, [
				defineSolvedCell(1, 0),
				defineSolvedCell(1, 3)
			],
			"10 0  \n" +
			"010011\n" +
			"100101\n" +
			"01    \n" +
			"001101\n" +
			"110100");

		checkStep(engine, [
				defineSolvedCell(2, 0),
				defineSolvedCell(2, 3)
			],
			"1010  \n" +
			"010011\n" +
			"100101\n" +
			"011   \n" +
			"001101\n" +
			"110100");

		checkStep(engine, [
				defineSolvedCell(3, 3)
			],
			"1010  \n" +
			"010011\n" +
			"100101\n" +
			"0110  \n" +
			"001101\n" +
			"110100");

		checkStep(engine, [
				defineSolvedCell(4, 0),
				defineSolvedCell(4, 3)
			],
			"10101 \n" +
			"010011\n" +
			"100101\n" +
			"01101 \n" +
			"001101\n" +
			"110100");

		checkStep(engine, [
				defineSolvedCell(5, 0),
				defineSolvedCell(5, 3)
			],
			"101010\n" +
			"010011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		checkStep(engine, [],
			"101010\n" +
			"010011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");
	});

	it("puzzles", function() {
		for (var i = 0; i < puzzles.length; i++) {
			var puzzle = puzzles[i];
			var engine = Engine.import(puzzle.data);
			while (Engine.step(engine));
			assert.strictEqual(Engine.export(engine), puzzle.answer);
		}
	});
});

function defineSolvedCell(x, y) {
	return {
		x: x,
		y: y
	};
}

function checkStep(engine, solvedCells, expectedExport) {
	assert.strictEqual(Engine.step(engine), 0 < solvedCells.length);
	assert.strictEqual(Engine.export(engine), expectedExport);

	assert.strictEqual(engine.cells.solved.length, solvedCells.length);
	for (var i = 0; i < solvedCells.length; i++) {
		var solvedCell = solvedCells[i];
		assert.strictEqual(
			Cells.at(engine.cells, solvedCell.x, solvedCell.y).flags,
			solvedFlag,
			"x=" + solvedCell.x + " y=" + solvedCell.y
		);
	}
}

function bookmarklet() {
	var d = "{\"data\":\"";
	for (var i = 0; i < puzzel.length; i++) {
		if (0 < i) {
			d += "\\n";
		}
		d += puzzel[i].join("");
	}
	d += "\",\"answer\":\"";
	for (var i = 0; i < oplossing.length; i++) {
		if (0 < i) {
			d += "\\n";
		}
		d += oplossing[i].join("");
	}
	d += "\"}";
	console.log(d);
}
