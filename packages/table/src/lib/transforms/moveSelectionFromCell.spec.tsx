/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { moveSelectionFromCell } from './moveSelectionFromCell';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('moveSelectionFromCell', () => {
  it('returns undefined when edge expansion needs more than one selected cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
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
    const initialSelection = editor.read.selection();

    expect(moveSelectionFromCell(editor, { edge: 'right' })).toBeUndefined();
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('can expand from a single active cell when fromOneCell is true', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    expect(
      moveSelectionFromCell(editor, { edge: 'right', fromOneCell: true })
    ).toBe(true);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 1, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('can expand a single active cell upward when fromOneCell is true', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                21
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    expect(
      moveSelectionFromCell(editor, { edge: 'top', fromOneCell: true })
    ).toBe(true);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 1, 0, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('can expand a single active cell downward when fromOneCell is true', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    expect(
      moveSelectionFromCell(editor, { edge: 'bottom', fromOneCell: true })
    ).toBe(true);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 1, 0, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('does nothing when edge expansion would leave the table grid', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
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
    const initialSelection = editor.read.selection();

    expect(
      moveSelectionFromCell(editor, { edge: 'left', fromOneCell: true })
    ).toBe(true);
    expect(editor.read.selection()).toEqual(initialSelection);
  });
});
