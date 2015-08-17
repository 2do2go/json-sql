# Table

Query:

``` js
var sql = jsonSql.build({
    table: 'table'
});
```

Result:

``` js
sql.query
// select * from "table";

sql.values
// {}
```
