'use strict';

var _ = require('underscore');

var exports = module.exports = Modifiers;

function Modifiers(modifiers) {
	modifiers = modifiers || {};

	if (_.isObject(modifiers) && !_.isEmpty(modifiers)) {
		_(this).extend(modifiers);
	}
}

Modifiers.prototype.$set = function(values) {
	var self = this;

 	return _(values).map(function(value, field) {
		var placeholder = self.pushValue(value);

		return [field, '=', placeholder].join(' ');
	}).join(', ');
};

Modifiers.prototype.$inc = function(values) {
	var self = this;

 	return _(values).map(function(value, field) {
		var placeholder = self.pushValue(value);

		return [field, '=', field, '+', placeholder].join(' ');
	}).join(', ');
};

Modifiers.prototype.$dec = function(values) {
	var self = this;

 	return _(values).map(function(value, field) {
		var placeholder = self.pushValue(value);

		return [field, '=', field, '-', placeholder].join(' ');
	}).join(', ');
};
