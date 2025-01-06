import {
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
} from '@udecode/plate-common/react';

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

  const setProgresses = usePlaceholderStore().set.progresses();
  const setIsUploading = usePlaceholderStore().set.isUploading();
  const setUpdatedFiles = usePlaceholderStore().set.updatedFiles();

  const size = usePlaceholderStore().get.size();

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
