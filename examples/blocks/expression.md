# Expression block example

Query:

``` js
var sql = jsonSql.build({
    expression: {
        pattern: 'generate_series({start}, {stop})',
        values: {start: 2, stop: 4}
    }
});
```

Result:

``` js
sql.query
// select * from generate_series(2, 4);

sql.values
// {}
```
