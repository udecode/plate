import { Mark, Attribute } from '@core/index.js';

export const Underline = Mark.create({
  name: 'underline',

  addOptions() {
    return {
      htmlAttributes: {},
    };
  },

  parseDOM() {
    return [
      { tag: 'u' },
      { style: 'text-decoration=underline' },
      { style: 'text-decoration=auto', clearMark: (m) => m.type.name == 'u' },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['u', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addAttributes() {
    return {
      underlineType: {
        default: 'single',
      },
    };
  },

  //prettier-ignore
  addCommands() {
    return {
      setUnderline: () => ({ commands }) => commands.setMark(this.name),
      unsetUnderline: () => ({ commands }) => commands.unsetMark(this.name),
      toggleUnderline: () => ({ commands }) => commands.toggleMark(this.name),
    };
  },

  addShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleUnderline(),
      'Mod-U': () => this.editor.commands.toggleUnderline(),
    };
  },
});
