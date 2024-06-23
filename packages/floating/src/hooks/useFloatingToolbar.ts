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
  const [mousedown, setMousedown] = React.useState(false);

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
    mousedown,
    open,
    selectionExpanded,
    selectionText,
    setMousedown,
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
  mousedown,
  open,
  selectionExpanded,
  selectionText,
  setMousedown,
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
    const mouseup = () => setMousedown(false);
    const mousedown = () => setMousedown(true);

    document.addEventListener('mouseup', mouseup);

    document.addEventListener('mousedown', mousedown);

    return () => {
      document.removeEventListener('mouseup', mouseup);
      document.removeEventListener('mousedown', mousedown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!selectionExpanded || !selectionText || (mousedown && !open)) {
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
    mousedown,
    waitForCollapsedSelection,
    open,
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
