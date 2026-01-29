import { Node, Attribute } from '@core/index.js';

export const Mention = Node.create({
  name: 'mention',

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addOptions() {
    return {
      htmlAttributes: {
        class: 'sd-editor-mention',
        'aria-label': 'Mention node',
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: `span[data-type="${this.name || this.email}"]`,
        getAttrs: (node) => ({
          name: node.getAttribute('name') || null,
          email: node.getAttribute('email') || null,
        }),
      },
    ];
  },

  renderDOM({ node, htmlAttributes }) {
    const { name, email } = node.attrs;

    return [
      'span',
      Attribute.mergeAttributes({ 'data-type': this.name || this.email }, this.options.htmlAttributes, htmlAttributes),
      `@${name ? name : email}`,
    ];
  },

  addAttributes() {
    return {
      name: { default: null },
      email: { default: null },
    };
  },
});
