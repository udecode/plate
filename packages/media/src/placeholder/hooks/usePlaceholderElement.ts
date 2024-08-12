import { useEditorRef, useElement } from '@udecode/plate-common/react';
import { useFocused, useReadOnly, useSelected } from 'slate-react';

import type { TPlaceholderElement } from '../types';

import { ELEMENT_PLACEHOLDER } from '../PlaceholderPlugin';
import { usePlaceholderStore } from '../placeholderStore';

export const usePlaceholderElementState = () => {
  const element = useElement();
  const editor = useEditorRef();
  const focused = useFocused();
  const readOnly = useReadOnly();
  const selected = useSelected();

  const progresses = usePlaceholderStore().get.progresses();
  const isUploading = usePlaceholderStore().get.isUploading();
  const updatedFiles = usePlaceholderStore().get.updatedFiles();

  const { mediaType } = useElement<TPlaceholderElement>(ELEMENT_PLACEHOLDER);

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
    updatedFiles,
  };
};
