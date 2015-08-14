'use strict';

module.exports = function(dialect) {
	dialect.blocks.add('offset', function(params) {
		var limit = '';

		if (typeof params.limit === 'undefined') {
			limit = dialect.buildBlock('limit', {limit: -1}) + ' ';
		}

		return limit + 'offset ' + dialect.builder._pushValue(params.offset);
	});
};
