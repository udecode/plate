import type { PluginConfig } from '@platejs/core';
import type { PlatePluginContext } from '@platejs/core/react';
import {
  createPlatePlugin,
  useEditorComposing,
  useEditorFocused,
  useEditorReadOnly,
  useEditorSelector,
  usePluginOption,
} from '@platejs/core/react';
import { type Element, type Path, PathApi } from '@platejs/plite';
import React from 'react';

import { KEYS } from '../../lib';

export type BlockPlaceholderConfig = PluginConfig<
  'blockPlaceholder',
  {
    _target: { node: Element; placeholder: string } | null;
    className?: string;
    placeholders: Record<string, string>;
    query: (
      context: PlatePluginContext<BlockPlaceholderConfig> & {
        node: Element;
        path: Path;
      }
    ) => boolean;
  },
  {},
  {},
  {
    placeholder: (node?: Element) => string | undefined;
  }
>;

const getBlockPlaceholder = (
  context: PlatePluginContext<BlockPlaceholderConfig> & {
    node: Element;
    path: Path;
  }
) => {
  const { editor, getOptions, node } = context;
  const { path } = context;
  const entry = editor.read.nodes.block();

  if (!entry) return;

  const [, blockPath] = entry;

  if (!PathApi.equals(path, blockPath)) return;

  const { placeholders, query } = getOptions();
  const children = editor.read.children();
  const firstNode = children[0];

  if (!firstNode) return;

  const isPristineEmptyEditor =
    children.length === 1 &&
    editor.read.nodes.isEmpty(firstNode) &&
    editor.api.isElementStateEmpty(firstNode);

  const placeholder = Object.keys(placeholders).find(
    (key) => editor.getType(key) === node.type
  );

  if (
    query({ ...context, node, path }) &&
    placeholder &&
    editor.read.nodes.isEmpty(node) &&
    !isPristineEmptyEditor
  ) {
    return placeholders[placeholder];
  }
};

export const BlockPlaceholderPlugin = createPlatePlugin<BlockPlaceholderConfig>(
  {
    key: KEYS.blockPlaceholder,
    editOnly: true,
    options: {
      _target: null,
      className: undefined,
      placeholders: {
        [KEYS.p]: 'Type something...',
      },
      query: ({ path }) => path.length === 1,
    },
    useHooks: (ctx) => {
      const { editor, setOption } = ctx;
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
      }, [composing, editor, focused, readOnly]);

      React.useEffect(() => {
        if (!entry) {
          setOption('_target', null);
          return;
        }

        const [node, path] = entry;
        const placeholder = getBlockPlaceholder({ ...ctx, node, path });

        setOption('_target', placeholder ? { node, placeholder } : null);
        // Keep this effect keyed to the editor state snapshot above; `ctx`
        // carries stable plugin helpers but is not itself a useful dependency.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [editor, entry, setOption]);
    },
  }
)
  .extendSelectors(({ getOption }) => ({
    placeholder: (node?: Element) => {
      const target = getOption('_target');

      if (target && target.node === node) {
        return target.placeholder;
      }
    },
  }))
  .extend({
    inject: {
      isBlock: true,
      nodeProps: {
        transformProps: (props) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const placeholder = usePluginOption(
            props.plugin,
            'placeholder',
            props.element
          );

          if (props.element && placeholder) {
            return {
              className: props.getOption('className'),
              placeholder,
            };
          }
        },
      },
    },
  });
