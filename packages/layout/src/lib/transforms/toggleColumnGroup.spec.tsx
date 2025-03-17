import type { Path } from '@udecode/plate';

import { createPlateEditor } from '@udecode/plate/react';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import { toggleColumnGroup } from './toggleColumnGroup';

describe('toggleColumnGroup', () => {
  let editor: ReturnType<typeof createPlateEditor>;
  let initialValue: any[];

  beforeEach(() => {
    initialValue = [
      {
        children: [{ text: 'Some paragraph text' }],
        type: 'p',
      },
    ];

    editor = createPlateEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: initialValue,
    });
  });

  it('should wrap a paragraph in a column group when toggling from a paragraph', () => {
    const at: Path = [0, 0]; // Inside the paragraph text
    editor.tf.select(editor.api.start(at)!);

    // Toggle to 2 columns
    toggleColumnGroup(editor, { columns: 2 });

    const node: any = editor.children[0];
    expect(node.type).toBe('column_group');
    expect(node.children).toHaveLength(2);
    expect(node.children[0].type).toBe('column');
    expect(node.children[1].type).toBe('column');
    expect(node.children[0].children[0].children[0].text).toBe(
      'Some paragraph text'
    );
    // The second column should have a newly created block
    expect(node.children[1].children[0].type).toBe('p');
    expect(node.children[1].children[0].children[0].text).toBe('');
  });

  it('should update the number of columns if already a column group', () => {
    // Start with a column group of 2 columns
    editor.children = [
      {
        children: [
          {
            children: [{ children: [{ text: 'Col1 text' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
          {
            children: [{ children: [{ text: 'Col2 text' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'column_group',
      },
    ];

    const columnGroupPath: Path = [0];
    editor.tf.select(editor.api.start(columnGroupPath.concat([0, 0, 0]))!);

    // Toggle to 3 columns (from 2 columns)
    toggleColumnGroup(editor, { columns: 3 });

    const node: any = editor.children[0];
    expect(node.type).toBe('column_group');
    expect(node.children).toHaveLength(3);

    // All widths should be adjusted
    expect(node.children[0].width).toContain('33.3333');
    expect(node.children[1].width).toContain('33.3333');
    expect(node.children[2].width).toContain('33.3333');

    // Content from the original 2 columns should still exist
    expect(node.children[0].children[0].children[0].text).toBe('Col1 text');
    expect(node.children[1].children[0].children[0].text).toBe('Col2 text');

    // The new 3rd column should have one empty paragraph
    expect(node.children[2].children).toHaveLength(1);
    expect(node.children[2].children[0].type).toBe('p');
    expect(node.children[2].children[0].children[0].text).toBe('');
  });

  it('should preserve content when toggling between different column counts', () => {
    // Start with a column group of 2 columns
    editor.children = [
      {
        children: [
          {
            children: [{ children: [{ text: 'Col1 text' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
          {
            children: [{ children: [{ text: 'Col2 text' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'column_group',
      },
    ];

    const columnGroupPath: Path = [0];
    editor.tf.select(editor.api.start(columnGroupPath)!);

    // Toggle to 3 columns
    toggleColumnGroup(editor, { columns: 3 });
    let node: any = editor.children[0];
    expect(node.children).toHaveLength(3);

    // Insert content in the third column
    editor.tf.apply({
      node: { children: [{ text: 'Col3 extra text' }], type: 'p' },
      path: [0, 2, 1],
      type: 'insert_node',
    });

    // Toggle back to 2 columns
    toggleColumnGroup(editor, { columns: 2 });
    node = editor.children[0];
    expect(node.children).toHaveLength(2);

    // Col3 content should have merged into column 2
    const col2Texts = node.children[1].children
      .flatMap((child: any) => child.children)
      .map((child: any) => child.text);

    expect(col2Texts).toContain('Col2 text');
    expect(col2Texts).toContain('Col3 extra text');
  });

  it('should do nothing if no selection is provided', () => {
    // No selection
    toggleColumnGroup(editor, { columns: 2 });
    // Should remain a single paragraph
    const node = editor.children[0];
    expect(node.type).toBe('p');
  });

  it('should handle toggling from a selection inside a column as well', () => {
    // Start with a column group of 2 columns
    editor.children = [
      {
        children: [
          {
            children: [{ children: [{ text: 'Col1 text' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
          {
            children: [{ children: [{ text: 'Col2 text' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'column_group',
      },
    ];
    const columnGroupPath: Path = [0];
    // Select inside second column's paragraph
    editor.tf.select(editor.api.start([0, 1, 0, 0])!);

    // Toggle to 3 columns
    toggleColumnGroup(editor, { columns: 3 });
    const node: any = editor.children[0];

    expect(node.children).toHaveLength(3);
    // Should keep Col1 text and Col2 text
    expect(node.children[0].children[0].children[0].text).toBe('Col1 text');
    expect(node.children[1].children[0].children[0].text).toBe('Col2 text');
    // New column
    expect(node.children[2].children[0].children[0].text).toBe('');
  });
});
