import type { OverrideEditor } from '../../plugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withDeleteMode: OverrideEditor = ({
  editor,
  tf: { deleteBackward, deleteForward, deleteFragment },
}) => {
  const resetMarks = () => {
    if (editor.api.isAt({ start: true })) {
      editor.tf.removeMarks();
    }
  };

  return {
    transforms: {
      deleteBackward(unit) {
        if (editor.selection && editor.api.isCollapsed()) {
          const block = editor.api.block();
          if (block) {
            const [blockNode] = block;
            const plugin = getPluginByType(editor, blockNode.type);

            const deleteMode = plugin?.node.deleteMode;

            if (deleteMode) {
              if (
                deleteMode.start === 'reset' &&
                editor.api.isAt({ start: true })
              ) {
                editor.tf.resetBlock(block);
                return;
              }
              if (
                deleteMode.empty === 'reset' &&
                editor.api.isEmpty(editor.selection, {
                  block: true,
                })
              ) {
                editor.tf.resetBlock(block);
                return;
              }
            }
          }
        }

        deleteBackward(unit);
        resetMarks();
      },
      deleteForward(unit) {
        deleteForward(unit);
        resetMarks();
      },
      deleteFragment(options) {
        deleteFragment(options);
        resetMarks();
      },
    },
  };
};
