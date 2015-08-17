# `with`, `withRecursive` blocks example

## Example 1 - array

``` js
var sql = jsonSql.build({
    'with': [{
        name: 'table',
        select: {table: 'withTable'}
    }],
    table: 'table'
});
```

Result:

``` js
sql.query
// with "table" as (select * from "withTable") select * from "table";

sql.values
// {}
```

## Example 2 - object

``` js
var sql = jsonSql.build({
    'with': {
        table: {
            select: {table: 'withTable'}
        }
    },
    table: 'table'
});
```

Result:

``` js
sql.query
// with "table" as (select * from "withTable") select * from "table";

sql.values
// {}
```

## Example 3 - with recursive

``` js
var sql = jsonSql.build({
    withRecursive: [{
        name: 'table',
        select: {table: 'withTable'}
    }],
    table: 'table'
});
```

Result:

``` js
sql.query
// with recursive "table" as (select * from "withTable") select * from "table";

sql.values
// {}
```
