import { DefaultAuthoredPlugin, type AuthoredView } from '../../authored';
import { definePlugin, RangeApi, TextApi } from '../../core';
import { PLUGINS } from '../../utils';
import { observeSuggestionChanges } from './suggestion.internal';

const viewByMode = {
  editing: { intent: 'edit', projection: 'accepted' },
  suggesting: { intent: 'propose', projection: 'markup' },
} as const satisfies Record<'editing' | 'suggesting', AuthoredView>;
const suggestionModes = {
  editing: 'editing',
  suggesting: 'suggesting',
} as const;

/** Native authored-change interaction and semantic text decorations. */
export const BaseSuggestionPlugin = definePlugin(PLUGINS.suggestion, {
  dependencies: [DefaultAuthoredPlugin],
  api: ({ editor }) => ({
    setMode: (mode: keyof typeof viewByMode) =>
      editor.plugin(DefaultAuthoredPlugin).api.setView(viewByMode[mode]),
  }),
  read: ({ editor }) => ({
    mode: () =>
      editor.plugin(DefaultAuthoredPlugin).read.view().intent === 'propose'
        ? suggestionModes.suggesting
        : suggestionModes.editing,
  }),
  decorate: {
    observe: ({ editor, refresh }) => observeSuggestionChanges(editor, refresh),
    read: ({ editor, entry: [node, path] }) => {
      if (!TextApi.isText(node)) return [];
      const nodeKey = editor.key(path);
      if (!nodeKey) return [];
      const root = editor.read.view.root();
      const textRange = {
        anchor: { offset: 0, path, ...(root ? { root } : {}) },
        focus: { offset: node.text.length, path, ...(root ? { root } : {}) },
      };

      return editor
        .plugin(DefaultAuthoredPlugin)
        .read.changesAt(textRange)
        .flatMap((change) =>
          change.ranges.flatMap((range, index) => {
            const intersection = RangeApi.intersection(range, textRange);
            if (!intersection || RangeApi.isCollapsed(intersection)) return [];

            return [
              {
                attributes: {
                  'data-editor-authored-author': change.authorId,
                  'data-editor-authored-change': change.id,
                  'data-editor-authored-kind': change.kind,
                  'data-editor-authored-status': change.status,
                },
                key: `authored:${change.id}:${index}:${nodeKey}`,
                range: intersection,
              },
            ];
          })
        );
    },
  },
});
