import { Node, Attribute } from '@core/index.js';

export const CommentRangeStart = Node.create({
  name: 'commentRangeStart',

  group: 'inline',

  inline: true,

  atom: true,

  selectable: false,

  draggable: false,

  parseDOM() {
    return [{ tag: 'commentRangeStart' }];
  },

  addOptions() {
    return {
      htmlAttributes: {
        contentEditable: 'false',
        'aria-label': 'Comment range start node',
      },
    };
  },

  renderDOM({ htmlAttributes }) {
    return ['commentRangeStart', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },

  addAttributes() {
    return {
      'w:id': {
        rendered: false,
      },
      internal: {
        default: true,
        rendered: false,
      },
    };
  },
});

export const CommentRangeEnd = Node.create({
  name: 'commentRangeEnd',

  group: 'inline',

  inline: true,

  atom: true,

  selectable: false,

  draggable: false,

  addOptions() {
    return {
      htmlAttributes: {
        contentEditable: 'false',
        'aria-label': 'Comment range end node',
      },
    };
  },

  parseDOM() {
    return [{ tag: 'commentRangeEnd' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['commentRangeEnd', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },

  addAttributes() {
    return {
      'w:id': {
        rendered: false,
      },
    };
  },
});

export const CommentReference = Node.create({
  name: 'commentReference',

  group: 'inline',

  inline: true,

  atom: true,

  selectable: false,

  draggable: false,

  addOptions() {
    return {
      htmlAttributes: {
        contentEditable: 'false',
        'aria-label': 'Comment reference node',
      },
    };
  },

  parseDOM() {
    return [{ tag: 'commentReference' }];
  },

  renderDOM({ htmlAttributes }) {
    return ['commentReference', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },

  addAttributes() {
    return {
      attributes: {
        rendered: false,
      },
    };
  },
});
