import type { Path } from '@udecode/plate';

import { createPlateEditor } from '@udecode/plate/react';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import { setColumns } from './setColumns';

describe('setColumns', () => {
  let editor: ReturnType<typeof createPlateEditor>;
  let columnGroupPath: Path;

  beforeEach(() => {
    editor = createPlateEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      // Initial value: a column_group with 2 columns
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Column 1 text' }], type: 'p' }],
              type: 'column',
              width: '50%',
            },
            {
              children: [{ children: [{ text: 'Column 2 text' }], type: 'p' }],
              type: 'column',
              width: '50%',
            },
          ],
          type: 'column_group',
        },
      ],
    });
    columnGroupPath = [0];
  });

  it('should update widths if same number of columns', () => {
    // Currently 2 columns, set new widths for these 2 columns
    setColumns(editor, {
      at: columnGroupPath,
      widths: ['30%', '70%'],
    });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
    expect(node.children[0].width).toBe('30%');
    expect(node.children[1].width).toBe('70%');
    // Content remains the same
    expect(node.children[0].children[0].children[0].text).toBe('Column 1 text');
    expect(node.children[1].children[0].children[0].text).toBe('Column 2 text');
  });

  it('should insert new columns if targetCount > currentCount', () => {
    // Currently 2 columns, want 3 columns
    setColumns(editor, {
      at: columnGroupPath,
      widths: ['33%', '33%', '33%'],
    });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(3);

    // First two columns updated
    expect(node.children[0].width).toContain('33.');
    expect(node.children[1].width).toContain('33.');

    // New column inserted
    expect(node.children[2].width).toContain('33.');
    // Should have a default block inside
    expect(node.children[2].children).toHaveLength(1);
    expect(node.children[2].children[0].type).toBe('p');
    // Original content untouched in the first two columns
    expect(node.children[0].children[0].children[0].text).toBe('Column 1 text');
    expect(node.children[1].children[0].children[0].text).toBe('Column 2 text');
  });

  it('should merge columns and remove extras if targetCount < currentCount', () => {
    // Setup initial state with 3 columns
    editor.children = [
      {
        children: [
          {
            children: [{ children: [{ text: 'C1 text' }], type: 'p' }],
            type: 'column',
            width: '33%',
          },
          {
            children: [{ children: [{ text: 'C2 text' }], type: 'p' }],
            type: 'column',
            width: '33%',
          },
          {
            children: [{ children: [{ text: 'C3 text' }], type: 'p' }],
            type: 'column',
            width: '33%',
          },
        ],
        type: 'column_group',
      },
    ];

    // Now reduce to 2 columns
    setColumns(editor, {
      at: columnGroupPath,
      widths: ['50%', '50%'],
    });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
    // Check widths updated
    expect(node.children[0].width).toBe('50%');
    expect(node.children[1].width).toBe('50%');

    // Content from column 3 should have moved into column 2
    const col1Text = node.children[0].children[0].children[0].text;
    const col2TextChildren = node.children[1].children.flatMap(
      (n: any) => n.children
    );
    const col2Texts = col2TextChildren.map((t: any) => t.text);

    expect(col1Text).toBe('C1 text');
    expect(col2Texts).toContain('C2 text');
    expect(col2Texts).toContain('C3 text');

    // Column 3 should now be removed
  });

  it('should do nothing if no path is provided', () => {
    // Call without at
    setColumns(editor, { widths: ['100%'] });

    const node = editor.children[0] as any;
    // Should remain unchanged
    expect(node.children).toHaveLength(2);
    expect(node.children[0].width).toBe('50%');
    expect(node.children[1].width).toBe('50%');
  });

  it('should do nothing if node is not found at the given path', () => {
    setColumns(editor, { at: [999], widths: ['100%'] });

    const node = editor.children[0] as any;
    // Should remain unchanged
    expect(node.children).toHaveLength(2);
    expect(node.children[0].width).toBe('50%');
    expect(node.children[1].width).toBe('50%');
  });

  it('should do nothing if widths array is empty', () => {
    setColumns(editor, { at: columnGroupPath, widths: [] });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
    // Should remain unchanged
    expect(node.children[0].width).toBe('50%');
    expect(node.children[1].width).toBe('50%');
    expect(node.children[0].children[0].children[0].text).toBe('Column 1 text');
    expect(node.children[1].children[0].children[0].text).toBe('Column 2 text');
  });

  it('should handle decimal widths', () => {
    setColumns(editor, { at: columnGroupPath, widths: ['33.3%', '66.7%'] });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
    expect(node.children[0].width).toBe('33.3%');
    expect(node.children[1].width).toBe('66.7%');
  });

  it('should handle widths that do not sum to 100%', () => {
    setColumns(editor, { at: columnGroupPath, widths: ['40%', '40%'] });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
    expect(node.children[0].width).toBe('50%');
    expect(node.children[1].width).toBe('50%');
  });

  it('should handle multiple toggles without losing content', () => {
    // Start: 2 columns
    // Toggle to 3 columns
    setColumns(editor, { at: columnGroupPath, widths: ['33%', '33%', '34%'] });

    let node = editor.children[0] as any;
    expect(node.children).toHaveLength(3);
    expect(node.children[0].children[0].children[0].text).toBe('Column 1 text');
    expect(node.children[1].children[0].children[0].text).toBe('Column 2 text');
    expect(node.children[2].width).toBe('34%');

    // Add some new content in the third column
    editor.tf.insertNodes(
      { children: [{ text: 'Column 3 text' }], type: 'p' },
      {
        at: [0, 2, 1],
      }
    );

    // Toggle back to 2 columns
    setColumns(editor, { at: columnGroupPath, widths: ['50%', '50%'] });

    node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
    // Col3 content should have merged into column 2
    expect(node.children[1].children[0].children[0].text).toBe('Column 2 text');
    expect(node.children[1].children[2].children[0].text).toBe('Column 3 text');

    // Toggle again to 3 columns
    setColumns(editor, { at: columnGroupPath, widths: ['33%', '33%', '34%'] });

    node = editor.children[0] as any;
    expect(node.children).toHaveLength(3);
    // Column 3 added again with empty content
    expect(node.children[2].children.length).toBeGreaterThan(0);
    // Original content is still preserved in columns 2
    expect(node.children[1].children[0].children[0].text).toBe('Column 2 text');
    expect(node.children[1].children[2].children[0].text).toBe('Column 3 text');
    expect(node.children[2].children[0].children[0].text).toBe('');
  });

  it('should gracefully handle toggling to zero columns (though not practical)', () => {
    // Set columns to an empty widths array (no columns)
    setColumns(editor, { at: columnGroupPath, widths: [] });

    // Should have done nothing as per previous test, but let's check stability
    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);
  });

  it('should append content to the end when merging columns', () => {
    // Setup initial state with 3 columns
    editor.children = [
      {
        children: [
          {
            children: [{ children: [{ text: 'Col 1' }], type: 'p' }],
            type: 'column',
            width: '33%',
          },
          {
            children: [
              { children: [{ text: '21' }], type: 'p' },
              { children: [{ text: '22' }], type: 'p' },
              { children: [{ text: '23' }], type: 'p' },
              { children: [{ text: '24' }], type: 'p' },
              { children: [{ text: '25' }], type: 'p' },
            ],
            type: 'column',
            width: '33%',
          },
          {
            children: [
              { children: [{ text: 'Col 3 first' }], type: 'p' },
              { children: [{ text: 'Col 3 second' }], type: 'p' },
            ],
            type: 'column',
            width: '33%',
          },
        ],
        type: 'column_group',
      },
    ];

    // Reduce to 2 columns
    setColumns(editor, {
      at: columnGroupPath,
      widths: ['50%', '50%'],
    });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);

    // Check column 2's content order
    const col2Children = node.children[1].children;
    expect(col2Children).toHaveLength(7);
    expect(col2Children[0].children[0].text).toBe('21');
    expect(col2Children[1].children[0].text).toBe('22');
    expect(col2Children[2].children[0].text).toBe('23');
    expect(col2Children[3].children[0].text).toBe('24');
    expect(col2Children[4].children[0].text).toBe('25');
    expect(col2Children[5].children[0].text).toBe('Col 3 first');
    expect(col2Children[6].children[0].text).toBe('Col 3 second');
  });

  it('should correctly merge multiple columns when reducing from 4 to 2', () => {
    // Setup initial state with 4 columns
    editor.children = [
      {
        children: [
          {
            children: [{ children: [{ text: 'Col 1' }], type: 'p' }],
            type: 'column',
            width: '25%',
          },
          {
            children: [
              { children: [{ text: 'Col 2 first' }], type: 'p' },
              { children: [{ text: 'Col 2 second' }], type: 'p' },
            ],
            type: 'column',
            width: '25%',
          },
          {
            children: [
              { children: [{ text: 'Col 3 first' }], type: 'p' },
              { children: [{ text: 'Col 3 second' }], type: 'p' },
            ],
            type: 'column',
            width: '25%',
          },
          {
            children: [
              { children: [{ text: 'Col 4 first' }], type: 'p' },
              { children: [{ text: 'Col 4 second' }], type: 'p' },
            ],
            type: 'column',
            width: '25%',
          },
        ],
        type: 'column_group',
      },
    ];

    // Reduce to 2 columns
    setColumns(editor, {
      at: columnGroupPath,
      widths: ['50%', '50%'],
    });

    const node = editor.children[0] as any;
    expect(node.children).toHaveLength(2);

    // Check column 1's content (should be unchanged)
    expect(node.children[0].children[0].children[0].text).toBe('Col 1');

    // Check column 2's content order (should have content from cols 2, 3, and 4)
    const col2Children = node.children[1].children;
    expect(col2Children).toHaveLength(6);
    expect(col2Children[0].children[0].text).toBe('Col 2 first');
    expect(col2Children[1].children[0].text).toBe('Col 2 second');
    expect(col2Children[2].children[0].text).toBe('Col 3 first');
    expect(col2Children[3].children[0].text).toBe('Col 3 second');
    expect(col2Children[4].children[0].text).toBe('Col 4 first');
    expect(col2Children[5].children[0].text).toBe('Col 4 second');
  });
});
