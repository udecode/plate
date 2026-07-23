import React from 'react';

import { useEditor } from '@platejs/core/react';
import { TextApi } from '@platejs/plite';
import type { TTagProps } from '@platejs/utils';
import { useEditorString } from '@platejs/utils/react';

import { useSelectedItems } from './useSelectedItems';

/**
 * - Select first item when search updates and remove text
 * - Select end of editor when combobox closes
 */
export const useSelectEditorCombobox = ({
  open,
  selectFirstItem,
  onValueChange,
}: {
  open: boolean;
  selectFirstItem: () => void;
  onValueChange?: (items: TTagProps[]) => void;
}) => {
  const editor = useEditor();
  const search = useEditorString();

  // Remove text and select end of editor when combobox closes
  React.useEffect(() => {
    if (!open) {
      editor.update((tx) => {
        tx.nodes.remove({
          at: [],
          match: (node) => TextApi.isText(node) && node.text.length > 0,
        });

        const end = tx.points.end([]);

        if (end) tx.selection.set(end);
      });
    }
  }, [editor, open]);

  // Select first item when search updates
  React.useEffect(() => {
    if (search !== undefined) {
      selectFirstItem();
    }
  }, [search, selectFirstItem]);

  const selectedItems = useSelectedItems();

  React.useEffect(() => {
    onValueChange?.(selectedItems);
  }, [onValueChange, selectedItems]);
};
