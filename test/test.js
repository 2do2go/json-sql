'use strict';

var _ = require('underscore');
var queryBuilder = require('../lib');
var Builder = queryBuilder.Builder;
var BuilderError = queryBuilder.BuilderError;
var expect = require('expect.js');

describe('Builder', function() {
	describe('.properties', function() {
		it('should have fields', function() {
			var builder = new Builder();

			expect(builder).to.be.ok();

			expect(builder._query).to.be('');
			expect(builder._placeholderId).to.be(0);
			expect(builder._values).to.eql({});

			expect(builder._blocks).to.be.ok();

			expect(builder._templates).to.be.ok();
			expect(builder._templates.query).to.be.ok();
			expect(builder._templates.block).to.be.ok();

			expect(builder._conditions.compare).to.be.ok();
			expect(builder._conditions.contain).to.be.ok();
			expect(builder._conditions.combine).to.be.ok();

			expect(builder._modifiers).to.be.ok();
		});
	});

	describe('.build()', function() {
		describe('common', function() {
			it('with wrong type param', function() {
				expect(function() {
					queryBuilder({
						type: 'wrong',
						table: 'users'
					});
				}).to.throwError(function(e) {
					expect(e).to.be.a(BuilderError);
					expect(e.message).to.be('Unknown type "wrong" in query properties');
				});
			});

			it('without table param', function() {
				expect(queryBuilder).to.throwError(function(e) {
					expect(e).to.be.a(BuilderError);
					expect(e.message).to.be('Table name is not set in query properties');
				});
			});
		});

		describe('select', function() {
			it('without type param', function() {
				var result = queryBuilder({table: 'users'});

				expect(result.query).to.be('select * from users;');
				expect(result.values).to.eql({});
			});

			it('with type and table param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users'
				});

				expect(result.query).to.be('select * from users;');
				expect(result.values).to.eql({});
			});

			it('with distinct param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					distinct: true
				});

				expect(result.query).to.be('select distinct * from users;');
				expect(result.values).to.eql({});
			});

			it('with mixed array fields param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					fields: [
						'name',
						{field: 'address'},
						{age: 'a'},
						{field: 'score', table: 'users'},
						{field: 'zone', alias: 'zone'},
						{field: 'sex', table: 'users', alias: 'sex'}
					]
				});

				expect(result.query).to.be('select name, address, age as a, users.score, ' +
					'zone as zone, users.sex as sex from users;');
				expect(result.values).to.eql({});
			});

			it('with object fields param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					fields: {
						age: 'a',
						score: {table: 'users'},
						zone: {field: 'zone_1', alias: 'zone'},
						sex: {table: 'users', alias: 'sex'},
						name: {field: 'name_1', table: 'users', alias: 'sex'}
					}
				});

				expect(result.query).to.be('select age as a, users.score, zone_1 as ' +
					'zone, users.sex as sex, users.name_1 as sex from users;');
				expect(result.values).to.eql({});
			});

			it('with alias param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					alias: 'u'
				});

				expect(result.query).to.be('select * from users as u;');
				expect(result.values).to.eql({});
			});

			it('without join table name param', function() {
				expect(function() {
					queryBuilder({
						type: 'select',
						table: 'users',
						joins: [{}]
					});
				}).to.throwError(function(e) {
					expect(e).to.be.a(BuilderError);
					expect(e.message).to.be('Join table name is not set in query properties');
				});
			});

			it('with wrong join type param', function() {
				expect(function() {
					queryBuilder({
						type: 'select',
						table: 'users',
						joins: [{
							type: 'wrong',
							table: 'payments'
						}]
					});
				}).to.throwError(function(e) {
					expect(e).to.be.a(BuilderError);
					expect(e.message).to.be('Invalid join type "wrong"');
				});
			});

			it('with default join type param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					joins: [{
						table: 'payments'
					}]
				});

				expect(result.query).to.be('select * from users join payments;');
				expect(result.values).to.eql({});
			});

			it('with many joins with on param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					joins: [{
						table: 'payments',
						on: {
							name: {$field: 'payments.name'}
						}
					}, {
						type: 'natural',
						table: 'table2',
						alias: 't2',
						on: {
							name: {$field: 't2.name'}
						}
					}, {
						type: 'natural left',
						table: 'table3',
						alias: 't3',
						on: {
							name: {$field: 't3.name'}
						}
					}, {
						type: 'left outer',
						table: 'table4',
						alias: 't4',
						on: {
							name: {$field: 't4.name'}
						}
					}, {
						type: 'inner',
						table: 'table5',
						alias: 't5',
						on: {
							name: {$field: 't5.name'}
						}
					}, {
						type: 'cross',
						table: 'table6',
						alias: 't6',
						on: {
							name: {$field: 't6.name'}
						}
					}]
				});

				expect(result.query).to.be('select * from users ' +
					'join payments on (name = payments.name) ' +
					'natural join table2 as t2 on (name = t2.name) ' +
					'natural left join table3 as t3 on (name = t3.name) ' +
					'left outer join table4 as t4 on (name = t4.name) ' +
					'inner join table5 as t5 on (name = t5.name) ' +
					'cross join table6 as t6 on (name = t6.name);');
				expect(result.values).to.eql({});
			});

			it('with condition param', function() {
				var result = queryBuilder({
					type: 'select',
					table: 'users',
					condition: {
						$or: [{
							name: 'Max',
							age: {$gt: 25}
						}, {
							$and: [{
								test: {$in: [1,2,3]}
							}, {
								sex: {$ne: 'female'}
							}]
						}]
					}
				});

				expect(result.query).to.be('select * from users where ' +
					'(((name = $p0 and age > $p1) or (((test in ($p2, $p3, $p4)) ' +
					'and (sex != $p5)))));');
				expect(result.values).to.eql({
					$p0: 'Max',
					$p1: 25,
					$p2: 1,
					$p3: 2,
					$p4: 3,
					$p5: 'female'
				});
			});

		});

		describe('update', function() {
			it('without modifier param', function() {
				expect(function() {
					queryBuilder({
						type: 'update',
						table: 'users'
					});
				}).to.throwError(function(e) {
					expect(e).to.be.a(BuilderError);
					expect(e.message).to.be('Modifier is empty in query properties');
				});
			});

			it('with default modifier param ($set)', function() {
				var result = queryBuilder({
					type: 'update',
					table: 'users',
					modifier: {
						name: 'Max'
					}
				});

				expect(result.query).to.be('update users set name = $p0;');
				expect(result.values).to.eql({$p0: 'Max'});
			});

			it('with $set modifier param', function() {
				var result = queryBuilder({
					type: 'update',
					table: 'users',
					modifier: {
						$set: {
							name: 'Max'
						}
					}
				});

				expect(result.query).to.be('update users set name = $p0;');
				expect(result.values).to.eql({$p0: 'Max'});
			});

			it('with $inc modifier param', function() {
				var result = queryBuilder({
					type: 'update',
					table: 'users',
					modifier: {
						$inc: {
							age: 1
						}
					}
				});

				expect(result.query).to.be('update users set age = age + $p0;');
				expect(result.values).to.eql({$p0: 1});
			});

			it('with $dec modifier param', function() {
				var result = queryBuilder({
					type: 'update',
					table: 'users',
					modifier: {
						$dec: {
							age: 1
						}
					}
				});

				expect(result.query).to.be('update users set age = age - $p0;');
				expect(result.values).to.eql({$p0: 1});
			});
		});
	});
});
