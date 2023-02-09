import { useEffect, useState } from 'react';
import {
  getSelectionText,
  isSelectionExpanded,
  mergeProps,
  useEventEditorSelectors,
  usePlateEditorState,
} from '@udecode/plate-core';
import {
  flip,
  getSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
  UseVirtualFloatingOptions,
  UseVirtualFloatingReturn,
} from '@udecode/plate-floating';
import { useFocused } from 'slate-react';

export const useFloatingToolbar = ({
  floatingOptions,
}: {
  floatingOptions?: UseVirtualFloatingOptions;
} = {}): UseVirtualFloatingReturn & {
  open: boolean;
} => {
  const focusedEditorId = useEventEditorSelectors.focus();
  const editor = usePlateEditorState();
  const focused = useFocused();

  const [waitForCollapsedSelection, setWaitForCollapsedSelection] = useState(
    false
  );

  const [open, setOpen] = useState(false);

  const selectionExpanded = editor && isSelectionExpanded(editor);
  const selectionText = editor && getSelectionText(editor);

  // On refocus, the editor keeps the previous selection,
  // so we need to wait it's collapsed at the new position before displaying the floating toolbar.
  useEffect(() => {
    if (!focused) {
      setWaitForCollapsedSelection(true);
    }

    if (!selectionExpanded) {
      setWaitForCollapsedSelection(false);
    }
  }, [focused, selectionExpanded]);

  useEffect(() => {
    if (!selectionExpanded || !selectionText || editor.id !== focusedEditorId) {
      setOpen(false);
    } else if (
      selectionText &&
      selectionExpanded &&
      !waitForCollapsedSelection
    ) {
      setOpen(true);
    }
  }, [
    editor.id,
    editor.selection,
    focusedEditorId,
    selectionExpanded,
    selectionText,
    waitForCollapsedSelection,
  ]);

  const floatingResult = useVirtualFloating(
    mergeProps(
      {
        middleware: [
          offset(12),
          flip({
            padding: 96,
          }),
        ],
        placement: 'top',
        getBoundingClientRect: getSelectionBoundingClientRect,
        open,
        onOpenChange: setOpen,
      },
      floatingOptions
    )
  );

  const { update } = floatingResult;

  const selectionTextLength = selectionText?.length ?? 0;

  useEffect(() => {
    if (selectionTextLength > 0) {
      update?.();
    }
  }, [selectionTextLength, update]);

  return { ...floatingResult, open };
};
