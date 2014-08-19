'use strict';

var _ = require('underscore');

var dialects = {
	base: require('./dialects/base'),
	mssql: require('./dialects/mssql'),
	postgresql: require('./dialects/postgresql'),
	sqlite: require('./dialects/sqlite')
};

var Builder = module.exports = function(options) {
	this.configure(options);
};

Builder.prototype._reset = function() {
	this._placeholderId = 1;
	this._query = '';
	this._values = this.options.namedValues ? {} : [];
};

Builder.prototype._getPlaceholder = function() {
	return (this.options.namedValues ? 'p' : '') + (this._placeholderId++);
};

Builder.prototype._wrapPlaceholder = function(name) {
	return this.options.valuesPrefix + name;
};

Builder.prototype._wrapIdentifier = function(name) {
	return this.dialect.config.identifierPrefix + name + this.dialect.config.identifierSuffix;
};

Builder.prototype._pushValue = function(value) {
	var valueType = typeof value;

	if (valueType === 'undefined') {
		return 'null';
	} else if (value === null || valueType === 'number' ||
			valueType === 'boolean') {
		return String(value);
	} else if (valueType === 'string') {
		var placeholder = this._getPlaceholder();
		if (this.options.namedValues) {
			this._values[placeholder] = value;
		} else {
			this._values.push(value);
		}
		return this._wrapPlaceholder(placeholder);
	} else {
		throw new Error('Wrong value type "' + valueType + '".');
	}
};

Builder.prototype.configure = function(options) {
	this.options = _(options || {}).defaults({
		namedValues: true,
		valuesPrefix: '$',
		dialect: 'base'
	});

	this.setDialect(this.options.dialect);

	this._reset();
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

	this._reset();

	this._query = this.buildTemplate(params.type, params) + ';';

	return {
		query: this._query,
		values: this._values,
		getPrefixedValues: function() {
			var values = {};
			_(this.toObject()).each(function(value, name) {
				values[builder._wrapPlaceholder(name)] = value;
			});
			return values;
		},
		toArray: function() {
			return _.isArray(this.values) ? this.values : _(this.values).values();
		},
		toObject: function() {
			return _.isArray(this.values) ? _(_.range(1, this.values.length + 1)).object(this.values) :
				this.values;
		}
	};
};

Builder.prototype.setDialect = function(name) {
	if (!dialects[name]) {
		throw new Error('Unknown dialect "' + name + '".');
	}

	this.dialect = new (dialects[name])(this);
};
