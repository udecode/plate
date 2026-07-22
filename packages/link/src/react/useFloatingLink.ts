import React from 'react';

import {
  type UseVirtualFloatingOptions,
  getDOMSelectionBoundingClientRect,
  getRangeBoundingClientRect,
  useVirtualFloating,
} from '@platejs/floating';
import {
  useEditorFocused,
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelection,
  usePluginOption,
} from '@platejs/core/react';
import { KEYS } from '@platejs/utils';
import { useHotkeys } from '@udecode/react-hotkeys';
import { useComposedRef, useOnClickOutside } from '@udecode/react-utils';

import { LinkPlugin } from './LinkPlugin';

export type LinkFloatingToolbarState = {
  floatingOptions?: UseVirtualFloatingOptions;
};

export const useVirtualFloatingLink = ({
  editorId,
  ...floatingOptions
}: { editorId: string } & UseVirtualFloatingOptions) => {
  const { setOption } = useEditorPlugin(LinkPlugin);

  return useVirtualFloating({
    onOpenChange: (open) => setOption('openEditorId', open ? editorId : null),
    ...floatingOptions,
  });
};

export const useFloatingLinkEnter = () => {
  const { editor } = useEditorPlugin(LinkPlugin);
  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    '*',
    (e) => {
      if (e.key !== 'Enter') return;
      if (editor.plugin(LinkPlugin).api.submit()) {
        e.preventDefault();
      }
    },
    {
      enabled: open,
      enableOnFormTags: ['INPUT'],
    },
    []
  );
};

export const useFloatingLinkEscape = () => {
  const { api, editor, getOptions } = useEditorPlugin(LinkPlugin);
  const open = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    'escape',
    (e) => {
      const { isEditing, mode } = getOptions();

      if (!mode) return;

      e.preventDefault();

      if (mode === 'edit' && isEditing) {
        api.show('edit', editor.id);
        editor.api.dom.focus();

        return;
      }
      if (mode === 'insert') {
        editor.api.dom.focus();
      }

      api.hide();
    },
    {
      enabled: open,
      enableOnContentEditable: true,
      enableOnFormTags: ['INPUT'],
    },
    []
  );
};

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
      api.show('edit', editor.id);
      floating.update();

      return;
    }
    if (getOptions().mode === 'edit') {
      api.hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, versionEditor, floating.update]);

  useHotkeys(
    triggerFloatingLinkHotkeys ?? 'meta+k, ctrl+k',
    (e) => {
      if (
        getOptions().mode === 'edit' &&
        editor.plugin(LinkPlugin).api.triggerEdit()
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

  const clickOutsideRef = useOnClickOutside(() => {
    if (!getOptions().isEditing) return;

    api.hide();
  });

  return {
    editButtonProps: {
      onClick: () => {
        editor.plugin(LinkPlugin).api.triggerEdit();
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

export const useFloatingLinkInsertState = ({
  floatingOptions,
}: LinkFloatingToolbarState = {}) => {
  const { editor } = useEditorPlugin(LinkPlugin);
  const triggerFloatingLinkHotkeys = usePluginOption(
    LinkPlugin,
    'triggerFloatingLinkHotkeys'
  );
  const readOnly = useEditorReadOnly();
  const focused = useEditorFocused();
  const mode = usePluginOption(LinkPlugin, 'mode');
  const isOpen = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect: getDOMSelectionBoundingClientRect,
    open: isOpen && mode === 'insert',
    whileElementsMounted: () => () => {},
    ...floatingOptions,
  });

  return {
    floating,
    focused,
    isOpen,
    readOnly,
    triggerFloatingLinkHotkeys,
  };
};

export type FloatingLinkInsertProps = {
  hidden: boolean;
  props: { style: React.CSSProperties };
  ref: React.RefCallback<HTMLDivElement>;
  textInputProps: {
    defaultValue: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    ref: (element: HTMLInputElement) => void;
  };
};

export const useFloatingLinkInsert = ({
  floating,
  focused,
  isOpen,
  readOnly,
  triggerFloatingLinkHotkeys,
}: ReturnType<typeof useFloatingLinkInsertState>): FloatingLinkInsertProps => {
  const { api, editor, getOptions, setOption } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        setOption('text', e.target.value);
      },
      [setOption]
    );

  const ref = useOnClickOutside(
    () => {
      if (getOptions().mode === 'insert') {
        api.hide();
        editor.api.dom.focus();
      }
    },
    {
      disabled: !isOpen,
    }
  );

  // wait for update before focusing input
  React.useEffect(() => {
    if (isOpen) {
      floating.update();
      setOption('updated', true);
    } else {
      setOption('updated', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, floating.update]);

  useHotkeys(
    triggerFloatingLinkHotkeys ?? 'meta+k, ctrl+k',
    (e) => {
      if (editor.plugin(LinkPlugin).api.triggerInsert({ focused })) {
        e.preventDefault();
      }
    },
    {
      enableOnContentEditable: true,
    },
    [focused]
  );

  useFloatingLinkEscape();

  const { text, updated } = getOptions();

  const updatedValue = React.useCallback(
    (el: HTMLInputElement) => {
      if (el && updated) {
        el.value = getOptions().text;
      }
    },
    [getOptions, updated]
  );

  return {
    hidden: readOnly || !isOpen,
    props: {
      style: {
        ...floating.style,
        zIndex: 50,
      },
    },
    ref: useComposedRef<HTMLDivElement>(floating.refs.setFloating, ref),
    textInputProps: {
      defaultValue: text,
      ref: updatedValue,
      onChange,
    },
  };
};
