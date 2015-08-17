# Fields

## Example 1 - without fields (*)

Query:

``` js
var sql = jsonSql.build({
    table: 'table'
});
```

Result:

``` js
sql.query
// select * from "table";

sql.values
// {}
```

## Example 2 - array

Query:

``` js
var sql = jsonSql.build({
    fields: [
        'a',
        {b: 'c'},
        {table: 'd', name: 'e', alias: 'f'},
        ['g']
    ],
    table: 'table'
});
```

Result:

``` js
sql.query
// select "a", "b" as "c", "d"."e" as "f", "g" from "table";

sql.values
// {}
```

## Example 3 - object

Query:

``` js
var sql = jsonSql.build({
    fields: {
        a: 'b',
        d: {table: 'c', alias: 'e'}
    },
    table: 'table'
});
```

Result:

``` js
sql.query
// select "a" as "b", "c"."d" as "e" from "table";

sql.values
// {}
```
