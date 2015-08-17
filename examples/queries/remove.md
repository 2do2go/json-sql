# Remove query

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
// delete from "table";

sql.values
// {}
```
