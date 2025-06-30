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

          const selectedText = editor.api.string();
          
          // For empty blocks, manually add empty content instead of calling setFragmentData
          // This prevents the duplication bug while still copying empty blocks
          if (!selectedText?.trim()) {
            // Add empty line for plain text
            textPlain += '\n';
            
            // Add empty paragraph for HTML
            const divChild = document.createElement('div');
            divChild.innerHTML = '<p></p>';
            div.append(divChild);
          } else {
            // set data from selection for non-empty blocks
            editor.tf.setFragmentData(data);

            // get plain text
            textPlain += `${data.getData('text/plain')}\n`;

            // get html text
            const divChild = document.createElement('div');
            divChild.innerHTML = data.getData('text/html');
            div.append(divChild);
          }
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
