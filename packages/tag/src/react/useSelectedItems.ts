import { type SlateEditor, getNodeEntries } from '@udecode/plate-common';
import { useEditorSelector } from '@udecode/plate-common/react';

import type { TTagElement } from '../lib';

import { TagPlugin } from './TagPlugin';

export const getSelectedItems = (editor: SlateEditor) => {
  const options = getNodeEntries<TTagElement>(editor, {
    at: [],
    match: { type: TagPlugin.key },
  });

  return [...options].map(([{ children, type, ...option }]) => ({
    ...option,
  }));
};

export const useSelectedItems = () => {
  const selectedItems = useEditorSelector(
    (editor) => getSelectedItems(editor),
    [],
    {
      equalityFn: (prev, next) => {
        if (prev.length !== next.length) return false;

        return prev.every((item, index) => item.value === next[index].value);
      },
    }
  );

  return selectedItems;
};
