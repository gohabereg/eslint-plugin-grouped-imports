# Specify groups and order of imports (order)

Allow you to group imports and specify groups order

## Rule Details

With specified order: `['/^atoms/', '/^molecules/', '/^organisms/', 'utils']`

Examples of **incorrect** code for this rule:

```js
import Organism from 'organisms/Organism'; // organism should go last
import Atom from 'atoms/Atom';
import Molecule from 'molecules/Molecule';
import utils from  'utils';
```

Examples of **correct** code for this rule:

```js
import Atom from 'atoms/Atom';
import Molecule from 'molecules/Molecule';
import Organism from 'organisms/Organism';
import utils form 'utils';
```

### Options

Plugin accepts an object as option:

```json
{
    "grouped-imports/order": ["error", {
        "order": ["some", "/^order/", "with", "grouped", "section"],
        "groups": {
            "grouped": ["some", "nested", "group"]
        },
        "empty-line-between-groups": true,
        "ignore-in-group-sort": true,
        "ignore-alphabetical-sort": true,
        "ignore-members-sort": true 
    }]
}
```

#### `order`

The list of strings or RegExp expressions to specify import groups and their order.

For each import in your files plugin will try to find corresponding group. 

If group is a string, import source will be just compared to string:

```js
// order: ['atoms']

import * as Atoms from 'atoms'; // import is in group
import Button from 'atoms/Button'; // import is not in group as 'atoms/Button' !== 'atoms'
```

If group is a regex, import source will be tested by this regex:

```js
// order: ['/^atoms/']

// Both imports in group as they both match regex
import * as Atoms from 'atoms'; 
import Button from 'atoms/Button';
```

By default, imports which don't match any group should go after all other imports,
but you can specify place for them using `everything-else` keyword:


Default:

```js
// order: ['/^atoms/']

import * as Atoms from 'atoms'; 
import utils from 'utils'; // everything-else goes last
```

With `everything-else`:

```js
// order: ['everything-else', /^atoms/']

import utils from 'utils';
import * as Atoms from 'atoms'; 
```

#### `groups`

Using `groups` option you can specify sub-group:

```json
{
  "order": ["/^atoms/", "molecules"],
  "groups": {
    "molecules": ["/^molecules/", "/^external\/molecules/"]
  }
}
```

#### 'empty-line-between-group'

If `true`, empty line between groups required (`false` by defualt):

```js
// order: ['atoms', 'molecules']
// empty-line-between-group: false

import * as Atoms from 'atoms';
import * as Molecules from 'molecules';
```

```js
// order: ['atoms', 'molecules']
// empty-line-between-group: true

import * as Atoms from 'atoms';

import * as Molecules from 'molecules';
```

#### `ignore-in-group-sort`

By default, imports in sub-groups are sorted in the order they listed in sub-group definition.
You can ignore that behaviour by `ignore-in-group-sort` option (`false` by default).

```json
{
  "order": ["/^atoms/", "molecules"],
  "groups": {
    "molecules": ["/^molecules/", "/^external\/molecules/"]
  }
}
```


```js
// ignore-in-group-sort: false

// Not ok as 'external/molecules' should go after 'molecules'
import ExternalMolecules from 'external/molecules';
import Molecules from 'molecules';
```

```js
// ignore-in-group-sort: true

// Ok as sort is ignored
import ExternalMolecules from 'external/molecules';
import Molecules from 'molecules';
```

#### `ignore-alphabetical-sort`

By default, imports in groups (and sub-groups) are sorted in the alphabetical order of first import specifier.
You can ignore that behaviour by `ignore-alphabetical-sort` option (`false` by default).

```js
// ignore-alphabetical-sort: false

// Not ok as Icon should go after Button in alphabetical order
import Icon from 'atoms/Icon';
import Button from 'atoms/Button';
```

```js
// ignore-alphabetical-sort: true

// Ok as sort is ignored
import Icon from 'atoms/Icon';
import Button from 'atoms/Button';
```

#### `ignore-members-sort`

By default, import specifiers sorted in the alphabetical order.
You can ignore that behaviour by `ignore-members-sort` option (`false` by default).


```js
// ignore-members-sort: false

// Not ok as Button should go before Icon in alphabetical order
import { Icon, Button } from 'atoms';
```

```js
// ignore-alphabetical-sort: true

// Ok as sort is ignored
import { Icon, Button } from 'atoms/Icon';
```