import React from 'react';

import { type TTagProps, isDefined } from 'platejs';
import { useEditorRef, useEditorString } from 'platejs/react';

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
  const editor = useEditorRef();
  const search = useEditorString();

  // Remove text and select end of editor when combobox closes
  React.useEffect(() => {
    if (!open) {
      editor.tf.removeNodes({ at: [], empty: false, text: true });
      editor.tf.select([], { edge: 'end' });
    }
  }, [editor, open]);

  // Select first item when search updates
  React.useEffect(() => {
    if (isDefined(search)) {
      selectFirstItem();
    }
  }, [search, selectFirstItem]);

  const selectedItems = useSelectedItems();

  React.useEffect(() => {
    onValueChange?.(selectedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);
};
