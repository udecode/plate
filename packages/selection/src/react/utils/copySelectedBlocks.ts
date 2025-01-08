import type { SlateEditor } from '@udecode/plate';

import copyToClipboard from 'copy-to-clipboard';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const copySelectedBlocks = (editor: SlateEditor) => {
  const { selectedIds } = editor.getOptions(BlockSelectionPlugin);
  const selectedEntries = editor
    .getApi(BlockSelectionPlugin)
    .blockSelection.getNodes();
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

          // set data from selection
          editor.tf.setFragmentData(data);

          // get plain text
          textPlain += `${data.getData('text/plain')}\n`;

          // get html text
          const divChild = document.createElement('div');
          divChild.innerHTML = data.getData('text/html');
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
