import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import type { EditorStaticApi } from '../interfaces/editor';

export const insertNode: EditorStaticApi['insertNode'] = (
  editor,
  node,
  options
) => {
  dispatchCommand(editor, editorCommands.insertNodes, {
    nodes: node,
    options,
  });
};
