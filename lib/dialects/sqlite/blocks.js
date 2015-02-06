'use strict';

module.exports = function(dialect) {
	dialect.blocks.add('offset', function(params) {
		var limit = '';

		if (typeof params.limit === 'undefined') {
			limit = this.buildBlock('limit', {limit: -1}) + ' ';
		}

		return limit + 'offset ' + this._pushValue(params.offset);
	});
};
