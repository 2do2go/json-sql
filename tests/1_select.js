'use strict';

var jsonSql = require('../lib');
var expect = require('expect.js');

describe('Select', function() {
	describe('type', function() {
		it('should be ok without `type`', function() {
			var result = jsonSql.build({
				table: 'users'
			});

			expect(result.query).to.be('select * from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with select `type`', function() {
			var result = jsonSql.build({
				type: 'select',
				table: 'users'
			});

			expect(result.query).to.be('select * from users;');
			expect(result.values).to.eql({});
		});
	});

	describe('distinct', function() {
		it('should be ok with `distinct`', function() {
			var result = jsonSql.build({
				table: 'users',
				distinct: true
			});

			expect(result.query).to.be('select distinct * from users;');
			expect(result.values).to.eql({});
		});
	});

	describe('fields', function() {
		it('should be ok with string array `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: ['name', 'type']
			});

			expect(result.query).to.be('select name, type from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object array `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{userAge: 'age'}]
			});

			expect(result.query).to.be('select userAge as age from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(field) array `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{field: 'address'}]
			});

			expect(result.query).to.be('select address from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(field,table) array `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{field: 'score', table: 'users'}]
			});

			expect(result.query).to.be('select users.score from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(field,alias) array `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{field: 'zoneName', alias: 'zone'}]
			});

			expect(result.query).to.be('select zoneName as zone from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(field,table,alias) array `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: [{field: 'zoneName', table: 'users', alias: 'zone'}]
			});

			expect(result.query).to.be('select users.zoneName as zone from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {userAge: 'age', userScore: 'score'}
			});

			expect(result.query).to.be('select userAge as age, userScore as score from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(table) `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {score: {table: 'users'}}
			});

			expect(result.query).to.be('select users.score from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(field,alias) `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {zone: {field: 'zone_1', alias: 'zone'}}
			});

			expect(result.query).to.be('select zone_1 as zone from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(table,alias) `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {score: {table: 'users', alias: 's'}}
			});

			expect(result.query).to.be('select users.score as s from users;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object(field,table,alias) `fields`', function() {
			var result = jsonSql.build({
				table: 'users',
				fields: {name: {field: 'name_1', table: 'users', alias: 'name_2'}}
			});

			expect(result.query).to.be('select users.name_1 as name_2 from users;');
			expect(result.values).to.eql({});
		});
	});

	describe('alias', function() {
		it('should be ok with `alias`', function() {
			var result = jsonSql.build({
				table: 'users',
				alias: 'u'
			});

			expect(result.query).to.be('select * from users as u;');
			expect(result.values).to.eql({});
		});
	});

	describe('select', function() {
		it('should be ok with `select`', function() {
			var result = jsonSql.build({
				select: {
					table: 't'
				}
			});

			expect(result.query).to.be('select * from (select * from t);');
			expect(result.values).to.eql({});
		});
	});

	describe('join', function() {
		it('should throw error without join `table` and `select`', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					join: [{}]
				});
			}).to.throwError(function(e) {
				expect(e).to.be.a(Error);
				expect(e.message).to.be('Table name or subselect is not set in join clause.');
			});
		});

		it('should throw error with wrong `join.type`', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					join: [{
						type: 'wrong',
						table: 'payments'
					}]
				});
			}).to.throwError(function(e) {
				expect(e).to.be.a(Error);
				expect(e.message).to.be('Invalid join type "wrong".');
			});
		});

		it('should be ok with correct `join.type`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					type: 'left outer',
					table: 'payments'
				}]
			});

			expect(result.query).to.be('select * from users left outer join payments;');
			expect(result.values).to.eql({});
		});

		it('should be ok with array `join`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					table: 'payments'
				}]
			});

			expect(result.query).to.be('select * from users join payments;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object `join`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: {
					payments: {}
				}
			});

			expect(result.query).to.be('select * from users join payments;');
			expect(result.values).to.eql({});
		});

		it('should be ok with `join.on`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: {
					payments: {
						on: {'users.name': 'payments.name'}
					}
				}
			});

			expect(result.query).to.be('select * from users join payments on users.name = payments.name;');
			expect(result.values).to.eql({});
		});

		it('should be ok with `join.select`', function() {
			var result = jsonSql.build({
				table: 'users',
				join: [{
					select: {
						table: 'payments'
					},
					on: {'users.name': 'payments.name'}
				}]
			});

			expect(result.query).to.be(
				'select * from users ' +
					'join (select * from payments) ' +
					'on users.name = payments.name;'
			);
			expect(result.values).to.eql({});
		});
	});

	describe('condition operators', function() {
		it('should throw error with wrong operator in `condition`', function() {
			expect(function() {
				jsonSql.build({
					table: 'users',
					condition: {
						name: {$wrong: 'John'}
					}
				});
			}).to.throwError(function(e) {
				expect(e).to.be.a(Error);
				expect(e.message).to.be('Unknown operator "$wrong".');
			});
		});

		it('should be ok with default operator(=) in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: 'John'
				}
			});

			expect(result.query).to.be('select * from users where name = p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $eq operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$eq: 'John'}
				}
			});

			expect(result.query).to.be('select * from users where name = p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $ne operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$ne: 'John'}
				}
			});

			expect(result.query).to.be('select * from users where name != p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $gt operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$gt: 'John'}
				}
			});

			expect(result.query).to.be('select * from users where name > p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $lt operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$lt: 'John'}
				}
			});

			expect(result.query).to.be('select * from users where name < p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $gte operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$gte: 'John'}
				}
			});

			expect(result.query).to.be('select * from users where name >= p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $lte operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$lte: 'John'}
				}
			});

			expect(result.query).to.be('select * from users where name <= p0;');
			expect(result.values).to.eql({
				p0: 'John'
			});
		});

		it('should be ok with $is operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$is: null}
				}
			});

			expect(result.query).to.be('select * from users where name is p0;');
			expect(result.values).to.eql({
				p0: null
			});
		});

		it('should be ok with $isnot operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$isnot: null}
				}
			});

			expect(result.query).to.be('select * from users where name is not p0;');
			expect(result.values).to.eql({
				p0: null
			});
		});

		it('should be ok with $like operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$like: 'John%'}
				}
			});

			expect(result.query).to.be('select * from users where name like p0;');
			expect(result.values).to.eql({
				p0: 'John%'
			});
		});

		it('should be ok with $null:true operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$null: true}
				}
			});

			expect(result.query).to.be('select * from users where name is p0;');
			expect(result.values).to.eql({
				p0: null
			});
		});

		it('should be ok with $null:false operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$null: false}
				}
			});

			expect(result.query).to.be('select * from users where name is not p0;');
			expect(result.values).to.eql({
				p0: null
			});
		});

		it('should be ok with $field operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$field: 'name_2'}
				}
			});

			expect(result.query).to.be('select * from users where name = name_2;');
			expect(result.values).to.eql({});
		});

		it('should be ok with object $field operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: {$field: {field: 'name_2'}}
				}
			});

			expect(result.query).to.be('select * from users where name = name_2;');
			expect(result.values).to.eql({});
		});

		it('should be ok with $in operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					age: {$in: [12, 13, 14]}
				}
			});

			expect(result.query).to.be('select * from users where age in (p0, p1, p2);');
			expect(result.values).to.eql({
				p0: 12,
				p1: 13,
				p2: 14
			});
		});

		it('should be ok with $nin operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					age: {$nin: [12, 13, 14]}
				}
			});

			expect(result.query).to.be('select * from users where age not in (p0, p1, p2);');
			expect(result.values).to.eql({
				p0: 12,
				p1: 13,
				p2: 14
			});
		});

		it('should be ok with $between operator in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					age: {$between: [12, 14]}
				}
			});

			expect(result.query).to.be('select * from users where age between p0 and p1;');
			expect(result.values).to.eql({
				p0: 12,
				p1: 14
			});
		});
	});

	describe('condition logical operators', function() {
		it('should throw error with wrong logical operator in `condition`', function() {
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
			}).to.throwError(function(e) {
				expect(e).to.be.a(Error);
				expect(e.message).to.be('Unknown logical operator "$wrong".');
			});
		});

		it('should be ok with default logical operator($and) in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					name: 'John',
					age: 12
				}
			});

			expect(result.query).to.be('select * from users where name = p0 and age = p1;');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with default logical operator($and) for one field in `condition`', function() {
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

			expect(result.query).to.be('select * from users where age > p0 and age < p1 and age != p2;');
			expect(result.values).to.eql({
				p0: 5,
				p1: 15,
				p2: 10
			});
		});

		it('should be ok with array $and in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$and: [
						{name: 'John'},
						{age: 12}
					]
				}
			});

			expect(result.query).to.be('select * from users where name = p0 and age = p1;');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with object $and in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$and: {
						name: 'John',
						age: 12
					}
				}
			});

			expect(result.query).to.be('select * from users where name = p0 and age = p1;');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with array $or in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$or: [
						{name: 'John'},
						{age: 12}
					]
				}
			});

			expect(result.query).to.be('select * from users where name = p0 or age = p1;');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with object $or in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$or: {
						name: 'John',
						age: 12
					}
				}
			});

			expect(result.query).to.be('select * from users where name = p0 or age = p1;');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with array $not in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$not: [
						{name: 'John'},
						{age: 12}
					]
				}
			});

			expect(result.query).to.be('select * from users where not (name = p0 and age = p1);');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with object $not in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$not: {
						name: 'John',
						age: 12
					}
				}
			});

			expect(result.query).to.be('select * from users where not (name = p0 and age = p1);');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12
			});
		});

		it('should be ok with object [$or,$or] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 or age = p1) and ' +
					'(name = p2 or age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with object $and:[$or,$or] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 or age = p1) and ' +
					'(name = p2 or age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with object $or:[{},{}] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 and age = p1) or ' +
					'(name = p2 and age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with object $or:[$and,$and] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 and age = p1) or ' +
					'(name = p2 and age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with [{},{}] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 and age = p1) and ' +
					'(name = p2 and age = p3);');
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with $and:[{},{}] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 and age = p1) and ' +
					'(name = p2 and age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with $and:[$and,$and] in `condition`', function() {
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 and age = p1) and ' +
					'(name = p2 and age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});

		it('should be ok with $or:[$or,$or] in `condition`', function() {
			var result = jsonSql.build({
				table: 'users',
				condition: {
					$or: [{
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

			expect(result.query).to.be(
				'select * from users ' +
					'where (name = p0 or age = p1) or ' +
					'(name = p2 or age = p3);'
			);
			expect(result.values).to.eql({
				p0: 'John',
				p1: 12,
				p2: 'Mark',
				p3: 14
			});
		});
	});

	describe('group', function() {
		it('should be ok with string `group`', function() {
			var result = jsonSql.build({
				table: 'users',
				group: 'age'
			});

			expect(result.query).to.be(
				'select * from users group by age;'
			);
			expect(result.values).to.eql({});
		});

		it('should be ok with array `group`', function() {
			var result = jsonSql.build({
				table: 'users',
				group: ['age', 'gender']
			});

			expect(result.query).to.be(
				'select * from users group by age, gender;'
			);
			expect(result.values).to.eql({});
		});
	});

	describe('sort', function() {
		it('should be ok with string `sort`', function() {
			var result = jsonSql.build({
				table: 'users',
				sort: 'age'
			});

			expect(result.query).to.be(
				'select * from users order by age;'
			);
			expect(result.values).to.eql({});
		});

		it('should be ok with array `sort`', function() {
			var result = jsonSql.build({
				table: 'users',
				sort: ['age', 'gender']
			});

			expect(result.query).to.be(
				'select * from users order by age, gender;'
			);
			expect(result.values).to.eql({});
		});

		it('should be ok with object `sort`', function() {
			var result = jsonSql.build({
				table: 'users',
				sort: {
					age: 1,
					gender: -1
				}
			});

			expect(result.query).to.be(
				'select * from users order by age asc, gender desc;'
			);
			expect(result.values).to.eql({});
		});
	});

	describe('limit, offset', function() {
		it('should be ok with `limit`', function() {
			var result = jsonSql.build({
				table: 'users',
				limit: 5
			});

			expect(result.query).to.be(
				'select * from users limit p0;'
			);
			expect(result.values).to.eql({
				p0: 5
			});
		});

		it('should be ok with `offset`', function() {
			var result = jsonSql.build({
				table: 'users',
				offset: 5
			});

			expect(result.query).to.be(
				'select * from users limit p0 offset p1;'
			);
			expect(result.values).to.eql({
				p0: -1,
				p1: 5
			});
		});

		it('should be ok with `limit` and `offset`', function() {
			var result = jsonSql.build({
				table: 'users',
				limit: 10,
				offset: 20
			});

			expect(result.query).to.be(
				'select * from users limit p0 offset p1;'
			);
			expect(result.values).to.eql({
				p0: 10,
				p1: 20
			});
		});
	});
});
