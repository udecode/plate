import { ClipboardEvent } from 'react';
import {
  DOMHandlerReturnType,
  getEndPoint,
  getPluginType,
  getStartPoint,
  PlateEditor,
  select,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import copyToClipboard from 'copy-to-clipboard';
import { Path } from 'slate';
import { ELEMENT_TH } from './createTablePlugin';
import { getTableGridAbove } from './queries';

// Based on packages/selection/src/utils/copySelectedBlocks.ts
export const onCopyTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): DOMHandlerReturnType<ClipboardEvent> => (e) => {
  const tableEntry = getTableGridAbove(editor, {
    format: 'table',
  })?.[0];

  const initialSelection = editor.selection;

  if (!tableEntry || !initialSelection) return;

  const selectionStart =
    Path.compare(initialSelection.anchor.path, initialSelection.focus.path) < 1
      ? initialSelection.anchor
      : initialSelection.focus;

  const [tableNode, tablePath] = tableEntry;
  const tableRows = tableNode.children as TElement[];

  const tableSelectionStart = selectionStart.path.slice(
    tablePath.length,
    tablePath.length + 2
  );

  const [y, x] = tableSelectionStart;

  copyToClipboard(' ', {
    onCopy: (dataTransfer) => {
      const data = dataTransfer as DataTransfer;
      if (!data) return;

      let textCsv = '';
      let textTsv = '';

      const divElement = document.createElement('div');
      const tableElement = document.createElement('table');

      withoutNormalizing(editor, () => {
        tableRows.forEach((row, rowIndex) => {
          const rowCells = row.children as TElement[];
          const rowPath = tablePath.concat(y + rowIndex);

          const cellStrings: string[] = [];
          const rowElement =
            row.type === getPluginType(editor, ELEMENT_TH)
              ? document.createElement('th')
              : document.createElement('tr');

          rowCells.forEach((_, cellIndex) => {
            const cellPath = rowPath.concat(x + cellIndex);

            // select cell by cell
            select(editor, {
              anchor: getStartPoint(editor, cellPath),
              focus: getEndPoint(editor, cellPath),
            });

            // set data from selection
            editor.setFragmentData(data);

            // get plain text
            cellStrings.push(data.getData('text/plain'));

            const cellElement = document.createElement('td');
            cellElement.innerHTML = data.getData('text/html');
            rowElement.appendChild(cellElement);
          });

          tableElement.appendChild(rowElement);

          textCsv += `${cellStrings.join(',')}\n`;
          textTsv += `${cellStrings.join('\t')}\n`;
        });

        // select back original cells
        select(editor, initialSelection!);

        divElement.appendChild(tableElement);
      });

      data.setData('text/csv', textCsv);
      data.setData('text/tsv', textTsv);
      data.setData('text/plain', textTsv);
      data.setData('text/html', divElement.innerHTML);

      // set slate fragment
      const selectedFragmentStr = JSON.stringify(tableNode);
      const encodedFragment = window.btoa(
        encodeURIComponent(selectedFragmentStr)
      );
      data.setData('application/x-slate-fragment', encodedFragment);
    },
  });

  e.preventDefault();
  e.stopPropagation();
};
