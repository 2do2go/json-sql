# `values` block example

# Example 1 - values only

``` js
var sql = jsonSql.build({
    type: 'insert',
    table: 'table',
    values: {a: 5, b: 'text'}
});
```

Result:

``` js
sql.query
// insert into "table" ("a", "b") values (5, $p1);

sql.values
// {p1: 'text'}
```

# Example 2 - fields + values

``` js
var sql = jsonSql.build({
    type: 'insert',
    table: 'table',
    fields: ['a', 'b', 'c'],
    values: {b: 5, c: 'text'}
});
```

Result:

``` js
sql.query
// insert into "table" ("a", "b", "c") values (null, 5, $p1);

sql.values
// {p1: 'text'}
```
