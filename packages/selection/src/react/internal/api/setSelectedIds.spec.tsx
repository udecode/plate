import { createPlateEditor } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
/** @jsx jsxt */

describe('BlockSelectionPlugin', () => {
  const createTestEditor = () =>
    createPlateEditor({
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'table1',
          children: [
            {
              id: 'tr1',
              children: [{ text: 'Row 1' }],
              type: 'tr',
            },
            {
              id: 'tr2',
              children: [{ text: 'Row 2' }],
              type: 'tr',
            },
          ],
          type: 'table',
        },
        {
          id: 'p1',
          children: [{ text: 'Paragraph 1' }],
          type: 'p',
        },
        {
          id: 'table2',
          children: [
            {
              id: 'tr3',
              children: [{ text: 'Row 3' }],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

  it.skip('should deselect ancestor when selecting descendants', () => {
    const editor = createTestEditor();
    const api = editor.getApi(BlockSelectionPlugin).blockSelection;

    // Select table1
    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['table1']));

    // Add tr1 and tr2 (descendants of table1)
    api.add(['tr1', 'tr2']);

    // Should deselect table1 and only have tr1 and tr2
    const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
    expect(Array.from(selectedIds!).sort()).toEqual(['tr1', 'tr2']);
  });

  it.skip('should select ancestor and deselect descendants when selecting outside', () => {
    const editor = createTestEditor();
    const api = editor.getApi(BlockSelectionPlugin).blockSelection;

    // First select tr1
    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['tr1']));

    // Then select p1 (outside of table1)
    api.add('p1');

    // Should select table1 (ancestor) and p1, deselecting tr1
    const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
    expect(Array.from(selectedIds!).sort()).toEqual(['p1', 'table1']);
  });

  it.skip('should deselect ancestor when selecting descendants', () => {
    const editor = createTestEditor();
    const api = editor.getApi(BlockSelectionPlugin).blockSelection;

    // Select table1
    editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['table1']));

    // Select tr1
    api.add('tr1');

    // Should deselect table1 and only have tr1
    const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
    expect(Array.from(selectedIds!).sort()).toEqual(['tr1']);
  });

  it.skip('should handle multiple tables and their rows independently', () => {
    const editor = createTestEditor();
    const api = editor.getApi(BlockSelectionPlugin).blockSelection;

    // Select tr1 from table1 and tr3 from table2
    editor.setOption(
      BlockSelectionPlugin,
      'selectedIds',
      new Set(['tr1', 'tr3'])
    );

    // Both rows should be selected as they're in different tables
    const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
    expect(Array.from(selectedIds!).sort()).toEqual(['tr1', 'tr3']);

    // Now select p1 (outside both tables)
    api.add('p1');

    // Should select both tables and p1, deselecting all rows
    const newSelectedIds = editor.getOption(
      BlockSelectionPlugin,
      'selectedIds'
    );
    expect(Array.from(newSelectedIds!).sort()).toEqual([
      'p1',
      'table1',
      'table2',
    ]);
  });
});
