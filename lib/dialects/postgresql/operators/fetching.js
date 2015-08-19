'use strict';

module.exports = function(dialect) {
	dialect.operators.fetching.add('$json', {
		fn: function(value, end) {
			if (end) value = {value: value};
			return dialect.buildBlock('term', {term: value, type: 'value'});
		}
	});
};
