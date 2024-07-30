import {
  type TElement,
  type WithOverride,
  getEndPoint,
  getPluginType,
  getStartPoint,
  select,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import type { TTableCellElement, TablePluginOptions } from './types';

import { ELEMENT_TH } from './TablePlugin';
import { getColSpan, getRowSpan, getTableGridAbove } from './queries/index';

export const withSetFragmentDataTable: WithOverride<TablePluginOptions> = (
  editor
) => {
  const { setFragmentData } = editor;

  editor.setFragmentData = (
    data: DataTransfer,
    originEvent?: 'copy' | 'cut' | 'drag' | undefined
  ) => {
    const tableEntry = getTableGridAbove(editor, {
      format: 'table',
    })?.[0];
    const selectedCellEntries = getTableGridAbove(editor, {
      format: 'cell',
    });

    const initialSelection = editor.selection;

    if (!tableEntry || !initialSelection) {
      setFragmentData(data, originEvent);

      return;
    }

    const selectionStart =
      Path.compare(initialSelection.anchor.path, initialSelection.focus.path) <
      1
        ? initialSelection.anchor
        : initialSelection.focus;

    const [tableNode, tablePath] = tableEntry;
    const tableRows = tableNode.children as TElement[];

    const tableSelectionStart = selectionStart.path.slice(
      tablePath.length,
      tablePath.length + 2
    );

    const [y, x] = tableSelectionStart;

    let textCsv = '';
    let textTsv = '';

    const divElement = document.createElement('div');
    const tableElement = document.createElement('table');

    /**
     * Cover single cell copy | cut operation. In this case, copy cell content
     * instead of table structure.
     */
    if (
      tableEntry &&
      initialSelection &&
      selectedCellEntries.length === 1 &&
      (originEvent === 'copy' || originEvent === 'cut')
    ) {
      setFragmentData(data);

      return;
    }

    withoutNormalizing(editor, () => {
      tableRows.forEach((row, rowIndex) => {
        const rowCells = row.children as TTableCellElement[];
        const rowPath = tablePath.concat(y + rowIndex);

        const cellStrings: string[] = [];
        const rowElement =
          row.type === getPluginType(editor, ELEMENT_TH)
            ? document.createElement('th')
            : document.createElement('tr');

        rowCells.forEach((cell, cellIndex) => {
          // need to clean data before every iteration
          data.clearData();

          const cellPath = rowPath.concat(x + cellIndex);

          // select cell by cell
          select(editor, {
            anchor: getStartPoint(editor, cellPath),
            focus: getEndPoint(editor, cellPath),
          });

          // set data from selection
          setFragmentData(data);

          // get plain text
          cellStrings.push(data.getData('text/plain'));

          const cellElement = document.createElement('td');

          const colSpan = getColSpan(cell);
          cellElement.colSpan = colSpan;
          const rowSpan = getRowSpan(cell);
          cellElement.rowSpan = rowSpan;

          cellElement.innerHTML = data.getData('text/html');
          rowElement.append(cellElement);
        });

        tableElement.append(rowElement);

        textCsv += `${cellStrings.join(',')}\n`;
        textTsv += `${cellStrings.join('\t')}\n`;
      });

      // select back original cells
      select(editor, initialSelection!);

      divElement.append(tableElement);
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
  };

  return editor;
};
