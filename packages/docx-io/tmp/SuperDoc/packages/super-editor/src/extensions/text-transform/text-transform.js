import { Extension } from '@core/index.js';

export const TextTransform = Extension.create({
  name: 'textTransform',

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
          textTransform: {
            default: null,
            renderDOM: (attrs) => {
              if (!attrs.textCase) return {};
              return {
                style: `text-transform: ${attrs.textCase}`,
              };
            },
          },
        },
      },
    ];
  },
});
