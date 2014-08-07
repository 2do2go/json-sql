# JSON-SQL

Library for mapping mongo-style query objects to SQL queries.

## Quick Start

Install it with NPM or add it to your package.json:

``` bash
$ npm install json-sql
```

Then:

``` js
var jsonSql = require('json-sql');

var sql = jsonSql.build({
	type: 'select',
	table: 'users',
	fields: ['name', 'age'],
	condition: {id: 6}
});

sql.query
// sql string:
// select name, age from users where id = p0;

sql.values
// hash of values:
// { p0: 6 }
```

## Documentation

Documentation is available [here](./docs).

## Examples

__Select with join:__

``` js
var sql = jsonSql.build({
	type: 'select',
	table: 'users',
	join: {
		documents: {
			on: {'user.id': 'documents.userId'}
		}
	}
});

sql.query
// select * from users join documents on user.id = documents.userId;

sql.values
// {}
```

__Insert:__

``` js
var sql = jsonSql.build({
	type: 'insert',
	table: 'users',
	values: {
		name: 'John',
		lastname: 'Snow',
		age: 24,
		gender: 'male'
	}
});

sql.query
// insert into users (name, lastname, age, gender) values (p0, p1, p2, p3);

sql.values
// { p0: 'John', p1: 'Snow', p2: 24, p3: 'male' }
```

__Update:__

``` js
var sql = jsonSql.build({
	type: 'update',
	table: 'users',
	modifier: {
		age: 33
	},
	condition: {
		id: 5
	}
});

sql.query
// update users set age = p0 where id = p1;

sql.values
// { p0: 33, p1: 5 }
```

__Remove:__

``` js
var sql = jsonSql.build({
	type: 'remove',
	table: 'users',
	condition: {
		id: 5
	}
});

sql.query
// delete from users where id = p0;

sql.values
// { p0: 5 }
```

For more examples, take a look at the [./tests directory](./tests).

## Tests

Clone repository from github, `cd` into cloned dir and install dev dependencies

``` bash
$ npm install
```

run tests

``` bash
$ npm test
```

## License

MIT