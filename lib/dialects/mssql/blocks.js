'use strict';

var _ = require('underscore');

module.exports = function(dialect) {
	dialect.blocks.set('limit', function(params) {
		return (!isNaN(params.offset)) ? '' : 'top(' + dialect.builder._pushValue(params.limit) + ')';
	});

	dialect.blocks.set('offset', function(params) {
		var pre = (!params.sort) ? 'order by 1 ' : '';
		if (params.limit) {
			var str = pre + 'offset ' + dialect.builder._pushValue(params.offset);
			str += ' rows fetch next ' + dialect.builder._pushValue(params.limit) + ' rows only';
			return str;
		}else {
			return pre + 'OFFSET ' + dialect.builder._pushValue(params.offset) + ' rows';
		}
	});

	dialect.blocks.set('returning', function(params) {
		var result = dialect.buildBlock('fields', {fields: params.returning});

		if (result) result = 'output ' + result;

		return result;
	});

	dialect.blocks.set('insert:values', function(params) {
		var values = params.values;

		if (!_.isArray(values)) values = [values];

		var fields = params.fields || _(values)
		 .chain()
		 .map(function(row) {
			return _(row).keys();
		})
		 .flatten()
		 .uniq()
		 .value();

		return dialect.buildTemplate('insertValues', {
			fields: fields,
			returning: params.returning || undefined,
			values: _(values).map(function(row) {
				return _(fields).map(function(field) {
					return dialect.buildBlock('value', {value: row[field]});
				});
			})
		});
	});

	dialect.blocks.add('insertValues:values', function(params) {
		return _(params.values).map(function(row) {
			return '(' + row.join(', ') + ')';
		}).join(', ');
	});
};
