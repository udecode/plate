import {
  type PluginConfig,
  type QueryNodeOptions,
  BaseParagraphPlugin,
  createTSlatePlugin,
  queryNode,
} from '@udecode/plate';

export type DeleteConfig = PluginConfig<
  'delete',
  {
    query?: QueryNodeOptions;
  }
>;

export const DeletePlugin = createTSlatePlugin<DeleteConfig>({
  key: 'delete',
  options: {
    query: {
      allow: [BaseParagraphPlugin.key],
    },
  },
}).overrideEditor(({ editor, getOptions, tf: { deleteForward } }) => ({
  transforms: {
    deleteForward(unit) {
      if (!editor.selection) return;

      const { query } = getOptions();

      const isValidNode = !query || queryNode(editor.api.above(), query);

      if (
        !editor.api.isExpanded() &&
        editor.api.isEmpty(editor.selection, { block: true }) &&
        isValidNode
      ) {
        // Cursor is in query blocks and line is empty
        editor.tf.removeNodes();
      } else {
        // When the line is not empty or other conditions are not met, fall back to default behavior
        deleteForward(unit);
      }
    },
  },
}));
