'use strict';

var _ = require('underscore');
var util = require('util');

var exports = module.exports;

exports.Templates = Templates;
exports.QueryTemplates = QueryTemplates;
exports.BlockTemplates = BlockTemplates;

function Templates(templates) {
	templates = templates || {};

	if (_.isObject(templates) && !_.isEmpty(templates)) {
		_(this).extend(templates);
	}
}

function QueryTemplates() {
	Templates.apply(this, arguments);
}

util.inherits(QueryTemplates, Templates);

QueryTemplates.prototype.select = [
	'select', '{distinct}', '{fields}', 'from', '{table}', '{select}', '{alias}',
	'{join}', '{condition}', '{group}', '{sort}', '{limit}', '{offset}'
];

QueryTemplates.prototype.update = [
	'update', '{or}', '{table}', '{modifier}', '{condition}'
];

QueryTemplates.prototype.remove = [
	'delete from', '{table}', '{condition}'
];

QueryTemplates.prototype.insert = [
	'insert', '{or}', 'into', '{table}', '{values}'
];

function BlockTemplates() {
	Templates.apply(this, arguments);
}

util.inherits(BlockTemplates, Templates);

BlockTemplates.prototype.joinItem = [
	'{type}', 'join', '{table}', '{select}', '{alias}', '{on}'
];

BlockTemplates.prototype.values = [
	'(', '{fields}', ')', 'values', '{valuesList}'
];
