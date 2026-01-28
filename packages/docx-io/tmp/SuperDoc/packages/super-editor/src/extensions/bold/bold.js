import { Mark, Attribute } from '@core/index.js';

export const Bold = Mark.create({
  name: 'bold',

  addOptions() {
    return {
      htmlAttributes: {},
    };
  },

  addAttributes() {
    return {
      value: {
        default: null,
        renderDOM: (attrs) => {
          if (!attrs.value) return {};

          if (attrs.value === '0') {
            return { style: 'font-weight: normal' };
          }
          return {};
        },
      },
    };
  },

  parseDOM() {
    return [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (node) => node.style.fontWeight != 'normal' && null },
      { style: 'font-weight=400', clearMark: (m) => m.type.name == 'strong' },
      { style: 'font-weight', getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['strong', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  //prettier-ignore
  addCommands() {
    return {
      setBold: () => ({ commands }) => commands.setMark(this.name),
      unsetBold: () => ({ commands }) => commands.unsetMark(this.name),
      toggleBold: () => ({ commands }) => commands.toggleMark(this.name),
    };
  },

  addShortcuts() {
    return {
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-B': () => this.editor.commands.toggleBold(),
    };
  },
});
