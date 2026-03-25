import { createSlateEditor } from 'platejs';

import { withTrailingBlock } from './withTrailingBlock';

describe('withTrailingBlock', () => {
  it('appends a trailing block at the next path when the last node has the wrong type', () => {
    const editor = createSlateEditor({
      value: [{ type: 'h1', children: [{ text: 'x' }] }] as any,
    });
    const normalizeNode = mock();

    const override = withTrailingBlock({
      editor,
      getOptions: () => ({
        level: 0,
        type: 'p',
      }),
      tf: { normalizeNode },
    } as any);
    const normalize = override.transforms!.normalizeNode!;

    normalize([editor, []]);

    expect(editor.children).toHaveLength(2);
    expect(editor.children[1]).toMatchObject({
      type: 'p',
      children: [{ text: '' }],
    });
    expect(normalizeNode).not.toHaveBeenCalled();
  });

  it('falls through to the base normalizeNode when the trailing block is already valid', () => {
    const editor = createSlateEditor({
      value: [{ type: 'p', children: [{ text: 'x' }] }] as any,
    });
    const normalizeNode = mock();

    const override = withTrailingBlock({
      editor,
      getOptions: () => ({
        level: 0,
        type: 'p',
      }),
      tf: { normalizeNode },
    } as any);
    const normalize = override.transforms!.normalizeNode!;

    normalize([editor, []]);

    expect(editor.children).toHaveLength(1);
    expect(normalizeNode).toHaveBeenCalledWith([editor, []]);
  });
});
