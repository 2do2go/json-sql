'use strict';

var _ = require('underscore');

var dialectsHash = {
	base: require('./dialects/base'),
	mssql: require('./dialects/mssql'),
	postgresql: require('./dialects/postgresql'),
	sqlite: require('./dialects/sqlite'),
	mysql: require('./dialects/mysql')
};

var Builder = module.exports = function(options) {
	this.configure(options);
};

Builder.prototype._reset = function() {
	if (this.options.separatedValues) {
		this._placeholderId = 1;
		this._values = this.options.namedValues ? {} : [];
	} else {
		delete this._placeholderId;
		delete this._values;
	}

	this._query = '';
};

Builder.prototype._getPlaceholder = function() {
	return (this.options.namedValues ? 'p' : '') + (this._placeholderId++);
};

Builder.prototype._wrapPlaceholder = function(name) {
	return this.options.valuesPrefix + name;
};

Builder.prototype._pushValue = function(value) {
	if (_.isUndefined(value) || _.isNull(value)) {
		return 'null';
	} else if (_.isNumber(value) || _.isBoolean(value)) {
		return String(value);
	} else if (_.isString(value)) {
		if (this.options.separatedValues) {
			var placeholder = this._getPlaceholder();
			if (this.options.namedValues) {
				this._values[placeholder] = value;
			} else {
				this._values.push(value);
			}
			return this._wrapPlaceholder(placeholder);
		} else {
			return '\'' + value + '\'';
		}
	} else {
		throw new Error('Wrong value type "' + (typeof value) + '"');
	}
};

Builder.prototype.configure = function(options) {
	options = options || {};

	this.options = _.defaults({}, options, {
		separatedValues: true,
		namedValues: true,
		valuesPrefix: '$',
		dialect: 'base',
		wrappedIdentifiers: true
	});

	this.setDialect(this.options.dialect);

	this._reset();
};

Builder.prototype.build = function(params) {
	var builder = this;

	this._reset();

	this._query = this.dialect.buildTemplate('query', {queryBody: params}) + ';';

	if (this.options.separatedValues) {
		return {
			query: this._query,
			values: this._values,
			prefixValues: function() {
				var values = {};
				_(this.getValuesObject()).each(function(value, name) {
					values[builder._wrapPlaceholder(name)] = value;
				});
				return values;
			},
			getValuesArray: function() {
				return _.isArray(this.values) ? this.values : _(this.values).values();
			},
			getValuesObject: function() {
				return _.isArray(this.values) ? _(_.range(1, this.values.length + 1)).object(this.values) :
					this.values;
			}
		};
	} else {
		return {query: this._query};
	}
};

Builder.prototype.setDialect = function(name) {
	if (!dialectsHash[name]) {
		throw new Error('Unknown dialect "' + name + '"');
	}

	this.dialect = new (dialectsHash[name])(this);
};
