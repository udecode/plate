import type { PluginConfig, WithAnyKey } from '@platejs/core';
import {
  type PlatePluginContext,
  createPlatePlugin,
  usePluginStore,
} from '@platejs/core/react';
import { type Element, type Path, PathApi } from '@platejs/plite';

import { KEYS } from '../../lib';
import { useBlockPlaceholder } from './useBlockPlaceholder.internal';

export type BlockPlaceholderConfig = PluginConfig<
  'blockPlaceholder',
  {
    _target: { path: Path; placeholder: string } | null;
    className?: string;
    placeholders: Record<string, string>;
    query: (
      context: PlatePluginContext<WithAnyKey<BlockPlaceholderConfig>> & {
        node: Element;
        path: Path;
      }
    ) => boolean;
  },
  {},
  {},
  {
    placeholder: (
      state: Readonly<{
        _target: { path: Path; placeholder: string } | null;
      }>,
      path?: Path
    ) => string | undefined;
  }
>;

export const BlockPlaceholderPlugin = createPlatePlugin<BlockPlaceholderConfig>(
  {
    key: KEYS.blockPlaceholder,
    initialState: {
      _target: null,
      className: undefined,
      placeholders: {
        [KEYS.p]: 'Type something...',
      },
      query: ({ path }) => path.length === 1,
    },

    editOnly: true,
    useHooks: useBlockPlaceholder,
    inject: {
      isBlock: true,
      nodeProps: {
        transformProps: (props) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const placeholder = usePluginStore(
            props.plugin,
            'placeholder',
            props.path
          );

          if (props.element && placeholder) {
            return {
              className: props.store.get().className,
              placeholder,
            };
          }
        },
      },
    },
    selectors: {
      placeholder: (state, path?: Path) => {
        const target = state._target;

        if (target && path && PathApi.equals(target.path, path)) {
          return target.placeholder;
        }
      },
    },
  }
);
