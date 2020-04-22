/**
 * @file Specify the order of imports
 * @author Georgy Berezhnoy
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const OPTIONS = {
  order: 'order',
  groups: 'groups',
  emptyLines: 'empty-line-between-groups',
  ignoreAlphabeticalSort: 'ignore-alphabetical-sort',
  ignoreInGroupSort: 'ignore-in-group-sort',
  ignoreMembersSort: 'ignore-members-sort',
};

module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Rule to follow custom imports order',
      recommended: false,
    },
    fixable: 'code',  // or "code" or "whitespace"
    schema: [
      // fill in your schema
      {
        type: 'object',
        properties: {
          order: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          groups: {
            type: 'object',
          },
          [OPTIONS.emptyLines]: {
            type: 'boolean',
          },
          [OPTIONS.ignoreMembersSort]: {
            type: 'boolean',
          },
          [OPTIONS.ignoreInGroupSort]: {
            type: 'boolean',
          },
          [OPTIONS.ignoreAlphabeticalSort]: {
            type: 'boolean',
          },
        },
        required: [ 'order' ],
        additionalProperties: false,
      },
    ],
  },

  create: function (context) {
    // variables should be defined here

    const EVERYTHING_ELSE_GROUP = 'everything-else';
    const nodes = [];
    const options = context.options[0] || {};
    const userSpecifiedOrder = options[OPTIONS.order] || [];
    const userSpecifiedGroups = options[OPTIONS.groups] || {};
    const sourceCode = context.getSourceCode();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    // any helper functions should go here or else delete this section
    /**
     * Returns true if there is an empty line between nodes
     *
     * @param {ImportDeclaration} firstNode - import declaration AST node
     * @param {ImportDeclaration} secondNode - import declaration AST node
     *
     * @returns {boolean}
     */
    function isLineBetween(firstNode, secondNode) {
      return Math.abs(firstNode.loc.end.line - secondNode.loc.start.line) > 1;
    }

    /**
     * Checks if passed string match /(*.)/ pattern which means regexp
     *
     * @param {string} value - string to check
     *
     * @returns {boolean}
     */
    function isRegExp(value) {
      return /^\/(.*)\/$/.test(value);
    }

    /**
     * Finds index of group import source matches
     *
     * @param {string} source - import declaration source module name
     *
     * @returns {number}
     */
    function getSourceGroupIndex(source) {
      return userSpecifiedOrder.findIndex(option => {
        if (option in userSpecifiedGroups) {
          return userSpecifiedGroups[option].some(groupOption => checkSourceMatchesGroup(source, groupOption));
        }

        return checkSourceMatchesGroup(source, option);
      });
    }

    /**
     * Get index of pattern in group source matches
     *
     * @param {string} groupName - group to check
     * @param {string} source - import declaration source module name
     *
     * @returns {boolean}
     */
    function getSourceIndexInGroup(groupName, source) {
      return userSpecifiedGroups[groupName].findIndex(option => {
        return checkSourceMatchesGroup(source, option);
      });
    }

    /**
     * User can specify 'everything-else' group for imports which don't match any group.
     * If 'everything-else' is not specified, by default it is the last group
     *
     * @returns {number}
     */
    function getEverythingElseGroupIndex() {
      const userSpecified = userSpecifiedOrder.indexOf(EVERYTHING_ELSE_GROUP);

      return userSpecified === -1 ? userSpecifiedOrder.length : userSpecified;
    }

    /**
     * Get some useful data from AST node
     *
     * @param {ImportDeclaration} node - import declaration node
     *
     * @returns {object}
     */
    function getNodeData(node) {
      const text = sourceCode.getText(node);
      const source = node.source.value;

      const indexOfGroup = getSourceGroupIndex(source);

      let indexInGroup;

      if (userSpecifiedOrder[indexOfGroup] in userSpecifiedGroups) {
        indexInGroup = getSourceIndexInGroup(userSpecifiedOrder[indexOfGroup], source);
      }

      return {
        node,
        text,
        source,
        indexOfGroup,
        indexInGroup,
      };
    }

    /**
     * Gets name of first import member in import declaration
     * If import doesn't have any members (`import 'styles.css'`), returns import source module name
     *
     * @param {ImportDeclaration} node - AST import declaration node
     *
     * @returns {string}
     */
    function getMemberName(node) {
      const member = node.specifiers[0];
      let memberName;

      if (member) {
        memberName = member.local.name;
      }

      return memberName;
    }

    //----------------------------------------------------------------------
    // Checks
    //----------------------------------------------------------------------


    /**
     * Checks if import declaration source matches one of the specified groups
     *
     * @param {string} source - import declaration source module name
     * @param {string} group - group to match
     *
     * @returns {boolean}
     */
    function checkSourceMatchesGroup(source, group) {
      if (isRegExp(group)) {
        const regex = new RegExp(group.slice(1, -1));

        return regex.test(source);
      }

      if (!(group in userSpecifiedGroups)) {
        return group === source;
      }

      return false;
    }

    /**
     * Checks imports order to follow specified groups
     */
    function checkGroupsOrder() {
      const firstNodeInGroup = [];
      const groups = [];

      const nodesData = nodes.map(node => {
        const data = getNodeData(node);
        let {indexOfGroup} = data;

        if (indexOfGroup === -1) {
          data.indexOfGroup = indexOfGroup = getEverythingElseGroupIndex();
        }

        groups[indexOfGroup] = [...(groups[indexOfGroup] || []), node];

        if (!firstNodeInGroup[indexOfGroup]) {
          firstNodeInGroup[indexOfGroup] = data;
        }

        return data;
      });

      nodesData.forEach((nodeData, i) => {
        const {indexOfGroup} = nodeData;
        const indexOfNodeData = nodesData.indexOf(nodeData);
        let indexOfFirstImportInNextGroup = -1;

        nodesData.forEach(
          (d, j) => {
            if (j > indexOfNodeData) {
              return false;
            }

            if (d.indexOfGroup > indexOfGroup && (
              indexOfFirstImportInNextGroup === -1 ||
              d.indexOfGroup < nodesData[indexOfFirstImportInNextGroup].indexOfGroup
            )) {
              indexOfFirstImportInNextGroup = j;
            }
          }
        );

        if (indexOfFirstImportInNextGroup !== -1 && indexOfFirstImportInNextGroup < i) {
          reportWrongOrder(nodes[i], nodes[indexOfFirstImportInNextGroup]);
        }

        if (
          i !== 0 &&
                    nodeData === firstNodeInGroup[indexOfGroup] &&
                    !isLineBetween(nodes[i], nodes[i - 1])
        ) {
          reportRequiredEmptyLine(nodes[i]);
        }
      });

      checkOrderInGroups(groups);
    }

    /**
     * Checks imports order to follow alphabetical sort within a group
     *
     * @param {Array<Array<ImportDeclaration>>} groups - groups of AST import declaration nodes
     */
    function checkOrderInGroups(groups) {
      groups.forEach(group => {
        const nodesData = group.map(n => getNodeData(n));

        nodesData.forEach((nodeData, i) => {
          const {indexInGroup} = nodeData;

          /**
           * If index in group is undefined, that means import is not in specified group
           */
          if (indexInGroup === undefined || options[OPTIONS.ignoreInGroupSort]) {
            return;
          }

          const indexOfNodeData = nodesData.indexOf(nodeData);
          let nextImportInGroupIndex = -1;

          nodesData.forEach(
            (d, j) => {
              if (j > indexOfNodeData) {
                return;
              }

              if (d.indexInGroup > indexInGroup &&(
                nextImportInGroupIndex === -1 ||
                d.indexInGroup < nodesData[nextImportInGroupIndex].indexInGroup
              )) {
                nextImportInGroupIndex = j;
              }
            }
          );

          if (nextImportInGroupIndex !== -1 && nextImportInGroupIndex < i) {
            reportWrongOrder(nodeData.node, nodesData[nextImportInGroupIndex].node);
          }
        });

        const members = group.map(n => {
          const name = getMemberName(n);

          if (name) {
            return name;
          }

          return String.fromCharCode('z'.charCodeAt(0) + 1);
        });

        group.forEach((node, i) => {
          checkMembersOrder(node);

          if (options[OPTIONS.ignoreAlphabeticalSort]) {
            return;
          }

          if (i === 0) {
            return;
          }

          const member = getMemberName(node);

          if (!member) {
            return;
          }

          const indexOfMember = members.indexOf(member);
          let lastBiggerWordIndex = -1;

          members.forEach(
            (s, j) => {
              if (j > indexOfMember) {
                return;
              }

              if (nodesData[i].indexInGroup !== undefined && nodesData[i].indexInGroup !== nodesData[j].indexInGroup) {
                return;
              }

              if (s > member) {
                lastBiggerWordIndex = j;
              }
            }
          );

          if (lastBiggerWordIndex !== -1 && lastBiggerWordIndex < indexOfMember) {
            reportWrongOrder(node, group[lastBiggerWordIndex]);
          }
        });
      });
    }

    /**
     * Checks import declaration members to follow alphabetical order
     *
     * @param {ImportDeclaration} node - import declaration AST node
     */
    function checkMembersOrder(node) {
      if (options[OPTIONS.ignoreMembersSort]) {
        return;
      }

      const members = node.specifiers;

      if (!members.length) {
        return;
      }

      const hasDefaultMember = members[0].type === 'ImportDefaultSpecifier';

      const names = members
        .slice(hasDefaultMember ? 1 : 0)
        .map(s => s.local.name);

      if (!names.length) {
        return;
      }

      const sortedNames = [ ...names ].sort();

      names.some((n, i) => {
        if (n !== sortedNames[i]) {
          reportWrongMembersOrder(members[i + (hasDefaultMember ? 1 : 0)]);

          return true;
        }
      });
    }

    //----------------------------------------------------------------------
    // Reports
    //----------------------------------------------------------------------

    /**
     * Reports wrong order of imports
     *
     * @param {ImportDeclaration} node - node that breaks the order
     * @param {ImportDeclaration} place - node before which current node should go
     */
    function reportWrongOrder(node, place) {
      context.report({
        node: node,
        message: 'Expected import from \'{{ current }}\' to come before import from \'{{ previous }}\'.',
        data: {
          current: node.source.value,
          previous: place.source.value,
        },
        fix: (fixer) => {
          /**
           * Fixes to apply
           *
           * 1. Insert copy of breaking node before correct node
           * 2. Remove old node
           */
          const fixes = [
            fixer.insertTextBefore(place, sourceCode.getText(node) + '\n'),
            fixer.remove(node),
          ];

          // Remove linebreak
          fixes[1].range[1] += 1;

          return fixes;
        },

      });
    }

    /**
     * Reports about empty line, required before group
     *
     * @param {ImportDeclaration} node - node that breaks the rule
     */
    function reportRequiredEmptyLine(node) {
      if (!options[OPTIONS.emptyLines]) {
        return;
      }

      context.report({
        node: node,
        message: 'Expected an empty line before import from \'{{ source }}\'.',
        data: {
          source: node.source.value,
        },
        fix: (fixer) => {
          /**
           * Fixes to apply
           *
           * 1. Insert empty line
           */
          return fixer.insertTextBefore(node, '\n');
        },
      });
    }

    /**
     * Reports about wrong import members order
     *
     * @param {ImportDeclaration} node - node whose members aren't sorted
     */
    function reportWrongMembersOrder(node) {
      const importDeclaration = node.parent;
      const specifiers = importDeclaration.specifiers;
      const hasDefaultSpecifier = specifiers[0].type === 'ImportDefaultSpecifier';

      const firstSpecifier = specifiers[hasDefaultSpecifier ? 1 : 0];
      const lastSpecifier = specifiers[specifiers.length - 1];

      const names = specifiers
        .slice(hasDefaultSpecifier ? 1 : 0)
        .map(s => s.local.name);
      const sortedNames = [ ...names ].sort();


      context.report({
        node: node,
        message: 'Member \'{{ specifier }}\' of the import declaration should be sorted alphabetically.',
        data: {
          specifier: node.local.name,
        },
        fix: (fixer) => {
          /**
           * Fixes to apply
           *
           * 1. Just get the right order of members and replace current one
           */
          return fixer.replaceTextRange([firstSpecifier.start, lastSpecifier.end], sortedNames.join(', '));
        },
      });
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      /**
       * Push each import declaration node to buffer
       *
       * @param {ImportDeclaration} node - import declaration AST node
       */
      ImportDeclaration(node) {
        nodes.push(node);
      },
      /**
       * Execute checks after whole file is parsed
       */
      'Program:exit'() {
        checkGroupsOrder();
      },
    };
  },
};
