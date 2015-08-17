# Subselect

Query:

``` js
var sql = jsonSql.build({
    select: {table: 'table'}
});
```

Result:

``` js
sql.query
// select * from (select * from "table");

sql.values
// {}
```
