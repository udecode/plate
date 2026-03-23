import { createSlateEditor } from 'platejs';

import { BaseColumnItemPlugin, BaseColumnPlugin } from '../BaseColumnPlugin';
import { insertColumn } from './insertColumn';

describe('insertColumn', () => {
  it('insert a column with the default width and an empty block', () => {
    const editor = createSlateEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'First' }], type: 'p' }],
              type: 'column',
              width: '67%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    insertColumn(editor, { at: [0, 1] });

    const columnGroup = editor.children[0] as any;

    expect(columnGroup.children).toHaveLength(2);
    expect(columnGroup.children[1].type).toBe('column');
    expect(columnGroup.children[1].width).toBe('33%');
    expect(columnGroup.children[0].width).toBe('67%');
    expect(columnGroup.children[1].children[0].type).toBe('p');
    expect(columnGroup.children[1].children[0].children[0].text).toBe('');
  });

  it('respect a custom width and insertion path', () => {
    const editor = createSlateEditor({
      plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'Existing' }], type: 'p' }],
              type: 'column',
              width: '75%',
            },
          ],
          type: 'column_group',
        },
      ],
    });

    insertColumn(editor, { at: [0, 0], width: '25%' });

    const columnGroup = editor.children[0] as any;

    expect(columnGroup.children).toHaveLength(2);
    expect(columnGroup.children[0].width).toBe('25%');
    expect(columnGroup.children[1].width).toBe('75%');
    expect(columnGroup.children[0].children[0].children[0].text).toBe('');
    expect(columnGroup.children[1].children[0].children[0].text).toBe(
      'Existing'
    );
  });
});
