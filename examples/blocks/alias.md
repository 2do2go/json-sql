# Alias block example

Query:

``` js
var sql = jsonSql.build({
    table: 'table',
    alias: 'alias'
});
```

Result:

``` js
sql.query
// select * from "table" as "alias";

sql.values
// {}
```
