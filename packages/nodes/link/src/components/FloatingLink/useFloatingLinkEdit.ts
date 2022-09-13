import { useCallback, useEffect } from 'react';
import {
  focusEditor,
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
} from '@udecode/plate-core';
import {
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
} from '@udecode/plate-floating';
import { ELEMENT_LINK, LinkPlugin } from '../../createLinkPlugin';
import { submitFloatingLink } from '../../transforms/submitFloatingLink';
import { triggerFloatingLinkEdit } from '../../utils/triggerFloatingLinkEdit';
import { FloatingLinkProps } from './FloatingLink';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkEdit = ({
  floatingOptions,
  ...props
}: FloatingLinkProps): HTMLPropsAs<'div'> => {
  const editor = useEditorRef();
  const keyEditor = usePlateSelectors().keyEditor();
  const mode = useFloatingLinkSelectors().mode();
  const open = useFloatingLinkSelectors().open();

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
      return;
    }

    if (floatingLinkSelectors.mode() === 'edit') {
      floatingLinkActions.hide();
    }
  }, [editor, keyEditor, update]);

  useHotkeys(
    triggerFloatingLinkHotkeys!,
    () => {
      if (floatingLinkSelectors.mode() === 'edit') {
        triggerFloatingLinkEdit(editor);
      }
    },
    {
      enableOnContentEditable: true,
    },
    []
  );

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
      if (floatingLinkSelectors.mode() !== 'edit') return;

      if (floatingLinkSelectors.isEditing()) {
        floatingLinkActions.show('edit');
        focusEditor(editor, editor.selection!);
        return;
      }

      floatingLinkActions.hide();
    },
    {
      enableOnTags: ['INPUT'],
      enableOnContentEditable: true,
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
