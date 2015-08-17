# Modifier

## Example 1 - default modifier

Query:

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
// update "table" set "a" = 5;

sql.values
// {}
```

## Example 2 - specific modifiers

Query:

``` js
var sql = jsonSql.build({
    type: 'update',
    table: 'table',
    modifier: {
        $set: {a: 5},
        $default: {b: true},
        $inc: {c: 10}
    }
});
```

Result:

``` js
sql.query
// update "table" set "a" = 5, "b" = default, "c" = "c" + 10;

sql.values
// {}
```
