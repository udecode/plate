import {
  ElementStatePlugin,
  type GetInjectNodePropsReturnType,
  type WithAnyKey,
} from '@platejs/core';
import {
  type TransformOptions,
  type UseHooks,
  useEditorComposing,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
import { useEffect } from 'react';
import type { BlockPlaceholderHookConfig } from '../plugins/BlockPlaceholderPlugin';

type BlockPlaceholderContextConfig = WithAnyKey<BlockPlaceholderHookConfig>;

export const useBlockPlaceholderProps = (
  props: TransformOptions<BlockPlaceholderContextConfig> & {
    props: GetInjectNodePropsReturnType;
  }
) => {
  const placeholder = usePluginStore(props.plugin, 'placeholder', props.path);

  if (props.element && placeholder) {
    return {
      className: props.store.get().className,
      placeholder,
    };
  }
};

export const useBlockPlaceholder: UseHooks<BlockPlaceholderContextConfig> = ({
  editor,
  store,
  type,
}) => {
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const composing = useEditorComposing();

  const entry = useEditorSelector(() => {
    if (
      readOnly ||
      composing ||
      !focused ||
      !editor.read.selection() ||
      editor.read.selection.isExpanded()
    ) {
      return null;
    }

    return editor.read.nodes.block();
  });

  useEffect(() => {
    if (!entry) {
      store.set({ _target: null });
      return;
    }

    const [node, path] = entry;
    const currentEntry = editor.read.nodes.block();

    if (!currentEntry || !PathApi.equals(path, currentEntry[1])) {
      store.set({ _target: null });
      return;
    }

    const { placeholders, query } = store.get();
    const children = editor.read.children();
    const firstNode = children[0];

    if (!firstNode) {
      store.set({ _target: null });
      return;
    }

    const isPristineEmptyEditor =
      children.length === 1 &&
      editor.read.nodes.isEmpty(firstNode) &&
      editor.plugin(ElementStatePlugin).api.isEmpty(firstNode);
    const placeholder = Object.keys(placeholders).find(
      (key) => editor.getType(key) === node.type
    );

    if (
      query({ editor, node, path, type }) &&
      placeholder &&
      editor.read.nodes.isEmpty(node) &&
      !isPristineEmptyEditor
    ) {
      store.set({
        _target: {
          path,
          placeholder: placeholders[placeholder],
        },
      });
    } else {
      store.set({ _target: null });
    }
  }, [editor, entry, store, type]);
};
