import { Extension } from '@core/index.js';
import { dropCursor } from 'prosemirror-dropcursor';

export const DropCursor = Extension.create({
  name: 'dropCursor',

  addOptions() {
    return {
      color: 'currentColor',
      width: 2,
      class: undefined,
    };
  },

  addPmPlugins() {
    return [dropCursor(this.options)];
  },
});
