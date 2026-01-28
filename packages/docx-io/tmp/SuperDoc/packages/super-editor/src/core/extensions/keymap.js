import { Extension } from '../Extension.js';
import { isIOS } from '../utilities/isIOS.js';
import { isMacOS } from '../utilities/isMacOS.js';

export const handleEnter = (editor) => {
  return editor.commands.first(({ commands }) => [
    () => commands.newlineInCode(),
    () => commands.createParagraphNear(),
    () => commands.liftEmptyBlock(),
    () => commands.splitBlock(),
  ]);
};

export const handleBackspace = (editor) => {
  return editor.commands.first(({ commands, tr }) => [
    () => commands.undoInputRule(),
    () => {
      tr.setMeta('inputType', 'deleteContentBackward');
      return false;
    },
    () => commands.deleteSelection(),
    () => commands.handleBackspaceNextToList(),
    () => commands.deleteListItem(),
    () => commands.joinBackward(),
    () => commands.selectNodeBackward(),
  ]);
};

export const handleDelete = (editor) => {
  return editor.commands.first(({ commands }) => [
    () => commands.deleteSelection(),
    () => commands.handleDeleteNextToList(),
    () => commands.joinForward(),
    () => commands.selectNodeForward(),
  ]);
};

/**
 * For reference.
 * https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts
 */
export const Keymap = Extension.create({
  name: 'keymap',

  addShortcuts() {
    const baseKeymap = {
      Enter: () => handleEnter(this.editor),
      'Mod-Enter': () => this.editor.commands.exitCode(),
      Backspace: () => handleBackspace(this.editor),
      'Mod-Backspace': () => handleBackspace(this.editor),
      'Shift-Backspace': () => handleBackspace(this.editor),
      Delete: () => handleDelete(this.editor),
      'Mod-Delete': () => handleDelete(this.editor),
      'Mod-a': () => this.editor.commands.selectAll(),
      Tab: () => this.editor.commands.insertTabNode(),
    };

    const pcBaseKeymap = {
      ...baseKeymap,
    };

    const macBaseKeymap = {
      ...baseKeymap,
      'Ctrl-h': () => handleBackspace(this.editor),
      'Alt-Backspace': () => handleBackspace(this.editor),
      'Ctrl-d': () => handleDelete(this.editor),
      'Ctrl-Alt-Backspace': () => handleDelete(this.editor),
      'Alt-Delete': () => handleDelete(this.editor),
      'Alt-d': () => handleDelete(this.editor),
      'Ctrl-a': () => this.editor.commands.selectTextblockStart(),
      'Ctrl-e': () => this.editor.commands.selectTextblockEnd(),
      'Ctrl-t': () => this.editor.commands.insertTabChar(),
    };

    if (isMacOS() || isIOS()) {
      return macBaseKeymap;
    }

    return pcBaseKeymap;
  },
});
