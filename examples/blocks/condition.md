# Condition block example

## Example 1 - array

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    condition: [
        {a: {$gt: 1}},
        {b: {$lt: 10}}
    ]
});
```

Result:

``` js
sql.query
// select * from "table" where "a" > 1 and "b" < 10;

sql.values
// {}
```

## Example 2 - object

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    condition: {
        a: {$gt: 1},
        b: {$lt: 10}
    }
});
```

Result:

``` js
sql.query
// select * from "table" where "a" > 1 and "b" < 10;

sql.values
// {}
```
