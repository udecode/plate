import { type TPlaceholderElement, KEYS } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import {
  useEditorRef,
  useEditorSelector,
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

export type PlaceholderPopoverState = {
  editor: PlateEditor;
  element: TPlaceholderElement;
  focused: boolean;
  id: TPlaceholderElement['id'];
  mediaType: TPlaceholderElement['mediaType'];
  readOnly: boolean;
  selected: boolean;
  selectionCollapsed: boolean;
  setIsUploading: PlaceholderStoreSetter<'isUploading'>;
  setProgresses: PlaceholderStoreSetter<'progresses'>;
  setUpdatedFiles: PlaceholderStoreSetter<'updatedFiles'>;
  size: PlaceholderStore['size'];
};

export const usePlaceholderPopoverState = (): PlaceholderPopoverState => {
  const editor = useEditorRef<PlateEditor>();
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();

  const selectionCollapsed = useEditorSelector(
    (editor) => !editor.api.isExpanded(),
    []
  );

  const element = useElement<TPlaceholderElement>(KEYS.placeholder);
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
