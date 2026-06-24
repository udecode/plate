import { type TPlaceholderElement, KEYS } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import {
  useEditorRef,
  useElement,
  useFocused,
  useReadOnly,
  useSelected,
} from 'platejs/react';

import type {
  PlaceholderStore,
  PlaceholderStoreSetter,
} from '../placeholderStore';
import { usePlaceholderSet, usePlaceholderValue } from '../placeholderStore';

export type PlaceholderElementState = {
  editor: PlateEditor;
  element: TPlaceholderElement;
  focused: boolean;
  isUploading: PlaceholderStore['isUploading'];
  mediaType: TPlaceholderElement['mediaType'];
  progresses: PlaceholderStore['progresses'];
  progressing: boolean;
  readOnly: boolean;
  selected: boolean;
  setSize: PlaceholderStoreSetter<'size'>;
  updatedFiles: PlaceholderStore['updatedFiles'];
};

export const usePlaceholderElementState = (): PlaceholderElementState => {
  const element = useElement<TPlaceholderElement>(KEYS.placeholder);
  const editor = useEditorRef<PlateEditor>();
  const focused = useFocused();
  const readOnly = useReadOnly();
  const selected = useSelected();

  const progresses = usePlaceholderValue('progresses');
  const isUploading = usePlaceholderValue('isUploading');
  const updatedFiles = usePlaceholderValue('updatedFiles');
  const setSize = usePlaceholderSet('size');

  const { mediaType } = element;

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
