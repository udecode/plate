import { ChangeEventHandler, useCallback, useEffect } from 'react';
import {
  createComponentAs,
  createElementAs,
  focusEditor,
  HTMLPropsAs,
  mergeProps,
  useEditorRef,
  useElement,
  useHotkeys,
} from '@udecode/plate-core';
import { TMediaElement } from '../types';
import {
  floatingMediaActions,
  floatingMediaSelectors,
} from './floatingMediaStore';
import { submitFloatingMedia } from './submitFloatingMedia';

export type FloatingMediaUrlInputProps = HTMLPropsAs<'input'> & {
  pluginKey?: string;
};

export const useFloatingMediaUrlInput = ({
  pluginKey,
  ...props
}: FloatingMediaUrlInputProps): HTMLPropsAs<'input'> => {
  const editor = useEditorRef();
  const element = useElement<TMediaElement>();

  useEffect(() => {
    return () => {
      floatingMediaActions.isEditing(false);
    };
  }, []);

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

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingMediaActions.url(e.target.value);
  }, []);

  return mergeProps(
    {
      onChange,
      autoFocus: true,
      defaultValue: floatingMediaSelectors.url(),
    },
    props
  );
};

export const FloatingMediaUrlInput = createComponentAs<FloatingMediaUrlInputProps>(
  (props) => {
    const htmlProps = useFloatingMediaUrlInput(props);

    return createElementAs('input', htmlProps);
  }
);
