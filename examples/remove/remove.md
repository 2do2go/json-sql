# Basic remove query

Query:

``` js
var sql = jsonSql.build({
    type: 'remove',
    table: 'table'
});
```

Result:

``` js
sql.query
// delete from "test";

sql.values
// {}
```
