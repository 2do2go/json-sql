'use strict';

var jsonSql = require('../../lib')({
	dialect: 'postgresql',
	namedValues: false
});
var expect = require('chai').expect;

describe('PostgreSQL dialect', function() {
	describe('json', function() {
		it('should correctly wrap each part of json path', function() {
			var result = jsonSql.build({
				table: 'test',
				fields: ['params->a->>b'],
				condition: {
					'params->>c': {$like: '7%'}
				}
			});

			expect(result.query).to.be.equal(
				'select "params"->\'a\'->>\'b\' from "test" ' +
				'where "params"->>\'c\' like $1;'
			);
		});

		it('should be ok with `$jsonContains` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params->a': {
						$jsonContains: {b: 1}
					}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params"->\'a\' @> $1;'
			);
			expect(result.values).to.be.eql(['{"b":1}']);
		});

		it('should be ok with `$jsonIn` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params->a': {
						$jsonIn: {b: 1}
					}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params"->\'a\' <@ $1;'
			);
			expect(result.values).to.be.eql(['{"b":1}']);
		});

		it('should be ok with `$jsonHas` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$jsonHas: 'account'}
				}
			});

			expect(result.query).to.be.equal('select * from "test" where "params" ? $1;');
			expect(result.values).to.be.eql(['account']);
		});

		it('should be ok with `$jsonHasAny` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$jsonHasAny: ['a', 'b']}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" ?| array[$1, $2];'
			);
			expect(result.values).to.be.eql(['a', 'b']);
		});

		it('should be ok with `$jsonHasAll` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$jsonHasAll: ['a', 'b']}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" ?& array[$1, $2];'
			);
			expect(result.values).to.be.eql(['a', 'b']);
		});

		it('should be ok with `$ilike` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$ilike: 'hello%'}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" ilike $1;'
			);
			expect(result.values).to.be.eql(['hello%']);
		});

		it('should be ok with `$nilike` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {$nilike: 'hello%'}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" not ilike $1;'
			);
			expect(result.values).to.be.eql(['hello%']);
		});

		it('should be ok with `$jsonConcatenate` modification operator', function() {
			var result = jsonSql.build({
				type: 'update',
				table: 'test',
				modifier: {
					$jsonConcatenate: {
						params: {c: 1}
					}
				}
			});

			expect(result.query).to.be.equal('update "test" set "params" = "params" || $1;');
			expect(result.values).to.be.eql(['{"c":1}']);
		});

		it('should be ok with `$jsonDelete` modification operator', function() {
			var result = jsonSql.build({
				type: 'update',
				table: 'test',
				modifier: {
					$jsonDelete: {
						params: {c: 1}
					}
				}
			});

			expect(result.query).to.be.equal('update "test" set "params" = "params" - $1;');
			expect(result.values).to.be.eql(['{"c":1}']);
		});

		it('should be ok with `$jsonDeleteByPath` modification operator', function() {
			var result = jsonSql.build({
				type: 'update',
				table: 'test',
				modifier: {
					$jsonDeleteByPath: {
						params: '{1,d}'
					}
				}
			});

			expect(result.query).to.be.equal('update "test" set "params" = "params" #- $1;');
			expect(result.values).to.be.eql(['{1,d}']);
		});
	});

	describe('array', function() {
		it('should replace empty array to {}', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params': []
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" = $1;'
			);
			expect(result.values).to.be.eql(['{}']);
		});

		it('should be ok with empty array in modification', function() {
			var result = jsonSql.build({
				type: 'update',
				table: 'test',
				modifier: {
					'params': []
				}
			});

			expect(result.query).to.be.equal('update "test" set "params" = $1;');
			expect(result.values).to.be.eql(['{}']);
		});

		it('should be ok with empty array in values', function() {
			var result = jsonSql.build({
				type: 'insert',
				table: 'test',
				values: {
					'params': []
				}
			});

			expect(result.query).to.be.equal('insert into "test" ("params") values ($1);');
			expect(result.values).to.be.eql(['{}']);
		});

		it('should be ok with `$arrayContains` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params': {
						$arrayContains: ['a']
					}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" @> array[$1];'
			);
			expect(result.values).to.be.eql(['a']);
		});

		it('should correctly wrap `$arrayContains` parameters to array', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params': {
						$arrayContains: 'a'
					}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" @> array[$1];'
			);
			expect(result.values).to.be.eql(['a']);
		});

		it('should be ok with `$arrayIn` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params': {
						$arrayIn: ['a']
					}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" <@ array[$1];'
			);
			expect(result.values).to.be.eql(['a']);
		});

		it('should correctly wrap `$arrayIn` parameters to array', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					'params': {
						$arrayIn: 'a'
					}
				}
			});

			expect(result.query).to.be.equal(
				'select * from "test" where "params" <@ array[$1];'
			);
			expect(result.values).to.be.eql(['a']);
		});

		it('should be ok with `$arrayOverlap` conditional operator', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {
						$arrayOverlap: ['a']
					}
				}
			});

			expect(result.query).to.be.equal('select * from "test" where "params" && array[$1];');
			expect(result.values).to.be.eql(['a']);
		});

		it('should correctly wrap `$arrayOverlap` parameters to array', function() {
			var result = jsonSql.build({
				table: 'test',
				condition: {
					params: {
						$arrayOverlap: 'a'
					}
				}
			});

			expect(result.query).to.be.equal('select * from "test" where "params" && array[$1];');
			expect(result.values).to.be.eql(['a']);
		});
	});


	describe('explain', function() {
		it('should throw error without `query`, `select` and `expression` properties',
			function() {
				expect(function() {
					jsonSql.build({
						type: 'explain'
					});
				}).to.throw('Neither `query`, `select`, `expression` properties ' +
					'are not set in `explain` clause');
			}
		);

		it('should be ok without options', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'}
			});

			expect(result.query).to.be.equal('explain (select * from "test");');
		});

		it('should be ok with `analyze` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				analyze: true
			});

			expect(result.query).to.be.equal('explain analyze (select * from "test");');
		});

		it('should be ok with `verbose` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				verbose: true
			});

			expect(result.query).to.be.equal('explain verbose (select * from "test");');
		});

		it('should throw error with empty `options` property', function() {
			expect(function() {
				jsonSql.build({
					type: 'explain',
					select: {table: 'test'},
					options: {}
				});
			}).to.throw('Neither `analyze`, `verbose`, `costs`, `buffers`, `timing`, `format` properties ' +
				'are not set in `explain:options` clause');
		});

		it('should be ok with `options`.`analyze` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				options: {
					analyze: true
				}
			});

			expect(result.query).to.be.equal('explain (analyze true) (select * from "test");');
		});

		it('should be ok with `options`.`verbose` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				options: {
					verbose: true
				}
			});

			expect(result.query).to.be.equal('explain (verbose true) (select * from "test");');
		});

		it('should be ok with `options`.`costs` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				options: {
					costs: true
				}
			});

			expect(result.query).to.be.equal('explain (costs true) (select * from "test");');
		});

		it('should be ok with `options`.`buffers` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				options: {
					buffers: true
				}
			});

			expect(result.query).to.be.equal('explain (buffers true) (select * from "test");');
		});

		it('should be ok with `options`.`timing` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				options: {
					timing: true
				}
			});

			expect(result.query).to.be.equal('explain (timing true) (select * from "test");');
		});

		it('should throw error with wrong `options`.`format` property', function() {
			expect(function() {
				jsonSql.build({
					type: 'explain',
					select: {table: 'test'},
					options: {
						format: 'wrong'
					}
				});
			}).to.throw('Invalid `format` property value "wrong" in `explain:options` clause');
		});

		it('should be ok with `options`.`format` property', function() {
			var result = jsonSql.build({
				type: 'explain',
				select: {table: 'test'},
				options: {
					format: 'json'
				}
			});

			expect(result.query).to.be.equal('explain (format json) (select * from "test");');
		});

	});

	describe('select', function() {
		describe('distinctOn', function() {
			it('should be ok with string value', function() {
				var result = jsonSql.build({
					table: 'users',
					distinctOn: 'a'
				});

				expect(result.query).to.be.equal('select distinct on ("a") * from "users";');
			});

			it('should be ok with array value', function() {
				var result = jsonSql.build({
					table: 'users',
					distinctOn: ['a', 'b']
				});

				expect(result.query).to.be.equal('select distinct on ("a", "b") * from "users";');
			});
		});
	});
});
