import React from 'react';

import type { WithRequiredKey } from '@udecode/plate';

import {
  createPrimitiveComponent,
  useEditorRef,
  useElement,
  useHotkeys,
} from '@udecode/plate/react';

import type { TMediaElement } from '../../../lib/media/types';

import { FloatingMediaStore } from './FloatingMediaStore';
import { submitFloatingMedia } from './submitFloatingMedia';

export const useFloatingMediaUrlInputState = ({
  plugin,
}: {
  plugin: WithRequiredKey;
}) => {
  const editor = useEditorRef();
  const element = useElement<TMediaElement>();

  useHotkeys(
    'enter',
    (e) => {
      if (submitFloatingMedia(editor, { element, plugin })) {
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
      if (FloatingMediaStore.get('isEditing')) {
        FloatingMediaStore.actions.reset();
        editor.tf.focus({ at: editor.selection! });
      }
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: ['INPUT'],
    },
    []
  );

  return {
    defaultValue: FloatingMediaStore.get('url'),
  };
};

export const useFloatingMediaUrlInput = ({
  defaultValue,
}: ReturnType<typeof useFloatingMediaUrlInputState>) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
      FloatingMediaStore.set('url', e.target.value);
    }, []);

  return {
    props: {
      autoFocus: true,
      defaultValue,
      onChange,
    },
  };
};

export const FloatingMediaUrlInput = createPrimitiveComponent('input')({
  propsHook: useFloatingMediaUrlInput,
  stateHook: useFloatingMediaUrlInputState,
});
