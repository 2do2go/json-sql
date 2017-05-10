'use strict';

var jsonSql = require('../../lib')({
  dialect: 'mssql',
  namedValues: false
});
var expect = require('chai').expect;

describe('MSSQL dialect', function() {
  describe('limit', function() {
    it('should be ok with `limit` property', function() {
      var result = jsonSql.build({
        table: 'test',
        fields: ['user'],
        limit: 1,
        condition: {
          'name': {$eq: 'test'}
        }
      });
      expect(result.query).to.be.equal('select top(1) "user" from "test" where "name" = $1;');
    });

    it('should be ok with `limit` and `offset` properties', function() {
      var result = jsonSql.build({
        table: 'test',
        fields: ['user'],
        limit: 4,
        offset: 2,
        condition: {
          'name': {$eq: 'test'}
        }
      });
      expect(result.query).to.be.equal('select  "user" from "test" where "name" = $1 order by 1 offset 2 rows fetch next 4 rows only;');
    });
  });
  describe('returning', function() {
    it('should be ok with `remove` type', function() {
      var result = jsonSql.build({
        type: 'remove',
        table: 'test',
        returning: ['DELETED.*'],
        condition: {
          Description: {$eq: 'test'}
        }
      });
      expect(result.query).to.be.equal('delete from "test" output "DELETED".* where "Description" = $1;');
    });
    it('should be ok with `insert` type', function() {
      var result = jsonSql.build({
        type: 'insert',
        table: 'test',
        returning: ['INSERTED.*'],
        values: {
          Description: 'test',
        }
      });
      expect(result.query).to.be.equal('insert into "test" ("Description") output "INSERTED".* values ($1);');
    });
  });
});
