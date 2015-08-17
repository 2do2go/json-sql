# Returning block example

Query:

``` js
var sql = jsonSql.build({
    type: 'insert',
    table: 'table',
    values: {a: 5},
    returning: ['table.*']
});
```

Result:

``` js
sql.query
// insert into "table" ("a") values (5) returning "table".*;

sql.values
// {}
```
