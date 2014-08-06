'use strict';

module.exports = function(dialect) {
	dialect.templates.add('select', [
		'{with}', 'select', '{distinct}',
		'{fields}', 'from', '{table}', '{select}', '{alias}',
		'{join}',
		'{condition}', '{group}', '{sort}', '{limit}', '{offset}'
	]);

	dialect.templates.add('insert', [
		'{with}', 'insert', '{or}', 'into', '{table}', '{values}', '{condition}'
	]);

	dialect.templates.add('update', [
		'{with}', 'update', '{or}', '{table}', '{values}', '{modifier}', '{condition}'
	]);

	dialect.templates.add('remove', [
		'{with}', 'delete from', '{table}', '{condition}'
	]);

	dialect.templates.add('union', ['{with}', '{selects}']);

	dialect.templates.add('union all', ['{with}', '{selects}']);

	dialect.templates.add('intersect', ['{with}', '{selects}']);

	dialect.templates.add('except', ['{with}', '{selects}']);


	dialect.templates.add('joinItem', [
		'{type}', 'join', '{table}', '{select}', '{alias}', '{on}'
	]);

	dialect.templates.add('values', [
		'{valuesNames}', 'values', '{valuesList}'
	]);

	dialect.templates.add('withItem', ['{name}', '{fields}', 'as', '{select}']);
};
