import {
  authored,
  authoredRecords,
  type AuthoredPlugin as NativeAuthoredPlugin,
} from 'plitejs/authored';

import { definePlugin } from '../core';
import { readEditorAuthor } from '../lib/editor/editorUser.internal';
import type { InternalBasePluginRuntimeExtension } from '../lib/plugin/BasePlugin';
import type { InternalPluginDefinitionOf } from '../lib/plugin/pluginDefinitionLookup.internal';
import { suggestionColorOf } from './suggestionColorOf';

const joinUnique = (values: readonly string[]) =>
  [...new Set(values)].join(' ');

const BaseAuthoredPlugin = definePlugin('authored', {
  dependencies: [authoredRecords],
});

// The package declaration build cannot print the inferred `.extend()` type,
// which inlines Plite's private plugin brand (TS4094), so this annotation names
// its parts. Delete it once that build passes without it.
const AuthoredRuntimePlugin: InternalBasePluginRuntimeExtension<
  typeof BaseAuthoredPlugin,
  InternalPluginDefinitionOf<typeof BaseAuthoredPlugin>,
  NativeAuthoredPlugin
> = BaseAuthoredPlugin.extend(() => authored({ authorId: readEditorAuthor }));

/**
 * Suggestions attributed to the author the writing view names with
 * `createEditorView(editor, { authorId })`, else to the editor's user, or to
 * the local user when the editor has no `userId`. Also paints each node's
 * pending authored changes as `data-editor-authored-*` attributes.
 */
export const AuthoredPlugin = AuthoredRuntimePlugin.extend({
  inject: {
    nodeProps: {
      nodeKey: 'authored',
      textScope: 'nodeKey',
      transformProps: ({ editor, element, nodeValue, text }) => {
        if (!nodeValue) return {};

        const { read } = editor.plugin(AuthoredRuntimePlugin);
        const { marks } = read.reviewOf(element ?? text);

        if (marks.length === 0) return {};

        // The youngest claim paints its author's color and its card opens,
        // so text typed inside another's insertion shows its own card.
        const youngest = marks.reduce((left, right) =>
          right.at > left.at ||
          (right.at === left.at && right.change > left.change)
            ? right
            : left
        );
        const cards = [youngest, ...marks].flatMap(
          (mark) => read.groupOf(mark.change)?.id ?? []
        );

        return {
          'data-editor-authored-color': String(
            suggestionColorOf(youngest.author)
          ),
          'data-editor-authored-groups': joinUnique(cards),
          'data-editor-authored-author': joinUnique(
            marks.map((mark) => mark.author)
          ),
          'data-editor-authored-change': joinUnique(
            marks.map((mark) => mark.change)
          ),
          'data-editor-authored-kind': joinUnique(
            marks.map((mark) => mark.kind)
          ),
        };
      },
    },
  },
});
