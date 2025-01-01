import type { TEditor, TElement } from '../interfaces';

import { unwrapStructuralNodes } from '../utils/unwrapStructuralNodes';

export type GetSelectionFragmentOptions = {
  structuralTypes?: string[];
};

export const getSelectionFragment = (
  editor: TEditor,
  options?: GetSelectionFragmentOptions
) => {
  if (!editor.selection) return [];

  const fragment = editor.api.fragment(editor.selection!) as TElement[];

  if (fragment.length === 0) return [];

  return unwrapStructuralNodes(fragment, options);
};
