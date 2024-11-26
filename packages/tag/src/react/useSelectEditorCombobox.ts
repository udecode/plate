import React from 'react';

import { isDefined, removeEditorText } from '@udecode/plate-common';
import {
  selectEditor,
  useEditorRef,
  useEditorString,
} from '@udecode/plate-common/react';

import type { TagLike } from '../lib';

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
  onValueChange?: (items: TagLike[]) => void;
}) => {
  const editor = useEditorRef();
  const search = useEditorString();

  // Remove text and select end of editor when combobox closes
  React.useEffect(() => {
    if (!open) {
      removeEditorText(editor);
      selectEditor(editor, { edge: 'end' });
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
  }, [selectedItems, onValueChange]);
};
