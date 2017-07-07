'use strict';

var	_ = require('underscore');

module.exports = function(dialect) {

    dialect.blocks.add('limit', function(params) {

        if (_.isUndefined(params.offset)) {
			return dialect.buildBlock('offset', { offset: 0, limit: params.limit }) + ' ';
		}

        return '';
	});

	dialect.blocks.add('offset', function(params) {
        let sort = '';
        if (_.isUndefined(params.sort)) {
            sort = dialect.buildBlock('sort', { sort: 1 }) + ' ';
        }

        if (_.isUndefined(params.limit)) {
            return sort+'OFFSET ' + dialect.builder._pushValue(params.offset) + ' ROWS';
        }
		return sort+'OFFSET ' + dialect.builder._pushValue(params.offset) + ' ROWS FETCH NEXT ' + dialect.builder._pushValue(params.limit) + ' ROWS ONLY';
	});
};
