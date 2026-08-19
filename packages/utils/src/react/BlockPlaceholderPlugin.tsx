import type { DefinitionOf } from '@platejs/core';
import { type PlateEditor, definePlatePlugin } from '@platejs/core/react';
import { type Element, type Path, PathApi } from '@platejs/plite';

import { PLUGINS } from '../lib';
import {
  useBlockPlaceholder,
  useBlockPlaceholderInjection,
} from './useBlockPlaceholder.internal';

type BlockPlaceholderTarget = {
  path: Path;
  placeholder: string;
};

export type BlockPlaceholderQueryContext = {
  editor: PlateEditor;
  node: Element;
  path: Path;
  type: string;
};

export type BlockPlaceholderPluginState = {
  _target: BlockPlaceholderTarget | null;
  className: string | undefined;
  placeholders: Record<string, string>;
  query: (context: BlockPlaceholderQueryContext) => boolean;
};

export const BlockPlaceholderPlugin = definePlatePlugin(
  PLUGINS.blockPlaceholder,
  {
    initialState: (): BlockPlaceholderPluginState => ({
      _target: null,
      className: undefined,
      placeholders: {},
      query: ({ path }) => path.length === 1,
    }),
    editOnly: true,
    inject: {
      isBlock: true,
    },
  }
)
  .extend({
    selectors: {
      placeholder: (state, path?: Path) => {
        const target = state._target;

        if (target && path && PathApi.equals(target.path, path)) {
          return target.placeholder;
        }
      },
    },
  })
  .extend({
    inject: {
      nodeProps: {
        transformProps: useBlockPlaceholderInjection,
      },
    },
    useHooks: useBlockPlaceholder,
  });

export type BlockPlaceholderDefinition = DefinitionOf<
  typeof BlockPlaceholderPlugin
>;
