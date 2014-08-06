'use strict';

var _ = require('underscore');
var ValuesStore = require('../../valuesStore');

var templatesInit = require('./templates');
var blocksInit = require('./blocks');
var conditionsInit = require('./conditions');
var logicalOperatorsInit = require('./logicalOperators');
var modifiersInit = require('./modifiers');

var Dialect = module.exports = function(builder) {
	this.builder = builder;

	this.blocks = new ValuesStore({context: builder});
	this.modifiers = new ValuesStore({context: builder});
	this.conditions = new ValuesStore({context: builder});
	this.logicalOperators = new ValuesStore({context: builder});
	this.templates = new ValuesStore({context: builder});

	templatesInit(this);
	blocksInit(this);
	conditionsInit(this);
	modifiersInit(this);
	logicalOperatorsInit(this);
};

Dialect.prototype.config = {
	placeholderPreffix: '',
	placeholderSuffix: '',
	identifierPreffix: '"',
	identifierSuffix: '"',
	defaultLogicalOperator: '$and',
	defaultModifier: '$set'
};

Dialect.prototype.prepare = function(params) {
	params = _(params || {}).clone();

	var type = params.type = params.type || 'select';

	if (_.contains(['union', 'union all', 'intersect', 'except'], type)) {
		if (!params.selects) {
			throw new Error('Selects list should be set in ' + type + ' query.');
		}
	} else if (_.contains(['select', 'update', 'insert', 'remove'], type)) {
		if (!params.table && !params.select) {
			throw new Error('Table name or subselect is not set in query properties.');
		}

		if (params.table && params.select) {
			throw new Error('Wrong using table name and subselect together in query properties.');
		}

		if (type === 'select') {
			if (!params.fields) {
				params.fields = {};
			}
		} else if (type === 'update') {
			if (!params.modifier) {
				throw new Error('Modifier is empty in query properties.');
			}
		} else if (type === 'insert') {
			if (!params.values) {
				throw new Error('Values is empty in query properties.');
			}
		}
	}

	return params;
};
