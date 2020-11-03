'use strict';

var BaseDialect = require('../base');
var _ = require('underscore');
var util = require('util');
var templatesInit = require('./templates');
var blocksInit = require('./blocks');

var Dialect = module.exports = function(builder) {

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

	// init templates
	templatesInit(this);

	// init blocks
	blocksInit(this);

};

util.inherits(Dialect, BaseDialect);

Dialect.prototype.config = _({}).extend(BaseDialect.prototype.config, {});
