import { Extension } from '@core/index.js';
import { parseSizeUnit } from '@core/utilities/index.js';

export const TextIndent = Extension.create({
  name: 'textIndent',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      defaults: {
        unit: 'in',
        increment: 0.125,
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textIndent: {
            default: null,
            parseDOM: (el) => el.style.textIndent,
            renderDOM: (attrs) => {
              if (!attrs.textIndent) return {};
              let [value, unit] = parseSizeUnit(attrs.textIndent);
              if (Number.isNaN(value) || !value) return {};
              unit = unit ? unit : this.options.defaults.unit;
              return { style: `margin-left: ${value}${unit}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextIndent:
        (indent) =>
        ({ commands }) => {
          if (!indent) return false;

          return this.options.types
            .map((type) => commands.updateAttributes(type, { textIndent: indent }))
            .every((result) => result);
        },

      unsetTextIndent:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => commands.resetAttributes(type, 'textIndent'))
            .every((result) => result);
        },

      increaseTextIndent:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => {
              let { textIndent } = this.editor.getAttributes(type);

              if (!textIndent) {
                let { increment, unit } = this.options.defaults;
                return commands.updateAttributes(type, {
                  textIndent: `${increment}${unit}`,
                });
              }

              let [value, unit] = parseSizeUnit(textIndent);
              value = value + this.options.defaults.increment;
              unit = unit ? unit : this.options.defaults.unit;

              if (Number.isNaN(value)) return false;

              return commands.updateAttributes(type, {
                textIndent: `${value}${unit}`,
              });
            })
            .every((result) => result);
        },

      decreaseTextIndent:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => {
              let { textIndent } = this.editor.getAttributes(type);

              if (!textIndent) return false;

              let [value, unit] = parseSizeUnit(textIndent);
              value = value - this.options.defaults.increment;
              unit = unit ? unit : this.options.defaults.unit;

              if (Number.isNaN(value)) return false;

              if (value <= 0) {
                return commands.unsetTextIndent();
              }

              return commands.updateAttributes(type, {
                textIndent: `${value}${unit}`,
              });
            })
            .every((result) => result);
        },
    };
  },
});
