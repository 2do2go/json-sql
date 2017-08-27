'use strict';

var jsonSql = require('../../lib')({
	dialect: 'mssql',
	namedValues: false
});
var expect = require('chai').expect;

describe('MSSQL dialect', function() {
	describe('limit / offset', function() {
		it('should be ok with `limit` property', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['id', 'name'],
				limit: 1,
				condition: {
					'active': {$eq: '1'}
				}
			});
			expect(result.query).to.be.equal(
				'select top(1) [id], [name] from [users] where [active] = $1;'
			);
		});

		it('should be ok with `limit` and `sort` properties', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['id', 'name'],
				limit: 1,
				sort: {
					'lastLogin': -1
				}
			});
			expect(result.query).to.be.equal(
				'select top(1) [id], [name] from [users] order by [lastLogin] desc;'
			);
		});

		it('should be ok with `offset` property', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['id', 'name'],
				offset: 2,
			});
			expect(result.query).to.be.equal(
				'select [id], [name] from [users] order by 1 offset 2 rows;'
			);
		});
		it('should be ok with `offset` and `sort` properties', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['id', 'name'],
				offset: 2,
				sort: {
					'lastLogin': -1
				}
			});
			expect(result.query).to.be.equal(
				'select [id], [name] from [users] order by [lastLogin] desc offset 2 rows;'
			);
		});

		it('should be ok with `limit` and `offset` properties', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['id', 'name'],
				limit: 4,
				offset: 2
			});
			expect(result.query).to.be.equal(
				'select [id], [name] from [users] order by 1 offset 2 rows fetch next 4 rows only;'
			);
		});

		it('should be ok with `limit` and `offset` and `sort` properties', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['id', 'name'],
				limit: 4,
				offset: 2,
				sort: {
					'lastLogin': -1
				}
			});
			expect(result.query).to.be.equal(
				'select [id], [name] from [users] order by [lastLogin] desc ' +
				'offset 2 rows fetch next 4 rows only;'
			);
		});
	});
	describe('Insert', function() {
		it('should be ok with different `values` property', function() {
			var date = new Date();
			var result = jsonSql.build({
				type: 'insert',
				table: 'users',
				values: {
					id: 1,
					name: 'Max',
					date: date,
					lastLogin: null,
					active: true
				}
			});
			expect(result.query).to.be.equal(
				'insert into [users] ([id], [name], [date], [lastLogin], [active]) ' +
				'values (1, $1, $2, null, 1);'
			);
		});

		it('should be ok with different `values` property with option `separatedValues` = false',
			function() {
				var options = jsonSql.options;
				jsonSql.configure({
					dialect: 'mssql',
					separatedValues: false
				});
				var date = new Date();
				var result = jsonSql.build({
					type: 'insert',
					table: 'users',
					values: {
						id: 1,
						name: 'Max',
						date: date,
						lastLogin: null,
						active: true
					}
				});
				expect(result.query).to.be.equal(
					'insert into [users] ([id], [name], [date], [lastLogin], [active]) ' +
					'values (1, \'Max\', \'' + date.toISOString() + '\', null, 1);'
				);
				jsonSql.configure(options);
			}
		);

		it('should be ok with array `values` property', function() {
			var result = jsonSql.build({
				type: 'insert',
				table: 'users',
				values: [
					{ id: 1, name: 'Max' },
					{ id: 2, name: 'Jane' }
				]
			});
			expect(result.query).to.be.equal('insert into [users] ([id], [name]) values (1, $1), (2, $2);');
		});


		it('should throw error with a null `returning` property', function() {
			expect(function() {
				jsonSql.build({
					type: 'insert',
					table: 'users',
					values: {
						name: 'Max'
					},
					returning: null
				});
			}).to.throw(
				'`returning` property should have one of expected types: "array", "object" ' +
				'in `insertValues` clause'
			);
		});

		it('should be ok with `returning` property', function() {
			var result = jsonSql.build({
				type: 'insert',
				table: 'users',
				values: {
					name: 'Max'
				},
				returning: [
					{table: 'inserted', name: 'id'}
				],
			});
			expect(result.query).to.be.equal(
				'insert into [users] ([name]) output [inserted].[id] values ($1);'
			);
		});

	});

	describe('Update', function() {
		it('should throw error with a null `returning` property', function() {
			expect(function() {
				jsonSql.build({
					type: 'update',
					table: 'users',
					modifier: {
						$dec: {
							age: 3
						}
					},
					returning: null
				});
			}).to.throw(
				'`returning` property should have one of expected types: "array", "object" ' +
				'in `update` clause'
			);
		});

		it('should be ok with `returning` property', function() {
			var result = jsonSql.build({
				type: 'update',
				table: 'users',
				modifier: {
					$dec: {
						age: 3
					}
				},
				returning: ['inserted.*', 'deleted.*']
			});
			expect(result.query).to.be.equal(
				'update [users] set [age] = [age] - 3 output [inserted].*, [deleted].*;'
			);
		});
	});

	describe('Delete', function() {
		it('should throw error with a null `returning` property', function() {
			expect(function() {
				jsonSql.build({
					type: 'remove',
					table: 'users',
					returning: null
				});
			}).to.throw(
				'`returning` property should have one of expected types: "array", "object" ' +
				'in `remove` clause'
			);
		});

		it('should be ok with `returning` property', function() {
			var result = jsonSql.build({
				type: 'remove',
				table: 'users',
				returning: ['deleted.*']
			});
			expect(result.query).to.be.equal('delete from [users] output [deleted].*;');
		});
	});
});
