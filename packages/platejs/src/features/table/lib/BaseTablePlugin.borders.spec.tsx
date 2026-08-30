/** @jsx jsxt */

import assert from 'node:assert/strict';

import { jsxt, type TestEditor } from '#platejs-test-internal';

import type { Element } from '../../../core';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';

jsxt;

const getFixtureId = (node: Element) =>
  typeof node.id === 'string' ? node.id : undefined;

const createTableEditor = (input: TestEditor) =>
  createTestTableEditor({
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
  });

describe('TablePlugin.update.toggleBorders integration', () => {
  it('toggles the left border for every selected first-column cell in a multi-row selection', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>
                21
                <focus />
              </hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const cells = editor
      .plugin(BaseTablePlugin)
      .read.selection()!
      .anchors.map(({ cell }) => cell);

    expect(cells.map(getFixtureId)).toEqual(['c11', 'c21']);

    editor
      .plugin(BaseTablePlugin)
      .update.toggleBorders({ border: 'left', cells });

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ left: { width: 0 } }} id="c11">
                <hp>
                  <anchor />
                  11
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ left: { width: 0 } }} id="c21">
                <hp>
                  21
                  <focus />
                </hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });

  it('toggles the left border for every selected non-first-column cell in a multi-row selection', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>
                <anchor />
                12
              </hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>
                22
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const cells = editor
      .plugin(BaseTablePlugin)
      .read.selection()!
      .anchors.map(({ cell }) => cell);

    expect(cells.map(getFixtureId)).toEqual(['c12', 'c22']);
    expect(editor.read.nodes.path(cells[1])).toEqual([0, 1, 1]);
    expect(
      getFixtureId(
        editor.plugin(BaseTablePlugin).read.getAdjacentCell({
          at: editor.read.nodes.path(cells[1]),
          deltaCol: -1,
        })![0]
      )
    ).toBe('c21');

    editor
      .plugin(BaseTablePlugin)
      .update.toggleBorders({ border: 'left', cells });

    expect(editor.read.history.undos()).toHaveLength(1);

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ right: { width: 0 } }} id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>
                  <anchor />
                  12
                </hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { width: 0 } }} id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );

    editor.update.history.undo();

    expect(editor.read.children()).toMatchObject(input.children);
  });

  it('can set the lower-row adjacent right border directly by path', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>
                22
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.plugin(BaseTablePlugin).update.setBorderWidth(0, {
      at: [0, 1, 0],
      border: 'right',
    });

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { width: 0 } }} id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });

  it('can set both adjacent right borders sequentially by path', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c12">
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>
                22
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.plugin(BaseTablePlugin).update.setBorderWidth(0, {
      at: [0, 0, 0],
      border: 'right',
    });
    editor.plugin(BaseTablePlugin).update.setBorderWidth(0, {
      at: [0, 1, 0],
      border: 'right',
    });

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ right: { width: 0 } }} id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { width: 0 } }} id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });

  it('rejects invalid border widths before mutation', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="c11">
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTableEditor(input);
    const before = editor.read.children();

    expect(() =>
      editor.plugin(BaseTablePlugin).update.setBorderWidth(-1)
    ).toThrow(/border width.*non-negative finite number/i);
    expect(() =>
      editor.plugin(BaseTablePlugin).update.setBorderWidth(Number.NaN)
    ).toThrow(/border width.*non-negative finite number/i);
    expect(editor.read.children()).toBe(before);
  });

  it('treats fractional border widths as visible', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd
              borders={{
                bottom: { width: 0.5 },
                left: { width: 0.5 },
                right: { width: 0.5 },
                top: { width: 0.5 },
              }}
            >
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTableEditor(input);
    const cells = editor
      .plugin(BaseTablePlugin)
      .read.selection()!
      .anchors.map(({ cell }) => cell);

    expect(
      editor.plugin(BaseTablePlugin).read.getSelectedCellsBorders(cells)
    ).toEqual({
      bottom: true,
      left: true,
      none: false,
      outer: true,
      right: true,
      top: true,
    });
  });

  it('toggles the top border on the spanning cell above a merged column selection', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd colSpan={2} id="c11">
              <hp>11</hp>
            </htd>
            <htd id="c13">
              <hp>13</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c21">
              <hp>21</hp>
            </htd>
            <htd id="c22">
              <hp>
                22
                <cursor />
              </hp>
            </htd>
            <htd id="c23">
              <hp>23</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const entry = editor.read.nodes.get([0, 1, 1], {
      type: BaseTableCellPlugin,
    });
    assert.ok(entry);
    const [target] = entry;

    expect(getFixtureId(target)).toBe('c22');

    editor
      .plugin(BaseTablePlugin)
      .update.toggleBorders({ border: 'top', cells: [target] });

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ bottom: { width: 0 } }} colSpan={2} id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c13">
                <hp>13</hp>
              </htd>
            </htr>
            <htr>
              <htd id="c21">
                <hp>21</hp>
              </htd>
              <htd id="c22">
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
              <htd id="c23">
                <hp>23</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ).children
    );
  });
});
