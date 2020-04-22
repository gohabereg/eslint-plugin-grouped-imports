/**
 * @file Specify the order of imports
 * @author Georgy
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/order'), RuleTester = require('eslint').RuleTester;
const stripIndent = require('strip-indent');
const strip = ([str]) => stripIndent(str);


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      modules: true,
    },
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
});

const ignoreAllOptions = {
  'ignore-in-group-sort': true,
  'ignore-alphabetical-sort': true,
  'ignore-members-sort': true,
};

ruleTester.run('order', rule, {

  valid: [
    /**
     * Check basic sort by specified order
     */
    {
      code: strip`
        import Button from 'Button';
        import UserCard from 'UserCard';
        import UserProfile from 'UserProfile';
      `,
      options: [ {
        order: ['Button', 'UserCard', 'UserProfile'],
        ...ignoreAllOptions,
      } ],
    },
    /**
     * Check basic sort by specified order with regexps
     */
    {
      code: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
    },
    /**
     * Check basic sort by specified order with not represented group
     */
    {
      code: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', 'notPresentedGroup', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
    },
    /**
     * Check basic sort by specified order with imports not related to any group
     */
    {
      code: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
        import SomeUtil from 'utils';
      `,
      options: [ {
        order: ['Button', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
    },
    /**
     * Check basic sort by specified order with specified everything-else group
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', 'everything-else', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
    },
    /**
     * Check basic sort by specified order with required empty lines between groups
     */
    {
      code: strip`
        import Button from 'Button';

        import SomeUtil from 'utils';

        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', 'everything-else', '/^atoms/'],
        'empty-line-between-groups': true,
        ...ignoreAllOptions,
      } ],
    },
    /**
     * Check basic sort by specified order with alphabetic in-group sort
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';

        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['everything-else', '/^atoms/'],
        'ignore-members-sort': true,
      } ],
    },
    /**
     * Check basic sort by specified order with alphabetic members sort
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';

        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['everything-else', '/^atoms/'],
      } ],
    },
    /**
     * Check basic sort by specified order with specified groups with ignored in-group sort
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';

        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['everything-else', 'atoms'],
        groups: {
          atoms: ['atoms/UserProfile', 'atoms/UserCard'],
        },
        'ignore-in-group-sort': true,
      } ],
    },
    /**
     * Check basic sort by specified order with specified groups with not ignored in-group sort
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';

        import UserProfile from 'atoms/UserProfile';
        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
      `,
      options: [ {
        order: ['everything-else', 'atoms'],
        groups: {
          atoms: ['atoms/UserProfile', 'atoms/UserCard'],
        },
      } ],
    },
    /**
     * Check basic sort by specified order with specified groups with regexp options in group
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';

        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['everything-else', 'atoms'],
        groups: {
          atoms: ['/^atoms/'],
        },
      } ],
    },
  ],

  invalid: [
    /**
     * Check basic sort by specified order
     */
    {
      code: strip`
        import Button from 'Button';
        import UserProfile from 'UserProfile';
        import UserCard from 'UserCard';
      `,
      options: [ {
        order: ['Button', 'UserCard', 'UserProfile'],
        ...ignoreAllOptions,
      } ],
      errors: [
        {
          message: 'Expected import from \'UserCard\' to come before import from \'UserProfile\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import UserCard from 'UserCard';
        import UserProfile from 'UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with regexps
     */
    {
      code: strip`
        import UserCard from 'atoms/UserCard';
        import Button from 'Button';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
      errors: [
        {
          message: 'Expected import from \'Button\' to come before import from \'atoms/UserCard\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with not represented group
     */
    {
      code: strip`
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
        import Button from 'Button';
      `,
      options: [ {
        order: ['Button', 'notPresentedGroup', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
      errors: [
        {
          message: 'Expected import from \'Button\' to come before import from \'atoms/UserCard\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with imports not related to any group
     */
    {
      code: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import SomeUtil from 'utils';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
      errors: [
        {
          message: 'Expected import from \'atoms/UserProfile\' to come before import from \'utils\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
        import SomeUtil from 'utils';
      `,
    },
    /**
     * Check basic sort by specified order with specified everything-else group
     */
    {
      code: strip`
        import Button from 'Button';
        import UserCard from 'atoms/UserCard';
        import SomeUtil from 'utils';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', 'everything-else', '/^atoms/'],
        ...ignoreAllOptions,
      } ],
      errors: [
        {
          message: 'Expected import from \'utils\' to come before import from \'atoms/UserCard\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with required empty lines between groups
     */
    {
      code: strip`
        import Button from 'Button';

        import SomeUtil from 'utils';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['Button', 'everything-else', '/^atoms/'],
        'empty-line-between-groups': true,
        ...ignoreAllOptions,
      } ],

      errors: [
        {
          message: 'Expected an empty line before import from \'atoms/UserCard\'.',
        },
      ],
      output: strip`
        import Button from 'Button';

        import SomeUtil from 'utils';

        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with alphabetic in-group sort
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserProfile from 'atoms/UserProfile';
        import UserCard from 'atoms/UserCard';
      `,
      options: [ {
        order: ['everything-else', '/^atoms/'],
        'ignore-members-sort': true,
      } ],
      errors: [
        {
          message: 'Expected import from \'atoms/UserCard\' to come before import from \'atoms/UserProfile\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserCard from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with alphabetic members sort
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserCard, {UserImage, UserEmail} from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['everything-else', '/^atoms/'],
      } ],
      errors: [
        {
          message: 'Member \'UserImage\' of the import declaration should be sorted alphabetically.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
    },
    /**
     * Check basic sort by specified order with specified groups
     */
    {
      code: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
        import UserProfile from 'atoms/UserProfile';
      `,
      options: [ {
        order: ['everything-else', 'atoms'],
        groups: {
          atoms: ['atoms/UserProfile', 'atoms/UserCard'],
        },
      } ],
      errors: [
        {
          message: 'Expected import from \'atoms/UserProfile\' to come before import from \'atoms/UserCard\'.',
        },
      ],
      output: strip`
        import Button from 'Button';
        import SomeUtil from 'utils';
        import UserProfile from 'atoms/UserProfile';
        import UserCard, {UserEmail, UserImage} from 'atoms/UserCard';
      `,
    },
  ],
});
