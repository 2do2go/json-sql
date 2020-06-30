'use strict';

var jsonSql = require('../lib')();
var expect = require('chai').expect;

describe('Select', function() {
	describe('type', function() {
		it('should be ok without `type` property', function() {
			var result = jsonSql.build({
				table: 'users'
			});

			expect(result.query).to.be.equal('select * from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with "select" value', function() {
			var result = jsonSql.build({
				type: 'select',
				table: 'users'
			});

			expect(result.query).to.be.equal('select * from "users";');
			expect(result.values).to.be.eql({});
		});
	});

	describe('distinct', function() {
		it('should be ok with true value', function() {
			var result = jsonSql.build({
				table: 'users',
				distinct: true
			});

			expect(result.query).to.be.equal('select distinct * from "users";');
			expect(result.values).to.be.eql({});
		});
	});

	describe('fields', function() {
		it('should be ok with empty fields array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: []
			});

			expect(result.query).to.be.equal('select * from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with empty fields object', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {}
			});

			expect(result.query).to.be.equal('select * from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with simple array fields', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [1, true, null, 'type']
			});

			expect(result.query).to.be.equal('select 1, true, null, "type" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`:`alias`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {userAge: 'age', userScore: 'score'}
			});

			expect(result.query).to.be.equal('select "userAge" as "age", "userScore" as "score" from ' +
				'"users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`:`alias`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{userAge: 'age'}]
			});

			expect(result.query).to.be.equal('select "userAge" as "age" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`field`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{field: 'address'}]
			});

			expect(result.query).to.be.equal('select "address" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`field.name`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{field: {name: 'address'}}]
			});

			expect(result.query).to.be.equal('select "address" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`table`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{name: 'score', table: 'users'}]
			});

			expect(result.query).to.be.equal('select "users"."score" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`alias`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{name: 'zoneName', alias: 'zone'}]
			});

			expect(result.query).to.be.equal('select "zoneName" as "zone" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`table`,`alias`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{name: 'zoneName', table: 'users', alias: 'zone'}]
			});

			expect(result.query).to.be.equal('select "users"."zoneName" as "zone" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`table`,`alias`,`cast`) array', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{name: 'zoneName', table: 'users', alias: 'zone', cast: 'integer'}]
			});

			expect(result.query).to.be.equal('select cast("users"."zoneName" as integer) as "zone" from ' +
				'"users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`table`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {score: {table: 'users'}}
			});

			expect(result.query).to.be.equal('select "users"."score" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`alias`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {zone: {name: 'zone_1', alias: 'zone'}}
			});

			expect(result.query).to.be.equal('select "zone_1" as "zone" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`table`,`alias`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {score: {table: 'users', alias: 's'}}
			});

			expect(result.query).to.be.equal('select "users"."score" as "s" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`table`,`alias`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {name: {name: 'name_1', table: 'users', alias: 'name_2'}}
			});

			expect(result.query).to.be.equal('select "users"."name_1" as "name_2" from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`name`,`table`,`alias`,`cast`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {name: {name: 'name_1', table: 'users', alias: 'name_2', cast: 'integer'}}
			});

			expect(result.query).to.be.equal('select cast("users"."name_1" as integer) as "name_2" from ' +
				'"users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`expression`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					expression: 'count(*)'
				}]
			});

			expect(result.query).to.be.equal('select count(*) from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`expression.pattern`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					expression: {
						pattern: 'count(*)'
					}
				}]
			});

			expect(result.query).to.be.equal('select count(*) from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should throw error if `expression` contains unexisting value', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					fields: [{expression: 'count({a})'}]
				});
			}).to.throw('Field `a` is required in `expression.values` property');
		});

		it('should be ok with object(`expression.pattern`,`expression.values`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					expression: {
						pattern: 'sum({a})',
						values: {a: 1}
					}
				}]
			});

			expect(result.query).to.be.equal('select sum(1) from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`func`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					func: 'random'
				}]
			});

			expect(result.query).to.be.equal('select random() from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`func.name`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					func: {name: 'random'}
				}]
			});

			expect(result.query).to.be.equal('select random() from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`func.name`,`func.args`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					func: {
						name: 'sum',
						args: [1]
					}
				}]
			});

			expect(result.query).to.be.equal('select sum(1) from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`select`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					select: {table: 'users'}
				}]
			});

			expect(result.query).to.be.equal('select (select * from "users") from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`query`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					query: {
						type: 'select',
						table: 'users'
					}
				}]
			});

			expect(result.query).to.be.equal('select (select * from "users") from "users";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object(`value`)', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{
					value: 1
				}]
			});

			expect(result.query).to.be.equal('select 1 from "users";');
			expect(result.values).to.be.eql({});
		});
	});

	describe('alias', function() {
		it('should be ok with string `alias` property', function() {
			var result = jsonSql.build({
				table: 'users',
				alias: 'u'
			});

			expect(result.query).to.be.equal('select * from "users" as "u";');
			expect(result.values).to.be.eql({});
		});

		it('should throw error if `alias` has wrong type', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					alias: 1
				});
			}).to.throw('`alias` property should have one of expected types: ' +
				'"string", "object" in `select` clause');
		});

		it('should throw error if object `alias` does not have `name` property', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					alias: {}
				});
			}).to.throw('`alias.name` property is required');
		});

		it('should be ok with object `alias`(`name`) property', function() {
			var result = jsonSql.build({
				table: 'users',
				alias: {
					name: 'u'
				}
			});

			expect(result.query).to.be.equal('select * from "users" as "u";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object `alias`(`name`, `columns`) property', function() {
			var result = jsonSql.build({
				table: 'users',
				alias: {
					name: 'u',
					columns: ['a', 'b']
				}
			});

			expect(result.query).to.be.equal('select * from "users" as "u"("a", "b");');
			expect(result.values).to.be.eql({});
		});
	});

	describe('query', function() {
		it('should be ok with `query` property', function() {
			var result = jsonSql.build({
				query: {
					type: 'select',
					table: 't'
				}
			});

			expect(result.query).to.be.equal('select * from (select * from "t");');
			expect(result.values).to.be.eql({});
		});
	});

	describe('select', function() {
		it('should be ok with `select` property', function() {
			var result = jsonSql.build({
				select: {
					table: 't'
				}
			});

			expect(result.query).to.be.equal('select * from (select * from "t");');
			expect(result.values).to.be.eql({});
		});
	});

	describe('expression', function() {
		it('should be ok with `expression` property', function() {
			var result = jsonSql.build({
				expression: 'function()'
			});

			expect(result.query).to.be.equal('select * from function();');
			expect(result.values).to.be.eql({});
		});
	});

	describe('join', function() {
		it('should throw error without `table`, `query` and `select` properties',
			function() {
				expect(function() {
					jsonSql.build({
						table: 'users',
						join: [{}]
					});
				}).to.throw('Neither `table`, `query`, `select`, `expression` properties ' +
					'are not set in `join` clause');
			}
		);

		it('should throw error with both `table` and `select` properties', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					join: [{
						table: 'a',
						select: {table: 'b'}
					}]
				});
			}).to.throw('Wrong using `table`, `select` properties together in `join` clause');
		});

		it('should throw error with both `table` and `query` properties', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					join: [{
						table: 'a',
						query: {table: 'b'}
					}]
				});
			}).to.throw('Wrong using `table`, `query` properties together in `join` clause');
		});

		it('should throw error with both `query` and `select` properties', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					join: [{
						query: 'a',
						select: {table: 'b'}
					}]
				});
			}).to.throw('Wrong using `query`, `select` properties together in `join` clause');
		});

		it('should throw error with wrong `type` property', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					join: [{
						type: 'wrong',
						table: 'payments'
					}]
				});
			}).to.throw('Invalid `type` property value "wrong" in `join` clause');
		});

		it('should be ok with correct `type` property', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					type: 'left outer',
					table: 'payments'
				}]
			});

			expect(result.query).to.be.equal('select * from "users" left outer join "payments";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with array `join`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					table: 'payments'
				}]
			});

			expect(result.query).to.be.equal('select * from "users" join "payments";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object `join`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: {
					payments: {}
				}
			});

			expect(result.query).to.be.equal('select * from "users" join "payments";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with `on` property', function() {
			var result = jsonSql.build({
				table: 'users',
				join: {
					payments: {
						on: {'users.name': 'payments.name'}
					}
				}
			});

			expect(result.query).to.be.equal('select * from "users" join "payments" on "users"."name" = ' +
				'"payments"."name";');
			expect(result.values).to.be.eql({});
		});

		it('should be ok with `query` property', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					query: {
						table: 'payments'
					},
					on: {'users.name': 'payments.name'}
				}]
			});

			expect(result.query).to.be.equal(
				'select * from "users" ' +
					'join (select * from "payments") ' +
					'on "users"."name" = "payments"."name";'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with `select` property', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					select: {
						table: 'payments'
					},
					on: {'users.name': 'payments.name'}
				}]
			});

			expect(result.query).to.be.equal(
				'select * from "users" ' +
					'join (select * from "payments") ' +
					'on "users"."name" = "payments"."name";'
			);
			expect(result.values).to.be.eql({});
		});
	});

	describe('condition', function() {
		describe('comparison operators', function() {
			it('should throw error with wrong operator', function() {
				expect(function() {
					jsonSql.build({
						table: 'users',
						condition: {
							name: {$wrong: 'John'}
						}
					});
				}).to.throw('Unknown operator "$wrong"');
			});

			it('should be ok with default operator(=)', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: 'John'
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$eq` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$eq: 'John'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$ne` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$ne: 'John'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" != $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$gt` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$gt: 'John'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" > $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$lt` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$lt: 'John'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" < $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$gte` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$gte: 'John'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" >= $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$lte` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$lte: 'John'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" <= $p1;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with `$is` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$is: null}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" is null;');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$isNot` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$isNot: null}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" is not null;');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$like` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$like: 'John%'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" like $p1;');
				expect(result.values).to.be.eql({
					p1: 'John%'
				});
			});

			it('should be ok with `$null`:true operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$null: true}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" is null;');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$null`:false operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$null: false}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" is not null;');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$field` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$field: 'name_2'}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = "name_2";');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with object `$field` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: {$field: {field: 'name_2'}}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = "name_2";');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$in` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$in: [12, 13, 14]}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" in (12, 13, 14);');
				expect(result.values).to.be.eql({});
			});

			it('should add `null` value with empty array in `$in` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$in: []}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" in (null);');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$nin` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$nin: [12, 13, 14]}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" not in (12, 13, 14);');
				expect(result.values).to.be.eql({});
			});

			it('should add `null` value with empty array in `$nin` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$nin: []}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" not in (null);');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with object subquery in `$in` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$in: {
							table: 'test'
						}}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" in (select * from ' +
					'"test");');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `query` subquery in `$in` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$in: {
							query: {
								table: 'test'
							}
						}}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" in (select * from ' +
					'(select * from "test"));');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `select` subquery in `$in` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$in: {
							select: {
								table: 'test'
							}
						}}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" in (select * from ' +
					'(select * from "test"));');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with `$between` operator', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {$between: [12, 14]}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" between 12 and 14;');
				expect(result.values).to.be.eql({});
			});
		});

		describe('logical operators', function() {
			it('should throw error with wrong logical operator', function() {
				expect(function() {
					jsonSql.build({
						table: 'users',
						condition: {
							$wrong: [
								{name: 'John'},
								{age: 12}
							]
						}
					});
				}).to.throw('Unknown operator "$wrong"');
			});

			it('should be ok with default logical operator(`$and`)', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						name: 'John',
						age: 12
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1 and "age" = 12;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with default logical operator(`$and`) for one field', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						age: {
							$gt: 5,
							$lt: 15,
							$ne: 10
						}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "age" > 5 and "age" < 15 and ' +
					'"age" != 10;');
				expect(result.values).to.be.eql({});
			});

			it('should be ok with array `$and`', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$and: [
							{name: 'John'},
							{age: 12}
						]
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1 and "age" = 12;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with object `$and`', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$and: {
							name: 'John',
							age: 12
						}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1 and "age" = 12;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with array `$or`', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$or: [
							{name: 'John'},
							{age: 12}
						]
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1 or "age" = 12;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with object `$or`', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$or: {
							name: 'John',
							age: 12
						}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where "name" = $p1 or "age" = 12;');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with array `$not`', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$not: [
							{name: 'John'},
							{age: 12}
						]
					}
				});

				expect(result.query).to.be.equal('select * from "users" where not ("name" = $p1 and ' +
					'"age" = 12);');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with object `$not`', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$not: {
							name: 'John',
							age: 12
						}
					}
				});

				expect(result.query).to.be.equal('select * from "users" where not ("name" = $p1 and ' +
					'"age" = 12);');
				expect(result.values).to.be.eql({
					p1: 'John'
				});
			});

			it('should be ok with object [`$or`, `$or`]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: [{
						$or: {
							name: 'John',
							age: 12
						}
					}, {
						$or: {
							name: 'Mark',
							age: 14
						}
					}]
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 or "age" = 12) and ' +
						'("name" = $p2 or "age" = 14);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with object `$and`:[`$or`, `$or`]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$and: [{
							$or: {
								name: 'John',
								age: 12
							}
						}, {
							$or: {
								name: 'Mark',
								age: 14
							}
						}]
					}
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 or "age" = 12) and ' +
						'("name" = $p2 or "age" = 14);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with object `$or`:[{},{}]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$or: [{
							name: 'John',
							age: 12
						}, {
							name: 'Mark',
							age: 14
						}]
					}
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 and "age" = 12) or ' +
						'("name" = $p2 and "age" = 14);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with object `$or`:[`$and`, `$and`]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$or: [{
							$and: {
								name: 'John',
								age: 12
							}
						}, {
							$and: {
								name: 'Mark',
								age: 14
							}
						}]
					}
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 and "age" = 12) or ' +
						'("name" = $p2 and "age" = 14);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with [{}, {}]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: [{
						name: 'John',
						age: 12
					}, {
						name: 'Mark',
						age: 14
					}]
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 and "age" = 12) and ' +
						'("name" = $p2 and "age" = 14);');
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with `$and`:[{}, {}]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$and: [{
							name: 'John',
							age: 12
						}, {
							name: 'Mark',
							age: 14
						}]
					}
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 and "age" = 12) and ' +
						'("name" = $p2 and "age" = 14);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with `$and`:[`$and`, `$and`]', function() {
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$and: [{
							$and: {
								name: 'John',
								age: 12
							}
						}, {
							$and: {
								name: 'Mark',
								age: 14
							}
						}]
					}
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 and "age" = 12) and ' +
						'("name" = $p2 and "age" = 14);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: 'Mark'
				});
			});

			it('should be ok with `$or`:[`$or`, `$or`]', function() {
				var date1 = new Date();
				var date2 = new Date();
				var result = jsonSql.build({
					table: 'users',
					condition: {
						$or: [{
							$or: {
								name: 'John',
								age: 12,
								date: date1
							}
						}, {
							$or: {
								name: 'Mark',
								age: 14,
								date: date2
							}
						}]
					}
				});

				expect(result.query).to.be.equal(
					'select * from "users" ' +
						'where ("name" = $p1 or "age" = 12 or "date" = $p2) or ' +
						'("name" = $p3 or "age" = 14 or "date" = $p4);'
				);
				expect(result.values).to.be.eql({
					p1: 'John',
					p2: date1,
					p3: 'Mark',
					p4: date2
				});
			});
		});
	});

	describe('group', function() {
		it('should be ok with string value', function() {
			var result = jsonSql.build({
				table: 'users',
				group: 'age'
			});

			expect(result.query).to.be.equal(
				'select * from "users" group by "age";'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with array value', function() {
			var result = jsonSql.build({
				table: 'users',
				group: ['age', 'gender']
			});

			expect(result.query).to.be.equal(
				'select * from "users" group by "age", "gender";'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with expression', function() {
			var result = jsonSql.build({
				table: 'users',
				group: [
					'age',
					'gender',
					{func: {name: 'date_trunc', args: ['day', {field: 'birthday'}]}}
				]
			});

			expect(result.query).to.be.equal(
				'select * from "users" group by "age", "gender", date_trunc($p1, "birthday");'
			);
			expect(result.values).to.be.eql({
				p1: 'day'
			});
		});
	});

	describe('sort', function() {
		it('should be ok with string value', function() {
			var result = jsonSql.build({
				table: 'users',
				sort: 'age'
			});

			expect(result.query).to.be.equal(
				'select * from "users" order by "age";'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with array value', function() {
			var result = jsonSql.build({
				table: 'users',
				sort: ['age', 'gender']
			});

			expect(result.query).to.be.equal(
				'select * from "users" order by "age", "gender";'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with object value', function() {
			var result = jsonSql.build({
				table: 'users',
				sort: {
					age: 1,
					gender: -1
				}
			});

			expect(result.query).to.be.equal(
				'select * from "users" order by "age" asc, "gender" desc;'
			);
			expect(result.values).to.be.eql({});
		});
	});

	describe('limit, offset', function() {
		it('should be ok with `limit` property', function() {
			var result = jsonSql.build({
				table: 'users',
				limit: 5
			});

			expect(result.query).to.be.equal(
				'select * from "users" limit 5;'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with `offset` property', function() {
			var result = jsonSql.build({
				table: 'users',
				offset: 5
			});

			expect(result.query).to.be.equal(
				'select * from "users" offset 5;'
			);
			expect(result.values).to.be.eql({});
		});

		it('should be ok with `limit` and `offset` properties', function() {
			var result = jsonSql.build({
				table: 'users',
				limit: 10,
				offset: 20
			});

			expect(result.query).to.be.equal(
				'select * from "users" limit 10 offset 20;'
			);
			expect(result.values).to.be.eql({});
		});
	});
});
