# Sort

## Example 1 - single column

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    sort: 'a'
});
```

Result:

``` js
sql.query
// select * from "table" order by "a";

sql.values
// {}
```

## Example 2 - multiple columns

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    sort: ['a', 'b']
});
```

Result:

``` js
sql.query
// select * from "table" order by "a", "b";

sql.values
// {}
```

## Example 3 - multiple columns with order

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    sort: {a: 1, b: -1}
});
```

Result:

``` js
sql.query
// select * from "table" order by "a" asc, "b" desc;

sql.values
// {}
```
