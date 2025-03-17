import {
  type PluginConfig,
  type Text,
  createTSlatePlugin,
  RangeApi,
  TextApi,
} from '@udecode/plate';

export type SkipMarkConfig = PluginConfig<
  'skip-mark',
  {
    query: {
      allow: string[];
    };
  }
>;

export const BaseSkipMarkPlugin = createTSlatePlugin<SkipMarkConfig>({
  key: 'skip-mark',
  options: {
    query: {
      allow: [],
    },
  },
}).overrideEditor(({ editor, getOption, tf: { insertText } }) => ({
  transforms: {
    insertText(text, options) {
      if (RangeApi.isExpanded(editor.selection))
        return insertText(text, options);

      const allow = getOption('query').allow;

      const textNode = editor.api.node<Text>({
        mode: 'lowest',
        match: (node) => {
          if (TextApi.isText(node)) {
            return allow.some((key) => !!node[key]);
          }
        },
      });

      if (!textNode) return insertText(text, options);

      const nextPoint = editor.api.start(textNode[1], { next: true });

      const nextNode =
        nextPoint &&
        editor.api.node<Text>({
          at: nextPoint,
          mode: 'lowest',
          match: (node) => {
            if (TextApi.isText(node)) {
              return allow.some((key) => !!node[key]);
            }
          },
        });

      const isBetweenSameMarks =
        nextNode &&
        allow.findIndex((key) => !!textNode[0][key]) ===
          allow.findIndex((key) => !!nextNode[0][key]);

      if (
        !isBetweenSameMarks &&
        editor.api.isEnd(editor.selection?.focus, textNode[1])
      ) {
        editor.tf.removeMarks(allow);
        insertText(text, options);

        return;
      }

      return insertText(text, options);
    },
  },
}));
