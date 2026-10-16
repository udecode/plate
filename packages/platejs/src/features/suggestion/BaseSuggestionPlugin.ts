import { AuthoredPlugin } from '../../authored';
import { definePlugin } from '../../core';
import { PLUGINS } from '../../utils';
import { suggestionColorOf } from './suggestionColorOf';

const suggestionModes = {
  editing: 'editing',
  suggesting: 'suggesting',
} as const;

const joinUnique = (values: readonly string[]) =>
  [...new Set(values)].join(' ');

/** Native authored-change interaction and the marks each node paints. */
export const BaseSuggestionPlugin = definePlugin(PLUGINS.suggestion, {
  dependencies: [AuthoredPlugin],
  api: ({ editor }) => ({
    setMode: (mode: keyof typeof suggestionModes) => {
      editor.plugin(AuthoredPlugin).api.setView({
        intent: mode === suggestionModes.editing ? 'edit' : 'propose',
      });
    },
  }),
  read: ({ editor }) => ({
    mode: () => {
      const view = editor.plugin(AuthoredPlugin).read.view();

      return 'intent' in view && view.intent === 'propose'
        ? suggestionModes.suggesting
        : suggestionModes.editing;
    },
  }),
  inject: {
    nodeProps: {
      nodeKey: 'authored',
      transformProps: ({ editor, element, nodeValue, text }) => {
        if (!nodeValue) return {};

        const { marks } = editor
          .plugin(AuthoredPlugin)
          .read.reviewOf(element ?? text);

        if (marks.length === 0) return {};

        const { read } = editor.plugin(AuthoredPlugin);
        // The youngest claim's card paints and opens, so text typed inside
        // another's insertion shows its own card.
        const youngest = marks.reduce((left, right) =>
          right.at > left.at || (right.at === left.at && right.change > left.change)
            ? right
            : left
        );
        const cards = [youngest, ...marks].flatMap(
          (mark) => read.groupOf(mark.change)?.id ?? []
        );

        return {
          'data-editor-authored-color': cards[0]
            ? String(suggestionColorOf(cards[0]))
            : undefined,
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
