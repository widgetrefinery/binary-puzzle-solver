var cells = require("./cells.js");
var solver = require("./solver.js");

function cellComponent(solver, x, y) {
	var component = {
		toggle: function() {
			cells.toggle(solver.cells, x, y);
			solver.dirty = true;
		},
		view: function() {
			return m("span", {
				class: solver.changes && solver.changes[x + "," + y] ? "active" : "",
				onclick: component.toggle
			}, cells.value(solver.cells, x, y));
		}
	};
	return m(component);
}

function rowComponent(solver, y) {
	var component = {
		view: function() {
			var cellComponents = new Array(solver.size);
			for (var x = 0; x < solver.size; x++) {
				cellComponents[x] = cellComponent(solver, x, y);
			}
			return m("div", cellComponents);
		}
	};
	return m(component);
}

var board = {
	running: undefined,
	speed: 200,
	solver: solver.create(6),
	resize: function(e) {
		var size = e.target.value | 0;
		board.solver = solver.create(size);
	},
	run: function() {
		if (board.running) {
			clearTimeout(board.running);
			board.running = undefined;
		} else {
			board.runCallback();
		}
	},
	runCallback: function() {
		solver.solve(board.solver);
		if (board.solver.changes.hasData) {
			board.running = setTimeout(board.runCallback, board.speed);
		} else {
			board.running = undefined;
		}
		m.redraw();
	},
	step: function() {
		solver.solve(board.solver);
	},
	view: function() {
		var rows = new Array(board.solver.size);
		for (var y = 0; y < board.solver.size; y++) {
			rows[y] = rowComponent(board.solver, y);
		}
		return m("div", [
			m("select", {
				onchange: board.resize
			}, [
				m("option", {
					value: 6
				}, "6x6"),
				m("option", {
					value: 8
				}, "8x8"),
				m("option", {
					value: 10
				}, "10x10"),
				m("option", {
					value: 12
				}, "12x12")
			]),
			m("button", {
				onclick: board.step
			}, "step"),
			m("button", {
				onclick: board.run
			}, board.running ? "stop" : "run"),
			m("div", {
				class: "board"
			}, rows)
		]);
	}
};

m.mount(document.body, board);
