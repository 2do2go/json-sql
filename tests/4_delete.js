'use strict';

var jsonSql = require('../lib')();
var expect = require('expect.js');

describe('delete', function() {
	it('should be ok without `condition`', function() {
		var result = jsonSql.build({
			type: 'remove',
			table: 'users'
		});

		expect(result.query).to.be('delete from users;');
		expect(result.values).to.eql({});
	});

	it('should be ok with `condition`', function() {
		var result = jsonSql.build({
			type: 'remove',
			table: 'users',
			condition: {
				a: 5
			}
		});

		expect(result.query).to.be('delete from users where a = 5;');
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
			type: 'remove',
			table: 'users'
		});

		expect(result.query).to.be('with t_1 as (select * from t_1) delete from users;');
		expect(result.values).to.eql({});
	});

	it('should be ok with `output`', function() {
		var result = jsonSql.build({
			type: 'remove',
			table: 'users',
			output: ['deleted.*']
		});

		expect(result.query).to.be(
			'delete from users output deleted.*;'
		);
		expect(result.values).to.eql({});
	});
});
