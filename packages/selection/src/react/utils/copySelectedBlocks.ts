import type { BaseEditor } from '@platejs/core';
import { ElementApi } from '@platejs/plite';

import copyToClipboard from 'copy-to-clipboard';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

const writeSelectedBlocksToDataTransfer = (
  editor: BaseEditor,
  data: DataTransfer
) => {
  if (!data) return false;

  const { selectedIds } = editor.plugin(BlockSelectionPlugin).getOptions();
  const selectedEntries = editor
    .plugin(BlockSelectionPlugin)
    .api.blockSelection.getNodes({ collapseTableRows: true });
  const selectedFragment = selectedEntries.map(([node]) => node);

  if (selectedEntries.length === 0) return false;

  let textPlain = '';
  const div = document.createElement('div');

  editor.update.withoutNormalizing(({ tx }) => {
    selectedEntries.forEach(([, path]) => {
      const entry = editor.read.nodes.get(path);

      if (!entry) return;

      // select block by block
      tx.selection.set({
        anchor: editor.read.points.start(path)!,
        focus: editor.read.points.end(path)!,
      });

      const isEmpty =
        ElementApi.isElement(entry[0]) && editor.read.nodes.isEmpty(entry[0]);

      if (isEmpty) {
        const after = editor.read.points.after(editor.read.selection()!);

        tx.selection.set({
          anchor: editor.read.points.start(path)!,
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
    editor.plugin(BlockSelectionPlugin).setOption('selectedIds', selectedIds);
  });

  data.setData('text/plain', textPlain);
  data.setData('text/html', div.innerHTML);

  // set slate fragment
  const selectedFragmentStr = JSON.stringify(selectedFragment);
  const encodedFragment = window.btoa(encodeURIComponent(selectedFragmentStr));
  data.setData('application/x-slate-fragment', encodedFragment);

  return true;
};

export const copySelectedBlocks = (
  editor: BaseEditor,
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
