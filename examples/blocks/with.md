# With

## Example 1 - array

Query:

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

Query:

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
