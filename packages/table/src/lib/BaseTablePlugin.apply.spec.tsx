/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createPlateEditor } from '@platejs/core/react';
import { DocumentChange } from '@platejs/plite';
import type { TTableCellElement } from '@platejs/utils';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    initialValue: input.children,
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

    editor.update.selection.set(requested.selection!);

    expect(editor.read.selection()).toEqual(requested.selection!);
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

    editor.update.selection.set(requested.selection!);

    expect(editor.read.selection()).toEqual(expected.selection!);
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

    editor.update.selection.set(requested.selection!);

    expect(editor.read.selection()).toEqual(expected.selection!);
  });

  it('drops removed cell indices and recomputes the remaining table indices', () => {
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
    const keepEntry = editor.read.nodes.get<TTableCellElement>([0, 0, 0]);
    const removeEntry = editor.read.nodes.get<TTableCellElement>([0, 0, 1]);
    assert(keepEntry);
    assert(removeEntry);
    const [keep] = keepEntry;
    const [remove] = removeEntry;

    editor.plugin(BaseTablePlugin).api.getCellIndices(keep);
    editor.plugin(BaseTablePlugin).api.getCellIndices(remove);
    editor.update.table.removeColumn();

    expect(editor.plugin(BaseTablePlugin).getOptions()._cellIndices).toEqual(
      {}
    );
    const nextKeep = editor.read.nodes.get<TTableCellElement>([0, 0, 0]);
    assert(nextKeep);
    expect(
      editor.plugin(BaseTablePlugin).api.getCellIndices(nextKeep[0])
    ).toEqual({ col: 0, row: 0 });
    expect(editor.plugin(BaseTablePlugin).getOptions()._cellIndices).toEqual({
      keep: { col: 0, row: 0 },
    });
  });

  it('invalidates cell indices for a classification-free table change', () => {
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
    const keepEntry = replay.read.nodes.get<TTableCellElement>([0, 0, 0]);
    const removeEntry = replay.read.nodes.get<TTableCellElement>([0, 0, 1]);
    assert(keepEntry);
    assert(removeEntry);
    const [keep] = keepEntry;
    const [remove] = removeEntry;

    replay.plugin(BaseTablePlugin).api.getCellIndices(keep);
    replay.plugin(BaseTablePlugin).api.getCellIndices(remove);
    expect(change.primaryClassification).toBeNull();
    replay.update((tx) => tx.changes.apply(change));

    expect(replay.plugin(BaseTablePlugin).getOptions()._cellIndices).toEqual(
      {}
    );
    const nextKeep = replay.read.nodes.get<TTableCellElement>([0, 0, 0]);
    assert(nextKeep);
    expect(
      replay.plugin(BaseTablePlugin).api.getCellIndices(nextKeep[0])
    ).toEqual({ col: 0, row: 0 });
    expect(replay.plugin(BaseTablePlugin).getOptions()._cellIndices).toEqual({
      keep: { col: 0, row: 0 },
    });
  });
});
