var Cells = require("./cells.js");
var Config = require("./config.js");
var Engine = require("./engine.js");

var boardSizes = Config.boardSizes;

var userFlag = Config.cellFlag.user;
var solvedFlag = Config.cellFlag.solved;

var cellComponent = {
	classes: function(engine, x, y) {
		var flags = Cells.at(engine.cells, x, y).flags;
		if (userFlag === flags) {
			return "user";
		}
		if (solvedFlag === flags) {
			return "solved";
		}
		return undefined;
	},
	rotate: function(engine, x, y) {
		Cells.rotate(engine.cells, x, y);
		engine.dirty = true;
	},
	view: function(vnode) {
		var engine = vnode.attrs.engine;
		var x = vnode.attrs.x;
		var y = vnode.attrs.y;
		return m("td", {
			class: cellComponent.classes(engine, x, y),
			onclick: function() {
				cellComponent.rotate(engine, x, y);
			}
		}, Cells.get(engine.cells, x, y));
	}
};

var rowComponent = {
	view: function(vnode) {
		var engine = vnode.attrs.engine;
		var y = vnode.attrs.y;
		var cells = new Array(engine.size);
		for (var x = 0; x < cells.length; x++) {
			cells[x] = m(cellComponent, {
				engine: engine,
				x: x,
				y: y
			});
		}
		return m("tr", cells);
	}
};

var boardComponent = {
	view: function(vnode) {
		var engine = vnode.attrs.engine;
		var rows = new Array(engine.size);
		for (var y = 0; y < rows.length; y++) {
			rows[y] = m(rowComponent, {
				engine: engine,
				y: y
			});
		}
		return m("table.board", {
			class: engine.size & 2 ? "odd" : "even"
		}, rows);
	}
};

var rootComponent = {
	engine: Engine.create(8),
	resizeOptions: function() {
		var options = new Array(boardSizes.length);
		for (var i = 0; i < options.length; i++) {
			var size = boardSizes[i];
			options[i] = m("option", {
				value: size,
				selected: size === rootComponent.engine.size
			}, size + "x" + size);
		}
		return options;
	},
	resize: function(size) {
		Engine.stop(rootComponent.engine);
		rootComponent.engine = Engine.create(size | 0);
	},
	clearAll: function() {
		rootComponent.engine = Engine.create(rootComponent.engine.size);
	},
	clear: function() {
		Cells.reset(rootComponent.engine.cells);
		rootComponent.engine.dirty = true;
	},
	step: function() {
		Engine.step(rootComponent.engine);
	},
	startStop: function() {
		if (rootComponent.engine.timer) {
			Engine.stop(rootComponent.engine);
		} else {
			Engine.start(rootComponent.engine, m.redraw);
		}
	},
	solve: function() {
		while (Engine.step(rootComponent.engine));
	},
	view: function(vnode) {
		var state = vnode.state;
		var engine = state.engine;
		return m("main", [
			m("fieldset", [
				m("select", {
					onchange: m.withAttr("value", state.resize),
					title: "Board Size"
				}, state.resizeOptions()),
				m("span.btn-group", [
					m("button", {
						onclick: state.clearAll,
						title: "Clear all cells."
					}, "Clear All"),
					m("button", {
						onclick: state.clear,
						title: "Clear computed cells, leaving user-defind cells on the board."
					}, "Clear")
				]),
				m("span.btn-group", [
					m("button", {
						onclick: state.step,
						title: "Look for some cells that can be solved and solve them."
					}, "Step"),
					m("button", {
						onclick: state.startStop,
						title: "Repeatedly call Step until there are no more cells that can be solved. A delay is inserted in between calls."
					}, engine.timer ? "Stop" : "Run"),
					m("button", {
						onclick: state.solve,
						title: "Repeatedly call Step until there are no more cells that can be solved."
					}, "Solve")
				])
			]),
			m(boardComponent, {
				engine: engine
			}),
			m("p", m.trust("This is an application for solving puzzles from <a href=\"http://binarypuzzle.com\" target=\"_blank\">http://binarypuzzle.com</a>. To use it:")),
			m("ol", [
				m("li", "Choose the board size using the upper left dropdown."),
				m("li", "Fill in the initial board state by clicking on the board cells."),
				m("li", "Click on the Solve button in the upper right.")
			]),
			m("p", m.trust("This is a pet project created for fun. It is not affiliated with <a href=\"http://binarypuzzle.com\" target=\"_blank\">http://binarypuzzle.com</a>."))
		]);
	}
};

m.mount(document.body, rootComponent);
