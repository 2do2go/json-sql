'use strict';

var jsonSql = require('../lib')();
var expect = require('expect.js');

describe('update', function() {
	it('should throw error without `modifier`', function() {
		expect(function() {
			jsonSql.build({
				type: 'update',
				table: 'users'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Modifier is empty in query properties.');
		});
	});

	it('should be ok with default($set) `modifier`', function() {
		var result = jsonSql.build({
			type: 'update',
			table: 'users',
			modifier: {
				name: 'Max',
				age: 16,
				lastVisit: null,
				active: false
			}
		});

		expect(result.query).to.be('update "users" set "name" = $p1, "age" = 16, "lastVisit" = null, ' +
			'"active" = false;');
		expect(result.values).to.eql({p1: 'Max'});
	});

	it('should be ok with $set `modifier`', function() {
		var result = jsonSql.build({
			type: 'update',
			table: 'users',
			modifier: {
				$set: {
					name: 'Max'
				}
			}
		});

		expect(result.query).to.be('update "users" set "name" = $p1;');
		expect(result.values).to.eql({p1: 'Max'});
	});

	it('should be ok with $inc `modifier`', function() {
		var result = jsonSql.build({
			type: 'update',
			table: 'users',
			modifier: {
				$inc: {
					age: 4
				}
			}
		});

		expect(result.query).to.be('update "users" set "age" = "age" + 4;');
		expect(result.values).to.eql({});
	});

	it('should be ok with $dec `modifier`', function() {
		var result = jsonSql.build({
			type: 'update',
			table: 'users',
			modifier: {
				$dec: {
					age: 2
				}
			}
		});

		expect(result.query).to.be('update "users" set "age" = "age" - 2;');
		expect(result.values).to.eql({});
	});

	it('should be ok with `with`', function() {
		var result = jsonSql.build({
			'with': [{
				name: 't_1',
				select: {
					table: 't_1'
				}
			}],
			type: 'update',
			table: 'users',
			modifier: {
				$dec: {
					age: 3
				}
			}
		});

		expect(result.query).to.be('with "t_1" as (select * from "t_1") update "users" set "age" = "age" - 3;');
		expect(result.values).to.eql({});
	});

	it('should be ok with `output`', function() {
		var result = jsonSql.build({
			type: 'update',
			table: 'users',
			modifier: {
				$dec: {
					age: 3
				}
			},
			output: ['inserted.*']
		});

		expect(result.query).to.be(
			'update "users" set "age" = "age" - 3 output "inserted".*;'
		);
		expect(result.values).to.eql({});
	});
});
