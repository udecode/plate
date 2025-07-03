import type { SlateEditor } from 'platejs';

import copyToClipboard from 'copy-to-clipboard';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const copySelectedBlocks = (editor: SlateEditor) => {
  const { selectedIds } = editor.getOptions(BlockSelectionPlugin);
  const selectedEntries = editor
    .getApi(BlockSelectionPlugin)
    .blockSelection.getNodes({ collapseTableRows: true });
  const selectedFragment = selectedEntries.map(([node]) => node);

  copyToClipboard(' ', {
    onCopy: (dataTransfer) => {
      const data = dataTransfer as DataTransfer;

      if (!data) return;

      let textPlain = '';
      const div = document.createElement('div');

      editor.tf.withoutNormalizing(() => {
        selectedEntries.forEach(([, path]) => {
          // select block by block
          editor.tf.select({
            anchor: editor.api.start(path)!,
            focus: editor.api.end(path)!,
          });

          const isEmpty = editor.api.isEmpty(path);

          if (isEmpty) {
            const after = editor.api.after(editor.selection!);

            editor.tf.select({
              anchor: editor.api.start(path)!,
              focus: after!,
            });
          }

          if (!isEmpty) {
            editor.tf.setFragmentData(data);
          }

          // get plain text
          if (isEmpty) {
            textPlain += '\n';
          } else {
            textPlain += `${data.getData('text/plain')}\n`;
          }

          // get html text
          const divChild = document.createElement('div');
          if (isEmpty) {
            // Does not support empty non-paragraph blocks yet
            divChild.innerHTML = '<p></p>';
          } else {
            divChild.innerHTML = data.getData('text/html');
          }

          div.append(divChild);
        });

        // deselect and select back selectedIds
        editor.tf.deselect();
        editor.setOption(BlockSelectionPlugin, 'selectedIds', selectedIds);
      });

      data.setData('text/plain', textPlain);
      data.setData('text/html', div.innerHTML);

      // set slate fragment
      const selectedFragmentStr = JSON.stringify(selectedFragment);
      const encodedFragment = window.btoa(
        encodeURIComponent(selectedFragmentStr)
      );
      data.setData('application/x-slate-fragment', encodedFragment);
    },
  });
};
