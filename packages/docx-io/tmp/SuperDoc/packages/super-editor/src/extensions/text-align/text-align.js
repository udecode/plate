import { Extension } from '@core/index.js';

export const TextAlign = Extension.create({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseDOM: (el) => {
              const alignment = el.style.textAlign || this.options.defaultAlignment;
              const containsAlignment = this.options.alignments.includes(alignment);
              return containsAlignment ? alignment : this.options.defaultAlignment;
            },
            renderDOM: (attrs) => {
              if (attrs.textAlign === this.options.defaultAlignment) return {};
              const textAlign = attrs.textAlign === 'both' ? 'justify' : attrs.textAlign;
              if (!textAlign) return {};
              return { style: `text-align: ${textAlign}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment) =>
        ({ commands }) => {
          const containsAlignment = this.options.alignments.includes(alignment);
          if (!containsAlignment) return false;

          return this.options.types
            .map((type) => commands.updateAttributes(type, { textAlign: alignment }))
            .every((result) => result);
        },

      unsetTextAlign:
        () =>
        ({ commands }) => {
          return this.options.types
            .map((type) => commands.resetAttributes(type, 'textAlign'))
            .every((result) => result);
        },
    };
  },

  addShortcuts() {
    return {
      'Mod-Shift-l': () => this.editor.commands.setTextAlign('left'),
      'Mod-Shift-e': () => this.editor.commands.setTextAlign('center'),
      'Mod-Shift-r': () => this.editor.commands.setTextAlign('right'),
      'Mod-Shift-j': () => this.editor.commands.setTextAlign('justify'),
    };
  },
});
