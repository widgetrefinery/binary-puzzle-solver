var assert = require("chai").assert;
var Config = require("../../src/js/config.js");
var Rows = require("../../src/js/rows.js");

var unknownState = Config.cellState.unknown;
var zeroState = Config.cellState.zero;
var oneState = Config.cellState.one;

describe("rows", function() {
	it("~_isPermutationValid", function() {
		assert.strictEqual(Rows._isPermutationValid(0x56A), false); // 000111 => 0101 0110 1010
		assert.strictEqual(Rows._isPermutationValid(0x59A), true); // 001011 => 0101 1001 1010
		assert.strictEqual(Rows._isPermutationValid(0x5A6), true); // 001101 => 0101 1010 0110
		assert.strictEqual(Rows._isPermutationValid(0x5A9), false); // 001110 => 0101 1010 1001
		assert.strictEqual(Rows._isPermutationValid(0x65A), true); // 010011 => 0110 0101 1010
		assert.strictEqual(Rows._isPermutationValid(0x666), true); // 010101 => 0110 0110 0110
		assert.strictEqual(Rows._isPermutationValid(0x669), true); // 010110 => 0110 0110 1001
		assert.strictEqual(Rows._isPermutationValid(0x696), true); // 011001 => 0110 1001 0110
		assert.strictEqual(Rows._isPermutationValid(0x699), true); // 011010 => 0110 1001 1001
		assert.strictEqual(Rows._isPermutationValid(0x6A5), false); // 011100 => 0110 1010 0101
		assert.strictEqual(Rows._isPermutationValid(0x95A), false); // 100011 => 1001 0101 1010
		assert.strictEqual(Rows._isPermutationValid(0x966), true); // 100101 => 1001 0110 0110
		assert.strictEqual(Rows._isPermutationValid(0x969), true); // 100110 => 1001 0110 1001
		assert.strictEqual(Rows._isPermutationValid(0x996), true); // 101001 => 1001 1001 0110
		assert.strictEqual(Rows._isPermutationValid(0x999), true); // 101010 => 1001 1001 1001
		assert.strictEqual(Rows._isPermutationValid(0x9A5), true); // 101100 => 1001 1010 0101
		assert.strictEqual(Rows._isPermutationValid(0xA56), false); // 110001 => 1010 0101 0110
		assert.strictEqual(Rows._isPermutationValid(0xA59), true); // 110010 => 1010 0101 1001
		assert.strictEqual(Rows._isPermutationValid(0xA65), true); // 110100 => 1010 0110 0101
		assert.strictEqual(Rows._isPermutationValid(0xA95), false); // 111000 => 1010 1001 0101
	});

	it("~create", function() {
		var rows = Rows.create(4);
		assert.strictEqual(rows.length, 4);
		assert.strictEqual(rows[0].merged, 0xFF);
		assert.deepEqual(rows[0].raw, [
			0x5A, // 0011 => 0101 1010
			0x66, // 0101 => 0110 0110
			0x69, // 0110 => 0110 1001
			0x96, // 1001 => 1001 0110
			0x99, // 1010 => 1001 1001
			0xA5 // 1100 => 1010 0101
		]);

		rows = Rows.create(6);
		assert.strictEqual(rows.length, 6);
		assert.strictEqual(rows[0].merged, 0xFFF);
		assert.deepEqual(rows[0].raw, [
			0x59A, // 001011 => 0101 1001 1010
			0x5A6, // 001101 => 0101 1010 0110
			0x65A, // 010011 => 0110 0101 1010
			0x666, // 010101 => 0110 0110 0110
			0x669, // 010110 => 0110 0110 1001
			0x696, // 011001 => 0110 1001 0110
			0x699, // 011010 => 0110 1001 1001
			0x966, // 100101 => 1001 0110 0110
			0x969, // 100110 => 1001 0110 1001
			0x996, // 101001 => 1001 1001 0110
			0x999, // 101010 => 1001 1001 1001
			0x9A5, // 101100 => 1001 1010 0101
			0xA59, // 110010 => 1010 0101 1001
			0xA65 // 110100 => 1010 0110 0101
		]);
	});

	it("~get", function() {
		var rows = Rows.create(4);
		assert.strictEqual(Rows.get(rows, 0, 0), unknownState);
		assert.strictEqual(Rows.get(rows, 0, 1), unknownState);
		assert.strictEqual(Rows.get(rows, 0, 2), unknownState);
		assert.strictEqual(Rows.get(rows, 0, 3), unknownState);
		assert.strictEqual(rows[0].dirty, false);
		assert.strictEqual(rows[0].merged, 0xFF);

		var row = rows[0];
		row.raw = [0x5A, 0x66];
		row.dirty = true;

		assert.strictEqual(Rows.get(rows, 0, 0), oneState);
		assert.strictEqual(Rows.get(rows, 0, 1), unknownState);
		assert.strictEqual(Rows.get(rows, 0, 2), unknownState);
		assert.strictEqual(Rows.get(rows, 0, 3), zeroState);
		assert.strictEqual(rows[0].dirty, false);
		assert.strictEqual(rows[0].merged, 0x7E);
	});

	it("~set", function() {
		var rows = Rows.create(4);
		assert.deepEqual(rows[0].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[1].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[2].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[3].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);

		assert.strictEqual(Rows.set(rows, 0, 0, zeroState), true);
		assert.deepEqual(rows[0].raw, [0x69, 0x99, 0xA5]);
		assert.deepEqual(rows[1].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[2].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[3].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);

		assert.strictEqual(Rows.set(rows, 0, 0, zeroState), false);
		assert.deepEqual(rows[0].raw, [0x69, 0x99, 0xA5]);
		assert.deepEqual(rows[1].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[2].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);
		assert.deepEqual(rows[3].raw, [0x5A, 0x66, 0x69, 0x96, 0x99, 0xA5]);

		assert.strictEqual(Rows.set(rows, 0, 1, zeroState), true);
		assert.deepEqual(rows[0].raw, [0xA5]);
		assert.deepEqual(rows[1].raw, [0x5A, 0x66, 0x69, 0x96, 0x99]);
		assert.deepEqual(rows[2].raw, [0x5A, 0x66, 0x69, 0x96, 0x99]);
		assert.deepEqual(rows[3].raw, [0x5A, 0x66, 0x69, 0x96, 0x99]);
	});
});
