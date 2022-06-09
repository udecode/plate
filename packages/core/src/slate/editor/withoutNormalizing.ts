import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Call a function, deferring normalization until after it completes
 * @return true if normalized.
 */
export const withoutNormalizing = <V extends Value>(
  editor: TEditor<V>,
  fn: () => boolean | void
) => {
  let normalized = false;

  Editor.withoutNormalizing(editor as any, () => {
    normalized = !!fn();
  });

  return normalized;
};
