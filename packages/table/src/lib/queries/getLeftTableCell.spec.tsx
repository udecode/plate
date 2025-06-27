/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type Value, createSlateEditor } from 'platejs';

import { getTestTablePlugins } from '../withNormalizeTable.spec';
import { getLeftTableCell } from './getLeftTableCell';

jsxt;

describe('getLeftTableCell', () => {
  describe('when cell has no spans', () => {
    it('should return left cell', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11">
                <hp>11</hp>
              </htd>
              <htd id="12">
                <hp>12</hp>
              </htd>
              <htd id="13">
                <hp>13</hp>
              </htd>
            </htr>
            <htr>
              <htd id="21">
                <hp>21</hp>
              </htd>
              <htd id="22">
                <hp>
                  <cursor />
                  22
                </hp>
              </htd>
              <htd id="23">
                <hp>23</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        value: input,
      });

      const result = getLeftTableCell(editor);
      expect(result).toBeDefined();
      
      const [cell] = result!;
      expect(cell.id).toBe('21');
    });

    it('should return undefined when at leftmost column', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11">
                <hp>
                  <cursor />
                  11
                </hp>
              </htd>
              <htd id="12">
                <hp>12</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        value: input,
      });

      const result = getLeftTableCell(editor);
      expect(result).toBeUndefined();
    });
  });

  describe('when cell has colSpan', () => {
    it('should find cell that spans into left position', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11" attributes={{ colspan: 2 }}>
                <hp>11 (spans 2 cols)</hp>
              </htd>
              <htd id="13">
                <hp>13</hp>
              </htd>
            </htr>
            <htr>
              <htd id="21">
                <hp>21</hp>
              </htd>
              <htd id="22">
                <hp>
                  <cursor />
                  22
                </hp>
              </htd>
              <htd id="23">
                <hp>23</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(undefined, (plugin) =>
          plugin.withComponent(() => plugin)
        ),
        value: input,
      });

      const result = getLeftTableCell(editor);
      expect(result).toBeDefined();
      
      const [cell] = result!;
      expect(cell.id).toBe('21');
    });

    it('should find merged cell that occupies left position', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11" attributes={{ colspan: 2 }}>
                <hp>11 (spans 2 cols)</hp>
              </htd>
              <htd id="13">
                <hp>
                  <cursor />
                  13
                </hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(undefined, (plugin) =>
          plugin.withComponent(() => plugin)
        ),
        value: input,
      });

      const result = getLeftTableCell(editor);
      expect(result).toBeDefined();
      
      const [cell] = result!;
      expect(cell.id).toBe('11');
    });
  });

  describe('when cell has rowSpan', () => {
    it('should find cell that spans into left position from above', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11" attributes={{ rowspan: 2 }}>
                <hp>11 (spans 2 rows)</hp>
              </htd>
              <htd id="12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd id="22">
                <hp>
                  <cursor />
                  22
                </hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(undefined, (plugin) =>
          plugin.withComponent(() => plugin)
        ),
        value: input,
      });

      const result = getLeftTableCell(editor);
      expect(result).toBeDefined();
      
      const [cell] = result!;
      expect(cell.id).toBe('11');
    });
  });

  describe('when cell has both colSpan and rowSpan', () => {
    it('should find complex merged cell', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11" attributes={{ colspan: 2, rowspan: 2 }}>
                <hp>11 (2x2)</hp>
              </htd>
              <htd id="13">
                <hp>13</hp>
              </htd>
            </htr>
            <htr>
              <htd id="23">
                <hp>
                  <cursor />
                  23
                </hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(undefined, (plugin) =>
          plugin.withComponent(() => plugin)
        ),
        value: input,
      });

      const result = getLeftTableCell(editor);
      expect(result).toBeDefined();
      
      const [cell] = result!;
      expect(cell.id).toBe('11');
    });
  });

  describe('with custom cell path', () => {
    it('should use provided path instead of cursor position', () => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd id="11">
                <hp>11</hp>
              </htd>
              <htd id="12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd id="21">
                <hp>21</hp>
              </htd>
              <htd id="22">
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as any as Value;

      const editor = createSlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        value: input,
      });

      // Get cell 22 path
      const cellPath = [0, 1, 1];
      
      const result = getLeftTableCell(editor, { at: cellPath });
      expect(result).toBeDefined();
      
      const [cell] = result!;
      expect(cell.id).toBe('21');
    });
  });
});