import React from 'react';

import {
  useEditorPlugin,
  useEditorRef,
  usePluginOption,
  useReadOnly,
  useSelected,
} from '@udecode/plate/react';

import { getTableGridAbove } from '../../../lib';
import { TablePlugin } from '../../TablePlugin';

/**
 * Many grid cells above and diff -> set No many grid cells above and diff ->
 * unset No selection -> unset
 */
export const useSelectedCells = () => {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = useEditorRef();

  const { setOption } = useEditorPlugin(TablePlugin);
  const selectedCells = usePluginOption(TablePlugin, 'selectedCells');

  React.useEffect(() => {
    if (!selected || readOnly) {
      setOption('selectedCells', null);
      setOption('selectedTables', null);
    }
  }, [selected, editor, readOnly, setOption]);

  React.useEffect(() => {
    if (readOnly) return;

    const tableEntries = getTableGridAbove(editor, { format: 'table' });
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    if (cellEntries?.length > 1) {
      const cells = cellEntries.map((entry) => entry[0]);
      const tables = tableEntries.map((entry) => entry[0]);

      if (JSON.stringify(cells) !== JSON.stringify(selectedCells)) {
        setOption('selectedCells', cells);
        setOption('selectedTables', tables);
      }
    } else if (selectedCells) {
      setOption('selectedCells', null);
      setOption('selectedTables', null);
    }
  }, [editor, editor.selection, readOnly, selectedCells, setOption]);
};
