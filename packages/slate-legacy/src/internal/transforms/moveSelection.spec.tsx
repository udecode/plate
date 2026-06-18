/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('moveSelection', () => {
  it('moves a collapsed cursor forward by one character', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            wo
            <cursor />
            rd
          </hp>
        </editor>
      ) as any
    );

    editor.move();

    const output = (
      <editor>
        <hp>
          wor
          <cursor />d
        </hp>
      </editor>
    ) as any;

    expect(editor.selection).toEqual(output.selection);
  });

  it('moves both edges by one word', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            one <cursor />
            two three
          </hp>
        </editor>
      ) as any
    );

    editor.move({ unit: 'word' });

    const output = (
      <editor>
        <hp>
          one two
          <cursor /> three
        </hp>
      </editor>
    ) as any;

    expect(editor.selection).toEqual(output.selection);
  });

  it('moves only the anchor when requested', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            one <anchor />
            two thr
            <focus />
            ee
          </hp>
        </editor>
      ) as any
    );

    editor.move({ distance: 3, edge: 'anchor' });

    const output = (
      <editor>
        <hp>
          one two
          <anchor /> thr
          <focus />
          ee
        </hp>
      </editor>
    ) as any;

    expect(editor.selection).toEqual(output.selection);
  });

  it('moves a grapheme cluster as one character', () => {
    const text = 'word👨‍👩‍👧‍👧';
    const editor: any = createEditor({
      children: [{ type: 'p', children: [{ text }] }] as any,
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    editor.move();

    expect(editor.selection).toEqual({
      anchor: { offset: text.length, path: [0, 0] },
      focus: { offset: text.length, path: [0, 0] },
    });
  });

  it('only updates editor.selection and leaves additive selection fields alone', () => {
    const editor: any = createEditor({
      children: [{ type: 'p', children: [{ text: 'word' }] }] as any,
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });
    const selections = [
      {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    ];

    editor.selections = selections;
    editor.move({ distance: 1 });

    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    expect(editor.selections).toBe(selections);
  });
});
