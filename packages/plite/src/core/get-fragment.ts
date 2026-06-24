import { NodeApi } from '../interfaces';
import type { Editor, EditorFragmentReadOptions } from '../interfaces/editor';
import { getLiveSelection } from './public-state';

export const getFragment = (
  editor: Editor,
  options: EditorFragmentReadOptions = {}
) => {
  const selection = options.at ?? getLiveSelection(editor);

  if (selection) {
    return NodeApi.fragment(editor, selection);
  }
  return [];
};
