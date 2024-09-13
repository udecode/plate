import { isSelectionExpanded } from '@udecode/plate-common';
import {
  useEditorRef,
  useEditorSelector,
  useElement,
} from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TPlaceholderElement } from '../../lib/placeholder/types';

import { BasePlaceholderPlugin } from '../../lib/placeholder/BasePlaceholderPlugin';
import { usePlaceholderStore } from './placeholderStore';

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

  const element = useElement<TPlaceholderElement>(BasePlaceholderPlugin.key);
  const { id, mediaType } = element;

  const setProgresses = usePlaceholderStore().set.progresses();
  const setIsUploading = usePlaceholderStore().set.isUploading();
  const setUpdatedFiles = usePlaceholderStore().set.updatedFiles();

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
  };
};
