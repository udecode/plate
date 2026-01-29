import { Node, Attribute } from '@core/index.js';

export const ContentBlock = Node.create({
  name: 'contentBlock',

  group: 'inline',

  content: '',

  isolating: true,
  atom: true,
  inline: true,

  addOptions() {
    return {
      htmlAttributes: {
        contenteditable: false,
      },
    };
  },

  addAttributes() {
    return {
      horizontalRule: {
        default: false,
        renderDOM: ({ horizontalRule }) => {
          if (!horizontalRule) return {};
          return { 'data-horizontal-rule': 'true' };
        },
      },
      size: {
        default: null,
        renderDOM: ({ size }) => {
          if (!size) return {};

          let style = '';
          if (size.top) style += `top: ${size.top}px; `;
          if (size.left) style += `left: ${size.left}px; `;
          if (size.width) style += `width: ${size.width.toString().endsWith('%') ? size.width : `${size.width}px`}; `;
          if (size.height)
            style += `height: ${size.height.toString().endsWith('%') ? size.height : `${size.height}px`}; `;
          return { style };
        },
      },

      background: {
        default: null,
        renderDOM: (attrs) => {
          if (!attrs.background) return {};
          return {
            style: `background-color: ${attrs.background}`,
          };
        },
      },

      drawingContent: {
        rendered: false,
      },

      attributes: {
        rendered: false,
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return [
      'div',
      Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes, { 'data-type': this.name }),
      0,
    ];
  },
});
