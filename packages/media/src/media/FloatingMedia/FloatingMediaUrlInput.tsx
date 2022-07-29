import { ChangeEventHandler, useCallback, useEffect } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  focusEditor,
  HTMLPropsAs,
  isUrl,
  mergeProps,
  PlateEditor,
  setNodes,
  useEditorRef,
  useElement,
  useHotkeys,
  Value,
} from '@udecode/plate-core';
import { TMediaElement } from '../types';
import {
  floatingMediaActions,
  floatingMediaSelectors,
} from './floatingMediaStore';

export const submitFloatingMedia = <V extends Value>(
  editor: PlateEditor<V>,
  element: TMediaElement
) => {
  const url = floatingMediaSelectors.url();

  if (url === element.url) {
    floatingMediaActions.reset();
    return true;
  }

  // const { isUrl } = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);
  const isValid = isUrl?.(url);
  if (!isValid) return;

  setNodes<TMediaElement>(editor, {
    url,
  });

  floatingMediaActions.reset();

  focusEditor(editor, editor.selection!);

  return true;
};

export const useFloatingMediaUrlInput = (
  props: HTMLPropsAs<'input'>
): HTMLPropsAs<'input'> => {
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
      if (submitFloatingMedia(editor, element)) {
        e.preventDefault();
      }
    },
    {
      enableOnTags: ['INPUT'],
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
      enableOnTags: ['INPUT'],
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

export const FloatingMediaUrlInput = createComponentAs<AsProps<'input'>>(
  (props) => {
    const htmlProps = useFloatingMediaUrlInput(props);

    return createElementAs('input', htmlProps);
  }
);
