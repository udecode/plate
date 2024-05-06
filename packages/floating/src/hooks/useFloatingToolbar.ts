import React from 'react';

import { useEditorSelector, usePlateSelectors } from '@udecode/plate-common';
import {
  getSelectionText,
  isSelectionExpanded,
  mergeProps,
  useEventEditorSelectors,
} from '@udecode/plate-common/server';
import { useFocused } from 'slate-react';

import {
  type UseVirtualFloatingOptions,
  getSelectionBoundingClientRect,
  useVirtualFloating,
} from '..';

export type FloatingToolbarState = {
  floatingOptions?: UseVirtualFloatingOptions;
  hideToolbar?: boolean;
  ignoreReadOnly?: boolean;
};

export const useFloatingToolbarState = ({
  floatingOptions,
  hideToolbar,
  ignoreReadOnly,
}: FloatingToolbarState) => {
  const editorId = usePlateSelectors().id();
  const selectionExpanded = useEditorSelector(isSelectionExpanded, []);
  const selectionText = useEditorSelector(getSelectionText, []);

  const focusedEditorId = useEventEditorSelectors.focus();
  const focused = useFocused();

  const [open, setOpen] = React.useState(false);
  const [waitForCollapsedSelection, setWaitForCollapsedSelection] =
    React.useState(false);

  const floating = useVirtualFloating(
    mergeProps(
      {
        getBoundingClientRect: getSelectionBoundingClientRect,
        onOpenChange: setOpen,
        open,
      },
      floatingOptions
    )
  );

  return {
    editorId,
    floating,
    focused,
    focusedEditorId,
    hideToolbar,
    ignoreReadOnly,
    open,
    selectionExpanded,
    selectionText,
    setOpen,
    setWaitForCollapsedSelection,
    waitForCollapsedSelection,
  };
};

export const useFloatingToolbar = ({
  editorId,
  floating,
  focused,
  focusedEditorId,
  hideToolbar,
  ignoreReadOnly,
  open,
  selectionExpanded,
  selectionText,
  setOpen,
  setWaitForCollapsedSelection,
  waitForCollapsedSelection,
}: ReturnType<typeof useFloatingToolbarState>) => {
  // On refocus, the editor keeps the previous selection,
  // so we need to wait it's collapsed at the new position before displaying the floating toolbar.
  React.useEffect(() => {
    if (!focused || ignoreReadOnly) {
      setWaitForCollapsedSelection(true);
    }
    if (!selectionExpanded) {
      setWaitForCollapsedSelection(false);
    }
  }, [
    focused,
    ignoreReadOnly,
    selectionExpanded,
    setWaitForCollapsedSelection,
  ]);

  React.useEffect(() => {
    if (
      !selectionExpanded ||
      !selectionText ||
      (!(editorId === focusedEditorId || ignoreReadOnly) && hideToolbar)
    ) {
      setOpen(false);
    } else if (
      selectionText &&
      selectionExpanded &&
      !waitForCollapsedSelection
    ) {
      setOpen(true);
    }
  }, [
    setOpen,
    editorId,
    focusedEditorId,
    hideToolbar,
    ignoreReadOnly,
    selectionExpanded,
    selectionText,
    waitForCollapsedSelection,
  ]);

  const { update } = floating;

  const selectionTextLength = selectionText?.length ?? 0;

  React.useEffect(() => {
    if (selectionTextLength > 0) {
      update?.();
    }
  }, [selectionTextLength, update]);

  return {
    hidden: !open,
    props: {
      style: floating.style,
    },
    ref: floating.refs.setFloating,
  };
};
