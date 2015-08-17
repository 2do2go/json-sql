# `type: except` query example

## Example 1 - except

``` js
var sql = jsonSql.build({
    type: 'except',
    queries: [
        {type: 'select', table: 'table1'},
        {type: 'select', table: 'table2'}
    ]
});
```

Result:

``` js
sql.query
// (select * from "table1") except (select * from "table2");

sql.values
// {}
```

## Example 2 - except all

``` js
var sql = jsonSql.build({
    type: 'except',
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
// (select * from "table1") except all (select * from "table2");

sql.values
// {}
```
