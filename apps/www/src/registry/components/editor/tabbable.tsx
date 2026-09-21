'use client';

import { BaseCodeBlockPlugin, PLUGINS, ElementApi } from 'platejs';
import { TabbablePlugin } from 'platejs/tabbable/react';
import { BaseTablePlugin } from 'platejs/table';

export const TabbableKit = [
  TabbablePlugin.configure(({ editor }) => ({
    override: {
      [PLUGINS.indent]: {
        shortcuts: {
          tab: null,
          untab: null,
        },
      },
    },
    initialState: {
      query: () => {
        if (
          editor.read.selection.isAtBlockStart() ||
          editor.read.selection.isAtBlockEnd()
        ) {
          return false;
        }

        const blockingTypes = new Set<string>(
          [BaseCodeBlockPlugin, BaseTablePlugin].flatMap((descriptor) => {
            const plugin = editor.plugin(descriptor);

            return plugin.installed ? [plugin.schema.type] : [];
          })
        );

        return !editor.read.nodes.some({
          match: (n) =>
            !!(
              (ElementApi.isElement(n) && blockingTypes.has(n.type)) ||
              (ElementApi.isElement(n) && n.listType)
            ),
        });
      },
    },
  })),
];
