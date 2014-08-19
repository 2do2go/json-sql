'use strict';

module.exports = function(dialect) {
	dialect.templates.add('select', [
		'{with}', 'select', '{distinct}',
		'{fields}', 'from', '{table}', '{select}', '{alias}',
		'{join}',
		'{condition}', '{group}', '{sort}', '{limit}', '{offset}'
	]);

	dialect.templates.add('insert', [
		'{with}', 'insert', '{or}', '{top}', 'into', '{table}', '{values}', '{condition}', '{returning}'
	]);

	dialect.templates.add('update', [
		'{with}', 'update', '{or}', '{top}', '{table}', '{modifier}', '{output}', '{condition}',
		'{returning}'
	]);

	dialect.templates.add('remove', [
		'{with}', 'delete', '{top}', 'from', '{table}', '{output}', '{condition}', '{returning}'
	]);

	dialect.templates.add('union', ['{with}', '{selects}']);

	dialect.templates.add('union all', ['{with}', '{selects}']);

	dialect.templates.add('intersect', ['{with}', '{selects}']);

	dialect.templates.add('except', ['{with}', '{selects}']);


	dialect.templates.add('joinItem', [
		'{type}', 'join', '{table}', '{select}', '{alias}', '{on}'
	]);

	dialect.templates.add('values', [
		'{valuesNames}', '{output}', 'values', '{valuesList}'
	]);

	dialect.templates.add('withItem', ['{name}', '{fields}', 'as', '{select}']);
};
