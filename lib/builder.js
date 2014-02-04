'use strict';

var _ = require('underscore');
var util = require('util');

var Blocks = require('./blocks');
var Templates = require('./templates');
var Conditions = require('./conditions');
var Modifiers = require('./modifiers');

var exports = module.exports = Builder;
exports.BuilderError = BuilderError;

function BuilderError(message) {
	Error.captureStackTrace(this, this);
	this.name = 'BuilderError';
	this.message = (message || '');
}
util.inherits(BuilderError, Error);

function Builder(params) {
	params = params || {};

	this.reset();

	// blocks init
	this._blocks = new Blocks(params.blocks || {});

	// templates init
	params.templates = params.templates || {};

	this._templates = {};

	this._templates.query =
		new Templates.QueryTemplates(params.templates.query || {});

	this._templates.block =
		new Templates.BlockTemplates(params.templates.block || {});

	// conditions init

	params.conditions = params.conditions || {};

	this._conditions = {};

	this._conditions.compare =
		new Conditions.CompareConditions(params.conditions.compare || {});

	this._conditions.contain =
		new Conditions.ContainConditions(params.conditions.contain || {});

	this._conditions.combine =
		new Conditions.CombineConditions(params.conditions.combine || {});

	// modifiers init
	this._modifiers = new Modifiers(params.modifiers || {});
}

Builder.prototype.BuilderError = BuilderError;

// Builder methods
Builder.prototype.reset = function() {
	this._placeholderId = 0;
	this._query = '';
	this._values = {};
};

Builder.prototype.getPlaceholderId = function() {
	return this._placeholderId++;
};

Builder.prototype.pushValue = function(value) {
	var placeholder = this.makeBlock('placeholder');

	this._values[placeholder] = value;

	return placeholder;
}

Builder.prototype.makeBlock = function(block, params) {
	var blockMethod = this._blocks[block];

	if (!blockMethod) {
		throw new BuilderError('Method for block type "' + block +
			'" is undefined');
	}

	return blockMethod.call(this, params);
};

Builder.prototype.buildTemplate = function(template, params) {
	var self = this;

	return _(template).chain().map(function(block) {
		var blockMatch = block.match(/^\{(\w+)\}$/i);

		if (blockMatch) {
			// if template block match block pattern - process it
			block = blockMatch[1];

			if (typeof params[block] !== 'undefined') {
				return self.makeBlock(block, params);
			}

			// if no data in params for block - return null
			return null;
		} else {
			// if template block is simple string - return it
			return block;
		}
	}).compact().value().join(' ');
};

Builder.prototype.prepareParams = function(params) {
	params = _(params || {}).clone();

	if (!params.table && !params.select) {
		throw new BuilderError('Table name or subselect is not set ' +
			'in query properties');
	}

	if (params.table && params.select) {
		throw new this.BuilderError('Wrong using table name and subselect together ' +
			'in query properties');
	}

	params.type = params.type || 'select';

	if (params.type === 'select') {
		if (!params.fields) {
			params.fields = {};
		}
	} else if (params.type === 'update') {
		if (!params.modifier) {
			throw new BuilderError('Modifier is empty in query properties');
		}
	} else if (params.type === 'insert') {
		if (!params.values) {
			throw new BuilderError('Values is empty in query properties');
		}
	}

	return params;
};

Builder.prototype.build = function(params) {
	params = this.prepareParams(params);

	var template = this._templates.query[params.type];

	if (!template) {
		throw new BuilderError('Unknown type "' + params.type + '" in query properties');
	}

	this.reset();

	this._query = this.buildTemplate(template, params) + ';';

	return {
		query: this._query,
		values: this._values
	};
};

Builder.prototype.getQuery = function() {
	return this._query;
};

Builder.prototype.getValues = function() {
	return this._values;
};
