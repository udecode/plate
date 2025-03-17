import {
  useEditorRef,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { usePlaceholderSet, usePlaceholderValue } from '../placeholderStore';

export const usePlaceholderElementState = () => {
  const element = useElement();
  const editor = useEditorRef();
  const focused = useFocused();
  const readOnly = useReadOnly();
  const selected = useSelected();

  const progresses = usePlaceholderValue('progresses');
  const isUploading = usePlaceholderValue('isUploading');
  const updatedFiles = usePlaceholderValue('updatedFiles');
  const setSize = usePlaceholderSet('size');

  const { mediaType } = useElement<TPlaceholderElement>(
    BasePlaceholderPlugin.key
  );

  const progressing = updatedFiles.length > 0 && isUploading;

  return {
    editor,
    element,
    focused,
    isUploading,
    mediaType,
    progresses,
    progressing,
    readOnly,
    selected,
    setSize,
    updatedFiles,
  };
};
