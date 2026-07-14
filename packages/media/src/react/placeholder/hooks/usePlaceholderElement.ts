import {
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from '@platejs/plite-react';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';
import { useEditorRef, useElement } from 'platejs/react';

import { usePlaceholderSet, usePlaceholderValue } from '../placeholderStore';

export const usePlaceholderElementState = (): any => {
  const element = useElement();
  const editor = useEditorRef();
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected();

  const progresses = usePlaceholderValue('progresses');
  const isUploading = usePlaceholderValue('isUploading');
  const updatedFiles = usePlaceholderValue('updatedFiles');
  const setSize = usePlaceholderSet('size');

  const { mediaType } = useElement<TPlaceholderElement>(KEYS.placeholder);

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
