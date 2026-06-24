import type { PluginConfig } from '@platejs/core';
import type { PlatePlugin } from '@platejs/core/react';
import { createTPlatePlugin } from '@platejs/core/react';
import { type Element, type Path, PathApi } from '@platejs/plite';

import { KEYS } from '../../lib';

export type BlockPlaceholderConfig = PluginConfig<
  'blockPlaceholder',
  {
    placeholders?: Record<string, string>;
    query?: (context: BlockPlaceholderQueryContext) => boolean;
    className?: string;
  },
  {},
  {},
  {
    placeholder: (node: Element, path?: Path) => string | undefined;
  }
>;

type BlockPlaceholderQueryContext = {
  node: Element;
  path: Path;
} & Record<string, unknown>;

type BlockPlaceholderQuery = NonNullable<
  BlockPlaceholderConfig['options']['query']
>;

const getBlockPlaceholder = (
  context: {
    editor: any;
    getOptions: () => BlockPlaceholderConfig['options'];
    node: Element;
    path?: Path;
  } & Record<string, unknown>
) => {
  const { editor, getOptions, node } = context;

  if (
    editor.dom.readOnly ||
    editor.dom.composing ||
    !editor.selection ||
    editor.api.isExpanded()
  ) {
    return;
  }

  const { path } = context;
  const entry = editor.api.block();

  if (!path || !entry) return;

  const [, blockPath] = entry;

  if (!PathApi.equals(path, blockPath)) return;

  const { placeholders = {}, query = ({ path }) => path.length === 1 } =
    getOptions();
  const firstNode = editor.children[0] as Element;
  const isPristineEmptyEditor =
    editor.children.length === 1 &&
    editor.api.isEmpty(firstNode) &&
    editor.api.isElementStateEmpty(firstNode);

  const placeholder = Object.keys(placeholders).find(
    (key) => editor.getType(key) === node.type
  );

  if (
    query({ ...context, node, path } as Parameters<BlockPlaceholderQuery>[0]) &&
    placeholder &&
    editor.api.isEmpty(node) &&
    !isPristineEmptyEditor
  ) {
    return placeholders[placeholder];
  }
};

export const BlockPlaceholderPlugin: PlatePlugin<BlockPlaceholderConfig> =
  createTPlatePlugin<BlockPlaceholderConfig>({
    key: KEYS.blockPlaceholder,
    editOnly: true,
    options: {
      className: undefined,
      placeholders: {
        [KEYS.p]: 'Type something...',
      },
      query: ({ path }) => path.length === 1,
    },
  })
    .extendSelectors((ctx) => ({
      placeholder: (node: Element, path?: Path) =>
        getBlockPlaceholder({ ...ctx, node, path }),
    }))
    .extend({
      inject: {
        isBlock: true,
        nodeProps: {
          transformProps: (props) => {
            if (!props.element) return;

            const placeholder = getBlockPlaceholder({
              ...props,
              node: props.element,
            });

            if (placeholder) {
              return {
                className: props.getOption('className'),
                placeholder,
              };
            }
          },
        },
      },
    });
