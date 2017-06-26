var assert = require("chai").assert;
var cells = require("../../src/js/cells.js");
var solver = require("../../src/js/solver.js");

describe("solver", function() {
	it("#solve", function() {
		var s = solver.create(6);
		solver.import(s,
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"00 1  \n" +
			" 1  00");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"3,5": true
		});
		assert.strictEqual(solver.export(s),
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"00 1  \n" +
			" 1 100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"2,5": true
		});
		assert.strictEqual(solver.export(s),
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"00 1  \n" +
			" 10100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"0,5": true
		});
		assert.strictEqual(solver.export(s),
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"00 1  \n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"2,4": true
		});
		assert.strictEqual(solver.export(s),
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"0011  \n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"4,4": true
		});
		assert.strictEqual(solver.export(s),
			"1  0  \n" +
			"  00 1\n" +
			" 00  1\n" +
			"      \n" +
			"00110 \n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"4,0": true,
			"4,3": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			"    1 \n" +
			"00110 \n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"5,4": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			"    1 \n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"5,3": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			"    10\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"3,3": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			"   010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"2,3": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			"  1010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"1,3": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			" 11010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"0,3": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00  1\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"3,2": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 001 1\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"4,2": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  00 1\n" +
			" 00101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"4,1": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  0011\n" +
			" 00101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"0,2": true
		});
		assert.strictEqual(solver.export(s),
			"1  01 \n" +
			"  0011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"5,0": true
		});
		assert.strictEqual(solver.export(s),
			"1  010\n" +
			"  0011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"2,0": true
		});
		assert.strictEqual(solver.export(s),
			"1 1010\n" +
			"  0011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"0,1": true,
			"1,1": true
		});
		assert.strictEqual(solver.export(s),
			"1 1010\n" +
			"010011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: true,
			"1,0": true
		});
		assert.strictEqual(solver.export(s),
			"101010\n" +
			"010011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");

		solver.solve(s);
		assert.deepEqual(s.changes, {
			hasData: false
		});
		assert.strictEqual(solver.export(s),
			"101010\n" +
			"010011\n" +
			"100101\n" +
			"011010\n" +
			"001101\n" +
			"110100");
	});
});
