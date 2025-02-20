import React from 'react';

import {
  getDOMSelectionBoundingClientRect,
  getRangeBoundingClientRect,
} from '@udecode/plate-floating';
import {
  useComposedRef,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorVersion,
  useHotkeys,
  useOnClickOutside,
  usePluginOption,
} from '@udecode/plate/react';

import type { LinkFloatingToolbarState } from './useFloatingLinkInsert';

import { unwrapLink } from '../../../lib';
import { LinkPlugin } from '../../LinkPlugin';
import { triggerFloatingLinkEdit } from '../../utils/triggerFloatingLinkEdit';
import { useFloatingLinkEnter } from './useFloatingLinkEnter';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkEditState = ({
  floatingOptions,
}: LinkFloatingToolbarState = {}) => {
  const { editor, getOptions, type } = useEditorPlugin(LinkPlugin);

  const { triggerFloatingLinkHotkeys } = getOptions();
  const readOnly = useEditorReadOnly();
  const isEditing = usePluginOption(LinkPlugin, 'isEditing');
  const version = useEditorVersion();
  const mode = usePluginOption(LinkPlugin, 'mode');
  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  const getBoundingClientRect = React.useCallback(() => {
    const entry = editor.api.above({
      match: { type },
    });

    if (entry) {
      const [, path] = entry;

      return getRangeBoundingClientRect(editor, {
        anchor: editor.api.start(path)!,
        focus: editor.api.end(path)!,
      });
    }

    return getDOMSelectionBoundingClientRect();
  }, [editor, type]);

  const isOpen = open && mode === 'edit';

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
    versionEditor: version,
  };
};

export const useFloatingLinkEdit = ({
  editor,
  floating,
  triggerFloatingLinkHotkeys,
  versionEditor,
}: ReturnType<typeof useFloatingLinkEditState>) => {
  const { api, getOptions } = useEditorPlugin(LinkPlugin);

  React.useEffect(() => {
    if (
      editor.selection &&
      editor.api.some({
        match: { type: editor.getType(LinkPlugin) },
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
    triggerFloatingLinkHotkeys!,
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
        unwrapLink(editor);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
