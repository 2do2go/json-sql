'use strict';

var jsonSql = require('../lib');
var Builder = jsonSql.Builder;
var expect = require('expect.js');

describe('Builder', function() {
	it('should have fields', function() {
		expect(jsonSql).to.be.ok();
		expect(jsonSql).to.be.a(Builder);

		expect(jsonSql.dialect).to.be.ok();

		expect(jsonSql.dialect.blocks).to.be.ok();
		expect(jsonSql.dialect.templates).to.be.ok();
		expect(jsonSql.dialect.conditions).to.be.ok();
		expect(jsonSql.dialect.modifiers).to.be.ok();
		expect(jsonSql.dialect.logicalOperators).to.be.ok();
	});

	it('should throw error with wrong `type`', function() {
		expect(function() {
			jsonSql.build({
				type: 'wrong',
				table: 'users'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Unknown template "wrong".');
		});
	});

	it('should throw error without `table`', function() {
		expect(function() {
			jsonSql.build({});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Table name or subselect is not set in query ' +
				'properties.');
		});
	});

	it('should throw error with both `table` and `select`', function() {
		expect(function() {
			jsonSql.build({
				table: 'users',
				select: {table: 'payments'}
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Wrong using table name and subselect together ' +
				'in query properties.');
		});
	});

	it('should throw error without name in `with` clause', function() {
		expect(function() {
			jsonSql.build({
				'with': [{
					select: {
						table: 'payments'
					}
				}],
				table: 'users'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Name is not set in with clause.');
		});
	});

	it('should throw error without select in `with` clause', function() {
		expect(function() {
			jsonSql.build({
				'with': [{
					name: 'payments'
				}],
				table: 'users'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Select query is not set in with clause.');
		});
	});

	it('should be ok with array `with`', function() {
		var result = jsonSql.build({
			'with': [{
				name: 'payments',
				select: {
					table: 'payments'
				}
			}],
			table: 'users'
		});

		expect(result.query).to.be('with payments as (select * from payments) select * from users;');
		expect(result.values).to.eql({});
	});

	it('should be ok with object `with`', function() {
		var result = jsonSql.build({
			'with': {
				payments: {
					select: {
						table: 'payments'
					}
				}
			},
			table: 'users'
		});

		expect(result.query).to.be('with payments as (select * from payments) select * from users;');
		expect(result.values).to.eql({});
	});
});
