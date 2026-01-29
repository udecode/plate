import { Node, Attribute } from '@core/index.js';
import { findParentNode } from '@helpers/index.js';
import { toggleList } from '@core/commands/index.js';
import { InputRule } from '@core/InputRule.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';

const inputRegex = /^(\d+)\.\s$/;

export const OrderedList = Node.create({
  name: 'orderedList',

  group: 'block list',

  selectable: false,

  content() {
    return `${this.options.itemTypeName}+`;
  },

  addOptions() {
    return {
      itemTypeName: 'listItem',
      htmlAttributes: {
        'aria-label': 'Ordered list node',
      },
      keepMarks: true,
      keepAttributes: false,
      listStyleTypes: ['decimal', 'lowerAlpha', 'lowerRoman'],
    };
  },

  addAttributes() {
    return {
      order: {
        default: 1,
        parseDOM: (element) => {
          return element.hasAttribute('start') ? parseInt(element.getAttribute('start') || '', 10) : 1;
        },
        renderDOM: (attrs) => {
          return {
            start: attrs.order,
          };
        },
      },

      sdBlockId: {
        default: null,
        keepOnSplit: false,
        parseDOM: (elem) => elem.getAttribute('data-sd-block-id'),
        renderDOM: (attrs) => {
          return attrs.sdBlockId ? { 'data-sd-block-id': attrs.sdBlockId } : {};
        },
      },

      syncId: {
        default: null,
        parseDOM: (elem) => elem.getAttribute('data-sync-id'),
        renderDOM: (attrs) => {
          if (!attrs.syncId) return {};
          return {
            'data-sync-id': attrs.syncId,
          };
        },
        // rendered: false,
      },

      listId: {
        keepOnSplit: true,
        parseDOM: (elem) => elem.getAttribute('data-list-id'),
        renderDOM: (attrs) => {
          if (!attrs.listId) return {};
          return {
            'data-list-id': attrs.listId,
          };
        },
      },

      'list-style-type': {
        default: 'decimal',
        rendered: false,
      },

      attributes: {
        rendered: false,
        keepOnSplit: true,
      },
    };
  },

  parseDOM() {
    return [{ tag: 'ol' }];
  },

  renderDOM({ htmlAttributes }) {
    const { start, ...restAttributes } = htmlAttributes;

    return start === 1
      ? ['ol', Attribute.mergeAttributes(this.options.htmlAttributes, restAttributes), 0]
      : ['ol', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addCommands() {
    return {
      toggleOrderedList: () => (params) => {
        return toggleList(this.type)(params);
      },

      restartListNodes:
        (followingNodes, pos) =>
        ({ tr }) => {
          let currentNodePos = pos;
          const nodes = followingNodes.map((node) => {
            const resultNode = {
              node,
              pos: currentNodePos,
            };

            currentNodePos += node.nodeSize;
            return resultNode;
          });

          nodes.forEach((item) => {
            const { pos } = item;
            const newPos = tr.mapping.map(pos);

            tr.setNodeMarkup(newPos, undefined, {});
          });

          return true;
        },

      /**
       * Updates ordered list style type when sink or lift `listItem`.
       * @example 1,2,3 -> a,b,c -> i,ii,iii -> 1,2,3 -> etc
       */
      updateOrderedListStyleType:
        () =>
        ({ dispatch, tr }) => {
          let list = findParentNode((node) => node.type.name === this.name)(tr.selection);

          if (!list) {
            return true;
          }

          if (dispatch) {
            // Each list level increases depth by 2.
            let listLevel = (list.depth - 1) / 2;
            let listStyleTypes = this.options.listStyleTypes;
            let listStyle = listStyleTypes[listLevel % listStyleTypes.length];
            let currentListStyle = list.node.attrs['list-style-type'];
            let nodeAtPos = tr.doc.nodeAt(list.pos);

            if (currentListStyle !== listStyle && nodeAtPos.eq(list.node)) {
              tr.setNodeMarkup(list.pos, undefined, {
                ...list.node.attrs,
                ...{
                  'list-style-type': listStyle,
                },
              });
            }
          }

          return true;
        },
    };
  },

  addShortcuts() {
    return {
      'Mod-Shift-7': () => {
        return this.editor.commands.toggleOrderedList();
      },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        match: inputRegex,
        handler: ({ state, range }) => {
          // Check if we're currently inside a list item
          const $pos = state.selection.$from;
          const listItemType = state.schema.nodes.listItem;

          // Look up the tree to see if we're inside a list item
          for (let depth = $pos.depth; depth >= 0; depth--) {
            if ($pos.node(depth).type === listItemType) {
              // We're inside a list item, don't trigger the rule
              return null;
            }
          }

          // Not inside a list item, proceed with creating new list
          const { tr } = state;
          tr.delete(range.from, range.to);

          ListHelpers.createNewList({
            listType: this.type,
            tr,
            editor: this.editor,
          });
        },
      }),
    ];
  },
});
