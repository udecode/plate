import React from 'react';

import { useEditorSelector } from '@udecode/plate-common';
import {
  getSelectionText,
  isSelectionExpanded,
  mergeProps,
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
  editorId,
  floatingOptions,
  focusedEditorId,
  hideToolbar,
  ignoreReadOnly,
}: {
  editorId: string;
  focusedEditorId: null | string;
} & FloatingToolbarState) => {
  const selectionExpanded = useEditorSelector(isSelectionExpanded, []);
  const selectionText = useEditorSelector(getSelectionText, []);

  const focused = useFocused();

  const [open, setOpen] = React.useState(false);
  const [waitForCollapsedSelection, setWaitForCollapsedSelection] =
    React.useState(false);
  const [mouseupped, setMouseupped] = React.useState(false);

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
    mouseupped,
    open,
    selectionExpanded,
    selectionText,
    setMouseupped,
    setOpen,
    setWaitForCollapsedSelection,
    waitForCollapsedSelection,
  };
};

export const useFloatingToolbar = ({
  editorId,
  floating,
  focusedEditorId,
  hideToolbar,
  ignoreReadOnly,
  mouseupped,
  open,
  selectionExpanded,
  selectionText,
  setMouseupped,
  setOpen,
  setWaitForCollapsedSelection,
  waitForCollapsedSelection,
}: ReturnType<typeof useFloatingToolbarState>) => {
  // On refocus, the editor keeps the previous selection,
  // so we need to wait it's collapsed at the new position before displaying the floating toolbar.
  React.useEffect(() => {
    if (!(editorId === focusedEditorId) || ignoreReadOnly) {
      setWaitForCollapsedSelection(true);
    }
    if (!selectionExpanded) {
      setWaitForCollapsedSelection(false);
    }
  }, [
    editorId,
    focusedEditorId,
    ignoreReadOnly,
    selectionExpanded,
    setWaitForCollapsedSelection,
  ]);

  React.useEffect(() => {
    const mouseup = () => setMouseupped(true);

    if (selectionText && selectionExpanded) {
      document.addEventListener('mouseup', mouseup);
    } else {
      document.removeEventListener('mouseup', mouseup);
    }

    return () => {
      document.removeEventListener('mouseup', mouseup);
    };
  }, [selectionText, selectionExpanded, setMouseupped]);

  React.useEffect(() => {
    if (!selectionExpanded || !selectionText) {
      setOpen(false);
      setMouseupped(false);
    } else if (
      selectionText &&
      selectionExpanded &&
      mouseupped &&
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
    mouseupped,
    setMouseupped,
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
