import { createSlateEditor, NodeApi } from 'platejs';

import { BaseColumnItemPlugin, BaseColumnPlugin } from './BaseColumnPlugin';

const createEditor = (value: any[]) =>
  createSlateEditor({
    plugins: [BaseColumnItemPlugin, BaseColumnPlugin],
    value,
  });

describe('withColumn', () => {
  it('unwrap a single-column group back to plain blocks', () => {
    const editor = createEditor([
      {
        children: [
          {
            children: [{ children: [{ text: 'Only' }], type: 'p' }],
            type: 'column',
            width: '100%',
          },
        ],
        type: 'column_group',
      },
    ]);

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect((editor.children[0] as any).type).toBe('p');
    expect((editor.children[0] as any).children[0].text).toBe('Only');
  });

  it('unwrap non-column content instead of dropping it', () => {
    const editor = createEditor([
      {
        children: [{ children: [{ text: 'Loose paragraph' }], type: 'p' }],
        type: 'column_group',
      },
    ]);

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect((editor.children[0] as any).type).toBe('p');
    expect((editor.children[0] as any).children[0].text).toBe(
      'Loose paragraph'
    );
  });

  it('normalize column widths so the group sums to one hundred percent', () => {
    const editor = createEditor([
      {
        children: [
          {
            children: [{ children: [{ text: 'A' }], type: 'p' }],
            type: 'column',
            width: '20%',
          },
          {
            children: [{ children: [{ text: 'B' }], type: 'p' }],
            type: 'column',
            width: '20%',
          },
        ],
        type: 'column_group',
      },
    ]);

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect((editor.children[0] as any).children[0].width).toBe('50%');
    expect((editor.children[0] as any).children[1].width).toBe('50%');
  });

  it('remove empty columns during normalization', () => {
    const editor = createEditor([
      {
        children: [
          {
            children: [{ children: [{ text: 'A' }], type: 'p' }],
            type: 'column',
            width: '50%',
          },
          {
            children: [],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'column_group',
      },
    ]);

    const path = [0, 1];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect((editor.children[0] as any).type).toBe('p');
    expect((editor.children[0] as any).children[0].text).toBe('A');
  });
});
