import { PlateEditor, TNodeEntry } from '@udecode/plate-common';
import { last } from 'lodash';

import { getEnclosingToggleIds } from './getEnclosingToggleIds';

export const getLastEntryEnclosedInToggle = (
  editor: PlateEditor,
  toggleId: string
): TNodeEntry | undefined => {
  const entriesInToggle = editor.children
    .map((node, index) => [node, [index]] as TNodeEntry)
    .filter(([node, path]) => {
      // @ts-ignore TODO Instead of relying on editor.children, use the element's siblings
      return getEnclosingToggleIds(editor.children, [node, path]).includes(
        toggleId
      );
    });
  return last(entriesInToggle);
};
