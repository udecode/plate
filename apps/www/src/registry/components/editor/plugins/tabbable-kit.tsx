'use client';

import type { TabbablePluginState } from '@platejs/tabbable';
import { TabbablePlugin } from '@platejs/tabbable/react';
import { ElementApi, getPluginTypes, KEYS } from 'platejs';

export type TabbableKitPluginState = Pick<TabbablePluginState, 'query'>;

export const TabbableKit = [
  TabbablePlugin.extend({
    override: {
      plugins: {
        [KEYS.indent]: {
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

        return !editor.read.nodes.some({
          match: (n) =>
            !!(
              (ElementApi.isElement(n) &&
                getPluginTypes(editor, [
                  KEYS.codeBlock,
                  KEYS.li,
                  KEYS.listTodoClassic,
                  KEYS.table,
                ]).includes(n.type)) ||
              (ElementApi.isElement(n) && n.listStyleType)
            ),
        });
      },
    },
  })),
];
