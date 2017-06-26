var config = require("./config.js");
var cells = require("./cells.js");
var row = require("./row.js");

var unknown = config.cell.unknown;
var zero = config.cell.zero;
var one = config.cell.one;

function createSolver(size) {
	return {
		size: size,
		dirty: true,
		cells: cells.create(size),
		rows: undefined,
		cols: undefined,
		queue: undefined,
		changes: undefined
	};
}

function importValues(solver, values) {
	solver.dirty = true;
	var i = 0;
	for (var y = 0; y < solver.size; y++) {
		for (var x = 0; x < solver.size; x++) {
			var value = i < values.length ? values[i] : " ";
			i++;
			var cell = cells.get(solver.cells, x, y);
			if ("0" === value) {
				cell.value = zero;
			} else if ("1" === value) {
				cell.value = one;
			} else {
				cell.value = unknown;
			}
		}
		i++; // skip over newline
	}
}

function exportValues(solver) {
	var values = "";
	for (var y = 0; y < solver.size; y++) {
		if (0 < y) {
			values += "\n";
		}
		for (var x = 0; x < solver.size; x++) {
			var value = cells.value(solver.cells, x, y);
			if (zero === value) {
				values += "0";
			} else if (one === value) {
				values += "1";
			} else {
				values += " ";
			}
		}
	}
	return values;
}

function solve(solver) {
	if (solver.dirty) {
		solver.dirty = false;
		resetSolver(solver);
	}
	solver.changes = {
		hasData: false
	};
	while (!solver.changes.hasData && 0 < solver.queue.length) {
		var entry = solver.queue.pop();
		if ("cell" === entry.type) {
			checkCell(solver, entry.x, entry.y);
		} else if ("row" === entry.type) {
			checkRow(solver, entry.y);
		} else if ("column" === entry.type) {
			checkColumn(solver, entry.x);
		} else {
			console.log("unknown queue entry: " + entry);
		}
	}
}

function resetSolver(solver) {
	solver.rows = new Array(solver.size);
	solver.cols = new Array(solver.size);
	solver.queue = [];
	for (var i = 0; i < solver.size; i++) {
		solver.rows[i] = row.create(solver.size);
		solver.cols[i] = row.create(solver.size);
	}

	for (var y = 0; y < solver.size; y++) {
		for (var x = 0; x < solver.size; x++) {
			var cell = cells.get(solver.cells, x, y);
			cell.queued = false;
			if (unknown === cell.value) {
				if (cells.hasNeighbor(solver.cells, x, y)) {
					queueCell(solver, x, y);
				}
			} else {
				if (row.set(solver.rows[y], x, cell.value)) {
					queueRow(solver, y);
				}
				if (row.set(solver.cols[x], y, cell.value)) {
					queueColumn(solver, x);
				}
			}
		}
	}
}

function queueCell(solver, x, y) {
	var cell = cells.get(solver.cells, x, y);
	if (!cell.queued) {
		cell.queued = true;
		solver.queue.push({
			type: "cell",
			x: x,
			y: y
		});
	}
}

function queueRow(solver, y) {
	var r = solver.rows[y];
	if (!r.queued) {
		r.queued = true;
		solver.queue.push({
			type: "row",
			y: y
		});
	}
}

function queueColumn(solver, x) {
	var c = solver.cols[x];
	if (!c.queued) {
		c.queued = true;
		solver.queue.push({
			type: "column",
			x: x
		});
	}
}

function queueUnknownNeighbors(solver, x, y) {
	// queue neighbors to the left
	queueUnknownNeighbor(solver, x, y, -1, 0);
	// queue neighbors to the right
	queueUnknownNeighbor(solver, x, y, 1, 0);
	// queue neighbors above
	queueUnknownNeighbor(solver, x, y, 0, -1);
	// queue neighbors below
	queueUnknownNeighbor(solver, x, y, 0, 1);
}

function queueUnknownNeighbor(solver, x, y, dx, dy) {
	x += dx;
	y += dy;
	var neighbor = cells.get(solver.cells, x, y);
	if (undefined !== neighbor && unknown === neighbor.value) {
		queueCell(solver, x, y);
	} else {
		x += dx;
		y += dy;
		neighbor = cells.get(solver.cells, x, y);
		if (undefined !== neighbor && unknown === neighbor.value) {
			queueCell(solver, x, y);
		}
	}
}

function handleModifiedCell(solver, x, y, value, updateRow, updateColumn) {
	solver.changes.hasData = true;
	solver.changes[x + "," + y] = true;
	queueUnknownNeighbors(solver, x, y);
	if (updateRow && row.set(solver.rows[y], x, value)) {
		queueRow(solver, y);
	}
	if (updateColumn && row.set(solver.cols[x], y, value)) {
		queueColumn(solver, x);
	}
}

function checkCell(solver, x, y) {
	var cell = cells.get(solver.cells, x, y);
	cell.queued = false;
	if (unknown === cell.value && unknown !== cells.infer(solver.cells, x, y)) {
		handleModifiedCell(solver, x, y, cell.value, true, true);
	}
}

function checkRow(solver, y) {
	var r = solver.rows[y];
	r.queued = false;

	for (var x = 0; x < solver.size; x++) {
		var cell = cells.get(solver.cells, x, y);
		if (unknown !== cell.value) {
			continue;
		}
		var value = row.get(r, x);
		if (unknown === value) {
			continue;
		}
		cell.value = value;
		handleModifiedCell(solver, x, y, value, false, true);
	}

	if (1 === r.perms.length) {
		var perm = r.perms[0];
		for (var i = 0; i < solver.size; i++) {
			if (i !== y && row.remove(solver.rows[i], perm)) {
				queueRow(solver, i);
			}
		}
	}
}

function checkColumn(solver, x) {
	var c = solver.cols[x];
	c.queued = false;

	for (var y = 0; y < solver.size; y++) {
		var cell = cells.get(solver.cells, x, y);
		if (unknown !== cell.value) {
			continue;
		}
		var value = row.get(c, y);
		if (unknown === value) {
			continue;
		}
		cell.value = value;
		handleModifiedCell(solver, x, y, value, true, false);
	}

	if (1 === c.perms.length) {
		var perm = c.perms[0];
		for (var i = 0; i < solver.size; i++) {
			if (i !== x && row.remove(solver.cols[i], perm)) {
				queueColumn(solver, i);
			}
		}
	}
}

module.exports = {
	create: createSolver,
	solve: solve,
	import: importValues,
	export: exportValues
};
