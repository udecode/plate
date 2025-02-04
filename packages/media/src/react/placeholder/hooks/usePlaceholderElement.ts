import {
  useEditorRef,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
  useStoreSet,
  useStoreValue,
} from '@udecode/plate/react';

import { type TPlaceholderElement, BasePlaceholderPlugin } from '../../../lib';
import { usePlaceholderStore } from '../placeholderStore';

export const usePlaceholderElementState = () => {
  const element = useElement();
  const editor = useEditorRef();
  const focused = useFocused();
  const readOnly = useReadOnly();
  const selected = useSelected();

  const store = usePlaceholderStore();
  const progresses = useStoreValue(store, 'progresses');
  const isUploading = useStoreValue(store, 'isUploading');
  const updatedFiles = useStoreValue(store, 'updatedFiles');
  const setSize = useStoreSet(store, 'size');

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
