import type { OverrideEditor } from '../../plugin';

import { getPluginByType } from '../../plugin/getSlatePlugin';

export const withBreakMode: OverrideEditor = ({
  editor,
  tf: { apply, insertBreak },
}) => {
  return {
    transforms: {
      apply(operation) {
        console.log('apply', operation);
        apply(operation);
      },
      insertBreak() {
        console.log('insertBreak');
        if (editor.selection && editor.api.isCollapsed()) {
          const block = editor.api.block();
          if (block) {
            const [blockNode] = block;
            const plugin = getPluginByType(editor, blockNode.type);

            const breakMode = plugin?.node.breakMode;
            if (breakMode) {
              // Handle 'empty' scenario
              if (
                breakMode.empty &&
                editor.api.isEmpty(editor.selection, {
                  block: true,
                })
              ) {
                if (breakMode.empty === 'reset') {
                  console.log('breakMode', breakMode);
                  editor.tf.resetBlock(block);
                  return;
                }
                if (breakMode.empty === 'exit') {
                  editor.tf.insertExitBreak();
                  return;
                }
                // if 'default', fall through to breakMode.default or standard behavior
              }

              // Handle 'emptyLineEnd' scenario
              if (
                breakMode.emptyLineEnd &&
                !editor.api.isEmpty(editor.selection, {
                  block: true,
                }) &&
                editor.api.isAt({ end: true })
              ) {
                const range = editor.api.range('before', editor.selection!);
                if (range) {
                  const char = editor.api.string(range);
                  if (char === '\n' && breakMode.emptyLineEnd === 'exit') {
                    editor.tf.insertExitBreak();
                    return;
                  }
                }
              }

              // Handle 'default' scenario (or fallthrough from 'empty: default' or 'emptyLineEnd: default')
              if (breakMode.default) {
                if (breakMode.default === 'lineBreak') {
                  editor.tf.insertSoftBreak();
                  return;
                }
                if (breakMode.default === 'exit') {
                  editor.tf.insertExitBreak();
                  return;
                }
                // if 'default', fall through to standard Slate insertBreak
              }
            }
          }
        }

        console.log('hey');

        // Standard Slate insertBreak if no custom breakMode handled it
        insertBreak();
      },
    },
  };
};
