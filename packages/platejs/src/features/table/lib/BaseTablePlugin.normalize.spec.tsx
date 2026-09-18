/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import type { Value } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

jsxt;

describe('BaseTablePlugin normalization', () => {
  describe('defaultTableWidth is defined and columnWidths is not defined', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'resolves fallback widths without persisting them (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
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

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({
            allowCellSpanEditing,
            defaultTableWidth: 90,
          }),
          initialValue: input,
        });

        editor.update.value.repair();
        const table = editor.read.nodes.get([0], { type: BaseTablePlugin })![0];
        expect(editor.plugin(BaseTablePlugin).api.columnWidths(table)).toEqual([
          48, 48, 48,
        ]);
        expect(editor.read.children()).toEqual(input);
      }
    );
  });

  describe('defaultTableWidth is defined and columnWidths is partially defined', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'resolves fallback widths without persisting them (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <fragment>
            <htable columnWidths={[null, 40, null]}>
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
            allowCellSpanEditing,
            defaultTableWidth: 90,
          }),
          initialValue: input,
        });

        editor.update.value.repair();
        const table = editor.read.nodes.get([0], { type: BaseTablePlugin })![0];
        expect(editor.plugin(BaseTablePlugin).api.columnWidths(table)).toEqual([
          48, 40, 48,
        ]);
        expect(editor.read.children()).toEqual(input);
      }
    );
  });

  describe('defaultTableWidth is defined and columnWidths is fully defined', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'keeps existing columnWidths when every column width is already defined (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <fragment>
            <htable columnWidths={[40, 40, 40]}>
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
            allowCellSpanEditing,
            defaultTableWidth: 90,
          }),
          initialValue: input,
        });

        editor.update.value.repair();
        const table = editor.read.nodes.get([0], { type: BaseTablePlugin })![0];
        expect(editor.plugin(BaseTablePlugin).api.columnWidths(table)).toEqual([
          40, 40, 40,
        ]);
        expect(editor.read.children()).toEqual(input);
      }
    );
  });

  describe('single-column widths', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'preserves columnWidths for single-column tables (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({
            allowCellSpanEditing,
          }),
          initialValue: (
            <fragment>
              <htable columnWidths={[120]}>
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
              <htable columnWidths={[120]}>
                <htr>
                  <htd>
                    <hp>cell</hp>
                  </htd>
                </htr>
              </htable>
            </fragment>
          ) as Value
        );
      }
    );
  });

  describe('rectangular table repair', () => {
    it('fills missing logical cells', () => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
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
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
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
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
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
