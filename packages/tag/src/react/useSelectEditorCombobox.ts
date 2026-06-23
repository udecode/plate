import React from 'react';

import type {
  EditorStateView,
  EditorUpdateTransaction,
  Point,
  Range,
  Value,
} from '@platejs/plite';
import { TextApi, type TTagProps, isDefined } from 'platejs';
import { useEditorRef, useEditorString } from 'platejs/react';

import { useSelectedItems } from './useSelectedItems';

type TagComboboxEditor = {
  api: {
    end: (at: []) => Point;
  };
  read: <T>(fn: (state: EditorStateView<Value>) => T) => T;
  update: (fn: (tx: EditorUpdateTransaction<Value>) => void) => void;
};

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
  const editor = useEditorRef() as unknown as TagComboboxEditor;
  const search = useEditorString();

  // Remove text and select end of editor when combobox closes
  React.useEffect(() => {
    if (!open) {
      const textRanges = editor.read((state) => {
        const ranges: Range[] = [];

        for (const [node, path] of state.nodes.entries({
          at: [],
        })) {
          if (!TextApi.isText(node) || node.text.length === 0) continue;

          ranges.push({
            anchor: { offset: 0, path },
            focus: { offset: node.text.length, path },
          });
        }

        return ranges;
      });

      editor.update((tx) => {
        textRanges.forEach((at) => {
          tx.text.delete({ at });
        });
        tx.selection.set(editor.api.end([]));
      });
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
