/** @jsx jsxt */

import assert from 'node:assert/strict';

import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '#platejs-test-internal';

import { ElementIdPlugin, DocumentChange } from '../../../core';
import { BaseYjsPlugin } from '../../../yjs/react';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import type { TableElementWithId } from './__tests__/tableTestTypes';
import { BaseTableCellPlugin, BaseTablePlugin } from './BaseTablePlugin';
import { compileTableGrid } from './internal/grid';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createTestTableEditor({
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
  });

const tableElement = (
  id: string,
  rows: ReadonlyArray<readonly string[]>
): TableElementWithId => ({
  children: rows.map((values, row) => ({
    children: values.map((value) => ({
      children: [
        {
          children: [{ text: value }],
          id: `paragraph-${value}`,
          type: 'paragraph',
        },
      ],
      id: value,
      type: 'tableCell',
    })),
    id: `${id}-row-${row}`,
    type: 'tableRow',
  })),
  id,
  type: 'table',
});

describe('BaseTablePlugin apply', () => {
  it('preserves a selection that spans cells within the same table', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
                one
              </hp>
            </htd>
            <htd>
              <hp>two</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const requested = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                one
              </hp>
            </htd>
            <htd>
              <hp>
                two
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTableEditor(input);

    editor.update.selection.set(requested.selection);

    expect(editor.read.selection()).toEqual(
      projectTestSelectionRange(requested.selection)
    );
  });

  it('clamps selection focus to the end of the table when dragging from inside the table to a block after it', () => {
    const input = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          <cursor />
          after
        </hp>
      </editor>
    ) as TestEditor;

    const requested = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                cell
              </hp>
            </htd>
          </htr>
        </htable>
        <hp>
          <focus />
          after
        </hp>
      </editor>
    ) as TestEditor;

    const expected = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                cell
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
        <hp>after</hp>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.selection.set(requested.selection);

    expect(editor.read.selection()).toEqual(
      projectTestSelectionRange(expected.selection)
    );
  });

  it('clamps backward selection focus to the point before the table when dragging from a block after it into the table', () => {
    const input = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const requested = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                <focus />
                cell
              </hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <anchor />
        </hp>
      </editor>
    ) as TestEditor;

    const expected = (
      <editor>
        <hp>
          before
          <focus />
        </hp>
        <htable>
          <htr>
            <htd>
              <hp>cell</hp>
            </htd>
          </htr>
        </htable>
        <hp>
          after
          <anchor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.selection.set(requested.selection);

    expect(editor.read.selection()).toEqual(
      projectTestSelectionRange(expected.selection)
    );
  });

  it('derives current indices after a column is removed', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="keep">
              <hp>11</hp>
            </htd>
            <htd id="remove">
              <hp>
                12
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTableEditor(input);
    const keepKey = editor.key([0, 0, 0])!;
    const removeKey = editor.key([0, 0, 1])!;

    expect(
      editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(keepKey)
    ).toEqual({ col: 0, row: 0 });
    expect(
      editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(removeKey)
    ).toEqual({ col: 1, row: 0 });
    editor.update.table.removeColumn();

    const nextKeep = editor.read.nodes.get([0, 0, 0], {
      type: BaseTableCellPlugin,
    });
    assert.ok(nextKeep);
    expect(
      editor.plugin(BaseTablePlugin).read.getCellIndices(nextKeep[0])
    ).toEqual({ col: 0, row: 0 });
    expect(
      editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(keepKey)
    ).toEqual({ col: 0, row: 0 });
    expect(
      editor.plugin(BaseTablePlugin).read.getCellIndicesByKey(removeKey)
    ).toBeUndefined();
  });

  it('derives current indices after replaying a classification-free change', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="keep">
              <hp>11</hp>
            </htd>
            <htd id="remove">
              <hp>
                12
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const source = createTableEditor(input);

    source.update.table.removeColumn();

    const change = DocumentChange.fromJSON(
      source.read.lastCommit()!.changes.toJSON()
    );
    const replay = createTableEditor(input);
    const keepKey = replay.key([0, 0, 0])!;
    const removeKey = replay.key([0, 0, 1])!;

    expect(
      replay.plugin(BaseTablePlugin).read.getCellIndicesByKey(keepKey)
    ).toEqual({ col: 0, row: 0 });
    expect(
      replay.plugin(BaseTablePlugin).read.getCellIndicesByKey(removeKey)
    ).toEqual({ col: 1, row: 0 });
    expect(change.primaryClassification).toBeNull();
    replay.update((tx) => tx.changes.apply(change));

    const nextKeep = replay.read.nodes.get([0, 0, 0], {
      type: BaseTableCellPlugin,
    });
    assert.ok(nextKeep);
    expect(
      replay.plugin(BaseTablePlugin).read.getCellIndices(nextKeep[0])
    ).toEqual({ col: 0, row: 0 });
    expect(
      replay.plugin(BaseTablePlugin).read.getCellIndicesByKey(keepKey)
    ).toEqual({ col: 0, row: 0 });
    expect(
      replay.plugin(BaseTablePlugin).read.getCellIndicesByKey(removeKey)
    ).toBeUndefined();
  });

  it('publishes a compound merge as one history entry with stable undo/redo', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="a">
              <hp>
                <anchor />a
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
              <hp>
                d<focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins({ disableMerge: false }),
      selection: input.selection,
      initialValue: input.children,
    });

    expect(editor.read.history.undos()).toHaveLength(0);

    editor.plugin(BaseTablePlugin).update.merge();

    expect(editor.read.history.undos()).toHaveLength(1);
    expect(
      editor.read.nodes.get([0, 0, 0], { type: BaseTableCellPlugin })?.[0]
    ).toMatchObject({
      colSpan: 2,
      id: 'a',
      rowSpan: 2,
    });

    editor.update.history.undo();

    expect(editor.read.children()).toMatchObject(input.children);
    assert.deepEqual(
      editor.read.selection(),
      projectTestSelectionRange(input.selection)
    );

    editor.update.history.redo();

    expect(editor.read.history.undos()).toHaveLength(1);
    expect(
      editor.read.nodes.get([0, 0, 0], { type: BaseTableCellPlugin })?.[0]
    ).toMatchObject({
      colSpan: 2,
      id: 'a',
      rowSpan: 2,
    });
  });

  it('publishes focused table correction as one history entry with stable undo/redo', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd id="a">
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
            <htd id="d">
              <hp>d</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTableEditor(input);
    const initialChildren = editor.read.children();
    const initialSelection = editor.read.selection();

    editor.update((tx) => tx.nodes.remove({ at: [0, 1, 1] }));

    const repaired = editor.read.nodes.get([0], { type: BaseTablePlugin })?.[0];
    assert.ok(repaired);

    const repairedGrid = editor.read((state) => compileTableGrid(state, [0]));
    const repairedChildren = editor.read.children();
    const repairedSelection = editor.read.selection();

    expect(editor.read.history.undos()).toHaveLength(1);
    expect(repairedGrid.problems).toEqual([]);
    expect(repairedGrid.anchors).toHaveLength(4);
    assert.deepEqual(repairedSelection, initialSelection);

    editor.update.history.undo();

    assert.deepEqual(editor.read.children(), initialChildren);
    assert.deepEqual(editor.read.selection(), initialSelection);

    editor.update.history.redo();

    assert.deepEqual(editor.read.children(), repairedChildren);
    assert.deepEqual(editor.read.selection(), repairedSelection);
    expect(editor.read.nodes.get([0, 1, 1])).toBeDefined();
  });

  it('publishes one Yjs update and replays the complete table plan', () => {
    const initialValue = [tableElement('table', [['a', 'b']])];
    const selection = {
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
      kind: 'text' as const,
    };
    const source = createTestTableEditor({
      plugins: [
        ElementIdPlugin,
        BaseTablePlugin,
        BaseYjsPlugin.configure({ initialState: { clientId: 'source' } }),
      ],
      selection,
      initialValue,
    });
    const doc = source.extension(BaseYjsPlugin).read.doc();
    const replay = createTestTableEditor({
      plugins: [
        ElementIdPlugin,
        BaseTablePlugin,
        BaseYjsPlugin.configure({
          initialState: { clientId: 'replay', doc },
        }),
      ],
      initialValue: [{ children: [{ text: 'local' }], type: 'paragraph' }],
    });
    let updateCount = 0;

    doc.on('update', () => (updateCount += 1) - 1);
    source.update.table.insertColumn();

    expect(updateCount).toBe(1);
    assert.deepEqual(replay.read.children(), source.read.children());
    expect(replay.read.nodes.get([0, 0, 1])).toBeDefined();
  });
});
