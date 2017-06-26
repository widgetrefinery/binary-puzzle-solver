var assert = require("chai").assert;
var config = require("../../src/js/config.js");
var row = require("../../src/js/row.js");

var unknown = config.cell.unknown;
var zero = config.cell.zero;
var one = config.cell.one;

describe("row", function() {
	it("#_isValid", function() {
		assert.strictEqual(row._isValid("111000"), false);
		assert.strictEqual(row._isValid("110100"), true);
		assert.strictEqual(row._isValid("101100"), true);
		assert.strictEqual(row._isValid("011100"), false);
		assert.strictEqual(row._isValid("110010"), true);
		assert.strictEqual(row._isValid("101010"), true);
		assert.strictEqual(row._isValid("011010"), true);
		assert.strictEqual(row._isValid("100110"), true);
		assert.strictEqual(row._isValid("010110"), true);
		assert.strictEqual(row._isValid("001110"), false);
		assert.strictEqual(row._isValid("110001"), false);
		assert.strictEqual(row._isValid("101001"), true);
		assert.strictEqual(row._isValid("011001"), true);
		assert.strictEqual(row._isValid("100101"), true);
		assert.strictEqual(row._isValid("010101"), true);
		assert.strictEqual(row._isValid("001101"), true);
		assert.strictEqual(row._isValid("100011"), false);
		assert.strictEqual(row._isValid("010011"), true);
		assert.strictEqual(row._isValid("001011"), true);
		assert.strictEqual(row._isValid("000111"), false);
	});
	it("#_compute", function() {
		assert.deepEqual(row._compute(4), [
			"1100",
			"1010",
			"0110",
			"1001",
			"0101",
			"0011"
		]);
		assert.deepEqual(row._compute(6), [
			"110100",
			"101100",
			"110010",
			"101010",
			"011010",
			"100110",
			"010110",
			"101001",
			"011001",
			"100101",
			"010101",
			"001101",
			"010011",
			"001011"
		]);
	});
	it("#get|#set", function() {
		var r = row.create(4);
		assert.strictEqual(row.get(r, 0), unknown);
		assert.strictEqual(row.get(r, 1), unknown);
		assert.strictEqual(row.get(r, 2), unknown);
		assert.strictEqual(row.get(r, 3), unknown);

		row.set(r, 1, zero);
		assert.strictEqual(row.get(r, 0), unknown);
		assert.strictEqual(row.get(r, 1), zero);
		assert.strictEqual(row.get(r, 2), unknown);
		assert.strictEqual(row.get(r, 3), unknown);

		row.set(r, 2, one);
		assert.strictEqual(row.get(r, 0), unknown);
		assert.strictEqual(row.get(r, 1), zero);
		assert.strictEqual(row.get(r, 2), one);
		assert.strictEqual(row.get(r, 3), unknown);

		row.set(r, 0, one);
		assert.strictEqual(row.get(r, 0), one);
		assert.strictEqual(row.get(r, 1), zero);
		assert.strictEqual(row.get(r, 2), one);
		assert.strictEqual(row.get(r, 3), zero);
	});
	it("#remove", function() {
		var r = row.create(4);
		assert.strictEqual(r.perms.length, 6);

		assert.strictEqual(row.remove(r, "1100"), true);
		assert.strictEqual(row.remove(r, "1100"), false);
		assert.strictEqual(r.perms.length, 5);

		assert.strictEqual(row.remove(r, "1010"), true);
		assert.strictEqual(row.remove(r, "1001"), true);
		assert.strictEqual(row.remove(r, "0101"), true);
		assert.strictEqual(r.perms.length, 2);

		assert.strictEqual(row.remove(r, "0011"), true);
		assert.deepEqual(r.perms.length, 1);
		assert.deepEqual(r.perms[0], "0110");
	});
});
