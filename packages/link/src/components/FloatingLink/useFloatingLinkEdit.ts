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
  usePlateSelectors,
} from '@udecode/plate-common';
import {
  getDefaultBoundingClientRect,
  getRangeBoundingClientRect,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';
import { ELEMENT_LINK, LinkPlugin } from '../../createLinkPlugin';
import { unwrapLink } from '../../index';
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
}: {
  floatingOptions?: UseVirtualFloatingOptions;
} = {}) => {
  const editor = usePlateEditorRef();
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

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    open: isOpen,
    getBoundingClientRect,
    ...floatingOptions,
  });
  const { update } = floating;

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
    floating,
  };
};

export const useFloatingLinkEdit = (
  state: ReturnType<typeof useFloatingLinkEditState>
) => {
  const editor = usePlateEditorRef();

  return {
    ref: state.floating.refs.setFloating,
    props: {
      style: {
        ...state.floating.style,
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
