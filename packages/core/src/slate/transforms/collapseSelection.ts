import { Transforms } from 'slate';
import { SelectionCollapseOptions } from 'slate/dist/transforms/selection';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Collapse the selection.
 */
export const collapseSelection = <V extends Value>(
  editor: TEditor<V>,
  options?: SelectionCollapseOptions
) => {
  Transforms.collapse(editor as any, options);
};
