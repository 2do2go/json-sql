'use strict';

var _ = require('underscore');

module.exports = function(dialect) {
	var availableJoinTypes = ['natural', 'cross', 'inner', 'outer', 'left', 'right', 'full', 'self'];
	var orRegExp = /^(rollback|abort|replace|fail|ignore)$/i;

	// private templates

	dialect.templates.add('query', {
		pattern: '{queryBody}',
		validate: function(type, params) {
			checkRequiredProp(type, params, 'queryBody');
			checkPropType(type, params, 'queryBody', 'object');
		}
	});


	dialect.templates.add('subQuery', {
		pattern: '({queryBody})',
		validate: function(type, params) {
			checkRequiredProp(type, params, 'queryBody');
			checkPropType(type, params, 'queryBody', 'object');
		}
	});


	dialect.templates.add('queriesCombination', {
		pattern: '{with} {withRecursive} {queries} {sort} {limit} {offset}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, ['with', 'withRecursive']);
			checkPropType(type, params, 'with', 'object');
			checkPropType(type, params, 'withRecursive', 'object');

			checkRequiredProp(type, params, 'queries');
			checkPropType(type, params, 'queries', 'array');
			checkMinPropLength(type, params, 'queries', 2);

			checkPropType(type, params, 'sort', ['string', 'array', 'object']);

			checkPropType(type, params, 'limit', ['number', 'string']);

			checkPropType(type, params, 'offset', ['number', 'string']);
		}
	});


	dialect.templates.add('insertValues', {
		pattern: '({fields}) values {fieldValues}',
		validate: function(type, params) {
			checkRequiredProp('values', params, 'fields');
			checkPropType('values', params, 'fields', 'array');
			checkMinPropLength('values', params, 'fields', 1);

			checkRequiredProp('values', params, 'fieldValues');
			checkPropType('values', params, 'fieldValues', 'array');
			checkMinPropLength('values', params, 'fieldValues', 1);
		}
	});


	dialect.templates.add('joinItem', {
		pattern: '{type} join {table} {query} {select} {expression} {alias} {on}',
		validate: function(type, params) {
			checkPropType('join', params, 'type', 'string');
			checkCustomProp('join', params, 'type', function(value) {
				var splitType = _(value.toLowerCase().split(' ')).compact();
				return !_.difference(splitType, availableJoinTypes).length;
			});

			checkAtLeastOneOfProps('join', params, ['table', 'query', 'select', 'expression']);
			checkOnlyOneOfProps('join', params, ['table', 'query', 'select', 'expression']);

			checkPropType('join', params, 'table', 'string');
			checkPropType('join', params, 'query', 'object');
			checkPropType('join', params, 'select', 'object');
			checkPropType('join', params, 'expression', ['string', 'object']);

			checkPropType('join', params, 'alias', ['string', 'object']);

			checkPropType('join', params, 'on', ['array', 'object']);
		}
	});


	dialect.templates.add('withItem', {
		pattern: '{name} {fields} as {query} {select} {expression}',
		validate: function(type, params) {
			checkRequiredProp('with', params, 'name');
			checkPropType('with', params, 'name', 'string');

			checkPropType(type, params, 'fields', ['array', 'object']);

			checkAtLeastOneOfProps('with', params, ['query', 'select', 'expression']);
			checkOnlyOneOfProps('with', params, ['query', 'select', 'expression']);

			checkPropType('with', params, 'query', 'object');
			checkPropType('with', params, 'select', 'object');
			checkPropType('with', params, 'expression', ['string', 'object']);
		}
	});


	dialect.templates.add('fromItem', {
		pattern: '{table} {query} {select} {expression} {alias}',
		validate: function(type, params) {
			checkAtLeastOneOfProps('from', params, ['table', 'query', 'select', 'expression']);
			checkOnlyOneOfProps('from', params, ['table', 'query', 'select', 'expression']);

			checkPropType('from', params, 'table', 'string');
			checkPropType('from', params, 'query', 'object');
			checkPropType('from', params, 'select', 'object');
			checkPropType('from', params, 'expression', ['string', 'object']);

			checkPropType('from', params, 'alias', ['string', 'object']);
		}
	});


	// public templates

	dialect.templates.add('select', {
		pattern: '{with} {withRecursive} select {distinct} {fields} ' +
			'from {from} {table} {query} {select} {expression} {alias} ' +
			'{join} {condition} {group} {sort} {limit} {offset}',
		defaults: {
			fields: {}
		},
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, ['with', 'withRecursive']);
			checkPropType(type, params, 'with', 'object');
			checkPropType(type, params, 'withRecursive', 'object');

			checkPropType(type, params, 'distinct', 'boolean');

			checkPropType(type, params, 'fields', ['array', 'object']);

			checkPropType(type, params, 'from', ['string', 'array', 'object']);

			checkAtLeastOneOfProps(type, params, ['table', 'query', 'select', 'expression']);
			checkOnlyOneOfProps(type, params, ['table', 'query', 'select', 'expression']);

			checkPropType(type, params, 'table', 'string');
			checkPropType(type, params, 'query', 'object');
			checkPropType(type, params, 'select', 'object');
			checkPropType(type, params, 'expression', ['string', 'object']);

			checkPropType(type, params, 'alias', ['string', 'object']);

			checkPropType(type, params, 'join', ['array', 'object']);

			checkPropType(type, params, 'condition', ['array', 'object']);

			checkPropType(type, params, 'group', ['string', 'array']);

			checkPropType(type, params, 'sort', ['string', 'array', 'object']);

			checkPropType(type, params, 'limit', ['number', 'string']);

			checkPropType(type, params, 'offset', ['number', 'string']);
		}
	});


	dialect.templates.add('insert', {
		pattern: '{with} {withRecursive} insert {or} into {table} {values} {condition} {returning}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, ['with', 'withRecursive']);
			checkPropType(type, params, 'with', 'object');
			checkPropType(type, params, 'withRecursive', 'object');

			checkPropType(type, params, 'or', 'string');
			checkPropMatch(type, params, 'or', orRegExp);

			checkRequiredProp(type, params, 'table');
			checkPropType(type, params, 'table', 'string');

			checkRequiredProp(type, params, 'values');
			checkPropType(type, params, 'values', ['array', 'object']);

			checkPropType(type, params, 'condition', ['array', 'object']);

			checkPropType(type, params, 'returning', ['array', 'object']);
		}
	});


	dialect.templates.add('update', {
		pattern: '{with} {withRecursive} update {or} {table} {modifier} {condition} {returning}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, ['with', 'withRecursive']);
			checkPropType(type, params, 'with', 'object');
			checkPropType(type, params, 'withRecursive', 'object');

			checkPropType(type, params, 'or', 'string');
			checkPropMatch(type, params, 'or', orRegExp);

			checkRequiredProp(type, params, 'table');
			checkPropType(type, params, 'table', 'string');

			checkRequiredProp(type, params, 'modifier');
			checkPropType(type, params, 'modifier', 'object');

			checkPropType(type, params, 'condition', ['array', 'object']);

			checkPropType(type, params, 'returning', ['array', 'object']);
		}
	});


	dialect.templates.add('remove', {
		pattern: '{with} {withRecursive} delete from {table} {condition} {returning}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, ['with', 'withRecursive']);
			checkPropType(type, params, 'with', 'object');
			checkPropType(type, params, 'withRecursive', 'object');

			checkRequiredProp(type, params, 'table');
			checkPropType(type, params, 'table', 'string');

			checkPropType(type, params, 'condition', ['array', 'object']);

			checkPropType(type, params, 'returning', ['array', 'object']);
		}
	});


	dialect.templates.add('union', dialect.templates.get('queriesCombination'));


	dialect.templates.add('intersect', dialect.templates.get('queriesCombination'));


	dialect.templates.add('except', dialect.templates.get('queriesCombination'));


	// validation helpers

	function checkRequiredProp(type, params, propName) {
		if (_.isUndefined(params[propName])) {
			throw new Error('`' + propName + '` property is not set in `' + type + '` clause');
		}
	}

	function checkAtLeastOneOfProps(type, params, expectedPropNames) {
		var propNames = _(params).chain().keys().intersection(expectedPropNames).value();

		if (!propNames.length) {
			throw new Error('Neither `' + expectedPropNames.join('`, `') +
				'` properties are not set in `' + type + '` clause');
		}
	}

	function checkOnlyOneOfProps(type, params, expectedPropNames) {
		var propNames = _(params).chain().keys().intersection(expectedPropNames).value();

		if (propNames.length > 1) {
			throw new Error('Wrong using `' + propNames.join('`, `') + '` properties together in `' +
				type + '` clause');
		}
	}

	function checkPropType(type, params, propName, expectedTypes) {
		if (_.isUndefined(params[propName])) return;

		var propValue = params[propName];

		if (!_.isArray(expectedTypes)) expectedTypes = [expectedTypes];

		var hasSomeType = _(expectedTypes).some(function(expectedType) {
			return _['is' + expectedType.charAt(0).toUpperCase() + expectedType.slice(1)](propValue);
		});

		if (!hasSomeType) {
			throw new Error('`' + propName + '` property should have ' +
				(expectedTypes.length > 1 ? 'one of expected types:' : 'type') +
				' "' + expectedTypes.join('", "') + '" in `' + type + '` clause');
		}
	}

	function checkMinPropLength(type, params, propName, length) {
		if (_.isUndefined(params[propName])) return;

		if (params[propName].length < length) {
			throw new Error('`' + propName + '` property should not have length less than ' + length +
				' in `' + type + '` clause');
		}
	}

	function checkPropMatch(type, params, propName, regExp) {
		if (_.isUndefined(params[propName])) return;

		if (!params[propName].match(regExp)) {
			throw new Error('Invalid `' + propName + '` property value "' + params[propName] + '" in `' +
				type + '` clause');
		}
	}

	function checkCustomProp(type, params, propName, fn) {
		if (_.isUndefined(params[propName])) return;

		if (!fn(params[propName])) {
			throw new Error('Invalid `' + propName + '` property value "' + params[propName] + '" in `' +
				type + '` clause');
		}
	}
};
