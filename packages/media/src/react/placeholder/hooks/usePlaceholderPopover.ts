import {
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
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

  const setProgresses = usePlaceholderStore().useSetProgresses();
  const setIsUploading = usePlaceholderStore().useSetIsUploading();
  const setUpdatedFiles = usePlaceholderStore().useSetUpdatedFiles();

  const size = usePlaceholderStore().useSizeValue();

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
