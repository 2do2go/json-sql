'use strict';

var templateChecks = require('../../utils/templateChecks');
var orRegExp = /^(rollback|abort|replace|fail|ignore)$/i;

module.exports = function(dialect) {
	dialect.templates.set('select', {
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

	dialect.templates.set('insert', {
		pattern: '{with} {withRecursive} insert {or} into {table} {values} ' +
			'{condition}',
		validate: function(type, params) {
			templateChecks.onlyOneOfProps(type, params, ['with', 'withRecursive']);
			templateChecks.propType(type, params, 'with', 'object');
			templateChecks.propType(type, params, 'withRecursive', 'object');

			templateChecks.propType(type, params, 'or', 'string');
			templateChecks.propMatch(type, params, 'or', orRegExp);

			templateChecks.requiredProp(type, params, 'table');
			templateChecks.propType(type, params, 'table', 'string');

			templateChecks.requiredProp(type, params, 'values');
			templateChecks.propType(type, params, 'values', ['array', 'object']);

			templateChecks.propType(type, params, 'condition', ['array', 'object']);

		}
	});

	dialect.templates.set('insertValues', {
		pattern: '({fields}) {returning} values {values}',
		validate: function(type, params) {
			templateChecks.requiredProp('values', params, 'fields');
			templateChecks.propType('values', params, 'fields', 'array');
			templateChecks.minPropLength('values', params, 'fields', 1);

			templateChecks.propType(type, params, 'returning', ['array', 'object']);

			templateChecks.requiredProp('values', params, 'values');
			templateChecks.propType('values', params, 'values', 'array');
			templateChecks.minPropLength('values', params, 'values', 1);
		}
	});

	dialect.templates.set('update', {
		pattern: '{with} {withRecursive} update {or} {table} {alias} {modifier} {returning} ' +
		 '{condition} ',
		validate: function(type, params) {
			templateChecks.onlyOneOfProps(type, params, ['with', 'withRecursive']);
			templateChecks.propType(type, params, 'with', 'object');
			templateChecks.propType(type, params, 'withRecursive', 'object');

			templateChecks.propType(type, params, 'or', 'string');
			templateChecks.propMatch(type, params, 'or', orRegExp);

			templateChecks.requiredProp(type, params, 'table');
			templateChecks.propType(type, params, 'table', 'string');

			templateChecks.propType(type, params, 'returning', ['array', 'object']);

			templateChecks.propType(type, params, 'alias', 'string');

			templateChecks.requiredProp(type, params, 'modifier');
			templateChecks.propType(type, params, 'modifier', 'object');

			templateChecks.propType(type, params, 'condition', ['array', 'object']);

		}
	});

	dialect.templates.set('remove', {
		pattern: '{with} {withRecursive} delete from {table} {returning} {alias} {condition} ',
		validate: function(type, params) {
			templateChecks.onlyOneOfProps(type, params, ['with', 'withRecursive']);
			templateChecks.propType(type, params, 'with', 'object');
			templateChecks.propType(type, params, 'withRecursive', 'object');

			templateChecks.requiredProp(type, params, 'table');
			templateChecks.propType(type, params, 'table', 'string');

			templateChecks.propType(type, params, 'returning', ['array', 'object']);

			templateChecks.propType(type, params, 'alias', 'string');

			templateChecks.propType(type, params, 'condition', ['array', 'object']);

		}
	});
};
