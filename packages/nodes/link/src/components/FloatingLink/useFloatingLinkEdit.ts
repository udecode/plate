import { useCallback, useEffect } from 'react';
import {
  getAboveNode,
  getEndPoint,
  getPluginOptions,
  getPluginType,
  getStartPoint,
  HTMLPropsAs,
  someNode,
  useComposedRef,
  useEditorRef,
  useHotkeys,
  usePlateSelectors,
} from '@udecode/plate-common';
import {
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
} from '@udecode/plate-floating';
import { ELEMENT_LINK, LinkPlugin } from '../../createLinkPlugin';
import { triggerFloatingLinkEdit } from '../../utils/triggerFloatingLinkEdit';
import { FloatingLinkProps } from './FloatingLink';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';
import { useFloatingLinkEnter } from './useFloatingLinkEnter';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkEdit = ({
  floatingOptions,
  ...props
}: FloatingLinkProps): HTMLPropsAs<'div'> => {
  const editor = useEditorRef();
  const keyEditor = usePlateSelectors().keyEditor();
  const mode = useFloatingLinkSelectors().mode();
  const open = useFloatingLinkSelectors().isOpen(editor.id);

  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPlugin>(
    editor,
    ELEMENT_LINK
  );

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
    editorId: editor.id,
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
      floatingLinkActions.show('edit', editor.id);
      update();
      return;
    }

    if (floatingLinkSelectors.mode() === 'edit') {
      floatingLinkActions.hide();
    }
  }, [editor, keyEditor, update]);

  useHotkeys(
    triggerFloatingLinkHotkeys!,
    (e) => {
      if (
        floatingLinkSelectors.mode() === 'edit' &&
        triggerFloatingLinkEdit(editor)
      ) {
        e.preventDefault();
      }
    },
    {
      enableOnContentEditable: true,
    },
    []
  );

  useFloatingLinkEnter();

  useFloatingLinkEscape();

  return {
    style: {
      ...style,
      zIndex: 1,
    },
    ...props,
    ref: useComposedRef<HTMLElement | null>(props.ref, floating),
  };
};
