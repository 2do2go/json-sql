'use strict';

var jsonSql = require('../lib')();
var expect = require('expect.js');

describe('union [all], except, intersect', function() {
	it('should throw error with non-array `selects`', function() {
		expect(function() {
			jsonSql.build({
				type: 'union',
				selects: 'wrong'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Selects list should be an array.');
		});
	});

	it('should throw error with `selects` array length = 1', function() {
		expect(function() {
			jsonSql.build({
				type: 'union',
				selects: [{
					table: 'users'
				}]
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Selects list length should not be less than 2.');
		});
	});

	it('should be ok with `selects` array length = 2', function() {
		var result = jsonSql.build({
			type: 'union',
			selects: [{
				table: 'users'
			}, {
				table: 'vipUsers'
			}]
		});

		expect(result.query).to.be('(select * from users) union (select * from vipUsers);');
		expect(result.values).to.eql({});
	});

	it('should be ok with `type` = "union all"', function() {
		var result = jsonSql.build({
			type: 'union all',
			selects: [{
				table: 'users'
			}, {
				table: 'vipUsers'
			}]
		});

		expect(result.query).to.be('(select * from users) union all (select * from vipUsers);');
		expect(result.values).to.eql({});
	});

	it('should be ok with `type` = "union all"', function() {
		var result = jsonSql.build({
			type: 'union all',
			selects: [{
				table: 'users'
			}, {
				table: 'vipUsers'
			}]
		});

		expect(result.query).to.be('(select * from users) union all (select * from vipUsers);');
		expect(result.values).to.eql({});
	});

	it('should be ok with `type` = "except"', function() {
		var result = jsonSql.build({
			type: 'except',
			selects: [{
				table: 'users'
			}, {
				table: 'vipUsers'
			}]
		});

		expect(result.query).to.be('(select * from users) except (select * from vipUsers);');
		expect(result.values).to.eql({});
	});

	it('should be ok with `type` = "intersect"', function() {
		var result = jsonSql.build({
			type: 'intersect',
			selects: [{
				table: 'users'
			}, {
				table: 'vipUsers'
			}]
		});

		expect(result.query).to.be('(select * from users) intersect (select * from vipUsers);');
		expect(result.values).to.eql({});
	});
});
