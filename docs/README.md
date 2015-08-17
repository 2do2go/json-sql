# Documentation

## Table of contents

* [API](#api)
    - [Initialization](#initialization)
    - __[build(query)](#buildquery)__
    - [configure(options)](#configureoptions)
    - [setDialect(name)](#setdialectname)
* __[Queries](#queries)__
    - [type: 'select'](#type-select)
    - [type: 'insert'](#type-insert)
    - [type: 'update'](#type-update)
    - [type: 'remove'](#type-remove)
    - [type: 'union' | 'intersect' | 'except'](#type-union--intersect--except)
* __[Blocks](#blocks)__

---

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

---

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

---

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

---

### setDialect(name)

Set active dialect, name can has value `'base'`, `'mssql'`, `'mysql'`, `'postrgresql'` or `'sqlite'`.

---

## Queries

### type: 'select'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[ [distinct](#distinct) ]<br>
>[ [fields](#fields) ]<br>
>[table](#table) | [query](#query) | [select](#select) | [expression](#expression)<br>
>[ [alias](#alias) ]<br>
>[ [join](#join) ]<br>
>[ [condition](#condition) ]<br>
>[ [group](#group) ]<br>
>[ [sort](#sort) ]<br>
>[ limit ]<br>
>[ offset ]<br>

[Example](/examples/queries/select.md)

---

### type: 'insert'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[ or ]<br>
>[table](#table)<br>
>values<br>
>[ [condition](#condition) ]<br>
>[ returning ]

[Example](/examples/queries/insert.md)

---

### type: 'update'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[ or ]<br>
>[table](#table)<br>
>modifier<br>
>[ [condition](#condition) ]<br>
>[ returning ]

[Example](/examples/queries/update.md)

---

### type: 'remove'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>[table](#table)<br>
>[ [condition](#condition) ]<br>
>[ returning ]

[Example](/examples/queries/remove.md)

---

### type: 'union' | 'intersect' | 'except'

>[ [with](#with-withrecursive) | [withRecursive](#with-withrecursive) ]<br>
>queries<br>
>[ [sort](#sort) ]<br>
>[ limit ]<br>
>[ offset ]

Examples: [union](/examples/queries/union.md), [intersect](/examples/queries/intersect.md), [except](/examples/queries/except.md)

---

## Blocks

#### with, withRecursive

Should be an `array` or an `object`.

If value is an `array`, each item of array should be an `object` and should conform the scheme:

>name<br>
>[ [fields](#fields) ]<br>
>[query](#query) | [select](#select) | [expression](#expression)

[Example](/examples/blocks/with.md#example-1---array)

If value is an `object`, keys of object interpret as names and each value should be an `object` and should conform the scheme:

>[ name ]<br>
>[ [fields](#fields) ]<br>
>[query](#query) | [select](#select) | [expression](#expression)

[Example](/examples/blocks/with.md#example-2---object)

---

#### distinct

Should be a `boolean`:

```
distinct: true
```

[Example](/examples/blocks/distinct.md)

---

#### fields

Should be an `array` or an `object`.

If value is an `array`, each item interprets as [field block](#field).

[Example](/examples/blocks/fields.md)

If value is an `object`, keys of object interpret as field names and each value should be an `object` and should conform the scheme:

>[ name ]<br>
>[ [table](#table) ]<br>
>[ cast ]<br>
>[ [alias](#alias) ]

[Example](/examples/blocks/fields.md)

---

#### field

Should be:
* a `string` - interprets as field name;
* an other simple type or an `array` - interprets as value;
* an `object` - should conform the scheme:

>[query](#query) | [select](#select) | [field](#field) | value | name | func | [expression](#expression)<br>
>[ [table](#table) ]<br>
>[ cast ]<br>
>[ [alias](#alias) ]

---

#### table

Should be a `string`:

```
table: 'tableName'
```

[Example](/examples/blocks/table.md)

---

#### query

Should be an `object`. Value interprets as sub-query and process recursively with [build(query)](#buildquery) method.

---

#### select

Should be an `object`. Value interprets as sub-select and process recursively with [build(query)](#buildquery) method.

---

#### expression

Should be a `string` or an `object`.

If value is a `string`:

```
expression: 'random()'
```

[Example](/examples/blocks/expression.md)

If value is an `object` it should conform the scheme:

>pattern<br>
>[ values ]

[Example](/examples/blocks/expression.md)

---

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

---

#### join

Should be an `array` or an `object`.

If value is an `array`, each item of array should be an `object` and should conform the scheme:

>[ type ]<br>
>[table](#table) | [query](#query) | [select](#select) | [expression](#expression)<br>
>[ [alias](#alias) ]<br>
>[ on ]

[Example](/examples/blocks/join.md#example-1---array)

If value is an `object`, keys of object interpret as table names and each value should be an `object` and should conform the scheme:

>[ type ]<br>
>[ [table](#table) | [query](#query) | [select](#select) | [expression](#expression) ]<br>
>[ [alias](#alias) ]<br>
>[ on ]

[Example](/examples/blocks/join.md#example-2---object)

---

#### condition

Should be an `array` or an `object`.

[Example](/examples/blocks/condition.md)

---

#### group

Should be a `string` or an `array`.

If value is a `string`:

```
group: 'groupName'
```

[Example](/examples/blocks/group.md)

If value is an `array`:

```
group: ['groupName1', 'groupName2']
```

[Example](/examples/blocks/group.md)

---

#### sort

Should be a `string`, an `array` or an `object`.

If value is a `string`:

```
sort: 'sortName'
```

[Example](/examples/blocks/sort.md)

If value is an `array`:

```
sort: ['sortName1', 'sortName2']
```

[Example](/examples/blocks/sort.md)

If value is an `object`:

```
sort: {
    sortName1: 1,
    sortName2: -1
}
```

[Example](/examples/blocks/group.md)