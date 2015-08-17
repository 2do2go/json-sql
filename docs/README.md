# Documentation

## Table of contents

* __[API](#api)__
    - [Initialization](#initialization)
    - [build(query)](#buildquery)
    - [configure(options)](#configureoptions)
    - [setDialect(name)](#setdialectname)
* __[Queries](#queries)__
    - [type: 'select'](#type-select)
    - [type: 'insert'](#type-insert)
    - [type: 'update'](#type-update)
    - [type: 'remove'](#type-remove)
    - [type: 'union' | 'intersect' | 'except'](#type-union--intersect--except)
* __[Blocks](#blocks)__

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

`options` are similar to [configure method options](#available-options).

### build(query)

Create sql query from mongo-style query object.

`query` is a json object that has required property `type` and a set of query-specific properties. `type` property determines the type of query. List of available values of `type` property you can see at [Queries section](#queries).

Returns object with properties:

| Property | Description |
| -------- | ----------- |
| `query` | SQL query string |
| `value` | Array or object with values.<br>Exists only if `separatedValues = true`. |
| `prefixValues()` | Method to get values with `valuesPrefix`.<br>Exists only if `separatedValues = true`. |
| `getValuesArray` | Method to get values as array.<br>Exists only if `separatedValues = true`. |
| `getValuesObject` | Method to get values as object.<br>Exists only if `separatedValues = true`. |

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

## Queries

### type: 'select'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[ [distinct](#distinct) ]<br>
>[ [fields](#fields) ]<br>
>[table](#table) | query | select | expression<br>
>[ [alias](#alias) ]<br>
>[ join ]<br>
>[ condition ]<br>
>[ group ]<br>
>[ sort ]<br>
>[ limit ]<br>
>[ offset ]<br>

[Example](/examples/queries/select.md)

### type: 'insert'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[ or ]<br>
>[table](#table)<br>
>values<br>
>[ condition ]<br>
>[ returning ]

[Example](/examples/queries/insert.md)

### type: 'update'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[ or ]<br>
>[table](#table)<br>
>modifier<br>
>[ condition ]<br>
>[ returning ]

[Example](/examples/queries/update.md)

### type: 'remove'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[table](#table)<br>
>[ condition ]<br>
>[ returning ]

[Example](/examples/queries/remove.md)

### type: 'union' | 'intersect' | 'except'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>queries<br>
>[ sort ]<br>
>[ limit ]<br>
>[ offset ]

Examples: [union](/examples/queries/union.md), [intersect](/examples/queries/intersect.md), [except](/examples/queries/except.md)

## Blocks

#### with, withRecursive

Should be an `array` or an `object`.

If value is an `array`, each item of array should be an `object` and should conform the scheme:

>name<br>
>[ [fields](#fields) ]<br>
>query | select | expression

[Example](/examples/blocks/with.md#example-1---array)

If value is an `object`, keys of object interpret as names and each value should be an `object` and should conform the scheme:

>[ name ]<br>
>[ [fields](#fields) ]<br>
>query | select | expression

[Example](/examples/blocks/with.md#example-2---object)

#### distinct

Should be a `boolean`:

```
distinct: true
```

[Example](/examples/blocks/distinct.md)

#### fields

Should be an `array` or an `object`.

If value is an `array`, each item interprets as [field block](#field).

[Example](/examples/blocks/fields.md)

If value is an `object`, keys of object interpret as field names and each value should be an `object` and should conform the scheme:

>[ [table](#table) ]<br>
>[ cast ]<br>
>[ [alias](#alias) ]

[Example](/examples/blocks/fields.md)

#### field

Should be:
* a `string` - interprets as field name;
* an other simple type or an `array` - interprets as value;
* an `object` - should conform the scheme:

>query | select | [field](#field) | value | name | func | expression<br>
>[ [table](#table) ]<br>
>[ cast ]<br>
>[ [alias](#alias) ]

#### table

Should be a `string`:

```
table: 'tableName'
```

[Example](/examples/blocks/table.md)

#### alias

Should be a `string` or an `object`.

If value is a `string`:

```
alias: 'aliasName'
```

[Example](/examples/blocks/alias.md)

If value is an `object` it should conform the scheme:

>name<br>
>[ columns ]

[Example](/examples/blocks/alias.md)