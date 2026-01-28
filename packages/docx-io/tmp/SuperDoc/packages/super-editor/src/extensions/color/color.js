import { Extension } from '@core/index.js';

export const Color = Extension.create({
  name: 'color',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseDOM: (el) => el.style.color?.replace(/['"]+/g, ''),
            renderDOM: (attrs) => {
              if (!attrs.color) return {};
              return { style: `color: ${attrs.color}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setColor:
        (color) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color: color }).run();
        },
      unsetColor:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run();
        },
    };
  },
});
