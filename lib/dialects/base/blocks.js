'use strict';

var _ = require('underscore');

var patterns = {
	or: /^(rollback|abort|replace|fail|ignore)$/i,
	joinType: /^(natural *)?(left( +outer)?|inner|cross)?$/i
};

function removeTopBrackets(condition) {
	if (condition.length && condition[0] === '(' &&
		condition[condition.length - 1] === ')') {
		condition = condition.slice(1, condition.length - 1);
	}

	return condition;
}

module.exports = function(dialect) {
	dialect.blocks.add('distinct', function() {
		return 'distinct';
	});

	dialect.blocks.add('field', function(params) {
		var field = params.field || params.$field;

		if (!field) {
			throw new Error('Field name is not set.');
		}

		var table = params.table || params.$table;
		if (table) {
			field = table + '.' + field;
		}

		if (params.alias || params.$alias) {
			field += ' ' + this.buildBlock('alias', params);
		}

		return field;
	});

	dialect.blocks.add('fields', function(params) {
		var self = this;

		var fields = params.fields || {};
		var result = '';

		if (!_.isObject(fields)) {
			throw new Error('Invalid fields type "' + typeof fields + '".');
		}

		if (!_.isEmpty(fields)) {
			// If fields is array: ['a', {b: 'c'}, {field: '', table: 't', alias: 'r'}]
			if (_.isArray(fields)) {
				result = _(fields).map(function(item) {

					if (_.isObject(item)) {
						// if field is field object: {field: '', table: 't', alias: 'r'}
						if (item.field) {
							return self.buildBlock('field', item);

						// if field is non-field object: {b: 'c'}
						} else {
							return self.buildBlock('fields', {fields: item});
						}

					// if field is string: 'a'
					} else if (_.isString(item)) {
						return item;
					}
				});

			// If fields is object: {a: 'u', b: {table: 't', alias: 'c'}}
			} else {
				// use keys as field names
				result = _(fields).map(function(item, field) {
					// b: {table: 't', alias: 'c'}
					if (_.isObject(item)) {
						if (!item.field) {
							item = _.clone(item);
							item.field = field;
						}

						return self.buildBlock('field', item);

					// a: 'u'
					} else if (_.isString(item)) {
						return self.buildBlock('field', {
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
	});

	dialect.blocks.add('table', function(params) {
		var table = params.table;

		if (!table) {
			throw new Error('Table name is not set.');
		}

		return table;
	});

	dialect.blocks.add('name', function(params) {
		var name = params.name;

		if (!name) {
			throw new Error('Name is not set.');
		}

		return name;
	});

	dialect.blocks.add('alias', function(params) {
		var alias = params.alias || params.$alias;

		if (!alias) {
			throw new Error('Alias name is not set.');
		}

		return 'as ' + alias;
	});

	dialect.blocks.add('condition', function(params) {
		var condition = params.condition;
		var result = '';

		if (_.isObject(condition)) {
			result = this.buildCondition({
				condition: condition,
				operator: '$eq'
			});
		} else if (_.isString(condition)) {
			result = condition;
		}

		if (result) {
			result = 'where ' + removeTopBrackets(result);
		}

		return result;
	});

	dialect.blocks.add('modifier', function(params) {
		var self = this;

		var modifier = params.modifier;
		var result = '';

		// if modifier is object -> call method for each operator
		if (_.isObject(modifier)) {
			result = _(modifier).map(function(values, field) {
				var modifierFn = self.dialect.modifiers.get(field);
				var methodParams = values;

				if (!modifierFn) {
					modifierFn = self.dialect.modifiers.get(self.dialect.config.defaultModifier);
					methodParams = {};
					methodParams[field] = values;
				}

				return modifierFn.call(self, methodParams);
			}).join(', ');

		// if modifier is string -> not process it
		} else if (_.isString(modifier)) {
			result = modifier;
		}

		if (result) {
			result = 'set ' + result;
		}

		return result;
	});

	dialect.blocks.add('joinItem', function(params) {
		if (!params.table && !params.select) {
			throw new Error('Table name or subselect is not set in join clause.');
		}

		if (params.table && params.select) {
			throw new Error('Wrong using table name and subselect together in join clause.');
		}

		return this.buildTemplate('joinItem', params);
	});

	dialect.blocks.add('join', function(params) {
		var self = this;

		var join = params.join;
		var result = '';

		// if join is array -> make each joinItem
		if (_.isArray(join)) {
			result = _(join).map(function(joinItem) {
				return self.buildBlock('joinItem', joinItem);
			}).join(' ');

		// if join is object -> set table name from key and make each joinItem
		} else if (_.isObject(join)) {
			result = _(join).map(function(joinItem, table) {
				if (!joinItem.table && !joinItem.select) {
					joinItem = _.clone(joinItem);
					joinItem.table = table;
				}

				return self.buildBlock('joinItem', joinItem);
			}).join(' ');

		// if join is string -> not process
		} else if (_.isString(join)) {
			result = join;
		}

		return result;
	});

	dialect.blocks.add('type', function(params) {
		var type = params.type;

		if (!patterns.joinType.test(type)) {
			throw new Error('Invalid join type "' + type + '".');
		}

		return type;
	});

	dialect.blocks.add('on', function(params) {
		var on = params.on;
		var result = '';

		// `on` block is use `$field` as default compare operator
		// because it most used case
		if (_.isObject(on)) {
			result = this.buildCondition({
				condition: on,
				operator: '$field'
			});
		} else if (_.isString(on)) {
			result = on;
		}

		if (result) {
			result = 'on ' + removeTopBrackets(result);
		}

		return result;
	});

	dialect.blocks.add('group', function(params) {
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
	});

	dialect.blocks.add('sort', function(params) {
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

		// if sort is string -> not process
		} else if (_.isString(sort)) {
			result = sort;
		}

		if (result) {
			result = 'order by ' + result;
		}

		return result;
	});

	dialect.blocks.add('limit', function(params) {
		return 'limit ' + this.pushValue(params.limit);
	});

	dialect.blocks.add('offset', function(params) {
		var limit = '';

		if (typeof params.limit === 'undefined') {
			limit = this.buildBlock('limit', {limit: -1}) + ' ';
		}

		return limit + 'offset ' + this.pushValue(params.offset);
	});

	dialect.blocks.add('or', function(params) {
		var or = params.or;

		if (!patterns.or.test(or)) {
			throw new Error('Invalid or "' + or + '" in query properties.');
		}

		return 'or ' + or;
	});

	dialect.blocks.add('values', function(params) {
		var self = this;

		var valuesList = params.values;

		if (!_.isObject(valuesList)) {
			throw new Error('Invalid values in query properties.');
		}

		if (!_.isArray(valuesList)) {
			valuesList = [valuesList];
		}

		if (valuesList.length === 0) {
			throw new Error('Invalid values array length in query properties.');
		}

		var valuesNames = _(valuesList).chain().map(function(values) {
			return _(values).keys();
		}).flatten().uniq().value();

		if (!valuesNames.length) {
			throw new Error('Invalid values in query properties.');
		}

		valuesList = _(valuesList).map(function(values) {
			return _(valuesNames).map(function(field) {
				return self.pushValue(values[field]);
			});
		});

		return this.buildTemplate('values', {
			valuesNames: valuesNames,
			valuesList: valuesList
		});
	});

	dialect.blocks.add('valuesList', function(params) {
		return _(params.valuesList).map(function(values) {
			return '(' + values.join(', ') + ')';
		}).join(', ');
	});

	dialect.blocks.add('valuesNames', function(params) {
		return '(' + this.buildBlock('fields', {fields: params.valuesNames}) + ')';
	});

	dialect.blocks.add('select', function(params) {
		var select = params.select;

		if (!select.table && !select.select) {
			throw new Error('Table name or subselect is not set in subselect properties.');
		}

		if (select.table && select.select) {
			throw new Error('Wrong using both table name and subselect in subselect properties.');
		}

		return '(' + this.buildTemplate('select', _({
			fields: {}
		}).extend(select)) + ')';
	});

	dialect.blocks.add('selects', function(params) {
		var self = this;
		var selects = params.selects;

		if (!_.isArray(selects)) {
			throw new Error('Selects list should be an array.');
		}

		if (selects.length < 2) {
			throw new Error('Selects list length should not be less than 2.');
		}

		return _(selects).map(function(select) {
			return self.buildBlock('select', {select: select});
		}).join(' ' + params.type + ' ');
	});

	dialect.blocks.add('with', function(params) {
		var self = this;

		var withList = params['with'];
		var result = '';

		// if with clause is array -> make each withItem
		if (_.isArray(withList)) {
			result = _(withList).map(function(withItem) {
				return self.buildBlock('withItem', withItem);
			}).join(', ');

		// if with clause is object -> set name from key and make each withItem
		} else if (_.isObject(withList)) {
			result = _(withList).map(function(withItem, name) {
				if (!withItem.name) {
					withItem = _.clone(withItem);
					withItem.name = name;
				}
				return self.buildBlock('withItem', withItem);
			}).join(', ');

		// if with clause is string -> not process
		} else if (_.isString(withList)) {
			result = withList;
		}

		return 'with ' + result;
	});

	dialect.blocks.add('withItem', function(params) {
		if (!params.name) {
			throw new Error('Name is not set in with clause.');
		}

		if (!params.select) {
			throw new Error('Select query is not set in with clause.');
		}

		return this.buildTemplate('withItem', params);
	});
};
