/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('next', () => {
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

    it('should traverse from point after when from="after"', () => {
      const next = editor.api.next({ at: [0] });
      expect(next![0].id).toBe('2');
    });

    it('should traverse from first child when from="child"', () => {
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

    it('should find next node matching criteria', () => {
      const next = editor.api.next({
        at: [0],
        match: (n) => 'type' in n && n.type === 'p',
      });
      expect(next![0].id).toBe('2-1');
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

    it('should traverse from table to first cell when from="child"', () => {
      const next = editor.api.next({
        at: [1], // table path
        from: 'child',
      });
      expect(next![0].id).toBe('row1');
    });

    it('should traverse from table to next block when from="after"', () => {
      const next = editor.api.next({
        at: [1], // table path
        from: 'after',
      });
      expect(next![0].id).toBe('3');
    });
  });
});
