import { useCallback, useEffect, useState } from 'react';
import {
  getSelectionText,
  isSelectionExpanded,
  useEventEditorSelectors,
  usePlateEditorState,
} from '@udecode/plate-core';
import {
  getSelectionBoundingClientRect,
  usePopperPosition,
  UsePopperPositionOptions,
} from '@udecode/plate-ui-popper';

export const useBalloonToolbarPopper = (options: UsePopperPositionOptions) => {
  const focusId = useEventEditorSelectors.focus();
  const editor = usePlateEditorState(focusId!)!;

  const [isHidden, setIsHidden] = useState(true);

  const selectionExpanded = editor && isSelectionExpanded(editor);
  const selectionText = editor && getSelectionText(editor);

  const show = useCallback(() => {
    if (isHidden && selectionExpanded) {
      setIsHidden(false);
    }
  }, [isHidden, selectionExpanded]);

  useEffect(() => {
    if (!selectionText) {
      setIsHidden(true);
    } else if (selectionText && selectionExpanded) {
      setIsHidden(false);
    }
  }, [selectionExpanded, selectionText, show]);

  const popperResult = usePopperPosition({
    isHidden,
    getBoundingClientRect: getSelectionBoundingClientRect,
    ...options,
  });

  const selectionTextLength = selectionText?.length ?? 0;
  const { update } = popperResult;

  useEffect(() => {
    selectionTextLength > 0 && update?.();
  }, [selectionTextLength, update]);

  return popperResult;
};
