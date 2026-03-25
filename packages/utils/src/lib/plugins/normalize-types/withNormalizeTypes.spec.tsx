import { createSlateEditor } from 'platejs';

import { withNormalizeTypes } from './withNormalizeTypes';

describe('withNormalizeTypes', () => {
  it('rewrites a mismatched strictType while preserving children', () => {
    const editor = createSlateEditor({
      value: [{ type: 'h2', children: [{ text: 'test' }] }] as any,
    });
    const normalizeNode = mock();

    const override = withNormalizeTypes({
      editor,
      getOptions: () => ({
        rules: [{ path: [0], strictType: 'h1' }],
      }),
      tf: { normalizeNode },
    } as any);
    const normalize = override.transforms!.normalizeNode!;

    normalize([editor, []]);

    expect(editor.children[0]).toMatchObject({
      type: 'h1',
      children: [{ text: 'test' }],
    });
    expect(normalizeNode).not.toHaveBeenCalled();
  });

  it('calls onError and falls through to the base normalizeNode when insertion fails', () => {
    const editor = createSlateEditor({
      value: [{ type: 'p', children: [{ text: 'x' }] }] as any,
    });
    const normalizeNode = mock();
    const onError = mock();

    const override = withNormalizeTypes({
      editor,
      getOptions: () => ({
        onError,
        rules: [{ path: [3], type: 'h1' }],
      }),
      tf: { normalizeNode },
    } as any);
    const normalize = override.transforms!.normalizeNode!;

    normalize([editor, []]);

    expect(onError).toHaveBeenCalled();
    expect(normalizeNode).toHaveBeenCalledWith([editor, []]);
    expect(editor.children[0]).toMatchObject({
      type: 'p',
      children: [{ text: 'x' }],
    });
  });
});
