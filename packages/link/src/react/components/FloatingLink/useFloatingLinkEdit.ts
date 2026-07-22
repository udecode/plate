import React from 'react';

import {
  getDOMSelectionBoundingClientRect,
  getRangeBoundingClientRect,
} from '@platejs/floating';
import {
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelection,
  usePluginOption,
} from '@platejs/core/react';
import { KEYS } from '@platejs/utils';
import { useHotkeys } from '@udecode/react-hotkeys';
import { useComposedRef, useOnClickOutside } from '@udecode/react-utils';

import type { LinkFloatingToolbarState } from './useFloatingLinkInsert';

import { LinkPlugin } from '../../LinkPlugin';
import { triggerFloatingLinkEdit } from '../../utils/triggerFloatingLinkEdit';
import { useFloatingLinkEnter } from './useFloatingLinkEnter';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkEditState = ({
  floatingOptions,
}: LinkFloatingToolbarState = {}) => {
  const { editor, type } = useEditorPlugin(LinkPlugin);

  const triggerFloatingLinkHotkeys = usePluginOption(
    LinkPlugin,
    'triggerFloatingLinkHotkeys'
  );
  const readOnly = useEditorReadOnly();
  const isEditing = usePluginOption(LinkPlugin, 'isEditing');
  const selection = useEditorSelection();
  const mode = usePluginOption(LinkPlugin, 'mode');
  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  const getBoundingClientRect = React.useCallback(() => {
    const entry = editor.read.nodes.above({
      match: { type },
    });

    if (entry) {
      const [, path] = entry;

      const range = editor.read.ranges.get(path);

      if (range) return getRangeBoundingClientRect(editor, range);
    }

    return getDOMSelectionBoundingClientRect();
  }, [editor, type]);

  const isOpen = open && mode === 'edit' && editor.read.selection.isCollapsed();

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect,
    open: isOpen,
    ...floatingOptions,
  });

  return {
    editor,
    floating,
    isEditing,
    isOpen,
    readOnly,
    triggerFloatingLinkHotkeys,
    versionEditor: selection,
  };
};

export type FloatingLinkEditProps = {
  editButtonProps: { onClick: () => void };
  props: { style: React.CSSProperties };
  ref: React.RefCallback<HTMLElement>;
  unlinkButtonProps: {
    onClick: () => void;
    onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  };
};

export const useFloatingLinkEdit = ({
  editor,
  floating,
  triggerFloatingLinkHotkeys,
  versionEditor,
}: ReturnType<typeof useFloatingLinkEditState>): FloatingLinkEditProps => {
  const { api, getOptions } = useEditorPlugin(LinkPlugin);

  React.useEffect(() => {
    const selection = editor.read.selection();

    if (
      selection &&
      editor.read.selection.isCollapsed() &&
      editor.read.nodes.some({
        at: selection,
        match: { type: editor.getType(KEYS.link) },
      })
    ) {
      api.floatingLink.show('edit', editor.id);
      floating.update();

      return;
    }
    if (getOptions().mode === 'edit') {
      api.floatingLink.hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, versionEditor, floating.update]);

  useHotkeys(
    triggerFloatingLinkHotkeys ?? 'meta+k, ctrl+k',
    (e) => {
      if (getOptions().mode === 'edit' && triggerFloatingLinkEdit(editor)) {
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

  const clickOutsideRef = useOnClickOutside(() => {
    if (!getOptions().isEditing) return;

    api.floatingLink.hide();
  });

  return {
    editButtonProps: {
      onClick: () => {
        triggerFloatingLinkEdit(editor);
      },
    },
    props: {
      style: {
        ...floating.style,
        zIndex: 50,
      },
    },
    ref: useComposedRef<HTMLElement | null>(
      floating.refs.setFloating,
      clickOutsideRef
    ),
    unlinkButtonProps: {
      onClick: () => {
        editor.update.link.unwrap();
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
