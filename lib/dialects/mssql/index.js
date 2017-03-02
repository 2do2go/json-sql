'use strict';

var BaseDialect = require('../base');
var _ = require('underscore');
var util = require('util');
var templateChecks = require('../../utils/templateChecks');

var Dialect = module.exports = function(builder) {
	builder.options.valuesPrefix = '@';
	
	builder._pushValue = function(value) {
		if (_.isUndefined(value) || _.isNull(value)) {
			return 'null';
		} else if (_.isBoolean(value)) {
			return String(Number(value));
		} else if (_.isNumber(value)) {
			return String(value);
		} else if (_.isString(value) || _.isDate(value)) {
			if (this.options.separatedValues) {
				var placeholder = this._getPlaceholder();

				if (this.options.namedValues) {
					this._values[placeholder] = value;
				} else {
					this._values.push(value);
				}

				return this._wrapPlaceholder(placeholder);
			} else {
				if (_.isDate(value)) value = value.toISOString();

				return '\'' + value + '\'';
			}
		} else {
			throw new Error('Wrong value type "' + (typeof value) + '"');
		}
	};
	
	BaseDialect.call(this, builder);

	this.blocks.set('limit', function(params) {
		return (!isNaN(params.offset)) ? '' : 'TOP(' + builder._pushValue(params.limit) + ')';
	});

	this.blocks.set('offset', function(params) {
		var pre = (!params.sort) ? 'ORDER BY 1 ' : '';
		if (params.limit) {
			var str = pre + 'OFFSET ' + builder._pushValue(params.offset);
			str += ' ROWS FETCH NEXT ' + builder._pushValue(params.limit) + ' ROWS ONLY';
			return str;
		}else {
			return pre + 'OFFSET ' + builder._pushValue(params.offset) + ' ROWS';
		}
	});

	this.templates.set('select', {
		pattern: '{with} {withRecursive} select {limit} {distinct} {fields} ' +
			'from {from} {table} {query} {select} {expression} {alias} ' +
			'{join} {condition} {group} {having} {sort} {offset}',
		defaults: {
			fields: {}
		},
		validate: function(type, params) {
			templateChecks.onlyOneOfProps(type, params, ['with', 'withRecursive']);
			templateChecks.propType(type, params, 'with', 'object');
			templateChecks.propType(type, params, 'withRecursive', 'object');

			templateChecks.propType(type, params, 'distinct', 'boolean');

			templateChecks.propType(type, params, 'fields', ['array', 'object']);

			templateChecks.propType(type, params, 'from', ['string', 'array', 'object']);

			templateChecks.atLeastOneOfProps(type, params, ['table', 'query', 'select', 'expression']);
			templateChecks.onlyOneOfProps(type, params, ['table', 'query', 'select', 'expression']);

			templateChecks.propType(type, params, 'table', 'string');
			templateChecks.propType(type, params, 'query', 'object');
			templateChecks.propType(type, params, 'select', 'object');
			templateChecks.propType(type, params, 'expression', ['string', 'object']);

			templateChecks.propType(type, params, 'alias', ['string', 'object']);

			templateChecks.propType(type, params, 'join', ['array', 'object']);

			templateChecks.propType(type, params, 'condition', ['array', 'object']);
			templateChecks.propType(type, params, 'having', ['array', 'object']);

			templateChecks.propType(type, params, 'group', ['string', 'array']);

			templateChecks.propType(type, params, 'sort', ['string', 'array', 'object']);

			templateChecks.propType(type, params, 'offset', ['number', 'string']);
			templateChecks.propType(type, params, 'limit', ['number', 'string']);
		}
	});

};

util.inherits(Dialect, BaseDialect);

Dialect.prototype.config = _({}).extend(BaseDialect.prototype.config, {});
