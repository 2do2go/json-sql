# `type: update` query example

``` js
var sql = jsonSql.build({
    type: 'update',
    table: 'table',
    modifier: {a: 5}
});
```

Result:

``` js
sql.query
// update "table" set a = 5;

sql.values
// {}
```
