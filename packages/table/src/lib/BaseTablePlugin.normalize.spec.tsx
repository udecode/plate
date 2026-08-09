/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type Value } from '@platejs/plite';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

jsxt;

describe('BaseTablePlugin normalization', () => {
  describe('initialTableWidth is defined and colSizes is not defined', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('sets colSizes (disableMerge: $disableMerge)', ({ disableMerge }) => {
      const input = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Value;

      const output = (
        <fragment>
          <htable colSizes={[30, 30, 30]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Value;

      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({
          disableMerge,
          initialTableWidth: 90,
        }),
        initialValue: input,
      });

      editor.update.value.repair();
      expect(editor.read.children()).toMatchObject(output);
    });
  });

  describe('initialTableWidth is defined and colSizes is partially defined', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('sets colSizes (disableMerge: $disableMerge)', ({ disableMerge }) => {
      const input = (
        <fragment>
          <htable colSizes={[0, 40, 0]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Value;

      const output = (
        <fragment>
          <htable colSizes={[30, 40, 30]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Value;

      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({
          disableMerge,
          initialTableWidth: 90,
        }),
        initialValue: input,
      });

      editor.update.value.repair();
      expect(editor.read.children()).toMatchObject(output);
    });
  });

  describe('initialTableWidth is defined and colSizes is fully defined', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('keeps existing colSizes when every column width is already defined (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const input = (
        <fragment>
          <htable colSizes={[40, 40, 40]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Value;

      const output = (
        <fragment>
          <htable colSizes={[40, 40, 40]}>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Value;

      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({
          disableMerge,
          initialTableWidth: 90,
        }),
        initialValue: input,
      });

      editor.update.value.repair();
      expect(editor.read.children()).toMatchObject(output);
    });
  });

  describe('enableUnsetSingleColSize', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('unsets colSizes for single-column tables (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({
          disableMerge,
          enableUnsetSingleColSize: true,
        }),
        initialValue: (
          <fragment>
            <htable colSizes={[120]}>
              <htr>
                <htd>
                  <hp>cell</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value,
      });

      editor.update.value.repair();

      expect(editor.read.children()).toMatchObject(
        (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>cell</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value
      );
    });
  });

  describe('rectangular table repair', () => {
    it('fills missing logical cells', () => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        initialValue: (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>c</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value,
      });

      editor.update.value.repair();

      expect(editor.read.children()).toMatchObject(
        (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>c</hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value
      );
    });

    it('clamps a row span to the table height', () => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        initialValue: (
          <fragment>
            <htable>
              <htr>
                <htd rowSpan={3}>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>c</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value,
      });

      editor.update.value.repair();

      expect(editor.read.children()).toMatchObject(
        (
          <fragment>
            <htable>
              <htr>
                <htd rowSpan={2}>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>c</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value
      );
    });

    it('splits a cell whose span collides with an earlier row span', () => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ disableMerge: false }),
        initialValue: (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd rowSpan={3}>
                  <hp>b</hp>
                </htd>
                <htd>
                  <hp>c</hp>
                </htd>
              </htr>
              <htr>
                <htd colSpan={3}>
                  <hp>d</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>e</hp>
                </htd>
                <htd>
                  <hp>f</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value,
      });

      editor.update.value.repair();

      expect(editor.read.children()).toMatchObject(
        (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd rowSpan={3}>
                  <hp>b</hp>
                </htd>
                <htd>
                  <hp>c</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>d</hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>e</hp>
                </htd>
                <htd>
                  <hp>f</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Value
      );
    });
  });
});
