import { useCallback, useEffect } from 'react';
import {
  focusEditor,
  getAboveNode,
  getEndPoint,
  getPluginOptions,
  getPluginType,
  getStartPoint,
  someNode,
  useHotkeys,
  usePlateEditorRef,
  usePlateReadOnly,
  usePlateSelectors,
} from '@udecode/plate-common';
import {
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
} from '@udecode/plate-floating';

import { ELEMENT_LINK, LinkPlugin } from '../../createLinkPlugin';
import { LinkFloatingToolbarState, unwrapLink } from '../../index';
import { triggerFloatingLinkEdit } from '../../utils/triggerFloatingLinkEdit';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';
import { useFloatingLinkEnter } from './useFloatingLinkEnter';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkEditState = ({
  floatingOptions,
}: LinkFloatingToolbarState = {}) => {
  const editor = usePlateEditorRef();
  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPlugin>(
    editor,
    ELEMENT_LINK
  );
  const readOnly = usePlateReadOnly();
  const isEditing = useFloatingLinkSelectors().isEditing();
  const keyEditor = usePlateSelectors().keyEditor();
  const mode = useFloatingLinkSelectors().mode();
  const open = useFloatingLinkSelectors().isOpen(editor.id);

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

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    open: isOpen,
    getBoundingClientRect,
    ...floatingOptions,
  });

  return {
    editor,
    triggerFloatingLinkHotkeys,
    isOpen,
    floating,
    keyEditor,
    isEditing,
    readOnly,
  };
};

export const useFloatingLinkEdit = ({
  editor,
  triggerFloatingLinkHotkeys,
  keyEditor,
  floating,
  isOpen,
  readOnly,
}: ReturnType<typeof useFloatingLinkEditState>) => {
  useEffect(() => {
    if (
      editor.selection &&
      someNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      })
    ) {
      floatingLinkActions.show('edit', editor.id);
      floating.update();
      return;
    }

    if (floatingLinkSelectors.mode() === 'edit') {
      floatingLinkActions.hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, keyEditor, floating.update]);

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
    ref: floating.refs.setFloating,
    props: {
      style: {
        ...floating.style,
        zIndex: 1,
      },
    },
    editButtonProps: {
      onClick: useCallback(() => {
        triggerFloatingLinkEdit(editor);
      }, [editor]),
    },
    unlinkButtonProps: {
      onClick: useCallback(() => {
        unwrapLink(editor);
        focusEditor(editor, editor.selection!);
      }, [editor]),
    },
  };
};
