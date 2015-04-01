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

	this.config.wrapIdentifierRegexp = new RegExp(
		'^\\' + this.config.identifierPrefix + '.*\\' +
		this.config.identifierSuffix + '$'
	);
};

Dialect.prototype.config = {
	identifierPrefix: '"',
	identifierSuffix: '"',
	defaultLogicalOperator: '$and',
	defaultModifier: '$set'
};

Dialect.prototype._wrapIdentifier = function(name) {
	if (name !== '*' && this.builder.options.wrappedIdentifiers &&
		!this.config.wrapIdentifierRegexp.test(name)) {
		// try to split name by dot
		var nameParts = name.split('.');

		if (nameParts.length > 2) {
			throw new Error('Can\'t wrap identifier with name name "' + name + '"');
		} else if (nameParts.length === 2) {
			name = this._wrapIdentifier(nameParts[0]) + '.' +
				this._wrapIdentifier(nameParts[1]);
		} else {
			name = this.config.identifierPrefix + name +
				this.config.identifierSuffix;
		}
	}

	return name;
};
