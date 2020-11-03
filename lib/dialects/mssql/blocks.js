'use strict';

var _ = require('underscore');

module.exports = function(dialect) {
	var parentValueBlock = dialect.blocks.get('value');

	dialect.blocks.set('value', function(params) {
		var value = params.value;

		var result;
		if (_.isBoolean(value)) {
			result = String(Number(value));
		} else {
			result = parentValueBlock(params);
		}

		return result;
	});

	dialect.blocks.set('limit', function(params) {
		var result = '';
		if (_.isUndefined(params.offset)) {
			result = 'top(' + dialect.builder._pushValue(params.limit) + ')';
		}
		return result;
	});

	dialect.blocks.set('offset', function(params) {
		var prefix = (!params.sort) ? 'order by 1 ' : '';
		var offset = 'offset ' + dialect.builder._pushValue(params.offset) + ' ';
		var limit = '';
		var suffix = 'rows';

		if (params.limit) {
			limit = 'rows fetch next ' + dialect.builder._pushValue(params.limit) + ' ';
			suffix = 'rows only';
		}

		return prefix + offset + limit + suffix;
	});

	dialect.blocks.set('returning', function(params) {
		var result = dialect.buildBlock('fields', {fields: params.returning});

		if (result) result = 'output ' + result;

		return result;
	});

	dialect.blocks.set('insert:values', function(params) {
		var values = params.values;
		var fields = params.fields;
		var returning = params.returning;

		if (!_.isArray(values)) values = [values];

		fields = fields || _(values)
			.chain()
			.map(function(row) {
				return _(row).keys();
			})
			.flatten()
			.uniq()
			.value();

		values = _(values).map(function(row) {
			return _(fields).map(function(field) {
				return dialect.buildBlock('value', {value: row[field]});
			});
		});

		return dialect.buildTemplate('insertValues', {
			values: values,
			fields: fields,
			returning: returning
		});
	});
};
