import {
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from '@platejs/plite-react';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';
import {
  useEditorRef,
  useEditorSelector,
  useElement,
} from '@platejs/core/react';

import { usePlaceholderSet, usePlaceholderValue } from '../placeholderStore';

export const usePlaceholderPopoverState = (): any => {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected();
  const focused = useEditorFocused();

  const selectionCollapsed = useEditorSelector(
    (editor) => editor.read.selection.isCollapsed(),
    []
  );

  const element = useElement<TPlaceholderElement>(KEYS.placeholder);
  const { id, mediaType } = element;

  const setProgresses = usePlaceholderSet('progresses');
  const setIsUploading = usePlaceholderSet('isUploading');
  const setUpdatedFiles = usePlaceholderSet('updatedFiles');

  const size = usePlaceholderValue('size');

  return {
    id,
    editor,
    element,
    focused,
    mediaType,
    readOnly,
    selected,
    selectionCollapsed,
    setIsUploading,
    setProgresses,
    setUpdatedFiles,
    size,
  };
};
