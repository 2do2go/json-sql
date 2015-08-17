# Group block example

## Example 1 - single column

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    group: 'a'
});
```

Result:

``` js
sql.query
// select * from "table" group by "a";

sql.values
// {}
```

## Example 2 - multiple columns

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    group: ['a', 'b']
});
```

Result:

``` js
sql.query
// select * from "table" group by "a", "b";

sql.values
// {}
```
