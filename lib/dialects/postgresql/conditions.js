'use strict';

var _ = require('underscore');

var buildInCondition = function(builder, field, operator, value) {
	field = builder.dialect._wrapIdentifier(field);

	var placeholder;
	try {
		placeholder = builder.buildBlock('field', value);
	} catch (e) {
		placeholder = builder._pushValue(JSON.stringify(value));
	}

	return [field, operator, placeholder].join(' ');
};

var buildHasCondition = function(builder, field, operator, value) {
	field = builder.dialect._wrapIdentifier(field);

	var placeholder;
	if (_(value).isArray()) {
		placeholder = 'array[' + _(value).map(function(item) {
			return builder._pushValue(item);
		}).join(', ') + ']';
	} else {
		placeholder = builder.buildBlock('field', value);
	}

	return [field, operator, placeholder].join(' ');
};

module.exports = function(dialect) {
	dialect.conditions.add('$jsonContains', function(field, operator, value) {
		return buildInCondition(this, field, '@>', value);
	});

	dialect.conditions.add('$jsonIn', function(field, operator, value) {
		return buildInCondition(this, field, '<@', value);
	});

	dialect.conditions.add('$jsonHas', function(field, operator, value) {
		field = this.dialect._wrapIdentifier(field);

		var placeholder = value;
		if (_(placeholder).isObject()) {
			placeholder = this.buildBlock('field', placeholder);
		} else {
			placeholder = this._pushValue(value.toString());
		}

		return [field, '?', placeholder].join(' ');
	});

	dialect.conditions.add('$jsonHasAny', function(field, operator, value) {
		return buildHasCondition(this, field, '?|', value);
	});

	dialect.conditions.add('$jsonHasAll', function(field, operator, value) {
		return buildHasCondition(this, field, '?&', value);
	});
};
