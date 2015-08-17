# Limit

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    limit: 5
});
```

Result:

``` js
sql.query
// select * from "table" limit 5;

sql.values
// {}
```
