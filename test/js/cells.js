var assert = require("chai").assert;
var config = require("../../src/js/config.js");
var cells = require("../../src/js/cells.js");

var unknown = config.cell.unknown;
var zero = config.cell.zero;
var one = config.cell.one;

describe("cells", function() {
	it("#get", function() {
		var c = cells.create(2);
		for (var i = 0; i < c.values.length; i++) {
			c.values[i].value = i;
		}

		assert.strictEqual(cells.get(c, -1, -1), undefined);
		assert.strictEqual(cells.get(c, 0, -1), undefined);
		assert.strictEqual(cells.get(c, 2, -1), undefined);

		assert.strictEqual(cells.get(c, -1, 0), undefined);
		assert.strictEqual(cells.get(c, 2, 0), undefined);

		assert.strictEqual(cells.get(c, -1, 2), undefined);
		assert.strictEqual(cells.get(c, 0, 2), undefined);
		assert.strictEqual(cells.get(c, 2, 2), undefined);

		assert.strictEqual(cells.get(c, 0, 0), c.values[0]);
		assert.strictEqual(cells.get(c, 1, 0), c.values[1]);
		assert.strictEqual(cells.get(c, 0, 1), c.values[2]);
		assert.strictEqual(cells.get(c, 1, 1), c.values[3]);
	});

	it("#value", function() {
		var c = cells.create(2);
		for (var i = 0; i < c.values.length; i++) {
			c.values[i].value = i;
		}

		assert.strictEqual(cells.value(c, -1, -1), unknown);
		assert.strictEqual(cells.value(c, 0, -1), unknown);
		assert.strictEqual(cells.value(c, 2, -1), unknown);

		assert.strictEqual(cells.value(c, -1, 0), unknown);
		assert.strictEqual(cells.value(c, 2, 0), unknown);

		assert.strictEqual(cells.value(c, -1, 2), unknown);
		assert.strictEqual(cells.value(c, 0, 2), unknown);
		assert.strictEqual(cells.value(c, 2, 2), unknown);

		assert.strictEqual(cells.value(c, 0, 0), 0);
		assert.strictEqual(cells.value(c, 1, 0), 1);
		assert.strictEqual(cells.value(c, 0, 1), 2);
		assert.strictEqual(cells.value(c, 1, 1), 3);
	});

	it("#toggle", function() {
		var c = cells.create(2);
		check(unknown, unknown, unknown, unknown);
		cells.toggle(c, 1, 0);
		check(unknown, zero, unknown, unknown);
		cells.toggle(c, 1, 0);
		check(unknown, one, unknown, unknown);

		cells.toggle(c, 1, 0);
		check(unknown, unknown, unknown, unknown);
		cells.toggle(c, 1, 0);
		check(unknown, zero, unknown, unknown);
		cells.toggle(c, 1, 0);
		check(unknown, one, unknown, unknown);

		cells.toggle(c, 0, 1);
		check(unknown, one, zero, unknown);

		function check(value0, value1, value2, value3) {
			assert.strictEqual(cells.value(c, 0, 0), value0);
			assert.strictEqual(cells.value(c, 1, 0), value1);
			assert.strictEqual(cells.value(c, 0, 1), value2);
			assert.strictEqual(cells.value(c, 1, 1), value3);
		}
	});

	it("#infer", function() {
		checkNeighbors(
			0, 1, // left2
			1, 1, // left1
			2, 1 // cell
		);
		checkNeighbors(
			0, 1, // left1
			2, 1, // right1
			1, 1 // cell
		);
		checkNeighbors(
			1, 1, // right1
			2, 1, // right2
			0, 1 // cell
		);
		checkNeighbors(
			1, 0, // above2
			1, 1, // above1
			1, 2 // cell
		);
		checkNeighbors(
			1, 0, // above1
			1, 2, // below1
			1, 1 // cell
		);
		checkNeighbors(
			1, 1, // below1
			1, 2, // below2
			1, 0 // cell
		);

		function checkNeighbors(firstX, firstY, secondX, secondY, cellX, cellY) {
			var c = cells.create(3);
			checkSingleCase(c,
				firstX, firstY, unknown,
				secondX, secondY, unknown,
				cellX, cellY, unknown);
			checkSingleCase(c,
				firstX, firstY, zero,
				secondX, secondY, unknown,
				cellX, cellY, unknown);
			checkSingleCase(c,
				firstX, firstY, unknown,
				secondX, secondY, one,
				cellX, cellY, unknown);
			checkSingleCase(c,
				firstX, firstY, one,
				secondX, secondY, zero,
				cellX, cellY, unknown);
			checkSingleCase(c,
				firstX, firstY, zero,
				secondX, secondY, zero,
				cellX, cellY, one);
			checkSingleCase(c,
				firstX, firstY, one,
				secondX, secondY, one,
				cellX, cellY, zero);
		}

		function checkSingleCase(c,
			firstX, firstY, firstValue,
			secondX, secondY, secondValue,
			cellX, cellY, inferResult) {
			cells.get(c, firstX, firstY).value = firstValue;
			cells.get(c, secondX, secondY).value = secondValue;
			cells.get(c, cellX, cellY).value = unknown;
			assert.strictEqual(cells.infer(c, cellX, cellY), inferResult);
			assert.strictEqual(cells.value(c, cellX, cellY), inferResult);
		}
	});

	it("#hasNeighbor", function() {
		var c = cells.create(3);
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), false);

		cells.get(c, 0, 0).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), false);

		cells.get(c, 0, 0).value = unknown;
		cells.get(c, 1, 0).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), true);

		cells.get(c, 1, 0).value = unknown;
		cells.get(c, 2, 0).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), false);

		cells.get(c, 2, 0).value = unknown;
		cells.get(c, 0, 1).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), true);

		cells.get(c, 0, 1).value = unknown;
		cells.get(c, 2, 1).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), true);

		cells.get(c, 2, 1).value = unknown;
		cells.get(c, 0, 2).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), false);

		cells.get(c, 0, 2).value = unknown;
		cells.get(c, 1, 2).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), true);

		cells.get(c, 1, 2).value = unknown;
		cells.get(c, 2, 2).value = zero;
		assert.strictEqual(cells.hasNeighbor(c, 1, 1), false);
	});
});
