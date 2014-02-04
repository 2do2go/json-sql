'use strict';

var _ = require('underscore');
var util = require('util');

var exports = module.exports;
exports.Conditions = Conditions;
exports.CompareConditions = CompareConditions;
exports.ContainConditions = ContainConditions;
exports.CombineConditions = CombineConditions;

function Conditions(conditions) {
	conditions = conditions || {};

	if (_.isObject(conditions) && !_.isEmpty(conditions)) {
		_(this).extend(conditions);
	}
}

function CompareConditions() {
	Conditions.apply(this, arguments);
}

util.inherits(CompareConditions, Conditions);

CompareConditions.prototype.$eq = '=';

CompareConditions.prototype.$ne = '!=';

CompareConditions.prototype.$gt = '>';

CompareConditions.prototype.$lt = '<';

CompareConditions.prototype.$gte = '>=';

CompareConditions.prototype.$lte = '<=';

CompareConditions.prototype.$is = 'is';

CompareConditions.prototype.$isnot = 'is not';

CompareConditions.prototype.$like = 'like';

CompareConditions.prototype.$glob = 'glob';

CompareConditions.prototype.$field = '=';

function ContainConditions() {
	Conditions.apply(this, arguments);
}

util.inherits(ContainConditions, Conditions);

ContainConditions.prototype.$in = 'in';

ContainConditions.prototype.$nin = 'not in';

function CombineConditions() {
	Conditions.apply(this, arguments);
}

util.inherits(CombineConditions, Conditions);

CombineConditions.prototype.$or = 'or';

CombineConditions.prototype.$and = 'and';
