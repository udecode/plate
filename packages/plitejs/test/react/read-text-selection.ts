import { type Editor, SelectionApi } from 'plitejs';

export const readTextSelection = (editor: Pick<Editor, 'read'>) => {
  const selection = editor.read((state) => state.runtime.snapshot().selection);

  if (selection !== null && !SelectionApi.isText(selection)) {
    throw new Error('Expected a text selection in this fixture.');
  }

  return selection;
};
