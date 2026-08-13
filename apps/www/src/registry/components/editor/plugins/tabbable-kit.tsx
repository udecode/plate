'use client';

import type { TabbablePluginState } from '@platejs/tabbable';
import { TabbablePlugin } from '@platejs/tabbable/react';
import { PLUGINS, ElementApi } from 'platejs';

export type TabbableKitPluginState = Pick<TabbablePluginState, 'query'>;

export const TabbableKit = [
  TabbablePlugin.extend({
    override: {
      plugins: {
        [PLUGINS.indent]: {
          shortcuts: {
            tab: null,
            untab: null,
          },
        },
      },
    },
  }).extend(({ editor }): { initialState: TabbableKitPluginState } => ({
    initialState: {
      query: () => {
        if (
          editor.read.selection.isAtBlockStart() ||
          editor.read.selection.isAtBlockEnd()
        ) {
          return false;
        }

        const blockingTypes = [
          PLUGINS.codeBlock,
          PLUGINS.listItem,
          PLUGINS.todoList,
          PLUGINS.table,
        ].flatMap((name) => {
          const plugin = editor.plugin(name);

          return plugin.installed ? [plugin.schema.type] : [];
        });

        return !editor.read.nodes.some({
          match: (n) =>
            !!(
              (ElementApi.isElement(n) && blockingTypes.includes(n.type)) ||
              (ElementApi.isElement(n) && n.listStyleType)
            ),
        });
      },
    },
  })),
];
