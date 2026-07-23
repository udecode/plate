import React from 'react';

import type { CorePluginConfig } from '@platejs/core';
import {
  type PlateEditor,
  useEditor,
  useEditorSelector,
} from '@platejs/core/react';
import type { Value } from '@platejs/plite';
import { useEditorFocused, useEditorReadOnly } from '@platejs/plite-react';
import { useOnClickOutside } from '@udecode/react-utils';
import { mergeProps } from '@udecode/utils';

import { getSelectionBoundingClientRect } from '../utils';
import {
  type UseVirtualFloatingOptions,
  useVirtualFloating,
} from './useVirtualFloating';

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
  const editor = useEditor<PlateEditor<Value, CorePluginConfig>>({
    id: editorId,
  });
  const selectionExpanded = useEditorSelector(
    (editor) => editor.read.selection.isExpanded(),
    { id: editorId }
  );
  const selectionText = useEditorSelector(
    (editor) => editor.read.text.string(),
    { id: editorId }
  );
  const readOnly = useEditorReadOnly();

  const focused = useEditorFocused();

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
    if (editorId !== focusedEditorId) {
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
  }, [setMousedown]);

  React.useEffect(() => {
    setOpen((prevOpen) => {
      if (
        !selectionExpanded ||
        !selectionText ||
        editorId !== focusedEditorId ||
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
      return prevOpen;
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
    readOnly,
  ]);

  const { update } = floating;

  const editorVersion = useEditorSelector(
    (editor) => editor.read.lastCommit()?.version ?? 0,
    { id: editorId }
  );

  React.useEffect(() => {
    update?.();
  }, [editorVersion, update]);

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
