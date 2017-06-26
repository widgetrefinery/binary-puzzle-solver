var config = require("./config.js");

var unknown = config.cell.unknown;
var zero = config.cell.zero;
var one = config.cell.one;

/**
 * {@link #computePermutations} caches any computed permutations here. The cache key is the row size
 * while the cache value is the list of permutations.
 *
 * @var {Object<number,string[]>}
 */
var permutationCache = {};

/**
 * Compute the permutations for a row with a certain size.
 *
 * @param {!number} size - row size; assumed to be a positive, even number
 * @return {string[]} list of permutations
 */
function computePermutations(size) {
	if (!permutationCache[size]) {
		var permutations = [];
		permutationCache[size] = permutations;
		// create initial permutation with left-half as ones and right-half as zeros
		var permutation = new Array(size);
		var halfSize = size / 2;
		for (var offset = 0; offset < halfSize; offset++) {
			permutation[offset] = one;
			permutation[halfSize + offset] = zero;
		}
		// save initial permutation if valid
		if (isValidPermutation(permutation)) {
			permutations.push(permutation.join(""));
		}
		// generate other permutations by shuffling the values around
		while (true) {
			// seek to the first offset that contains a one
			var firstOne = 0;
			while (zero === permutation[firstOne]) {
				firstOne++;
			}
			if (firstOne >= halfSize) {
				break;
			}
			// seek to the next zero
			var nextZero = firstOne + 1;
			while (one === permutation[nextZero]) {
				nextZero++;
			}
			// swap the one and zero on the right edge of the group
			permutation[nextZero - 1] = zero;
			permutation[nextZero] = one;
			// move the remaining ones back to the left edge of the row
			for (var offset = firstOne; offset < nextZero - 1; offset++) {
				permutation[offset] = zero;
				permutation[offset - firstOne] = one;
			}
			// save the permutation if valid
			if (isValidPermutation(permutation)) {
				permutations.push(permutation.join(""));
			}
		}
	}
	// return a copy of the permutations
	return permutationCache[size].slice();
}

/**
 * Test if the permutation is valid. A permutation is valid if it contains no more than 2 ones or
 * zeros grouped together.
 *
 * An example of a valid permutation: "011010"
 *
 * An example of an invalid permutation: "011100"
 *
 * @param {!string} permutation - permutation to test; assumed to contain an even number of ones and zeros
 * @return {!boolean} true if the permutation is valid
 */
function isValidPermutation(permutation) {
	var value = permutation[0];
	var count = 1;
	for (var offset = 1; offset < permutation.length; offset++) {
		if (value === permutation[offset]) {
			count++;
			if (2 < count) {
				return false;
			}
		} else {
			value = permutation[offset];
			count = 1;
		}
	}
	return true;
}

/**
 * Create an object to hold the state for a row (or column). It keeps track of the list of valid
 * permutations for the row.
 *
 * @param {!number} size - row size; assumed to be a positive, even number
 * @return {!object} row state
 */
function createRow(size) {
	return {
		perms: computePermutations(size),
		queued: false
	};
}

/**
 * Get the value at a particular offset if it is defined. The value is defined when the permutations
 * agree to the same value for the offset.
 *
 * @param {!object} row - row state
 * @param {!number} offset - offset into the row
 * @return {!string} zero, one, or unknown
 */
function getValue(row, offset) {
	var value = row.perms[0][offset];
	for (var i = 1; i < row.perms.length; i++) {
		if (value !== row.perms[i][offset]) {
			return unknown;
		}
	}
	return value;
}

/**
 * Set the value at a particular offset. This will remove any permutations that do not agree with
 * the value.
 *
 * @param {!object} row - row state
 * @param {!number} offset - offset into the row
 * @param {!string} value - value at the offset
 * @return {!boolean} true if the row state was modified
 */
function setValue(row, offset, value) {
	var modified = false;
	for (var i = row.perms.length - 1; 0 <= i; i--) {
		if (row.perms[i][offset] !== value) {
			row.perms.splice(i, 1);
			modified = true;
		}
	}
	return modified;
}

/**
 * Remove a permutation from the row.
 *
 * @param {!object} row - row state
 * @param {!string} permutation - permutation to remove
 * @return {!boolean} true if the row state was modified
 */
function removePermutation(row, permutation) {
	var modified = false;
	for (var i = row.perms.length - 1; 0 <= i; i--) {
		if (row.perms[i] === permutation) {
			row.perms.splice(i, 1);
			modified = true;
			break;
		}
	}
	return modified;
}

module.exports = {
	create: createRow,
	get: getValue,
	set: setValue,
	remove: removePermutation,
	// these are only exposed for unit tests
	_compute: computePermutations,
	_isValid: isValidPermutation
};
