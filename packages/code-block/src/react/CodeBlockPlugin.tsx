import { toPlatePlugin } from '@platejs/core/react';
import { ElementApi, NodeApi, type Element } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  BaseCodeBlockPlugin,
  BaseCodeHighlightPlugin,
  BaseCodeLinePlugin,
} from '../lib/BaseCodeBlockPlugin';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  dependencies: [CodeLinePlugin],
});

/** Adds Lowlight syntax highlighting to code blocks. */
export const CodeHighlightPlugin = toPlatePlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
}).extend(({ editor, store }) => ({
  extension: {
    key: 'react',
    onTransactionChange(context) {
      if (!store.get().lowlight) return;

      const roots = new Set<string | undefined>();

      context.change.iterChangedRanges((root) => roots.add(root ?? undefined));

      for (const root of roots) {
        if (!context.changed.has('properties', root)) continue;

        const beforeChildren =
          root === undefined
            ? context.before.children
            : (context.before.roots?.[root] ?? []);
        const afterChildren =
          root === undefined
            ? context.after.children
            : (context.after.roots?.[root] ?? []);

        for (const path of context.changed.paths(root)) {
          const before = NodeApi.getIf(
            { children: beforeChildren } as Element,
            path
          );
          const after = NodeApi.getIf(
            { children: afterChildren } as Element,
            path
          );
          const beforeLanguage =
            ElementApi.isElement(before) &&
            before.type === editor.getType(KEYS.codeBlock)
              ? before.lang
              : undefined;
          const afterLanguage =
            ElementApi.isElement(after) &&
            after.type === editor.getType(KEYS.codeBlock)
              ? after.lang
              : undefined;

          if (
            (beforeLanguage !== undefined || afterLanguage !== undefined) &&
            beforeLanguage !== afterLanguage
          ) {
            editor.api.react.refreshDecorations();

            return;
          }
        }
      }
    },
  },
}));
