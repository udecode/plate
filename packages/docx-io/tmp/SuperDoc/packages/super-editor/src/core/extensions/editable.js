import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '../Extension.js';

export const Editable = Extension.create({
  name: 'editable',

  addPmPlugins() {
    const editablePlugin = new Plugin({
      key: new PluginKey('editable'),
      props: {
        editable: () => {
          return this.editor.options.editable;
        },
      },
    });

    return [editablePlugin];
  },
});
