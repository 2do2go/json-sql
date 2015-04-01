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
	jsonPathWrap: '\''
}).extend(BaseDialect.prototype.config);

Dialect.prototype._wrapJsonPathPart = function(pathPart) {
	// check maybe it already wrapped
	var wrappedPart;
	if (pathPart.indexOf(this.config.jsonPathWrap) === -1) {
		wrappedPart = this.config.jsonPathWrap + pathPart +
				this.config.jsonPathWrap;
	} else {
		wrappedPart = pathPart;
	}
	return wrappedPart;
};

Dialect.prototype._wrapIdentifier = function(name) {
	// check if this is json field
	var identifier;
	if (this.config.jsonSeparatorRegexp.test(name)) {
		var self =this,
			regExp = this.config.jsonSeparatorRegexp;
		// split and wrap each json path part
		var jsonPathArr = _(name.split(regExp)).map(function(pathPart, ind) {
			return ind ? (self.config.jsonPathWrap + pathPart + self.config.jsonPathWrap) :
					self._wrapIdentifier(pathPart);
		});
		// and concat it back
		var identifier = _(jsonPathArr).reduce(function(memo, pathPart) {
			var pathSeparator = regExp.exec(name);
			return memo + pathPart + (pathSeparator || '');
		}, '');
		// set regexp lastIndex to 0
		regExp.lastIndex = 0;
	} else {
		identifier = BaseDialect.prototype._wrapIdentifier.call(this, name);
	}
	return identifier;
};
