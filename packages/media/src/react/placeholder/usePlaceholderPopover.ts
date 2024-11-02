import { isSelectionExpanded } from '@udecode/plate-common';
import {
  useEditorRef,
  useEditorSelector,
  useElement,
} from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import {
  type TPlaceholderElement,
  BasePlaceholderPlugin,
} from '../../lib/placeholder/BasePlaceholderPlugin';
import { usePlaceholderStore } from './placeholderStore';

export const usePlaceholderPopoverState = () => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  const selectionCollapsed = useEditorSelector(
    (editor) => !isSelectionExpanded(editor),
    []
  );

  const element = useElement<TPlaceholderElement>(BasePlaceholderPlugin.key);
  const { id, mediaType } = element;

  const setProgresses = usePlaceholderStore().set.progresses();
  const setIsUploading = usePlaceholderStore().set.isUploading();
  const setUpdatedFiles = usePlaceholderStore().set.updatedFiles();

  const mediaSize = usePlaceholderStore().get.mediaSize();

  return {
    id,
    editor,
    element,
    focused,
    mediaSize,
    mediaType,
    readOnly,
    selected,
    selectionCollapsed,
    setIsUploading,
    setProgresses,
    setUpdatedFiles,
  };
};
