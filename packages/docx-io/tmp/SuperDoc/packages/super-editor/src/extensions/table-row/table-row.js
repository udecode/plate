import { Node, Attribute } from '@core/index.js';

export const TableRow = Node.create({
  name: 'tableRow',

  content: '(tableCell | tableHeader)*',

  tableRole: 'row',

  addOptions() {
    return {
      htmlAttributes: {
        'aria-label': 'Table row node',
      },
    };
  },

  addAttributes() {
    return {
      rowHeight: {
        renderDOM({ rowHeight }) {
          if (!rowHeight) return {};
          const style = `height: ${rowHeight}px`;
          return { style };
        },
      },
    };
  },

  parseDOM() {
    return [{ tag: 'tr' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['tr', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },
});
