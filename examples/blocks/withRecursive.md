# With (recursive)

## Example 1 - array

Query:

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


## Example 2 - object

Query:

``` js
var sql = jsonSql.build({
    withRecursive: {
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
// with recursive "table" as (select * from "withTable") select * from "table";

sql.values
// {}
```
