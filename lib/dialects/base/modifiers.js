'use strict';

var _ = require('underscore');

module.exports = function(dialect) {
	dialect.modifiers.add('$set', function(values) {
		var self = this;

		return _(values).map(function(value, field) {
			var placeholder = self.buildBlock('value', {value: value});

			return [field, '=', placeholder].join(' ');
		}).join(', ');
	});

	dialect.modifiers.add('$inc', function(values) {
		var self = this;

		return _(values).map(function(value, field) {
			var placeholder = self.buildBlock('value', {value: value});

			return [field, '=', field, '+', placeholder].join(' ');
		}).join(', ');
	});

	dialect.modifiers.add('$dec', function(values) {
		var self = this;

		return _(values).map(function(value, field) {
			var placeholder = self.buildBlock('value', {value: value});

			return [field, '=', field, '-', placeholder].join(' ');
		}).join(', ');
	});
};
