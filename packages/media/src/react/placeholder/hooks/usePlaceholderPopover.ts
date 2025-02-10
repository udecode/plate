import {
  useEditorRef,
  useEditorSelector,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { usePlaceholderSet, usePlaceholderValue } from '../placeholderStore';

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
