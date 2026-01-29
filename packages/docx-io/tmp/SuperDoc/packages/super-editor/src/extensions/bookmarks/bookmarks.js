import { Node, Attribute } from '@core/index.js';

export const BookmarkStart = Node.create({
  name: 'bookmarkStart',
  group: 'inline',
  content: 'inline*',
  inline: true,

  addOptions() {
    return {
      htmlAttributes: {
        style: 'height: 0; width: 0;',
        'aria-label': 'Bookmark start node',
        role: 'link',
      },
    };
  },

  addAttributes() {
    return {
      name: {
        default: null,
        renderDOM: ({ name }) => {
          if (name) return { name };
          return {};
        },
      },
      id: {
        default: null,
        renderDOM: ({ id }) => {
          if (id) return { id };
          return {};
        },
      },
    };
  },

  renderDOM({ htmlAttributes }) {
    return ['a', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },
});
