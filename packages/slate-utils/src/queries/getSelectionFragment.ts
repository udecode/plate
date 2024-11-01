import { type TEditor, type TElement, getFragment } from '@udecode/slate';

import { unwrapStructuralNodes } from '../utils/unwrapStructuralNodes';

export type GetSelectionFragmentOptions = {
  structuralTypes?: string[];
};

export const getSelectionFragment = (
  editor: TEditor,
  options?: GetSelectionFragmentOptions
) => {
  if (!editor.selection) return [];

  const fragment = getFragment(editor, editor.selection!) as TElement[];

  if (fragment.length === 0) return [];

  return unwrapStructuralNodes(fragment, options);
};
