import {
  type TEditor,
  type TElement,
  getFragment,
  isExpanded,
} from '@udecode/slate';

import { unwrapStructuralNodes } from '../utils/unwrapStructuralNodes';

export type GetSelectionFragmentOptions = {
  structuralTypes?: string[];
};

export const getSelectionFragment = (
  editor: TEditor,
  options?: GetSelectionFragmentOptions
) => {
  if (!isExpanded(editor.selection)) return [];

  const fragment = getFragment(editor, editor.selection!) as TElement[];

  if (fragment.length === 0) return [];

  return unwrapStructuralNodes(fragment, options);
};
