import { Node, Attribute } from '@core/index.js';

export const LineBreak = Node.create({
  name: 'lineBreak',
  group: 'inline',
  inline: true,
  marks: '',
  defining: true,
  selectable: false,
  content: '',
  atom: true,

  parseDOM() {
    return [{ tag: 'br' }];
  },

  renderDOM() {
    return ['br', {}];
  },
});

export const HardBreak = Node.create({
  name: 'hardBreak',
  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addOptions() {
    return {
      htmlAttributes: {
        contentEditable: 'false',
        lineBreakType: 'page',
        'aria-hidden': 'true',
        'aria-label': 'Hard break node',
      },
    };
  },

  addAttributes() {
    return {
      pageBreakSource: {
        rendered: false,
        default: null,
      },
      pageBreakType: {
        default: null,
        rendered: false,
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: 'span[linebreaktype="page"]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          return {
            pageBreakSource: dom.getAttribute('pagebreaksource') || null,
            pageBreakType: dom.getAttribute('linebreaktype') || null,
          };
        },
      },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['span', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes)];
  },
});
