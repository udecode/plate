import { Editor } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

/**
 * {@link Editor.withoutNormalizing}
 * @return true if normalized.
 */
export const withoutNormalizing = (
  editor: TEditor,
  fn: () => boolean | void
) => {
  let normalized = false;

  Editor.withoutNormalizing(editor, () => {
    normalized = !!fn();
  });

  return normalized;
};
