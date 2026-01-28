import { Node, Attribute } from '@core/index.js';
import { ListItemNodeView } from './ListItemNodeView.js';
import { generateOrderedListIndex } from '@helpers/orderedListUtils.js';
import { orderedListSync } from '../ordered-list/helpers/orderedListSyncPlugin.js';

export const ListItem = Node.create({
  name: 'listItem',

  content: 'paragraph* block*',

  defining: true,

  priority: 101, // to run listItem commands first

  addOptions() {
    return {
      htmlAttributes: {
        'aria-label': 'List item node',
      },
      bulletListTypeName: 'bulletList',
      orderedListTypeName: 'orderedList',
    };
  },

  parseDOM() {
    return [{ tag: 'li' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['li', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addPmPlugins() {
    return this.editor?.converter?.convertedXml ? [orderedListSync(this.editor)] : [];
  },

  /**
   * Important: The listItem node uses a custom node view.
   * @returns {import('@core/NodeView.js').NodeView}
   */
  addNodeView() {
    return ({ node, editor, getPos, decorations }) => {
      return new ListItemNodeView(node, getPos, decorations, editor);
    };
  },

  addAttributes() {
    return {
      // Virtual attribute.
      markerType: {
        default: null,
        renderDOM: (attrs) => {
          let { listLevel, listNumberingType, lvlText } = attrs;
          let hasListLevel = !!listLevel?.length;

          if (!hasListLevel || !lvlText) {
            return {};
          }

          // MS Word has many custom ordered list options.
          // We need to generate the correct index here.
          let orderMarker = generateOrderedListIndex({
            listLevel,
            lvlText,
            listNumberingType,
          });

          if (!orderMarker) return {};

          return {
            'data-marker-type': orderMarker,
          };
        },
      },

      lvlText: {
        default: null,
        keepOnSplit: true,
        parseDOM: (elem) => elem.getAttribute('data-lvl-text'),
        renderDOM: (attrs) => {
          if (!attrs.lvlText) return {};
          return {
            'data-lvl-text': attrs.lvlText,
          };
        },
      },

      listNumberingType: {
        default: null,
        keepOnSplit: true,
        parseDOM: (elem) => elem.getAttribute('data-num-fmt'),
        renderDOM: (attrs) => {
          if (!attrs.listNumberingType) return {};
          return {
            'data-num-fmt': attrs.listNumberingType,
          };
        },
      },

      listLevel: {
        default: null,
        parseDOM: (elem) => {
          let listLevel = elem.getAttribute('data-list-level');
          try {
            listLevel = JSON.parse(listLevel);
          } catch {}
          return listLevel;
        },
        renderDOM: (attrs) => {
          if (!attrs.listLevel) return {};
          return {
            'data-list-level': JSON.stringify(attrs.listLevel),
          };
        },
      },

      // JC = justification. Expect left, right, center
      lvlJc: {
        keepOnSplit: true,
        default: null,
        rendered: false,
      },

      // This will contain indentation and space info.
      // ie: w:left (left indent), w:hanging (hanging indent)
      listParagraphProperties: {
        keepOnSplit: true,
        default: null,
        rendered: false,
      },

      // This will contain run properties for the list item
      listRunProperties: {
        keepOnSplit: true,
        default: null,
        rendered: false,
      },

      numId: {
        keepOnSplit: true,
        default: null,
        parseDOM: (elem) => elem.getAttribute('data-num-id'),
        renderDOM: (attrs) => {
          if (!attrs.numId) return {};
          return {
            'data-num-id': attrs.numId,
          };
        },
      },

      numPrType: {
        rendered: false,
        default: 'inline',
        keepOnSplit: true,
      },

      level: {
        parseDOM: (elem) => {
          return elem.getAttribute('data-level');
        },
        renderDOM: (attrs) => {
          if (attrs.level === undefined || attrs.level === null) return {};
          return {
            'data-level': attrs.level,
          };
        },
      },

      attributes: {
        keepOnSplit: true,
        rendered: false,
      },

      spacing: {
        keepOnSplit: true,
        default: null,
        rendered: false,
      },

      indent: {
        parseDOM: (elem) => JSON.parse(elem.getAttribute('data-indent')),
        keepOnSplit: true,
        default: null,
        rendered: false,
      },

      markerStyle: {
        default: null,
        rendered: false,
        keepOnSplit: true,
      },

      styleId: {
        rendered: false,
        keepOnSplit: true,
      },

      customFormat: {
        default: null,
        rendered: false,
        keepOnSplit: true,
      },

      importedFontFamily: {
        parseDOM: (elem) => elem.getAttribute('data-font-family'),
        renderDOM: (attrs) => {
          if (!attrs.importedFontFamily) return {};
          return {
            'data-font-family': attrs.importedFontFamily,
          };
        },
      },

      importedFontSize: {
        parseDOM: (elem) => elem.getAttribute('data-font-size'),
        renderDOM: (attrs) => {
          if (!attrs.importedFontSize) return {};
          return {
            'data-font-size': attrs.importedFontSize,
          };
        },
      },
    };
  },

  addShortcuts() {
    return {
      Enter: () => {
        return this.editor.commands.splitListItem();
      },

      'Shift-Enter': () => {
        return this.editor.commands.first(({ commands }) => [
          () => commands.createParagraphNear(),
          () => commands.splitBlock(),
        ]);
      },

      Tab: () => {
        return this.editor.commands.first(({ commands }) => [() => commands.increaseListIndent()]);
      },

      'Shift-Tab': () => {
        return this.editor.commands.first(({ commands }) => [() => commands.decreaseListIndent()]);
      },
    };
  },
});
