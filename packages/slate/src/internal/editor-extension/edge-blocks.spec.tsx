/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('edgeBlocks', () => {
  it('returns the same block for a collapsed selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
          <hp>next</hp>
        </editor>
      ) as any
    );

    expect(editor.api.edgeBlocks()).toEqual([
      [{ children: [{ text: 'test' }], type: 'p' }, [0]],
      [{ children: [{ text: 'test' }], type: 'p' }, [0]],
    ]);
  });

  it('returns both edge blocks for an expanded selection', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            te
            <anchor />
            st
          </hp>
          <hp>
            ne
            <focus />
            xt
          </hp>
        </editor>
      ) as any
    );

    expect(editor.api.edgeBlocks()).toEqual([
      [{ children: [{ text: 'test' }], type: 'p' }, [0]],
      [{ children: [{ text: 'next' }], type: 'p' }, [1]],
    ]);
  });

  it('returns null when the selection is missing', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'test' }], type: 'p' }] as any,
      selection: null,
    });

    expect(editor.api.edgeBlocks()).toBeNull();
  });
});
