# Intersect query

# Example 1 - intersect

Query:

``` js
var sql = jsonSql.build({
    type: 'intersect',
    queries: [
        {type: 'select', table: 'table1'},
        {type: 'select', table: 'table2'}
    ]
});
```

Result:

``` js
sql.query
// (select * from "table1") intersect (select * from "table2");

sql.values
// {}
```

# Example 2 - intersect all

Query:

``` js
var sql = jsonSql.build({
    type: 'intersect',
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
// (select * from "table1") intersect all (select * from "table2");

sql.values
// {}
```
