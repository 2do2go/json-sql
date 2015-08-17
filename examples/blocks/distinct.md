# `distinct` block example

``` js
var sql = jsonSql.build({
    distinct: true,
    table: 'table'
});
```

Result:

``` js
sql.query
// select distinct * from "table";

sql.values
// {}
```
