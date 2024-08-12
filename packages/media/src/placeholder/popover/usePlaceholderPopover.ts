import { isSelectionExpanded } from '@udecode/plate-common';
import {
  useEditorRef,
  useEditorSelector,
  useElement,
} from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TPlaceholderElement } from '../types';

import { ELEMENT_PLACEHOLDER } from '../PlaceholderPlugin';
import { usePlaceholderStore } from '../placeholderStore';

export const usePlaceholderPopoverState = () => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  const selectionCollapsed = useEditorSelector(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (editor) => !isSelectionExpanded(editor),
    []
  );

  const element = useElement<TPlaceholderElement>(ELEMENT_PLACEHOLDER);
  const { id, mediaType } = element;

  const setProgresses = usePlaceholderStore().set.progresses();
  const setIsUploading = usePlaceholderStore().set.isUploading();
  const setUpdatedFiles = usePlaceholderStore().set.updatedFiles();

  return {
    editor,
    element,
    focused,
    id,
    mediaType,
    readOnly,
    selected,
    selectionCollapsed,
    setIsUploading,
    setProgresses,
    setUpdatedFiles,
  };
};
