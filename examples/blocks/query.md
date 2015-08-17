# `query` block example

``` js
var sql = jsonSql.build({
    query: {type: 'select', table: 'table'}
});
```

Result:

``` js
sql.query
// select * from (select * from "table");

sql.values
// {}
```
