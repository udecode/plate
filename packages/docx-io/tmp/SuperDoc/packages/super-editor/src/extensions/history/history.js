import { history, redo as originalRedo, undo as originalUndo } from 'prosemirror-history';
import { Extension } from '@core/Extension.js';

export const History = Extension.create({
  name: 'history',

  addOptions() {
    // https://prosemirror.net/docs/ref/#history.history
    return {
      depth: 100,
      newGroupDelay: 500,
    };
  },

  addPmPlugins() {
    const historyPlugin = history(this.options);
    return [historyPlugin];
  },

  //prettier-ignore
  addCommands() {
    return {
      undo: () => ({ state, dispatch, tr }) => {
        tr.setMeta('inputType', 'historyUndo');
        return originalUndo(state, dispatch);
      },
      redo: () => ({ state, dispatch, tr }) => {
        tr.setMeta('inputType', 'historyRedo');
        return originalRedo(state, dispatch);
      },
    };
  },

  addShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-Shift-z': () => this.editor.commands.redo(),
      'Mod-y': () => this.editor.commands.redo(),
    };
  },
});
