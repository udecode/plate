import React, { useEffect } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  createStore,
  focusEditor,
  HTMLPropsAs,
  isUrl,
  RenderAfterEditableProps,
  useComposedRef,
  useEditorState,
  useHotkeys,
  useOnClickOutside,
} from '@udecode/plate-core';
import {
  flip,
  getSelectionBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@udecode/plate-floating';
import { useFocused } from 'slate-react';
import { insertLinkNode } from '../transforms/index';
import { FloatingLinkTextInput } from './FloatingLinkTextInput';
import { FloatingLinkUrlInput } from './FloatingLinkUrlInput';

export const floatingLinkStore = createStore('floatingLink')({
  open: false,
  mouseDown: false,
  updated: false,
  url: '',
  text: '',
});

export const useFloatingLink = ({
  editor,
  plugin,
  ...props
}: RenderAfterEditableProps & HTMLPropsAs<'div'>): HTMLPropsAs<'div'> => {
  const focused = useFocused();
  useEditorState();

  const open = floatingLinkStore.use.open();

  const { floating, style, update } = useVirtualFloating({
    getBoundingClientRect: getSelectionBoundingClientRect,
    placement: 'bottom-start',
    open,
    onOpenChange: floatingLinkStore.set.open,
    middleware: [
      offset(12),
      flip({
        padding: 150,
      }),
    ],
    whileElementsMounted: () => {},
  });

  // useEffect(() => {
  //   floatingLinkStore.set.update(update);
  // }, [update]);

  // wait for update before focusing input
  useEffect(() => {
    if (open) {
      update();
      floatingLinkStore.set.updated(true);
    } else {
      floatingLinkStore.set.updated(false);
    }
  }, [open, update]);

  // reset url and text when closing
  useEffect(() => {
    if (!open) {
      floatingLinkStore.set.url('');
      floatingLinkStore.set.text('');
    }
  }, [open]);

  useHotkeys(
    'command+k, ctrl+k',
    () => {
      if (!focused) return;

      floatingLinkStore.set.open(true);
    },
    {
      enableOnContentEditable: true,
    },
    [focused]
  );

  useHotkeys(
    'enter',
    (e) => {
      const url = floatingLinkStore.get.url();
      const isValid = isUrl(url);
      if (!isValid) return;

      const text = floatingLinkStore.get.text();

      floatingLinkStore.set.open(false);

      insertLinkNode(editor, {
        url,
        text,
      });

      setTimeout(() => {
        focusEditor(editor, editor.selection!);
      }, 0);

      e.preventDefault();
    },
    {
      enableOnTags: ['INPUT'],
    },
    []
  );

  useHotkeys(
    'escape',
    () => {
      floatingLinkStore.set.open(false);
      focusEditor(editor, editor.selection!);
    },
    {
      enableOnTags: ['INPUT'],
    },
    []
  );

  const ref = useOnClickOutside(() => {
    floatingLinkStore.set.open(false);
  });

  return {
    style: {
      ...style,
      zIndex: 1,
    },
    ...props,
    ref: useComposedRef<HTMLElement | null>(props.ref, floating, ref),
  };
};

export const FloatingLinkRoot = createComponentAs<
  RenderAfterEditableProps & AsProps<'div'>
>((props) => {
  const htmlProps = useFloatingLink(props);

  if (htmlProps.style?.display === 'none') return null;

  return createElementAs('div', htmlProps);
});

export const FloatingLink = {
  Root: FloatingLinkRoot,
  UrlInput: FloatingLinkUrlInput,
  TextInput: FloatingLinkTextInput,
};
