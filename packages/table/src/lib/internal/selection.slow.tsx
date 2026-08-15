/** @jsx jsxt */

import assert from 'node:assert/strict';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import type { TableElement, TableRowElement } from '../BaseTablePlugin';
import { BaseTableCellPlugin, BaseTablePlugin } from '../BaseTablePlugin';

import {
  createTestTableEditor,
  getTestTablePlugins,
} from '../__tests__/getTestTablePlugins';
import type { TableCellElementWithId } from '../__tests__/tableTestTypes';
import { createDetachedTableContext } from './context';
import {
  getTableSelectionExpansion,
  getTableSelectionNeighbor,
  readTableSelection,
  readTableSelectionViewMetrics,
  type TableSelectionEdge,
} from './selection';

jsxt;

const createEditor = (input: TestEditor) =>
  createTestTableEditor({
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
  });

const createThreeCellEditor = () =>
  createEditor({
    children: [
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'a' }], type: 'paragraph' }],
                id: 'a',
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'b' }], type: 'paragraph' }],
                id: 'b',
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'c' }], type: 'paragraph' }],
                id: 'c',
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ],
    selection: null,
  } as TestEditor);

const getSelectionTypes = (editor: ReturnType<typeof createEditor>) => ({
  cellTypes: [editor.plugin(BaseTableCellPlugin).schema.type],
  tableType: editor.plugin(BaseTablePlugin).schema.type,
});

const getFixtureIds = (anchors: readonly { cell: unknown }[]) =>
  anchors.map(({ cell }) => (cell as TableCellElementWithId).id);

const readSelection = (
  editor: ReturnType<typeof createEditor>,
  expansion: 'endpoint-union' | 'span-closure' = 'span-closure'
) =>
  editor.read((state) =>
    readTableSelection(state, {
      expansion,
      ...getSelectionTypes(editor),
    })
  );

const readExpandedSelection = (
  editor: ReturnType<typeof createEditor>,
  edge: TableSelectionEdge
) => {
  const view = readSelection(editor);

  assert(view);

  const expansion = getTableSelectionExpansion(view, edge);

  assert(expansion);

  const anchor = editor.read.points.start(
    view.tablePath.concat(expansion.anchor.path)
  );
  const focus = editor.read.points.start(
    view.tablePath.concat(expansion.focus.path)
  );

  assert(anchor);
  assert(focus);

  return editor.read((state) =>
    readTableSelection(state, {
      at: { anchor, focus },
      ...getSelectionTypes(editor),
    })
  );
};

const createGeneratedSpanTable = (seed: number): TableElement => {
  let random = seed;
  const next = (max: number) => {
    random = (random * 16_807) % 2_147_483_647;

    return random % max;
  };
  const width = 2 + next(7);
  const height = 2 + next(7);
  const occupied = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );
  const rows: TableCellElementWithId[][] = Array.from(
    { length: height },
    () => []
  );
  let id = 0;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (occupied[row][col]) continue;

      const candidates: { colSpan: number; rowSpan: number }[] = [];

      for (let rowSpan = 1; rowSpan <= Math.min(3, height - row); rowSpan++) {
        for (let colSpan = 1; colSpan <= Math.min(3, width - col); colSpan++) {
          const available = Array.from({ length: rowSpan }, (_, rowOffset) =>
            Array.from(
              { length: colSpan },
              (_, colOffset) => !occupied[row + rowOffset][col + colOffset]
            ).every(Boolean)
          ).every(Boolean);

          if (available) candidates.push({ colSpan, rowSpan });
        }
      }

      const { colSpan, rowSpan } = candidates[next(candidates.length)];
      const cellKey = `s${seed}:${id++}`;

      rows[row].push({
        children: [
          {
            children: [{ text: cellKey }],
            type: 'paragraph',
          },
        ],
        ...(colSpan > 1 ? { colSpan } : {}),
        id: cellKey,
        ...(rowSpan > 1 ? { rowSpan } : {}),
        type: 'tableCell',
      });

      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
        for (let colOffset = 0; colOffset < colSpan; colOffset++) {
          occupied[row + rowOffset][col + colOffset] = true;
        }
      }
    }
  }

  return {
    children: rows.map(
      (children): TableRowElement => ({
        children,
        type: 'tableRow',
      })
    ),
    type: 'table',
  };
};

describe('readTableSelection', () => {
  it('keeps endpoint union distinct from recursive span closure', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="a0">
              <hp>a0</hp>
            </htd>
            <htd id="start">
              <hp>
                <anchor />
                start
              </hp>
            </htd>
            <htd id="a2">
              <hp>a2</hp>
            </htd>
          </htr>
          <htr>
            <htd colSpan={2} id="wide">
              <hp>wide</hp>
            </htd>
            <htd id="end">
              <hp>
                end
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createEditor(input);
    const endpointUnion = readSelection(editor, 'endpoint-union');
    const spanClosure = readSelection(editor);

    assert(endpointUnion);
    assert(spanClosure);

    expect(endpointUnion.bounds).toEqual({
      maxCol: 2,
      maxRow: 1,
      minCol: 1,
      minRow: 0,
    });
    expect(getFixtureIds(endpointUnion.anchors)).toEqual([
      'start',
      'a2',
      'wide',
      'end',
    ]);
    expect(spanClosure.bounds).toEqual({
      maxCol: 2,
      maxRow: 1,
      minCol: 0,
      minRow: 0,
    });
    expect(getFixtureIds(spanClosure.anchors)).toEqual([
      'a0',
      'start',
      'a2',
      'wide',
      'end',
    ]);
  });

  it('matches the donor merged-cell closure oracle', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="1,1">
              <hp>
                <anchor />
                1,1
              </hp>
            </htd>
            <htd id="2,1">
              <hp>2,1</hp>
            </htd>
            <htd id="3,1">
              <hp>3,1</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,2">
              <hp>1,2</hp>
            </htd>
            <htd colSpan={2} id="2,2" rowSpan={2}>
              <hp>
                2,2
                <focus />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,3">
              <hp>1,3</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const view = readSelection(createEditor(input));

    expect(view && getFixtureIds(view.anchors)).toEqual([
      '1,1',
      '2,1',
      '3,1',
      '1,2',
      '2,2',
      '1,3',
    ]);
  });

  it('matches the donor colspan closure oracle', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="1,1">
              <hp>
                <anchor />
                1,1
              </hp>
            </htd>
            <htd id="2,1">
              <hp>2,1</hp>
            </htd>
            <htd id="3,1">
              <hp>3,1</hp>
            </htd>
          </htr>
          <htr>
            <htd colSpan={2} id="1,2">
              <hp>
                1,2
                <focus />
              </hp>
            </htd>
            <htd id="3,2">
              <hp>3,2</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,3">
              <hp>1,3</hp>
            </htd>
            <htd id="2,3">
              <hp>2,3</hp>
            </htd>
            <htd id="3,3">
              <hp>3,3</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const view = readSelection(createEditor(input));

    expect(view && getFixtureIds(view.anchors)).toEqual(['1,1', '2,1', '1,2']);
  });

  it('matches the donor rowspan closure oracle', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="1,1">
              <hp>
                <anchor />
                1,1
              </hp>
            </htd>
            <htd id="2,1" rowSpan={3}>
              <hp>
                2,1
                <focus />
              </hp>
            </htd>
            <htd id="3,1">
              <hp>3,1</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,2">
              <hp>1,2</hp>
            </htd>
            <htd id="3,2">
              <hp>3,2</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,3">
              <hp>1,3</hp>
            </htd>
            <htd id="3,3">
              <hp>3,3</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const view = readSelection(createEditor(input));

    expect(view && getFixtureIds(view.anchors)).toEqual([
      '1,1',
      '2,1',
      '1,2',
      '1,3',
    ]);
  });

  it('returns ordered unique anchors symmetrically for reversed endpoints', () => {
    const forward = (
      <editor>
        <htable>
          <htr>
            <htd colSpan={2} id="wide">
              <hp>
                <anchor />
                wide
              </hp>
            </htd>
            <htd id="b">
              <hp>b</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c">
              <hp>c</hp>
            </htd>
            <htd id="d">
              <hp>d</hp>
            </htd>
            <htd id="e">
              <hp>
                e<focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const backward = (
      <editor>
        <htable>
          <htr>
            <htd colSpan={2} id="wide">
              <hp>
                <focus />
                wide
              </hp>
            </htd>
            <htd id="b">
              <hp>b</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c">
              <hp>c</hp>
            </htd>
            <htd id="d">
              <hp>d</hp>
            </htd>
            <htd id="e">
              <hp>
                e<anchor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const forwardEditor = createEditor(forward);
    const backwardEditor = createEditor(backward);
    const forwardView = readSelection(forwardEditor);
    const backwardView = readSelection(backwardEditor);

    assert(forwardView);
    assert(backwardView);

    expect(backwardView.bounds).toEqual(forwardView.bounds);
    expect(getFixtureIds(backwardView.anchors)).toEqual(
      getFixtureIds(forwardView.anchors)
    );
    expect(new Set(forwardView.anchors).size).toBe(forwardView.anchors.length);
    expect(forwardView.anchor.key).toBe(forwardEditor.key([0, 0, 0])!);
    expect(backwardView.anchor.key).toBe(backwardEditor.key([0, 1, 2])!);
  });

  it('matches the donor rectangle-extension oracle', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="1,1">
              <hp>
                <anchor />
                1,1
              </hp>
            </htd>
            <htd id="2,1">
              <hp>2,1</hp>
            </htd>
            <htd id="3,1">
              <hp>
                3,1
                <focus />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,2">
              <hp>1,2</hp>
            </htd>
            <htd id="2,2">
              <hp>2,2</hp>
            </htd>
            <htd id="3,2">
              <hp>3,2</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,3">
              <hp>1,3</hp>
            </htd>
            <htd id="2,3">
              <hp>2,3</hp>
            </htd>
            <htd id="3,3">
              <hp>3,3</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const view = readExpandedSelection(createEditor(input), 'bottom');

    expect(view && getFixtureIds(view.anchors)).toEqual([
      '1,1',
      '2,1',
      '3,1',
      '1,2',
      '2,2',
      '3,2',
    ]);
  });

  it('matches the donor colspan move oracle', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd colSpan={3} id="1,1">
              <hp>1,1</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,2">
              <hp>
                <anchor />
                1,2
                <focus />
              </hp>
            </htd>
            <htd id="2,2">
              <hp>2,2</hp>
            </htd>
            <htd id="3,2">
              <hp>3,2</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,3">
              <hp>1,3</hp>
            </htd>
            <htd id="2,3">
              <hp>2,3</hp>
            </htd>
            <htd id="3,3">
              <hp>3,3</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const view = readExpandedSelection(createEditor(input), 'top');

    expect(view && getFixtureIds(view.anchors)).toEqual([
      '1,1',
      '1,2',
      '2,2',
      '3,2',
    ]);
  });

  it('matches the donor inverted rowspan move oracle', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="1,1">
              <hp>
                <focus />
                1,1
              </hp>
            </htd>
            <htd id="2,1" rowSpan={3}>
              <hp>2,1</hp>
            </htd>
            <htd id="3,1">
              <hp>3,1</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,2">
              <hp>
                1,2
                <anchor />
              </hp>
            </htd>
            <htd id="3,2">
              <hp>3,2</hp>
            </htd>
          </htr>
          <htr>
            <htd id="1,3">
              <hp>1,3</hp>
            </htd>
            <htd id="3,3">
              <hp>3,3</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const view = readExpandedSelection(createEditor(input), 'right');

    expect(view && getFixtureIds(view.anchors)).toEqual([
      '1,1',
      '2,1',
      '1,2',
      '1,3',
    ]);
  });

  it('derives span-aware vertical and horizontal neighbors from the grid', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="a" rowSpan={2}>
              <hp>
                <cursor />a
              </hp>
            </htd>
            <htd id="b">
              <hp>b</hp>
            </htd>
          </htr>
          <htr>
            <htd id="c">
              <hp>c</hp>
            </htd>
          </htr>
          <htr>
            <htd id="d">
              <hp>d</hp>
            </htd>
            <htd id="e">
              <hp>e</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createEditor(input);
    const view = readSelection(editor);

    assert(view);

    expect(
      getTableSelectionNeighbor(view.context, view.anchor, 'below')?.key
    ).toBe(editor.key([0, 2, 0])!);
    expect(
      getTableSelectionNeighbor(view.context, view.anchor, 'right')?.key
    ).toBe(editor.key([0, 0, 1])!);
    expect(
      getTableSelectionNeighbor(
        view.context,
        view.context.grid.byKey.get(editor.key([0, 2, 1])!)!,
        'above'
      )?.key
    ).toBe(editor.key([0, 1, 0])!);
  });

  it('matches generated span-grid navigation in every direction', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const context = createDetachedTableContext(
        createGeneratedSpanTable(seed)
      );

      expect(context.grid.problems).toEqual([]);

      context.grid.anchors.forEach((anchor, order) => {
        const expected = {
          above: context.anchorAt(anchor.row - 1, anchor.col),
          below: context.anchorAt(anchor.row + anchor.rowSpan, anchor.col),
          left: context.anchorAt(anchor.row, anchor.col - 1),
          next: context.grid.anchors[order + 1] ?? null,
          previous: context.grid.anchors[order - 1] ?? null,
          right: context.anchorAt(anchor.row, anchor.col + anchor.colSpan),
        } as const;

        expect(anchor.order).toBe(order);

        for (const direction of [
          'above',
          'below',
          'left',
          'next',
          'previous',
          'right',
        ] as const) {
          expect(getTableSelectionNeighbor(context, anchor, direction)).toBe(
            expected[direction]
          );
        }
      });
    }
  });

  it('closes generated span selections symmetrically over complete slots', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const table = createGeneratedSpanTable(seed);
      const sourceGrid = createDetachedTableContext(table).grid;
      const editor = createEditor({
        children: [table],
        selection: null,
      } as TestEditor);
      const pairCount = Math.min(sourceGrid.anchors.length * 2, 40);

      for (let pair = 0; pair < pairCount; pair++) {
        const anchor = sourceGrid.anchors[pair % sourceGrid.anchors.length];
        const focus =
          sourceGrid.anchors[(pair * 7 + seed) % sourceGrid.anchors.length];
        const anchorPoint = editor.read.points.start([0, ...anchor.path]);
        const focusPoint = editor.read.points.end([0, ...focus.path]);

        assert(anchorPoint);
        assert(focusPoint);
        editor.update.selection.set({
          anchor: anchorPoint,
          focus: focusPoint,
        });

        const beforeProjection = readTableSelectionViewMetrics();
        const forward = readSelection(editor);

        assert(forward);
        editor.update.selection.set({
          anchor: focusPoint,
          focus: anchorPoint,
        });

        const backward = readSelection(editor);

        assert(backward);
        const afterProjection = readTableSelectionViewMetrics();
        const selectedSlotCount =
          (forward.bounds.maxRow - forward.bounds.minRow + 1) *
          (forward.bounds.maxCol - forward.bounds.minCol + 1);

        expect(
          afterProjection.projectionSlotCount -
            beforeProjection.projectionSlotCount
        ).toBe(selectedSlotCount * 4);
        expect(backward.bounds).toEqual(forward.bounds);
        expect(getFixtureIds(backward.anchors)).toEqual(
          getFixtureIds(forward.anchors)
        );
        expect(new Set(forward.anchors).size).toBe(forward.anchors.length);

        const selected = new Set(forward.anchors);

        forward.anchors.forEach((selectedAnchor) => {
          expect(selectedAnchor.row).toBeGreaterThanOrEqual(
            forward.bounds.minRow
          );
          expect(
            selectedAnchor.row + selectedAnchor.rowSpan - 1
          ).toBeLessThanOrEqual(forward.bounds.maxRow);
          expect(selectedAnchor.col).toBeGreaterThanOrEqual(
            forward.bounds.minCol
          );
          expect(
            selectedAnchor.col + selectedAnchor.colSpan - 1
          ).toBeLessThanOrEqual(forward.bounds.maxCol);
        });

        for (
          let row = forward.bounds.minRow;
          row <= forward.bounds.maxRow;
          row++
        ) {
          for (
            let col = forward.bounds.minCol;
            col <= forward.bounds.maxCol;
            col++
          ) {
            const selectedAnchor = forward.context.anchorAt(row, col);

            expect(selectedAnchor).not.toBeNull();
            expect(selected.has(selectedAnchor!)).toBe(true);
          }
        }
      }
    }
  });

  it('matches generated rectangular selections for every endpoint order', () => {
    const rowCount = 4;
    const colCount = 5;
    const input = {
      children: [
        {
          children: Array.from({ length: rowCount }, (_, row) => ({
            children: Array.from({ length: colCount }, (_, col) => ({
              children: [
                {
                  children: [{ text: `${row},${col}` }],
                  type: 'paragraph',
                },
              ],
              id: `r${row}c${col}`,
              type: 'tableCell',
            })),
            type: 'tableRow',
          })),
          type: 'table',
        },
      ],
      selection: null,
    } as TestEditor;
    const editor = createEditor(input);

    for (let anchorRow = 0; anchorRow < rowCount; anchorRow++) {
      for (let anchorCol = 0; anchorCol < colCount; anchorCol++) {
        for (let focusRow = 0; focusRow < rowCount; focusRow++) {
          for (let focusCol = 0; focusCol < colCount; focusCol++) {
            const anchor = editor.read.points.start([0, anchorRow, anchorCol]);
            const focus = editor.read.points.start([0, focusRow, focusCol]);

            assert(anchor);
            assert(focus);
            editor.update.selection.set({ anchor, focus });

            const view = readSelection(editor, 'endpoint-union');
            assert(view);

            const minRow = Math.min(anchorRow, focusRow);
            const maxRow = Math.max(anchorRow, focusRow);
            const minCol = Math.min(anchorCol, focusCol);
            const maxCol = Math.max(anchorCol, focusCol);
            const expectedIds = Array.from(
              { length: maxRow - minRow + 1 },
              (_, rowOffset) =>
                Array.from(
                  { length: maxCol - minCol + 1 },
                  (_, colOffset) =>
                    `r${minRow + rowOffset}c${minCol + colOffset}`
                )
            ).flat();

            expect(getFixtureIds(view.anchors)).toEqual(expectedIds);
            expect(view.bounds).toEqual({
              maxCol,
              maxRow,
              minCol,
              minRow,
            });
          }
        }
      }
    }
  });

  it('does not cache a stale selection view inside one active transaction', () => {
    const editor = createThreeCellEditor();
    const a = editor.read.points.start([0, 0, 0]);
    const b = editor.read.points.start([0, 0, 1]);
    const c = editor.read.points.start([0, 0, 2]);

    assert(a);
    assert(b);
    assert(c);
    editor.update.selection.set({ anchor: a, focus: b });
    const selectionTypes = getSelectionTypes(editor);

    editor.update((tx) => {
      const first = readTableSelection(tx, selectionTypes);

      assert(first);
      const firstKeys = [tx.key([0, 0, 0])!, tx.key([0, 0, 1])!];
      tx.selection.set({ anchor: b, focus: c });

      const second = readTableSelection(tx, selectionTypes);

      assert(second);
      expect(second).not.toBe(first);
      expect(second.version).toBe(first.version);
      expect(first.cellKeys).toEqual(firstKeys);
      expect(second.cellKeys).toEqual([tx.key([0, 0, 1])!, tx.key([0, 0, 2])!]);
    });
  });

  it('does not cache a stale table view after structure changes in one transaction', () => {
    const editor = createThreeCellEditor();
    const anchor = editor.read.points.start([0, 0, 0]);
    const focus = editor.read.points.start([0, 0, 2]);

    assert(anchor);
    assert(focus);
    editor.update.selection.set({ anchor, focus });
    const selectionTypes = getSelectionTypes(editor);

    editor.update((tx) => {
      const first = readTableSelection(tx, selectionTypes);

      assert(first);
      const firstKeys = [0, 1, 2].map((index) => tx.key([0, 0, index])!);
      tx.nodes.insert(
        {
          children: [
            {
              children: [{ text: 'inserted' }],
              type: 'paragraph',
            },
          ],
          id: 'inserted',
          type: 'tableCell',
        },
        { at: [0, 0, 1] }
      );

      const second = readTableSelection(tx, selectionTypes);

      assert(second);
      expect(second).not.toBe(first);
      expect(second.version).toBe(first.version);
      expect(first.cellKeys).toEqual(firstKeys);
      expect(second.cellKeys).toEqual(
        [0, 1, 2, 3].map((index) => tx.key([0, 0, index])!)
      );
    });
  });

  it('caches one immutable view per snapshot and invalidates it after the version changes', () => {
    const size = 30;
    const input = {
      children: [
        {
          children: Array.from({ length: size }, (_, row) => ({
            children: Array.from({ length: size }, (_, col) => ({
              children: [
                {
                  children: [{ text: `${row},${col}` }],
                  type: 'paragraph',
                },
              ],
              id: `r${row}c${col}`,
              type: 'tableCell',
            })),
            type: 'tableRow',
          })),
          type: 'table',
        },
      ],
      selection: null,
    } as TestEditor;
    const editor = createEditor(input);
    const anchor = editor.read.points.start([0, 0, 0]);
    const focus = editor.read.points.end([0, size - 1, size - 1]);

    assert(anchor);
    assert(focus);
    editor.update.selection.set({ anchor, focus });

    const before = readTableSelectionViewMetrics();
    const cold = readSelection(editor);

    assert(cold);

    for (let index = 0; index < 10_000; index++) {
      expect(readSelection(editor)).toBe(cold);
    }

    const hot = readTableSelectionViewMetrics();

    expect(hot.compileCount - before.compileCount).toBe(1);
    expect(hot.cacheHitCount - before.cacheHitCount).toBe(10_000);
    expect(hot.projectionSlotCount - before.projectionSlotCount).toBe(
      size * size * 2
    );
    expect(cold.anchors).toHaveLength(size * size);
    expect(Object.isFrozen(cold)).toBe(true);
    expect(Object.isFrozen(cold.cellKeys)).toBe(true);
    expect(Object.isFrozen(cold.cellEntries)).toBe(true);

    const nextFocus = editor.read.points.end([0, 0, 1]);

    assert(nextFocus);
    editor.update.selection.set({ anchor, focus: nextFocus });

    const next = readSelection(editor);

    assert(next);
    expect(next).not.toBe(cold);
    expect(next.version).toBeGreaterThan(cold.version);
    expect(getFixtureIds(next.anchors)).toEqual(['r0c0', 'r0c1']);
    expect(cold.anchors).toHaveLength(size * size);
  });
});
