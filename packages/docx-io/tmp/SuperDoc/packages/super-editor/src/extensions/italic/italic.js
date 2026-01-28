import { Mark, Attribute } from '@core/index.js';

export const Italic = Mark.create({
  name: 'italic',

  addOptions() {
    return {
      htmlAttributes: {},
    };
  },

  parseDOM() {
    return [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style=italic' },
      { style: 'font-style=normal', clearMark: (m) => m.type.name == 'em' },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['em', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  //prettier-ignore
  addCommands() {
    return {
      setItalic: () => ({ commands }) => commands.setMark(this.name),
      unsetItalic: () => ({ commands }) => commands.unsetMark(this.name),
      toggleItalic: () => ({ commands }) => commands.toggleMark(this.name),
    };
  },

  addShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-I': () => this.editor.commands.toggleItalic(),
    };
  },
});
