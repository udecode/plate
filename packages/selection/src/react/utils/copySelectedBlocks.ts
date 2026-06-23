import type { BasePlateEditor } from 'platejs';

import copyToClipboard from 'copy-to-clipboard';

import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '../BlockSelectionPlugin';

const writeSelectedBlocksToDataTransfer = (
  editor: BasePlateEditor,
  data: DataTransfer
) => {
  if (!data) return false;

  const { selectedIds } = editor.getOptions(BlockSelectionPlugin);
  const selectedEntries = (
    editor.api as unknown as BlockSelectionConfig['api']
  ).blockSelection.getNodes({ collapseTableRows: true });
  const selectedFragment = selectedEntries.map(([node]) => node);

  if (selectedEntries.length === 0) return false;

  let textPlain = '';
  const div = document.createElement('div');

  editor.update((tx) => {
    selectedEntries.forEach(([, path]) => {
      // select block by block
      tx.selection.set({
        anchor: editor.api.start(path)!,
        focus: editor.api.end(path)!,
      });

      const isEmpty = editor.api.isEmpty(path);

      if (isEmpty) {
        const after = editor.api.after(editor.selection!);

        tx.selection.set({
          anchor: editor.api.start(path)!,
          focus: after!,
        });
      }

      if (!isEmpty) {
        editor.api.clipboard.writeSelection(data);
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
    tx.selection.clear();
    editor.setOption(BlockSelectionPlugin, 'selectedIds', selectedIds);
  });

  data.setData('text/plain', textPlain);
  data.setData('text/html', div.innerHTML);

  // set slate fragment
  const selectedFragmentStr = JSON.stringify(selectedFragment);
  const encodedFragment = window.btoa(encodeURIComponent(selectedFragmentStr));
  data.setData('application/x-plite-fragment', encodedFragment);

  return true;
};

export const copySelectedBlocks = (
  editor: BasePlateEditor,
  dataTransfer?: DataTransfer
) => {
  if (dataTransfer) {
    return writeSelectedBlocksToDataTransfer(editor, dataTransfer);
  }

  let didWrite = false;

  const didCopy = copyToClipboard(' ', {
    onCopy: (dataTransfer) => {
      const data = dataTransfer as DataTransfer;

      didWrite = writeSelectedBlocksToDataTransfer(editor, data);
    },
  });

  return didCopy && didWrite;
};
