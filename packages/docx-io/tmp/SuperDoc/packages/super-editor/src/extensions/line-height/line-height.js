import { Extension } from '@core/index.js';
import { getLineHeightValueString } from '@core/super-converter/helpers.js';

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      defaults: {
        unit: '',
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseDOM: (el) => el.style.lineHeight,
            renderDOM: (attrs) => {
              if (!attrs.lineHeight) return {};
              const lineHeightStyle = getLineHeightValueString(
                attrs.lineHeight,
                this.options.defaults.unit,
                attrs.spacing?.lineRule,
              );
              return {
                style: `${lineHeightStyle}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands }) => {
          if (!lineHeight) return false;

          return this.options.types
            .map((type) => commands.updateAttributes(type, { lineHeight }))
            .every((result) => result);
        },

      unsetLineHeight:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => commands.resetAttributes(type, 'lineHeight'))
            .every((result) => result);
        },
    };
  },
});
