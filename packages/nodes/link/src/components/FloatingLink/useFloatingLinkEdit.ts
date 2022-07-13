import { useCallback, useEffect } from 'react';
import {
  focusEditor,
  getAboveNode,
  getEndPoint,
  getPluginType,
  getStartPoint,
  HTMLPropsAs,
  someNode,
  useComposedRef,
  useEditorRef,
  useHotkeys,
  usePlateSelectors,
} from '@udecode/plate-core';
import {
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
} from '@udecode/plate-floating';
import { ELEMENT_LINK } from '../../createLinkPlugin';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';
import { FloatingLinkProps } from './FloatingLink';
import {
  floatingLinkActions,
  useFloatingLinkSelectors,
} from './floatingLinkStore';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkEdit = ({
  floatingOptions,
  ...props
}: FloatingLinkProps): HTMLPropsAs<'div'> => {
  const editor = useEditorRef();
  const keyEditor = usePlateSelectors(editor.id).keyEditor();
  const mode = useFloatingLinkSelectors().mode();
  const open = useFloatingLinkSelectors().open();

  const getBoundingClientRect = useCallback(() => {
    const entry = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_LINK) },
    });

    if (entry) {
      const [, path] = entry;
      return getRangeBoundingClientRect(editor, {
        anchor: getStartPoint(editor, path),
        focus: getEndPoint(editor, path),
      });
    }

    return getDefaultBoundingClientRect();
  }, [editor]);

  const isOpen = open && mode === 'edit';

  const { update, style, floating } = useVirtualFloatingLink({
    open: isOpen,
    getBoundingClientRect,
    ...floatingOptions,
  });

  useEffect(() => {
    if (
      editor.selection &&
      someNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      })
    ) {
      floatingLinkActions.show('edit');
      update();
    } else {
      floatingLinkActions.hide();
    }
  }, [editor, keyEditor, update]);

  useHotkeys(
    'enter',
    (e) => {
      if (submitFloatingLink(editor)) {
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
      floatingLinkActions.hide();
      focusEditor(editor, editor.selection!);
    },
    {
      enableOnTags: ['INPUT'],
    },
    []
  );

  return {
    style: {
      ...style,
      zIndex: 1,
    },
    ...props,
    ref: useComposedRef<HTMLElement | null>(props.ref, floating),
  };
};
