import { useCallback } from 'react';
import { isCollapsed } from '@udecode/slate-plugins';
import { Editor, Range } from 'slate';
import { useComboboxStore } from '../useComboboxStore';
import { getTextFromTrigger } from '../utils/getTextFromTrigger';

/**
 * If the cursor is after the trigger and at the end of the word:
 * Set target range, set search, reset tag index.
 */
export const useComboboxOnChange = ({
  editor,
  key,
  trigger,
}: {
  editor: Editor;
  key: string;
  trigger: string;
}) => {
  const setTargetRange = useComboboxStore((state) => state.setTargetRange);
  const setSearch = useComboboxStore((state) => state.setSearch);
  const setKey = useComboboxStore((state) => state.setKey);

  return useCallback(() => {
    const { selection } = editor;

    if (selection && isCollapsed(selection)) {
      const cursor = Range.start(selection);

      const isCursorAfterTrigger = getTextFromTrigger(editor, {
        at: cursor,
        trigger,
      });

      if (isCursorAfterTrigger) {
        const { range, textAfterTrigger } = isCursorAfterTrigger;

        setKey(key);
        setTargetRange(range);
        setSearch(textAfterTrigger);

        return {
          search: textAfterTrigger,
        };
      }
    }
  }, [editor, trigger, setKey, key, setTargetRange, setSearch]);
};
