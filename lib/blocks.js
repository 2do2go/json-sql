'use strict';

var _ = require('underscore');

var exports = module.exports = Blocks;

var patterns = {
	or: /^(rollback|abort|replace|fail|ignore)$/i,
	joinType: /^(natural *)?(left( +outer)?|inner|cross)?$/i
};

function Blocks(blocks) {
	blocks = blocks || {};

	if (_.isObject(blocks) && !_.isEmpty(blocks)) {
		_(this).extend(blocks);
	}
}

Blocks.prototype.distinct = function() {
	return 'distinct';
};

Blocks.prototype.placeholder = function() {
	return '$p' + this.getPlaceholderId();
};

Blocks.prototype.field = function(params) {
	var field = params.field || params.$field;

	if (!field) {
		throw new this.BuilderError('Field name is not set');
	}

	var table = params.table || params.$table;
	if (table) {
		field = table + '.' + field;
	}

	if (params.alias || params.$alias) {
		field += ' ' + this.makeBlock('alias', params);
	}

	return field;
};

Blocks.prototype.fields = function(params) {
	var self = this;

	var fields = params.fields || {};
	var result = '';

	if (!_.isObject(fields)) {
		throw new this.BuilderError('Invalid fields type "' + typeof fields + '"');
	}

	if (!_.isEmpty(fields)) {
		// If fields look like ['a', {b: 'c'}, {field: '', table: 't', alias: 'r'}]
		if (_.isArray(fields)) {
			result = _(fields).map(function(item) {

				if (_.isObject(item)) {
					// {field: '', table: 't', alias: 'r'}
					if (item.field) {
						return self.makeBlock('field', item);
					// {b: 'c'}
					} else {
						return self.makeBlock('fields', {fields: item});
					}
				// 'a'
				} else if (_.isString(item)) {
					return item;
				}
			});
		// If fields look like {a: 'u', b: {table: 't', alias: 'c'}}
		} else {
			result = _(fields).map(function(item, field) {
				// b: {table: 't', alias: 'c'}
				if (_.isObject(item)) {
					if (!item.field) {
						item.field = field;
					}

					return self.makeBlock('field', item);
				// a: 'u'
				} else if (_.isString(item)) {
					return self.makeBlock('field', {
						field: field,
						alias: item
					});
				}

				return '';
			});
		}

		result = result.join(', ');
	} else {
		result = '*';
	}

	return result;
};

Blocks.prototype.table = function(params) {
	var table = params.table;

	if (!table) {
		throw new this.BuilderError('Table name is not set');
	}

	return table;
};

Blocks.prototype.alias = function(params) {
	var alias = params.alias || params.$alias;

	if (!alias) {
		throw new this.BuilderError('Alias name is not set');
	}

	return 'as ' + alias;
};


// Compare conditions (e.g. $eq, $gt)
Blocks.prototype.compareCondition = function(params) {
	var operator = params.operator;
	var value = params.value;
	var placeholder;

	// if value is object, than make field block from it
	if (_.isObject(value)) {
		placeholder = this.makeBlock('field', value);
	} else {
		if (operator === '$field') {
			// $field - special operator, that not make placeholder for value
			placeholder = value;
		} else {
			// if value is simple - create placeholder for it
			placeholder = this.pushValue(value);
		}
	}

	return [params.field, this._conditions.compare[operator],
		placeholder].join(' ');
};

// Contain conditions ($in/$nin)
Blocks.prototype.containCondition = function(params) {
	var self = this;

	var operator = params.operator;
	var list = params.value;

	if (!_.isArray(list)) {
		throw new this.BuilderError('Invalid "' + operator + '" array type "' +
			typeof list + '"');
	}

	var placeholders = _(list).map(function(item) {
		return self.pushValue(item);
	});

	return [params.field, this._conditions.contain[operator],
		'(' + placeholders.join(', ') + ')'].join(' ');
};

// Complex condition ($or/$and)
Blocks.prototype.complexCondition = function(params) {
	var self = this;

	var result = '';
	var condition = params.condition;
	var combineOperator = params.combineOperator || '$and';
	var compareOperator = params.compareOperator || '$eq';

	if (_.isObject(condition) && !_.isEmpty(condition)) {
		if (_.isArray(condition)) {
			result = _(condition).map(function(item) {
				return self.makeBlock('complexCondition', {
					condition: item,
					compareOperator: compareOperator
				});
			});
		} else {
			result = _(condition).map(function(value, field) {
				// if condition item type is combine
				if (self._conditions.combine[field]) {
					return self.makeBlock('complexCondition', {
						condition: value,
						combineOperator: field,
						compareOperator: compareOperator
					});
				// if condition item is object
				} else if (_.isObject(value)) {
					return _(value).map(function(opValue, operator) {
						var makeBlockParams = {
							field: field,
							operator: operator,
							value: opValue
						};

						// if condition item type is compare
						if (self._conditions.compare[operator]) {
							return self.makeBlock('compareCondition', makeBlockParams);
						// if condition item type is contains
						} else if (self._conditions.contain[operator]) {
							return self.makeBlock('containCondition', makeBlockParams);
						}
					});
				// if condition item type is simple
				} else {
					return self.makeBlock('compareCondition', {
						field: field,
						operator: compareOperator,
						value: value
					});
				}
			});
		}

		result = _(result).chain().flatten(true).compact().value()
			.join(' ' + this._conditions.combine[combineOperator] + ' ');

		if (combineOperator === '$or') {
			result = '(' + result + ')';
		}
	}

	return result;
};

Blocks.prototype.condition = function(params) {
	var condition = params.condition;
	var result = '';

	if (_.isObject(condition)) {
		result = this.makeBlock('complexCondition', {
			condition: condition
		});
	} else if (_.isString(condition)) {
		result = condition;
	}

	if (result) {
		result = 'where ' + result;
	}

	return result;
};

Blocks.prototype.modifier = function(params) {
	var self = this;

	var modifier = params.modifier;
	var result = '';

	// if modifier is object -> call method for each operator
	if (_.isObject(modifier)) {
		result = _(modifier).map(function(values, field) {
			var method = self._modifiers[field];
			var methodParams = values;

			if (!method) {
				method = self._modifiers.$set;
				methodParams = {};
				methodParams[field] = values;
			}

			return method.call(self, methodParams);
		}).join(', ');
	// if modifier is string -> not process it
	} else if (_.isString(modifier)) {
		result = modifier;
	}

	if (result) {
		result = 'set ' + result;
	}

	return result;
};

Blocks.prototype.joinItem = function(params) {
	if (!params.table && !params.select) {
		throw new this.BuilderError('Join table name or subselect is ' +
			'not set in query properties');
	}

	if (params.table && params.select) {
		throw new this.BuilderError('Wrong using join table name and subselect ' +
			'together in query properties');
	}

	return this.buildTemplate(this._templates.block.joinItem, params);
};

Blocks.prototype.join = function(params) {
	var self = this;

	var join = params.join;
	var result = '';

	// if joins is array -> make each join
	if (_.isArray(join)) {
		result = _(join).map(function(joinItem, i) {
			return self.makeBlock('joinItem', joinItem);
		}).join(' ');
	// if joins is object -> set table name from key and make each join
	} else if (_.isObject(join)) {
		result = _(join).map(function(joinItem, table) {
			if (!joinItem.table && !joinItem.select) {
				joinItem.table = table;
			}

			return self.makeBlock('joinItem', joinItem);
		}).join(' ');
	// if joins is string -> not process
	} else if (_.isString(join)) {
		result = join;
	}

	return result;
};

Blocks.prototype.type = function(params) {
	var type = params.type;

	if (!patterns.joinType.test(type)) {
		throw new this.BuilderError('Invalid join type "' + type + '"');
	}

	return type;
};

Blocks.prototype.on = function(params) {
	var on = params.on;
	var result = '';

	// `on` block is use `$field` as default compare operator
	// because it most used case
	if (_.isObject(on)) {
		result = this.makeBlock('complexCondition', {
			condition: on,
			compareOperator: '$field'
		});
	} else if (_.isString(on)) {
		result = on;
	}

	if (result) {
		result = 'on ' + result;
	}

	return result;
};

Blocks.prototype.group  = function(params) {
	var result = '';
	var group = params.group;

	if (_.isArray(group)) {
		result = group.join(', ');
	} else if (_.isString(group)) {
		result = group;
	}

	if (result) {
		result = 'group by ' + result;
	}

	return result;
};

Blocks.prototype.sort = function(params) {
	var result = '';
	var sort = params.sort;

	// if sort is array -> field1, field2, ...
	if (_.isArray(sort)) {
		result = sort.join(', ');
	// if sort is object -> field1 asc, field2 desc, ...
	} else if (_.isObject(sort)) {
		result = _(sort).map(function(direction, field) {
			return field + ' ' + (direction > 0 ? 'asc' : 'desc');
		}).join(', ');
	} else if (_.isString(sort)) {
		result = sort;
	}

	if (result) {
		result = 'order by ' + result;
	}

	return result;
};

Blocks.prototype.limit = function(params) {
	return 'limit ' + this.pushValue(params.limit);
};

Blocks.prototype.offset = function(params) {
	var limit = '';

	// Sqlite is not support offset without limit
	// Set limit value to -1 if limit is not set and offset is set
	if (typeof params.limit === 'undefined') {
		limit = this.makeBlock('limit', {limit: -1}) + ' ';
	}

	return limit + 'offset ' + this.pushValue(params.offset);
};

Blocks.prototype.or = function(params) {
	var or = params.or;

	if (!patterns.or.test(or)) {
		throw new this.BuilderError('Invalid or "' + or + '" in query properties');
	}

	return 'or ' + or;
};

Blocks.prototype.values = function(params) {
	var self = this;

	var valuesList = params.values;

	if (!_.isObject(valuesList)) {
		throw new this.BuilderError('Invalid values in query properties');
	}

	if (!_.isArray(valuesList)) {
		valuesList = [valuesList];
	}

	if (valuesList.length === 0) {
		throw new this.BuilderError('Invalid values array length in query ' +
			'properties');
	}

	var fields = _(valuesList).chain().map(function(values) {
		return _(values).keys();
	}).flatten().uniq().value();

	if (!fields.length) {
		throw new this.BuilderError('Invalid values in query properties');
	}

	valuesList = _(valuesList).map(function(values) {
		return _(fields).map(function(field) {
			if (typeof values[field] === 'undefined' || values[field] === null) {
				return 'null';
			} else {
				return self.pushValue(values[field]);
			}
		});
	});

	return this.buildTemplate(this._templates.block.values, {
		fields: fields,
		valuesList: valuesList
	});
};

Blocks.prototype.valuesList = function(params) {
	return _(params.valuesList).map(function(values) {
		return '(' + values.join(', ') + ')';
	}).join(', ');
};

Blocks.prototype.select = function(params) {
	var select = params.select;

	if (!select.table && !select.select) {
		throw new BuilderError('Table name or subselect is not set ' +
			'in subselect properties');
	}

	if (select.table && select.select) {
		throw new this.BuilderError('Wrong using table name and subselect ' +
			'together in subselect properties');
	}

	return '(' + this.buildTemplate(this._templates.query.select, _({
		fields: {}
	}).extend(select)) + ')';
};
