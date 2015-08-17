# Insert query example

Query:

``` js
var sql = jsonSql.build({
    type: 'insert',
    table: 'table',
    values: {a: 4}
});
```

Result:

``` js
sql.query
// insert into "table" ("a") values (4);

sql.values
// {}
```
