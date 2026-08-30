'use client';

import { useEffect } from 'react';

import { type Path, PathApi } from '../../facade';
import type {
  GetInjectNodePropsReturnType,
  WithAnyName,
} from '../../lib/plugin/PluginDefinition';
import { ElementStatePlugin } from '../../lib/plugins/element-state/ElementStatePlugin';
import type { PLUGINS } from '../../utils';
import {
  useEditorComposing,
  useEditorFocused,
  useEditorReadOnly,
} from '../plite-react';
import type { TransformOptions, UseHooks } from '../plugin/PlatePlugin';
import { useEditorSelector } from '../stores/plate/useEditorSelector';
import { usePluginStore } from '../stores/plate/usePluginStore';
import type { BlockPlaceholderPluginState } from './BlockPlaceholderPlugin';

type BlockPlaceholderHookDefinition = Readonly<{
  editOnly: true;
  initialState: BlockPlaceholderPluginState;
  inject: true;
  name: typeof PLUGINS.blockPlaceholder;
  selectors: {
    placeholder: (
      state: Readonly<BlockPlaceholderPluginState>,
      path?: Path
    ) => string | undefined;
  };
}>;

type BlockPlaceholderHookContextDefinition =
  WithAnyName<BlockPlaceholderHookDefinition>;

export const useBlockPlaceholder: UseHooks<
  BlockPlaceholderHookContextDefinition
> = ({ editor, store }) => {
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
    const placeholder = Object.keys(placeholders).find((name) => {
      const target = editor.plugin(name);

      return target.schema.type === node.type;
    });

    if (
      query({ editor, node, path, type: node.type }) &&
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
  }, [editor, entry, store]);
};

export const useBlockPlaceholderInjection = (
  props: TransformOptions<BlockPlaceholderHookDefinition> & {
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

  return undefined;
};
