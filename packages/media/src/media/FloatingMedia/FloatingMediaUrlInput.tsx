import { ChangeEventHandler, useCallback } from 'react';
import {
  createPrimitiveComponent,
  focusEditor,
  useElement,
  useHotkeys,
  usePlateEditorRef,
} from '@udecode/plate-common';

import { TMediaElement } from '../types';
import {
  floatingMediaActions,
  floatingMediaSelectors,
} from './floatingMediaStore';
import { submitFloatingMedia } from './submitFloatingMedia';

export const useFloatingMediaUrlInputState = ({
  pluginKey,
}: {
  pluginKey?: string;
} = {}) => {
  const editor = usePlateEditorRef();
  const element = useElement<TMediaElement>();

  useHotkeys(
    'enter',
    (e) => {
      if (submitFloatingMedia(editor, { element, pluginKey })) {
        e.preventDefault();
      }
    },
    {
      enableOnFormTags: ['INPUT'],
    },
    []
  );

  useHotkeys(
    'escape',
    () => {
      if (floatingMediaSelectors.isEditing()) {
        floatingMediaActions.reset();
        focusEditor(editor, editor.selection!);
      }
    },
    {
      enableOnFormTags: ['INPUT'],
      enableOnContentEditable: true,
    },
    []
  );

  return {
    defaultValue: floatingMediaSelectors.url(),
  };
};

export const useFloatingMediaUrlInput = ({
  defaultValue,
}: ReturnType<typeof useFloatingMediaUrlInputState>) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingMediaActions.url(e.target.value);
  }, []);

  return {
    props: {
      onChange,
      autoFocus: true,
      defaultValue,
    },
  };
};

export const FloatingMediaUrlInput = createPrimitiveComponent('input')({
  stateHook: useFloatingMediaUrlInputState,
  propsHook: useFloatingMediaUrlInput,
});
