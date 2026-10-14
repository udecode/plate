import { getCompiledPlateModelBinding } from '../../../internal/plugin/compilePlateModel';
import { BaseParagraphPlugin } from '../../../lib';
import { PLUGINS } from '../../../utils/plate-keys';
import { toReactPlugin } from '../../core';

export const ParagraphPlugin = toReactPlugin(BaseParagraphPlugin).extend({
  shortcuts: {
    toggle: {
      handler: ({ editor }) => {
        const summaryType = getCompiledPlateModelBinding(
          editor,
          PLUGINS.detailsSummary
        )?.elementType;

        if (
          editor.read.nodes.blocks().some(([node]) => node.type === summaryType)
        ) {
          editor.update.blocks.reset({ unset: 'level' });
        } else {
          editor.update.blocks.toggle({
            type: editor.plugin(BaseParagraphPlugin).schema.type,
          });
        }
      },
      keys: ['mod+alt+0', 'mod+shift+0'],
      preventDefault: true,
    },
  },
});
