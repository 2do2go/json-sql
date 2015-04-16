'use strict';

var BaseDialect = require('../base');
var	_ = require('underscore');
var	util = require('util');
var	conditionsInit = require('./conditions');

var Dialect = module.exports = function(builder) {
	BaseDialect.call(this, builder);
	conditionsInit(this);
};

util.inherits(Dialect, BaseDialect);

Dialect.prototype.config = _({
	jsonSeparatorRegexp: /->>?/g,
	jsonIdentifierWrap: '\''
}).extend(BaseDialect.prototype.config);

Dialect.prototype._wrapJsonIdentifier = function(name) {
	return this.config.jsonIdentifierWrap + name + this.config.jsonIdentifierWrap;
};

Dialect.prototype._wrapIdentifier = function(name) {
	var self = this;

	// split by json separator
	var nameParts = name.split(this.config.jsonSeparatorRegexp);
	var separators = name.match(this.config.jsonSeparatorRegexp);

	// wrap base identifier
	var identifier = BaseDialect.prototype._wrapIdentifier.call(this, nameParts[0]);

	// wrap all json identifier and join them with separators
	identifier += _(separators).reduce(function(memo, separator, index) {
		return memo + separator + self._wrapJsonIdentifier(nameParts[index + 1]);
	}, '');

	return identifier;
};
