import { Extension } from '@core/index.js';
import { parseSizeUnit, minMax } from '@core/utilities/index.js';

/**
 * Do we need a unit conversion system?
 *
 * For reference.
 * https://github.com/remirror/remirror/tree/HEAD/packages/remirror__extension-font-size
 * https://github.com/remirror/remirror/blob/83adfa93f9a320b6146b8011790f27096af9340b/packages/remirror__core-utils/src/dom-utils.ts
 */
export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle', 'tableCell'],
      defaults: {
        value: 12,
        unit: 'pt',
        min: 8,
        max: 96,
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseDOM: (el) => el.style.fontSize,
            renderDOM: (attrs) => {
              if (!attrs.fontSize) return {};
              let [value, unit] = parseSizeUnit(attrs.fontSize);
              if (Number.isNaN(value)) return {};
              unit = unit ? unit : this.options.defaults.unit;
              return { style: `font-size: ${value}${unit}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          let [value, unit] = parseSizeUnit(fontSize);

          if (Number.isNaN(value)) {
            return false;
          }

          let { min, max, unit: defaultUnit } = this.options.defaults;
          value = minMax(value, min, max);
          unit = unit ? unit : defaultUnit;

          return chain()
            .setMark('textStyle', { fontSize: `${value}${unit}` })
            .run();
        },

      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});
