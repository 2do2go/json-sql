'use strict';

var _ = require('underscore');

module.exports = function(dialect) {
	var availableSourceProps = ['table', 'query', 'select', 'expression'];
	var availableJoinTypes = ['natural', 'cross', 'inner', 'outer', 'left', 'right', 'full', 'self'];
	var availableWithProps = ['with', 'withRecursive'];
	var orRegExp = /^(rollback|abort|replace|fail|ignore)$/i;

	// private templates

	dialect.templates.add('query', {
		pattern: '{queryBody}',
		validate: function(type, params) {
			checkRequiredProp(type, params, 'queryBody');
			checkObjectProp(type, params, 'queryBody');
		}
	});


	dialect.templates.add('subQuery', {
		pattern: '({queryBody})',
		validate: function(type, params) {
			checkRequiredProp(type, params, 'queryBody');
			checkObjectProp(type, params, 'queryBody');
		}
	});


	dialect.templates.add('queriesCombination', {
		pattern: '{with} {withRecursive} {queries} {sort} {limit} {offset}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, availableWithProps);

			checkRequiredProp(type, params, 'queries');
			checkArrayProp(type, params, 'queries');
			checkMinPropLength(type, params, 'queries', 2);
		}
	});


	dialect.templates.add('insertValues', {
		pattern: '({fields}) values {fieldValues}',
		validate: function(type, params) {
			checkRequiredProp('values', params, 'fields');
			checkArrayProp('values', params, 'fields');
			checkMinPropLength('values', params, 'fields', 1);

			checkRequiredProp('values', params, 'fieldValues');
			checkArrayProp('values', params, 'fieldValues');
			checkMinPropLength('values', params, 'fieldValues', 1);
		}
	});


	dialect.templates.add('joinItem', {
		pattern: '{type} join {table} {query} {select} {expression} {alias} {on}',
		validate: function(type, params) {
			checkStringProp('join', params, 'type');
			checkCustomProp('join', params, 'type', function(value) {
				var splitType = _(value.toLowerCase().split(' ')).compact();
				return !_.difference(splitType, availableJoinTypes).length;
			});

			checkAtLeastOneOfProps('join', params, availableSourceProps);
			checkOnlyOneOfProps('join', params, availableSourceProps);

			checkStringProp('join', params, 'table');
			checkObjectProp('join', params, 'query');
			checkObjectProp('join', params, 'select');
			// checkStringProp('join', params, 'expression');

			checkObjectProp(type, params, 'on');
		}
	});


	dialect.templates.add('withItem', {
		pattern: '{name} {fields} as {query} {select} {expression}',
		validate: function(type, params) {
			checkRequiredProp('with', params, 'name');
			checkStringProp('with', params, 'name');

			checkAtLeastOneOfProps('with', params, ['query', 'select', 'expression']);
			checkOnlyOneOfProps('with', params, ['query', 'select', 'expression']);

			checkObjectProp('with', params, 'query');
			checkObjectProp('with', params, 'select');
			// checkStringProp('with', params, 'expression');
		}
	});


	dialect.templates.add('fromItem', {
		pattern: '{table} {query} {select} {expression} {alias}',
		validate: function(type, params) {
			checkAtLeastOneOfProps('from', params, availableSourceProps);
			checkOnlyOneOfProps('from', params, availableSourceProps);

			checkStringProp('from', params, 'table');
			checkObjectProp('from', params, 'query');
			checkObjectProp('from', params, 'select');
			// checkStringProp('from', params, 'expression');
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
			checkOnlyOneOfProps(type, params, availableWithProps);

			checkAtLeastOneOfProps(type, params, availableSourceProps);
			checkOnlyOneOfProps(type, params, availableSourceProps);

			checkStringProp(type, params, 'table');
			checkObjectProp(type, params, 'query');
			checkObjectProp(type, params, 'select');
			// checkStringProp(type, params, 'expression');

			checkObjectProp(type, params, 'condition');
		}
	});


	dialect.templates.add('insert', {
		pattern: '{with} {withRecursive} insert {or} into {table} {values} {condition} {returning}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, availableWithProps);

			checkStringProp(type, params, 'or');
			checkRegExpProp(type, params, 'or', orRegExp);

			checkRequiredProp(type, params, 'table');
			checkStringProp(type, params, 'table');

			checkRequiredProp(type, params, 'values');
			checkObjectProp(type, params, 'values');

			checkObjectProp(type, params, 'condition');
		}
	});


	dialect.templates.add('update', {
		pattern: '{with} {withRecursive} update {or} {table} {modifier} {condition} {returning}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, availableWithProps);

			checkStringProp(type, params, 'or');
			checkRegExpProp(type, params, 'or', orRegExp);

			checkRequiredProp(type, params, 'table');
			checkStringProp(type, params, 'table');

			checkRequiredProp(type, params, 'modifier');
			checkObjectProp(type, params, 'modifier');

			checkObjectProp(type, params, 'condition');
		}
	});


	dialect.templates.add('remove', {
		pattern: '{with} {withRecursive} delete from {table} {condition} {returning}',
		validate: function(type, params) {
			checkOnlyOneOfProps(type, params, availableWithProps);

			checkRequiredProp(type, params, 'table');
			checkStringProp(type, params, 'table');

			checkObjectProp(type, params, 'condition');
		}
	});


	dialect.templates.add('union', dialect.templates.get('queriesCombination'));


	dialect.templates.add('intersect', dialect.templates.get('queriesCombination'));


	dialect.templates.add('except', dialect.templates.get('queriesCombination'));


	// validation helpers

	function checkRequiredProp(type, params, propName) {
		if (!(propName in params)) {
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

	function checkObjectProp(type, params, propName) {
		if ((propName in params) && !_.isObject(params[propName])) {
			throw new Error('`' + propName + '` property should be an object in `' + type + '` clause');
		}
	}

	function checkArrayProp(type, params, propName) {
		if ((propName in params) && !_.isArray(params[propName])) {
			throw new Error('`' + propName + '` property should be an array in `' + type + '` clause');
		}
	}

	function checkStringProp(type, params, propName) {
		if ((propName in params) && !_.isString(params[propName])) {
			throw new Error('`' + propName + '` property should be a string in `' + type + '` clause');
		}
	}

	function checkMinPropLength(type, params, propName, length) {
		if ((propName in params) && (params[propName].length < length)) {
			throw new Error('`' + propName + '` property should not have length less than ' + length +
				' in `' + type + '` clause');
		}
	}

	function checkRegExpProp(type, params, propName, regExp) {
		if ((propName in params) && !params[propName].match(regExp)) {
			throw new Error('Invalid `' + propName + '` property value "' + params[propName] + '" in `' +
				type + '` clause');
		}
	}

	function checkCustomProp(type, params, propName, fn) {
		if ((propName in params) && !fn(params[propName])) {
			throw new Error('Invalid `' + propName + '` property value "' + params[propName] + '" in `' +
				type + '` clause');
		}
	}
};
