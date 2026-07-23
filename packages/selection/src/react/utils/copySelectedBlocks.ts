import type { BaseEditor } from '@platejs/core';
import { ContentSlice, ElementApi } from '@platejs/plite';
import {
  getDOMClipboardFormatKey,
  writeDOMFragmentData,
  writeDOMRangeData,
} from '@platejs/plite-dom';

import copyToClipboard from 'copy-to-clipboard';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

const writeSelectedBlocksToDataTransfer = (
  editor: BaseEditor,
  data: DataTransfer
) => {
  if (!data) return false;

  const selectedEntries = editor
    .plugin(BlockSelectionPlugin)
    .api.getNodes({ collapseTableRows: true });

  if (selectedEntries.length === 0) return false;

  const blocks = editor.read((state) =>
    selectedEntries.flatMap(([node, path]) => {
      if (!state.nodes.get(path) || !ElementApi.isElement(node)) return [];

      const start = state.points.start(path);
      const end = state.points.end(path);

      if (!start || !end) return [];

      return [
        {
          empty: state.nodes.isEmpty(node),
          node,
          range: { anchor: start, focus: end, kind: 'text' as const },
        },
      ];
    })
  );

  if (blocks.length === 0) return false;

  const textParts: string[] = [];
  const div = document.createElement('div');

  blocks.forEach(({ empty, range }) => {
    const values = new Map<string, string>();
    const blockData = {
      getData: (type: string) => values.get(type) ?? '',
      setData: (type: string, value: string) => {
        values.set(type, value);
      },
    };

    if (!empty) writeDOMRangeData(editor, blockData, range);

    textParts.push(empty ? '' : blockData.getData('text/plain'));

    const divChild = document.createElement('div');

    divChild.innerHTML = empty ? '<p></p>' : blockData.getData('text/html');
    divChild.querySelectorAll('[data-plite-fragment]').forEach((element) => {
      element.removeAttribute('data-plite-fragment');
      element.removeAttribute('data-plite-fragment-format');
    });
    div.append(divChild);
  });

  writeDOMFragmentData(data, {
    clipboardFormatKey: getDOMClipboardFormatKey(editor),
    html: div.innerHTML,
    slice: ContentSlice.closed(blocks.map(({ node }) => node)),
    text: `${textParts.join('\n')}\n`,
    window: editor.api.dom.getWindow(),
  });

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
