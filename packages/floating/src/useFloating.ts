import React from 'react';

import type { ClientRectObject } from '@floating-ui/core';

import { useEditor, useEditorSelector } from '@platejs/core/react';
import { useEditorFocused, useEditorReadOnly } from '@platejs/plite-react';
import {
  useIsomorphicLayoutEffect,
  useOnClickOutside,
} from '@udecode/react-utils';
import { mergeProps } from '@udecode/utils';

import {
  createVirtualElement,
  getDefaultBoundingClientRect,
  getSelectionBoundingClientRect,
} from './geometry';
import {
  type UseFloatingOptions,
  type UseFloatingReturn,
  type VirtualElement,
  autoUpdate,
  useFloating,
} from './floating-ui';

export interface UseVirtualFloatingOptions extends Partial<UseFloatingOptions> {
  open?: boolean;
  getBoundingClientRect?: () => ClientRectObject;
}

export interface UseVirtualFloatingReturn
  extends UseFloatingReturn<VirtualElement> {
  style: React.CSSProperties;
  virtualElementRef: React.MutableRefObject<VirtualElement>;
}

/** `useFloating` with a controlled virtual reference element. */
export const useVirtualFloating = ({
  getBoundingClientRect = getDefaultBoundingClientRect,
  ...floatingOptions
}: UseVirtualFloatingOptions): UseVirtualFloatingReturn => {
  const virtualElementRef = React.useRef(createVirtualElement());
  const floatingResult = useFloating<VirtualElement>({
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });
  const { middlewareData, refs, strategy, update, x, y } = floatingResult;

  useIsomorphicLayoutEffect(() => {
    virtualElementRef.current.getBoundingClientRect = getBoundingClientRect;
    refs.setReference(virtualElementRef.current);
    void update();
  }, [getBoundingClientRect, refs.setReference, update]);

  return {
    ...floatingResult,
    style: {
      display: floatingOptions.open === false ? 'none' : undefined,
      left: x ?? 0,
      position: strategy,
      top: y ?? 0,
      visibility:
        middlewareData.hide?.referenceHidden === true ? 'hidden' : undefined,
    },
    virtualElementRef,
  };
};

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
  const editor = useEditor({ id: editorId });
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
