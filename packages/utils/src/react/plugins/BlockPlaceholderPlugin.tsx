import type { PluginConfig } from '@platejs/core';
import {
  createTPlatePlugin,
  type PlatePluginContext,
  useEditorComposing,
  useEditorReadOnly,
  useEditorSelector,
  useFocused,
  usePluginOption,
} from '@platejs/core/react';
import type { Path, TElement } from '@platejs/slate';
import React from 'react';

import { KEYS } from '../../lib';

export type BlockPlaceholderConfig = PluginConfig<
  'blockPlaceholder',
  {
    _target: { node: TElement; placeholder: string } | null;
    placeholders: Record<string, string>;
    query: (
      context: PlatePluginContext<BlockPlaceholderConfig> & {
        node: TElement;
        path: Path;
      }
    ) => boolean;
    className?: string;
  }
>;

export const BlockPlaceholderPlugin =
  createTPlatePlugin<BlockPlaceholderConfig>({
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
      const { editor, getOptions, setOption } = ctx;
      const focused = useFocused();

      const readOnly = useEditorReadOnly();
      const composing = useEditorComposing();
      const entry = useEditorSelector(() => {
        if (
          readOnly ||
          composing ||
          !focused ||
          !editor.selection ||
          editor.api.isExpanded()
        )
          return null;

        return editor.api.block();
      }, [readOnly, composing, focused]);

      React.useEffect(() => {
        if (!entry) {
          setOption('_target', null);
          return;
        }

        const { placeholders, query } = getOptions();

        const [element, path] = entry;
        const firstNode = editor.children[0] as TElement;
        const isPristineEmptyEditor =
          editor.children.length === 1 &&
          editor.api.isEmpty(firstNode) &&
          editor.api.isElementStateEmpty(firstNode);

        const placeholder = Object.keys(placeholders).find(
          (key) => editor.getType(key) === element.type
        );

        if (
          query({ ...ctx, node: element, path }) &&
          placeholder &&
          editor.api.isEmpty(element) &&
          !isPristineEmptyEditor
        ) {
          setOption('_target', {
            node: element,
            placeholder: placeholders[placeholder],
          });
        } else {
          setOption('_target', null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [editor, entry, setOption, getOptions]);
    },
  })
    .extendSelectors(({ getOption }) => ({
      placeholder: (node: TElement) => {
        const target = getOption('_target');

        if (target?.node === node) {
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
              props.element!
            );

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
