'use strict';

var _ = require('underscore');

var dialects = {
	base: require('./dialects/base'),
	mssql: require('./dialects/mssql'),
	postgresql: require('./dialects/postgresql'),
	sqlite: require('./dialects/sqlite')
};

var Builder = module.exports = function(params) {
	params = params || {};

	this.setDialect(params.dialect || 'base');

	this.reset();
};

// Builder methods
Builder.prototype.reset = function() {
	this._placeholderId = 0;
	this._query = '';
	this._values = {};
};

Builder.prototype.getPlaceholder = function() {
	return 'p' + (this._placeholderId++);
};

Builder.prototype.wrapPlaceholder = function(name) {
	return this.dialect.config.placeholderPreffix + name +
		this.dialect.config.placeholderSuffix;
};

Builder.prototype.wrapIdentifier = function(name) {
	return this.dialect.config.identifierPreffix + name +
		this.dialect.config.identifierSuffix;
};

Builder.prototype.pushValue = function(value) {
	var valueType = typeof value;

	if (valueType === 'undefined') {
		return 'null';
	} else if (value === null || valueType === 'number' ||
			valueType === 'boolean') {
		return String(value);
	} else if (valueType === 'string') {
		var placeholder = this.getPlaceholder();
		this._values[placeholder] = value;
		return this.wrapPlaceholder(placeholder);
	} else {
		throw new Error('Wrong value type "' + valueType + '".');
	}
};

Builder.prototype.buildBlock = function(block, params) {
	var blockFn = this.dialect.blocks.get(block);

	if (!blockFn) {
		throw new Error('Unknown block "' + block + '".');
	}

	return blockFn(params);
};

Builder.prototype.buildCondition = function(params) {
	var self = this;
	var result = '';

	var condition = params.condition;
	var logicalOperator = params.logicalOperator ||
		this.dialect.config.defaultLogicalOperator;

	if (_.isObject(condition) && !_.isEmpty(condition)) {
		// if condition is array: [{a: 1}, {b: 2}]
		if (_.isArray(condition)) {
			result = _(condition).map(function(item) {
				return self.buildCondition({
					condition: item,
					operator: params.operator
				});
			});

		// if condition is object
		} else {
			result = _(condition).map(function(value, field) {
				// if field name is operator
				if (field[0] === '$') {
					// if field name is logical operator: {$logicalOperator: {a: 1}}
					if (!self.dialect.logicalOperators.has(field)) {
						throw new Error('Unknown logical operator "' + field + '".');
					}

					return self.buildCondition({
						condition: value,
						logicalOperator: field,
						operator: params.operator
					});

				// if condition item is object: {a: {$operator: 4}}
				} else if (_.isObject(value)) {
					var logicalOperatorFn = self.dialect.logicalOperators
						.get(self.dialect.config.defaultLogicalOperator);

					return logicalOperatorFn(_(value).map(function(operatorValue, operator) {
						var operatorFn = self.dialect.conditions.get(operator);
						if (!operatorFn) {
							throw new Error('Unknown operator "' + operator + '".');
						}
						return operatorFn(field, operator, operatorValue);
					}));

				// if condition item type is simple: {a: 1, b: 2}
				} else {
					var operatorFn = self.dialect.conditions.get(params.operator);
					if (!operatorFn) {
						throw new Error('Unknown operator "' + params.operator + '".');
					}
					return operatorFn(field, params.operator, value);
				}
			});
		}

		result = this.dialect.logicalOperators
			.get(logicalOperator)(_(result).compact());
	}

	return result;
};

Builder.prototype.buildTemplate = function(templateName, params) {
	var self = this;

	var template = this.dialect.templates.get(templateName);
	if (!template) {
		throw new Error('Unknown template "' + templateName + '".');
	}

	return _(template).chain().map(function(block) {
		var blockMatch = block.match(/^\{(\w+)\}$/i);

		if (blockMatch) {
			// if template block match block pattern - process it
			block = blockMatch[1];

			if (typeof params[block] !== 'undefined') {
				return self.buildBlock(block, params);
			}

			// if no data in params for block - return null
			return null;
		} else {
			// if template block is simple string - return it
			return block;
		}
	}).compact().value().join(' ');
};

Builder.prototype.build = function(params) {
	var builder = this;

	params = this.dialect.prepare(params);

	this.reset();

	this._query = this.buildTemplate(params.type, params) + ';';

	return {
		query: this._query,
		values: this._values,
		getWrappedValues: function() {
			var values = {};
			_(this.values).each(function(value, name) {
				values[builder.wrapPlaceholder(name)] = value;
			});
			return values;
		},
		toArray: function() {
			return _(this.values).values();
		}
	};
};

Builder.prototype.setDialect = function(name) {
	if (!dialects[name]) {
		throw new Error('Unknown dialect "' + name + '".');
	}

	this.dialect = new (dialects[name])(this);
};
