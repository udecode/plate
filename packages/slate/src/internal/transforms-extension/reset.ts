import type { Editor, ResetOptions } from '../../interfaces';

export const reset = (editor: Editor, options: ResetOptions = {}) => {
  editor.tf.replaceNodes(editor.api.create.value(), {
    at: [],
    children: true,
    ...options,
  } as any);

  if (!options.children) {
    editor.operations = [];
    editor.marks = null;

    if (editor.history?.undos) {
      editor.history.undos = [];
      editor.history.redos = [];
    }
  }
};
