import React from 'react';

import {
  type UseVirtualFloatingOptions,
  getDOMSelectionBoundingClientRect,
  getDefaultBoundingClientRect,
  useVirtualFloating,
} from '@platejs/floating';
import {
  useEditorPlugin,
  useEditorReadOnly,
  useEditorSelection,
  usePluginStore,
} from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';
import { useHotkeys } from '@udecode/react-hotkeys';
import { useComposedRef, useOnClickOutside } from '@udecode/react-utils';

import { LinkPlugin } from './LinkPlugin';

export type LinkFloatingToolbarState = {
  floatingOptions?: UseVirtualFloatingOptions;
};

export type FloatingLinkTriggerOptions = {
  focused?: boolean;
};

export const useFloatingLinkActions = () => {
  const { api, editor, store, type, update } = useEditorPlugin(LinkPlugin);

  const submit = React.useCallback(() => {
    if (!editor.read.selection()) return;

    const {
      forceSubmit,
      newTab,
      text,
      transformInput,
      url: inputUrl,
    } = store.get();
    const url = transformInput ? (transformInput(inputUrl) ?? '') : inputUrl;

    if (!forceSubmit && !api.validateUrl(url)) return;

    api.hide();
    update.upsert({
      skipValidation: true,
      target: newTab ? '_blank' : undefined,
      text,
      url,
    });
    setTimeout(() => editor.api.dom.focus(), 0);

    return true;
  }, [api, editor, store, update]);

  const triggerEdit = React.useCallback(() => {
    const selection = editor.read.selection();

    if (!selection) return;

    const entry = editor.read.nodes.above<TLinkElement>({
      at: selection,
      match: { type },
    });

    if (!entry) return;

    const [link, path] = entry;
    const linkText = editor.read.text.string(path);

    store.set({
      isEditing: true,
      newTab: link.target === '_blank',
      text: linkText === link.url ? '' : linkText,
      url: link.url,
    });

    return true;
  }, [editor, store, type]);

  const triggerInsert = React.useCallback(
    ({ focused }: FloatingLinkTriggerOptions = {}) => {
      if (store.get().mode || !focused) return;
      if (editor.read.selection.isAcrossBlocks()) return;

      const selection = editor.read.selection();

      if (!selection) return;
      if (editor.read.nodes.some({ at: selection, match: { type } })) return;

      store.set({ text: editor.read.text.string() });
      api.show('insert', editor.id);

      return true;
    },
    [api, editor, store, type]
  );

  const trigger = React.useCallback(
    (options?: FloatingLinkTriggerOptions) =>
      store.get().mode === 'edit' ? triggerEdit() : triggerInsert(options),
    [store, triggerEdit, triggerInsert]
  );

  return { submit, trigger, triggerEdit, triggerInsert };
};

export const useFloatingLinkNewTabInputState = () => {
  const { store } = useEditorPlugin(LinkPlugin);
  const updated = usePluginStore(LinkPlugin, 'updated');
  const ref = React.useRef<HTMLInputElement>(null);
  const [checked, setChecked] = React.useState<boolean>(store.get().newTab);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }, [updated]);

  return {
    checked,
    ref,
    setChecked,
  };
};

export const useFloatingLinkNewTabInput = ({
  checked,
  ref,
  setChecked,
}: ReturnType<typeof useFloatingLinkNewTabInputState>) => {
  const { store } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        setChecked(e.target.checked);
        store.set({ newTab: e.target.checked });
      },
      [store, setChecked]
    );

  return {
    props: {
      checked,
      type: 'checkbox',
      onChange,
    },
    ref,
  };
};

export const useFloatingLinkUrlInputState = () => {
  const { api, store } = useEditorPlugin(LinkPlugin);
  const updated = usePluginStore(LinkPlugin, 'updated');
  const ref = React.useRef<HTMLInputElement>(null);
  const focused = React.useRef(false);

  React.useEffect(() => {
    if (ref.current && updated) {
      setTimeout(() => {
        const input = ref.current;

        if (!input || focused.current) return;

        focused.current = true;

        const url = store.get().url;
        input.focus();
        input.value = url ? api.decodeUrl(url) : '';
      }, 0);
    }
  }, [api, store, updated]);

  return {
    ref,
  };
};

export const useFloatingLinkUrlInput = (
  state: ReturnType<typeof useFloatingLinkUrlInputState>
) => {
  const { api, store } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        const url = api.encodeUrl(e.target.value);
        store.set({ url });
      },
      [api, store]
    );

  return {
    props: {
      defaultValue: store.get().url,
      onChange,
    },
    ref: state.ref,
  };
};

export const useVirtualFloatingLink = ({
  editorId,
  ...floatingOptions
}: { editorId: string } & UseVirtualFloatingOptions) => {
  const { store } = useEditorPlugin(LinkPlugin);

  return useVirtualFloating({
    onOpenChange: (open) => store.set({ openEditorId: open ? editorId : null }),
    ...floatingOptions,
  });
};

export const useFloatingLinkEnter = () => {
  const { editor } = useEditorPlugin(LinkPlugin);
  const { submit } = useFloatingLinkActions();
  const open = usePluginStore(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    '*',
    (e) => {
      if (e.key !== 'Enter') return;
      if (submit()) {
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
  const { api, editor, store } = useEditorPlugin(LinkPlugin);
  const open = usePluginStore(LinkPlugin, 'isOpen', editor.id);

  useHotkeys(
    'escape',
    (e) => {
      const { isEditing, mode } = store.get();

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
  const triggerFloatingLinkHotkeys = usePluginStore(
    LinkPlugin,
    'triggerFloatingLinkHotkeys'
  );
  const readOnly = useEditorReadOnly();
  const isEditing = usePluginStore(LinkPlugin, 'isEditing');
  const selection = useEditorSelection();
  const mode = usePluginStore(LinkPlugin, 'mode');
  const open = usePluginStore(LinkPlugin, 'isOpen', editor.id);

  const getBoundingClientRect = React.useCallback(() => {
    const entry = editor.read.nodes.above({
      match: { type },
    });

    if (entry) {
      const [, path] = entry;
      const range = editor.read.ranges.get(path);

      if (range) {
        return (
          editor.api.dom.resolveDOMRange(range)?.getBoundingClientRect() ??
          getDefaultBoundingClientRect()
        );
      }
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
  const { api, store, type } = useEditorPlugin(LinkPlugin);
  const { triggerEdit } = useFloatingLinkActions();

  React.useEffect(() => {
    const selection = editor.read.selection();

    if (
      selection &&
      editor.read.selection.isCollapsed() &&
      editor.read.nodes.some({
        at: selection,
        match: { type },
      })
    ) {
      api.show('edit', editor.id);
      floating.update();

      return;
    }
    if (store.get().mode === 'edit') {
      api.hide();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, versionEditor, floating.update]);

  useHotkeys(
    triggerFloatingLinkHotkeys ?? 'meta+k, ctrl+k',
    (e) => {
      if (store.get().mode === 'edit' && triggerEdit()) {
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
    if (!store.get().isEditing) return;

    api.hide();
  });

  return {
    editButtonProps: {
      onClick: () => {
        triggerEdit();
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
  const triggerFloatingLinkHotkeys = usePluginStore(
    LinkPlugin,
    'triggerFloatingLinkHotkeys'
  );
  const readOnly = useEditorReadOnly();
  const mode = usePluginStore(LinkPlugin, 'mode');
  const isOpen = usePluginStore(LinkPlugin, 'isOpen', editor.id);

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect: getDOMSelectionBoundingClientRect,
    open: isOpen && mode === 'insert',
    whileElementsMounted: () => () => {},
    ...floatingOptions,
  });

  return {
    floating,
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
  isOpen,
  readOnly,
  triggerFloatingLinkHotkeys,
}: ReturnType<typeof useFloatingLinkInsertState>): FloatingLinkInsertProps => {
  const { api, editor, store } = useEditorPlugin(LinkPlugin);
  const { triggerInsert } = useFloatingLinkActions();

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        store.set({ text: e.target.value });
      },
      [store]
    );

  const ref = useOnClickOutside(
    () => {
      if (store.get().mode === 'insert') {
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
      store.set({ updated: true });
    } else {
      store.set({ updated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, floating.update]);

  useHotkeys(
    triggerFloatingLinkHotkeys ?? 'meta+k, ctrl+k',
    (e) => {
      if (triggerInsert({ focused: editor.read.view.isFocused() })) {
        e.preventDefault();
      }
    },
    {
      enableOnContentEditable: true,
    },
    []
  );

  useFloatingLinkEscape();

  const { text, updated } = store.get();

  const updatedValue = React.useCallback(
    (el: HTMLInputElement) => {
      if (el && updated) {
        el.value = store.get().text;
      }
    },
    [store, updated]
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
