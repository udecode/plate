import { AuthoredPlugin } from '../../authored';
import { definePlugin } from '../../core';
import { PLUGINS } from '../../utils';

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

        return {
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
