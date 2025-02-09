import {
  type PluginConfig,
  type QueryNodeOptions,
  type Text,
  createTSlatePlugin,
  queryNode,
  RangeApi,
} from '@udecode/plate';

export type SkipMarkConfig = PluginConfig<
  'skip-mark',
  {
    query?: QueryNodeOptions;
  }
>;

export const BaseSkipMarkPlugin = createTSlatePlugin<SkipMarkConfig>({
  key: 'skip-mark',
  options: {},
}).overrideEditor(({ editor, getOption, tf: { insertText } }) => ({
  transforms: {
    insertText(text, options) {
      if (RangeApi.isExpanded(editor.selection))
        return insertText(text, options);

      const textNode = editor.api.node<Text>({
        mode: 'lowest',
      });

      const query = getOption('query');

      if (
        textNode &&
        !queryNode(textNode, query) &&
        editor.api.isEnd(editor.selection?.focus, textNode[1])
      ) {
        editor.tf.insertNode({ text });
        const _nextPoint = editor.api.start(textNode[1], { next: true });

        if (!_nextPoint) return;

        const nextPoint = {
          offset: _nextPoint.offset + 1,
          path: _nextPoint.path,
        };

        editor.tf.setSelection({
          anchor: nextPoint,
          focus: nextPoint,
        });

        return;
      }

      return insertText(text, options);
    },
  },
}));
