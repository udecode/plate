import { Mark, Attribute } from '@core/index.js';

export const Strike = Mark.create({
  name: 'strike',

  addOptions() {
    return {
      htmlAttributes: {},
    };
  },

  parseDOM() {
    return [
      { tag: 's' },
      { style: 'text-decoration=line-through' },
      { style: 'text-decoration=auto', clearMark: (m) => m.type.name == 's' },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['s', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addCommands() {
    return {
      setStrike:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      unsetStrike:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      toggleStrike:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
    };
  },

  addShortcuts() {
    return {
      'Mod-Shift-s': () => this.editor.commands.toggleStrike(),
    };
  },
});
