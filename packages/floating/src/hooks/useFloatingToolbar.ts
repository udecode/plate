import React from 'react';

import { mergeProps } from 'platejs';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorSelector,
  useFocused,
  useOnClickOutside,
} from 'platejs/react';

import {
  type UseVirtualFloatingOptions,
  getSelectionBoundingClientRect,
  useVirtualFloating,
} from '..';

export type FloatingToolbarState = {
  floatingOptions?: UseVirtualFloatingOptions;
  hideToolbar?: boolean;
  showWhenReadOnly?: boolean;
};

export const useFloatingToolbarState = ({
  editorId,
  floatingOptions,
  focusedEditorId,
  hideToolbar,
  showWhenReadOnly,
}: {
  editorId: string;
  focusedEditorId: string | null;
} & FloatingToolbarState) => {
  const editor = useEditorRef();
  const selectionExpanded = useEditorSelector(
    () => editor.api.isExpanded(),
    []
  );
  const selectionText = useEditorSelector(() => editor.api.string(), []);
  const readOnly = useEditorReadOnly();

  const focused = useFocused();

  const [open, setOpen] = React.useState(false);
  const [waitForCollapsedSelection, setWaitForCollapsedSelection] =
    React.useState(false);
  const [mousedown, setMousedown] = React.useState(false);

  const floating = useVirtualFloating(
    mergeProps(
      {
        open,
        getBoundingClientRect: () => getSelectionBoundingClientRect(editor),
        onOpenChange: setOpen,
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
    mousedown,
    open,
    readOnly,
    selectionExpanded,
    selectionText,
    setMousedown,
    setOpen,
    setWaitForCollapsedSelection,
    showWhenReadOnly,
    waitForCollapsedSelection,
  };
};

export const useFloatingToolbar = ({
  editorId,
  floating,
  focusedEditorId,
  hideToolbar,
  mousedown,
  open,
  readOnly,
  selectionExpanded,
  selectionText,
  setMousedown,
  setOpen,
  setWaitForCollapsedSelection,
  showWhenReadOnly,
  waitForCollapsedSelection,
}: ReturnType<typeof useFloatingToolbarState>) => {
  // On refocus, the editor keeps the previous selection,
  // so we need to wait it's collapsed at the new position before displaying the floating toolbar.
  React.useEffect(() => {
    if (!(editorId === focusedEditorId)) {
      setWaitForCollapsedSelection(true);
    }
    if (!selectionExpanded) {
      setWaitForCollapsedSelection(false);
    }
  }, [
    editorId,
    focusedEditorId,
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
    setOpen((prevOpen: boolean) => {
      if (
        !selectionExpanded ||
        !selectionText ||
        (mousedown && !prevOpen) ||
        hideToolbar ||
        (readOnly && !showWhenReadOnly)
      ) {
        return false;
      }
      if (
        selectionText &&
        selectionExpanded &&
        (!waitForCollapsedSelection || readOnly)
      ) {
        return true;
      }
      return prevOpen; // No change needed
    });
  }, [
    setOpen,
    editorId,
    focusedEditorId,
    hideToolbar,
    showWhenReadOnly,
    selectionExpanded,
    selectionText,
    mousedown,
    waitForCollapsedSelection,
    open,
    readOnly,
  ]);

  const { update } = floating;

  useEditorSelector(() => {
    update?.();
  }, [update]);

  const clickOutsideRef = useOnClickOutside(
    () => {
      setOpen(false);
    },
    {
      ignoreClass: 'ignore-click-outside/toolbar',
    }
  );

  return {
    clickOutsideRef,
    hidden: !open,
    props: {
      style: floating.style,
    },
    ref: floating.refs.setFloating,
  };
};
