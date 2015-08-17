# Union query example

## Example 1 - union

Query:

``` js
var sql = jsonSql.build({
    type: 'union',
    queries: [
        {type: 'select', table: 'table1'},
        {type: 'select', table: 'table2'}
    ]
});
```

Result:

``` js
sql.query
// (select * from "table1") union (select * from "table2");

sql.values
// {}
```

## Example 2 - union all

Query:

``` js
var sql = jsonSql.build({
    type: 'union',
    all: true,
    queries: [
        {type: 'select', table: 'table1'},
        {type: 'select', table: 'table2'}
    ]
});
```

Result:

``` js
sql.query
// (select * from "table1") union all (select * from "table2");

sql.values
// {}
```
