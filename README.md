# eslint-plugin-grouped-imports

Plugin to group and sort ES6 imports in any order

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-grouped-imports`:

```
$ npm install eslint-plugin-grouped-imports --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-custom-impors-sort` globally.

## Usage

Add `grouped-imports` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "grouped-imports"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "grouped-imports/order": 2
    }
}
```

## Supported Rules

- [`grouped-imports/order`](docs/rules/order.md) - allows you to group imports and sort groups





