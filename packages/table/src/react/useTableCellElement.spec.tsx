/** @jsx jsxt */

import assert from 'node:assert/strict';
import { renderHook } from '@testing-library/react';
import { Plate } from '@platejs/core/react';
import { ElementProvider } from '@platejs/core/react/internal';
import type {
  EditorCommit,
  EditorCommitChangeKind,
  Element,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import {
  type TableCellElement,
  type TableElement,
  type TableRowElement,
} from '../lib/BaseTablePlugin';
import React from 'react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseTablePlugin } from '../lib/BaseTablePlugin';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from '../lib/__tests__/getTestTablePlugins';
import type { TableCellElementWithId } from '../lib/__tests__/tableTestTypes';
import { TablePlugin } from './TablePlugin';
import { shouldUpdateCellIndices } from './internal/shouldUpdateCellIndices';
import { roundCellSizeToStep, useTableCellSize } from './useTableCellElement';
import { TableProvider } from './useTableStore';

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
      .read.getSelectedCells() as TableCellElement[];

    expect(cells.map(getFixtureId)).toEqual(['c11', 'c21']);

    editor
      .plugin(BaseTablePlugin)
      .update.toggleBorders({ border: 'left', cells });

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ left: { size: 0 } }} id="c11">
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
              <htd borders={{ left: { size: 0 } }} id="c21">
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
      .read.getSelectedCells() as TableCellElement[];

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
              <htd borders={{ right: { size: 0 } }} id="c11">
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
              <htd borders={{ right: { size: 0 } }} id="c21">
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

    editor.plugin(BaseTablePlugin).update.setBorderSize(0, {
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
              <htd borders={{ right: { size: 0 } }} id="c21">
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

    editor.plugin(BaseTablePlugin).update.setBorderSize(0, {
      at: [0, 0, 0],
      border: 'right',
    });
    editor.plugin(BaseTablePlugin).update.setBorderSize(0, {
      at: [0, 1, 0],
      border: 'right',
    });

    expect(editor.read.children()).toMatchObject(
      (
        <editor>
          <htable>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c11">
                <hp>11</hp>
              </htd>
              <htd id="c12">
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd borders={{ right: { size: 0 } }} id="c21">
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
    const entry = editor.read.nodes.get<TableCellElement>([0, 1, 1]);
    assert(entry);
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
              <htd borders={{ bottom: { size: 0 } }} colSpan={2} id="c11">
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

describe('roundCellSizeToStep', () => {
  it('returns the size without a step', () => {
    expect(roundCellSizeToStep(10.6)).toBe(10.6);
  });

  it('rounds the size to the nearest step', () => {
    expect(roundCellSizeToStep(14.9, 10)).toBe(10);
    expect(roundCellSizeToStep(15.1, 10)).toBe(20);
  });
});

describe('shouldUpdateCellIndices', () => {
  const commitWith = (...kinds: EditorCommitChangeKind[]) =>
    ({
      changed: {
        hasAny: (kind: EditorCommitChangeKind) => kinds.includes(kind),
      },
    }) as EditorCommit;

  it('ignores text and selection-only commits', () => {
    expect(shouldUpdateCellIndices(commitWith('text', 'selection'))).toBe(
      false
    );
  });

  it.each([
    'properties',
    'structure',
    'replace',
    'root-order',
  ] as const)('refreshes for %s changes', (kind) => {
    expect(shouldUpdateCellIndices(commitWith(kind))).toBe(true);
  });
});

describe('useTableCellSize', () => {
  it('uses an explicit cell instead of an ancestor element provider', () => {
    const element: TableCellElementWithId = {
      children: [{ text: '' }],
      id: 'cell-1',
      type: 'tableCell',
    };
    const row: TableRowElement = {
      children: [element],
      size: 24,
      type: 'tableRow',
    };
    const table: TableElement = {
      children: [row],
      colSizes: [120],
      type: 'table',
    };
    const editor = createTestTableEditor({
      initialValue: [table],
      plugins: [TablePlugin],
    });
    const installedTable = editor.read.nodes.get<TableElement>([0])![0];
    const installedRow = editor.read.nodes.get<TableRowElement>([0, 0])![0];
    const installedElement = editor.read.nodes.get<TableCellElement>([
      0, 0, 0,
    ])![0];
    const PlateWithChildren = Plate as React.ComponentType<
      Omit<React.ComponentProps<typeof Plate>, 'children'>
    >;
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        PlateWithChildren,
        { editor, suppressInstanceWarning: true },
        React.createElement(
          TableProvider,
          null,
          React.createElement(
            ElementProvider,
            {
              element: installedTable,
              entry: [installedTable, [0]],
              path: [0],
              scope: PLUGINS.table,
            },
            React.createElement(
              ElementProvider,
              {
                element: installedRow,
                entry: [installedRow, [0, 0]],
                path: [0, 0],
                scope: PLUGINS.tableRow,
              },
              children
            )
          )
        )
      );
    const { result } = renderHook(
      () => useTableCellSize({ element: installedElement }),
      { wrapper }
    );

    expect(result.current).toEqual({ minHeight: 24, width: 120 });
  });
});
