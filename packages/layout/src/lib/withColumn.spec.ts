import { createSlateEditor, NodeApi } from 'platejs';

import { BaseColumnItemPlugin, BaseColumnPlugin } from './BaseColumnPlugin';
import { withColumn } from './withColumn';

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

  it('unwraps column groups that contain only non-column children', () => {
    const editor = createEditor([
      {
        children: [
          { children: [{ text: 'A' }], type: 'p' },
          { children: [{ text: 'B' }], type: 'blockquote' },
        ],
        type: 'column_group',
      },
    ]);

    const path = [0];
    const node = NodeApi.get(editor, path);

    editor.tf.normalizeNode([node!, path]);

    expect(editor.children).toEqual([
      { children: [{ text: 'A' }], type: 'p' },
      { children: [{ text: 'B' }], type: 'blockquote' },
    ]);
  });

  it('selects the containing column when the current selection is inside it', () => {
    const select = mock();
    const fallbackSelectAll = mock(() => 'fallback');
    const transforms = withColumn({
      editor: {
        api: {
          above: mock(() => [{ type: 'column' }, [1, 0]]),
          end: mock(() => ({ offset: 2, path: [1, 0] })),
          isEnd: mock(() => false),
          isStart: mock(() => false),
          start: mock(() => ({ offset: 0, path: [1, 0, 0] })),
        },
        selection: {
          anchor: { offset: 0, path: [1, 0, 0] },
          focus: { offset: 2, path: [1, 0, 0] },
        },
        tf: { select },
      } as any,
      tf: {
        normalizeNode: mock(),
        selectAll: fallbackSelectAll,
      } as any,
      type: 'column',
    } as any).transforms as any;

    expect(transforms.selectAll()).toBe(true);
    expect(select).toHaveBeenCalledWith([1, 0]);
    expect(fallbackSelectAll).not.toHaveBeenCalled();
  });

  it('selects the parent column group when the entire column is already selected', () => {
    const select = mock();
    const transforms = withColumn({
      editor: {
        api: {
          above: mock(() => [{ type: 'column' }, [2, 1]]),
          end: mock(() => ({ offset: 4, path: [2, 1] })),
          isEnd: mock(() => true),
          isStart: mock(() => true),
          start: mock(() => ({ offset: 0, path: [2, 1] })),
        },
        selection: {
          anchor: { offset: 0, path: [2, 1] },
          focus: { offset: 4, path: [2, 1] },
        },
        tf: { select },
      } as any,
      tf: {
        normalizeNode: mock(),
        selectAll: mock(),
      } as any,
      type: 'column',
    } as any).transforms as any;

    expect(transforms.selectAll()).toBe(true);
    expect(select).toHaveBeenCalledWith([2]);
  });
});
