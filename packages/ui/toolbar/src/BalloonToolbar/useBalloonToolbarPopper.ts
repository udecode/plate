import { useEffect, useState } from 'react';
import {
  getSelectionText,
  isSelectionExpanded,
  useEditorState,
} from '@udecode/plate-core';
import {
  getSelectionBoundingClientRect,
  usePopperPosition,
  UsePopperPositionOptions,
} from '@udecode/plate-ui-popper';
import { useFocused } from 'slate-react';

export const useBalloonToolbarPopper = (options: UsePopperPositionOptions) => {
  const editor = useEditorState();
  const focused = useFocused();

  const [isHidden, setIsHidden] = useState(true);

  const selectionExpanded = editor && isSelectionExpanded(editor);
  const selectionText = editor && getSelectionText(editor);

  useEffect(() => {
    if (!selectionText || !focused) {
      setIsHidden(true);
    } else if (selectionText && selectionExpanded) {
      setIsHidden(false);
    }
  }, [focused, selectionExpanded, selectionText]);

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
