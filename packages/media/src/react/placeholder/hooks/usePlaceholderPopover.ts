import {
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
  useStoreSet,
  useStoreValue,
} from '@udecode/plate/react';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { usePlaceholderStore } from '../placeholderStore';

export const usePlaceholderPopoverState = () => {
  const editor = useEditorRef();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  const selectionCollapsed = useEditorSelector(
    (editor) => !editor.api.isExpanded(),
    []
  );

  const element = useElement<TPlaceholderElement>(BasePlaceholderPlugin.key);
  const { id, mediaType } = element;

  const store = usePlaceholderStore();
  const setProgresses = useStoreSet(store, 'progresses');
  const setIsUploading = useStoreSet(store, 'isUploading');
  const setUpdatedFiles = useStoreSet(store, 'updatedFiles');

  const size = useStoreValue(store, 'size');

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
