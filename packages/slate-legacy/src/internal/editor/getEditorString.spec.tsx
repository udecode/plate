/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('getEditorString', () => {
  it('returns an empty string without a selection', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'one' }], type: 'p' }] as any,
    });

    editor.selection = null;

    expect(editor.api.string()).toBe('');
  });

  it('returns the string across multiple blocks', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            one
            <anchor />
          </hp>
          <hp>
            two
            <focus />
          </hp>
        </editor>
      ) as any
    );

    expect(editor.api.string()).toBe('two');
    expect(editor.api.string(editor.selection)).toBe('two');
  });

  it('returns the string for a direct block path', () => {
    const editor = createEditor({
      children: [
        {
          children: [{ text: 'one' }, { text: 'two' }],
          type: 'tag',
        },
      ] as any,
    }) as any;

    editor.isVoid = (element: any) => element.type === 'tag';

    expect(editor.api.string([0])).toBe('onetwo');
  });

  it('returns an empty string for an invalid location', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ) as any
    );

    expect(editor.api.string([9, 9, 9] as any)).toBe('');
  });
});
