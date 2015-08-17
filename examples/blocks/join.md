# `join` block example

## Example 1 - array

``` js
var sql = jsonSql.build({
    table: 'table',
    join: [{
        type: 'right',
        table: 'joinTable',
        on: {'table.a': 'joinTable.b'}
    }]
});
```

Result:

``` js
sql.query
// select * from "table" right join "joinTable" on "table"."a" = "joinTable"."b";

sql.values
// {}
```

## Example 2 - object

``` js
var sql = jsonSql.build({
    table: 'table',
    join: {
        joinTable: {
            type: 'inner',
            on: {'table.a': 'joinTable.b'}
        }
    }]
});
```

Result:

``` js
sql.query
// select * from "table" inner join "joinTable" on "table"."a" = "joinTable"."b";

sql.values
// {}
```

### Example 3 - join with subselect

``` js
var sql = jsonSql.build({
    table: 'table',
    join: [{
        select: {table: 'joinTable'},
        alias: 'joinTable',
        on: {'table.a': 'joinTable.b'}
    }]
});
```

Result:

``` js
sql.query
// select * from "table" join (select * from "joinTable") as "joinTable" on "table"."a" = "joinTable"."b";

sql.values
// {}
```
