'use strict';

var jsonSql = require('../lib')();
var Builder = require('../lib').Builder;
var expect = require('expect.js');

describe('Builder', function() {
	it('should have fields', function() {
		expect(jsonSql).to.be.ok();
		expect(jsonSql).to.be.a(Builder);

		expect(jsonSql.dialect).to.be.ok();

		expect(jsonSql._query).to.be('');
		expect(jsonSql._values).to.eql({});

		expect(jsonSql.dialect.blocks).to.be.ok();
		expect(jsonSql.dialect.templates).to.be.ok();
		expect(jsonSql.dialect.conditions).to.be.ok();
		expect(jsonSql.dialect.modifiers).to.be.ok();
		expect(jsonSql.dialect.logicalOperators).to.be.ok();
	});

	it('should throw error with wrong `type` property', function() {
		expect(function() {
			jsonSql.build({
				type: 'wrong'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Unknown template type "wrong"');
		});
	});

	it('should throw error without `table`, `query` and `select` properties', function() {
		expect(function() {
			jsonSql.build({});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Neither `table`, `query`, `select` properties are not set in ' +
				'`select` clause');
		});
	});

	it('should throw error with both `table` and `select` properties', function() {
		expect(function() {
			jsonSql.build({
				table: 'users',
				select: {table: 'payments'}
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Wrong using `table`, `select` properties together in `select` clause');
		});
	});

	it('should throw error with both `table` and `query` properties', function() {
		expect(function() {
			jsonSql.build({
				table: 'users',
				query: {table: 'payments'}
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Wrong using `table`, `query` properties together in `select` clause');
		});
	});

	it('should throw error with both `query` and `select` properties', function() {
		expect(function() {
			jsonSql.build({
				query: {table: 'payments'},
				select: {table: 'payments'}
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Wrong using `query`, `select` properties together in `select` clause');
		});
	});

	it('should throw error without `name` property in `with` clause', function() {
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
			expect(e.message).to.be('`name` property is not set in `with` clause');
		});
	});

	it('should throw error without `query` and `select` properties in `with` clause', function() {
		expect(function() {
			jsonSql.build({
				'with': [{
					name: 'payments'
				}],
				table: 'users'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Neither `query`, `select` properties are not set in `with` clause');
		});
	});

	it('should throw error with both `query` and `select` properties in `with` clause', function() {
		expect(function() {
			jsonSql.build({
				'with': [{
					name: 'payments',
					query: {table: 'table1'},
					select: {table: 'table2'}
				}],
				table: 'users'
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Wrong using `query`, `select` properties together in `with` clause');
		});
	});

	it('should be ok with array in `with` clause', function() {
		var result = jsonSql.build({
			'with': [{
				name: 'payments',
				select: {
					table: 'payments'
				}
			}],
			table: 'users'
		});

		expect(result.query).to.be('with "payments" as (select * from "payments") select * from ' +
			'"users";');
		expect(result.values).to.eql({});
	});

	it('should be ok with object in `with` clause', function() {
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

		expect(result.query).to.be('with "payments" as (select * from "payments") select * from ' +
			'"users";');
		expect(result.values).to.eql({});
	});

	it('should create array values with option `namedValues` = false', function() {
		jsonSql.configure({
			namedValues: false
		});

		expect(jsonSql._values).to.eql([]);

		var result = jsonSql.build({
			table: 'users',
			condition: {name: 'John'}
		});

		expect(result.query).to.be('select * from "users" where "name" = $1;');
		expect(result.values).to.eql(['John']);
	});

	it('should use prefix `@` for values with option `valuesPrefix` = @', function() {
		jsonSql.configure({
			valuesPrefix: '@'
		});

		var result = jsonSql.build({
			table: 'users',
			condition: {name: 'John'}
		});

		expect(result.query).to.be('select * from "users" where "name" = @p1;');
		expect(result.values).to.eql({p1: 'John'});
	});

	it('should return prefixed values with method `prefixValues`', function() {
		var result = jsonSql.build({
			table: 'users',
			condition: {name: 'John'}
		});

		expect(result.query).to.be('select * from "users" where "name" = @p1;');
		expect(result.values).to.eql({p1: 'John'});
		expect(result.prefixValues()).to.eql({'@p1': 'John'});
	});

	it('should return array values with method `getValuesArray`', function() {
		var result = jsonSql.build({
			table: 'users',
			condition: {name: 'John'}
		});

		expect(result.query).to.be('select * from "users" where "name" = @p1;');
		expect(result.values).to.eql({p1: 'John'});
		expect(result.getValuesArray()).to.eql(['John']);
	});

	it('should return object values with method `getValuesObject`', function() {
		jsonSql.configure({
			valuesPrefix: '$',
			namedValues: false
		});

		expect(jsonSql._values).to.eql([]);

		var result = jsonSql.build({
			table: 'users',
			condition: {name: 'John'}
		});

		expect(result.query).to.be('select * from "users" where "name" = $1;');
		expect(result.values).to.eql(['John']);
		expect(result.prefixValues()).to.eql({'$1': 'John'});
		expect(result.getValuesObject()).to.eql({1: 'John'});
	});

	it('should create query without values with option `separatedValues` = false', function() {
		jsonSql.configure({
			separatedValues: false
		});

		expect(jsonSql._values).to.not.be.ok();
		expect(jsonSql._placeholderId).to.not.be.ok();

		var result = jsonSql.build({
			type: 'insert',
			table: 'users',
			values: {name: 'John', surname: 'Doe'}
		});

		expect(result.query).to.be('insert into "users" ("name", "surname") values (\'John\', \'Doe\');');
		expect(result.values).to.not.be.ok();
	});

	it('should create query without wrapping identifiers with option `wrappedIdentifiers` = false',
		function() {
			jsonSql.configure({
				wrappedIdentifiers: false
			});

			var result = jsonSql.build({
				type: 'insert',
				table: 'users',
				values: {name: 'John'}
			});

			expect(result.query).to.be('insert into users (name) values ($p1);');
		}
	);

	it('should throw error if identifier contains more than one dot', function() {
		jsonSql.configure({
			wrappedIdentifiers: true
		});

		expect(function() {
			jsonSql.build({
				type: 'insert',
				table: '"users"',
				values: {
					'users.a.b': 1
				}
			});
		}).to.throwError(function(e) {
			expect(e).to.be.a(Error);
			expect(e.message).to.be('Can\'t wrap identifier with name name "users.a.b"');
		});
	});

	it('shouldn\'t wrap identifiers twice', function() {
		jsonSql.configure({
			wrappedIdentifiers: true
		});

		var result = jsonSql.build({
			type: 'insert',
			table: '"users"',
			values: {
				'"name"': 'John',
				'"users"."age"': 22
			}
		});

		expect(result.query).to.be('insert into "users" ("name", "users"."age") values ($p1, 22);');
	});

	it('should wrap identifiers with dots', function() {
		jsonSql.configure({
			wrappedIdentifiers: true
		});

		var result = jsonSql.build({
			type: 'insert',
			table: '"users"',
			values: {
				'name': 'John',
				'users.age': 22
			}
		});

		expect(result.query).to.be('insert into "users" ("name", "users"."age") values ($p1, 22);');
	});
});
