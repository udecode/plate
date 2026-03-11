/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('next', () => {
  it('returns undefined when there is no location to search from', () => {
    const editor = createEditor({
      children: [{ children: [{ text: 'one' }], type: 'p' }] as any,
    });

    editor.selection = null;

    expect(editor.api.next()).toBeUndefined();
  });

  it('returns undefined instead of throwing when searching from the root path', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>two</hp>
        </editor>
      ) as any
    );

    expect(editor.api.next({ at: [] })).toBeUndefined();
  });

  describe('when using from option', () => {
    const editor = createEditor(
      (
        <editor>
          <element id="1">
            <text>Block One</text>
          </element>
          <element id="2">
            <element id="2-1">
              <text>Child One</text>
            </element>
            <element id="2-2">
              <text>Child Two</text>
            </element>
          </element>
          <element id="3">
            <text>Block Three</text>
          </element>
        </editor>
      ) as any
    );

    it('traverse from point after when from="after"', () => {
      const next = editor.api.next({ at: [0] });
      expect(next![0].id).toBe('2');
    });

    it('traverse from first child when from="child"', () => {
      const next = editor.api.next({
        at: [1],
        from: 'child',
      });
      expect(next![0].id).toBe('2-1');
    });
  });

  describe('when using match option', () => {
    const editor = createEditor(
      (
        <editor>
          <element id="1" type="p">
            <text>Block One</text>
          </element>
          <element id="2" type="div">
            <element id="2-1" type="p">
              <text>Child One</text>
            </element>
          </element>
        </editor>
      ) as any
    );

    it('find next node matching criteria', () => {
      const next = editor.api.next({
        at: [0],
        match: (n) => 'type' in n && n.type === 'p',
      });
      expect(next![0].id).toBe('2-1');
    });

    it('returns the next text node when matching text nodes directly', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>one</hp>
            <hp>two</hp>
          </editor>
        ) as any
      );

      const next = editor.api.next({
        at: [0],
        match: (n: any) => typeof n.text === 'string',
      });

      expect(next).toEqual([{ text: 'two' }, [1, 0]]);
    });
  });

  describe('when using nested blocks', () => {
    const editor = createEditor(
      (
        <editor>
          <element id="1">
            <text>Block One</text>
          </element>
          <element id="table" type="table">
            <element id="row1" type="table-row">
              <element id="cell1-1" type="table-cell">
                <text>Cell 1-1</text>
              </element>
              <element id="cell1-2" type="table-cell">
                <text>Cell 1-2</text>
              </element>
            </element>
            <element id="row2" type="table-row">
              <element id="cell2-1" type="table-cell">
                <text>Cell 2-1</text>
              </element>
            </element>
          </element>
          <element id="3">
            <text>Block Three</text>
          </element>
        </editor>
      ) as any
    );

    it('traverse from table to first cell when from="child"', () => {
      const next = editor.api.next({
        at: [1], // table path
        from: 'child',
      });
      expect(next![0].id).toBe('row1');
    });

    it('traverse from table to next block when from="after"', () => {
      const next = editor.api.next({
        at: [1], // table path
        from: 'after',
      });
      expect(next![0].id).toBe('3');
    });
  });

  it('falls back to a broad match when the location is a point or range', () => {
    const editor = createEditor({
      children: [
        { children: [{ text: 'one' }], type: 'p' },
        { children: [{ text: 'two' }], type: 'p' },
      ] as any,
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });

    expect(editor.api.next({ at: editor.selection! })).toEqual([
      { text: 'one' },
      [0, 0],
    ]);
  });
});
