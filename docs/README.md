# Documentation

## API

### Initialization

To create new instance of json-sql builder you can use factory function:

``` js
var jsonSql = require('json-sql')(options);
```

or create instance by class constructor:

``` js
var jsonSql = new (require('json-sql').Builder)(options);
```

Options are similar to configure method options.

### configure(options)

Set options of json-sql builder instance.

#### Available options

| Option name | Default value | Description |
| ----------- | ------------- | ----------- |
| `separatedValues` | `true` | If `true` - create placeholder for each string value and put it value to result `values`.<br>If `false` - put string values into sql query without placeholder (potential threat of sql injection). |
| `namedValues` | `true` | If `true` - create hash of values with placeholders p1, p2, ...<br>If `false` - put all values into array.<br>Option is used if `separatedValues = true`. |
| `valuesPrefix` | `'$'` | Prefix for values placeholders<br>Option is used if `namedValues = true`. |
| `dialect` | `'base'` | Active dialect. See setDialect for dialects list. |
| `wrappedIdentifiers` | `true` | If `true` - wrap all identifiers with dialect wrapper (name -> "name"). |

### setDialect(name)

Set active dialect, name can has value `'base'`, `'mssql'`, `'mysql'`, `'postrgresql'` or `'sqlite'`.

### build(query)

Create sql query from mongo-style query object.

Query is generated from template. Template is a set of blocks, where some blocks have own sub-templates. Most of blocks are optional.
See list of available templates and blocks below.

Return object with properties:

| Property | Description |
| -------- | ----------- |
| `query` | SQL query string |
| `value` | Array or object with values.<br>Exists only if `separatedValues = true`. |
| `prefixValues()` | Method to get values with `valuesPrefix`.<br>Exists only if `separatedValues = true`. |
| `getValuesArray` | Method to get values as array.<br>Exists only if `separatedValues = true`. |
| `getValuesObject` | Method to get values as object.<br>Exists only if `separatedValues = true`. |

## Query types

### select

Template for select queries.

__template:__ `{with} {withRecursive} select {distinct} {fields} from {table} {query} {select} {expression} {alias} {join} {condition} {group} {sort} {limit} {offset}`

### insert

Template for insert queries.

__template:__ `{with} {withRecursive} insert {or} into {table} {values} {condition} {returning}`

### update

Template for update queries.

__template:__ `{with} {withRecursive} update {or} {table} {modifier} {condition} {returning}`

### remove

Template for remove queries.

__template:__ `{with} {withRecursive} delete from {table} {condition} {returning}`

### union / intersect / except

Template for union, intersect and except queries.

__template:__ `{with} {withRecursive} {queries} {sort} {limit} {offset}`

### Auxiliary templates

Templates below are used inside of blocks:

### subQuery

Template is used to build subqueries.

__template:__ `({queryBody})`

### insertValues

Template is used by `values` block.

__template:__ `({fields}) values {fieldValues}`

### joinItem

Template is used by `join` block to build each item.

__template:__ `{type} join {table} {query} {select} {expression} {alias} {on}`

### withItem

Template is used by `with` and `withRecursive` blocks to build each item.

__template:__ `{name} {fields} as {query} {select} {expression}`