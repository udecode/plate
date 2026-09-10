import assert from 'node:assert/strict';

import { createTestBaseTableEditor } from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

const createFixture = (widths = [120, 180], marginLeft = 20) => {
  const editor = createTestBaseTableEditor({
    plugins: [BaseTablePlugin],
    initialValue: [
      {
        type: 'table',
        columnWidths: widths,
        marginLeft,
        children: [
          {
            type: 'tableRow',
            children: widths.map((_, index) => ({
              type: 'tableCell',
              children: [
                { type: 'paragraph', children: [{ text: String(index) }] },
              ],
            })),
          },
        ],
      },
    ],
  });
  const entry = editor.read.nodes.get([0], { type: BaseTablePlugin });
  assert.ok(entry);
  const table = entry[0];

  return { editor, table, plugin: editor.plugin(BaseTablePlugin) };
};

describe('table resizing', () => {
  it('projects deltas from captured sizes without changing the document', () => {
    const { editor, table, plugin } = createFixture();
    const resize = plugin.api.createResize(table, {
      edge: 'right',
      colIndex: 0,
    });

    expect(resize(30)).toEqual({
      edge: 'right',
      columns: [
        { colIndex: 0, width: 150 },
        { colIndex: 1, width: 150 },
      ],
    });
    expect(resize(10)).toEqual({
      edge: 'right',
      columns: [
        { colIndex: 0, width: 130 },
        { colIndex: 1, width: 170 },
      ],
    });
    expect(editor.read.children()[0]).toBe(table);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('preserves adjacent total width at both minimum constraints', () => {
    const { table, plugin } = createFixture();
    const resize = plugin.api.createResize(table, {
      edge: 'right',
      colIndex: 0,
    });

    expect(resize(1000)).toMatchObject({
      columns: [{ width: 252 }, { width: 48 }],
    });
    expect(resize(-1000)).toMatchObject({
      columns: [{ width: 48 }, { width: 252 }],
    });
  });

  it('keeps imported undersized columns positive and preserves their total', () => {
    const { table, plugin } = createFixture([20, 30]);
    const resize = plugin.api.createResize(table, {
      edge: 'right',
      colIndex: 0,
    });

    expect(resize(1000)).toMatchObject({
      columns: [{ width: 20 }, { width: 30 }],
    });
    expect(resize(-1000)).toMatchObject({
      columns: [{ width: 20 }, { width: 30 }],
    });
  });

  it('grows the trailing column without altering earlier widths', () => {
    const { editor, table, plugin } = createFixture();

    plugin.update.resize(
      plugin.api.createResize(table, { edge: 'right', colIndex: 1 })(50),
      { at: [0] }
    );
    expect(editor.read.children()[0]).toMatchObject({
      columnWidths: [120, 230],
    });
  });

  it('exchanges indentation and first-column width without moving the right edge', () => {
    const { table, plugin } = createFixture();
    const resize = plugin.api.createResize(table, { edge: 'left' });

    expect(resize(1000)).toEqual({
      edge: 'left',
      columns: [{ colIndex: 0, width: 48 }],
      marginLeft: 92,
    });
    expect(resize(-1000)).toEqual({
      edge: 'left',
      columns: [{ colIndex: 0, width: 140 }],
      marginLeft: 0,
    });
  });

  it('commits indentation and widths once and undoes the whole gesture', () => {
    const { editor, table, plugin } = createFixture();
    const commits: unknown[] = [];
    const unsubscribe = editor.subscribeCommit((commit) =>
      commits.push(commit)
    );

    plugin.update.resize(plugin.api.createResize(table, { edge: 'left' })(30), {
      at: [0],
    });
    unsubscribe();
    expect(commits).toHaveLength(1);
    expect(editor.read.history.undos()).toHaveLength(1);
    expect(editor.read.children()[0]).toMatchObject({
      columnWidths: [90, 180],
      marginLeft: 50,
    });
    editor.update.history.undo();
    expect(editor.read.children()).toEqual([table]);
    editor.update.history.redo();
    expect(editor.read.children()[0]).toMatchObject({
      columnWidths: [90, 180],
      marginLeft: 50,
    });
  });

  it('preserves an undersized first column when its left boundary stays put', () => {
    const { table, plugin } = createFixture([20, 100], 40);
    const resize = plugin.api.createResize(table, { edge: 'left' });

    expect(resize(0)).toMatchObject({
      columns: [{ width: 20 }],
      marginLeft: 40,
    });
    expect(resize(1000)).toMatchObject({
      columns: [{ width: 20 }],
      marginLeft: 40,
    });
    expect(resize(-1000)).toMatchObject({
      columns: [{ width: 60 }],
      marginLeft: 0,
    });
  });

  it('clamps row shrinking to a valid height', () => {
    const { editor, table, plugin } = createFixture();
    const resize = plugin.api.createResize(table, {
      edge: 'bottom',
      rowIndex: 0,
      height: 60,
    });

    expect(resize(20)).toEqual({ edge: 'bottom', rowIndex: 0, height: 80 });
    plugin.update.resize(resize(-1000), { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ height: 1 }],
    });
  });

  it('rejects invalid inputs without partially updating columns', () => {
    const { editor, table, plugin } = createFixture();

    expect(() =>
      plugin.api.createResize(table, { edge: 'right', colIndex: 2 })
    ).toThrow();
    expect(() =>
      plugin.api.createResize(table, { edge: 'bottom', rowIndex: 0, height: 0 })
    ).toThrow();
    expect(() =>
      plugin.api.createResize(table, { edge: 'left' })(Number.NaN)
    ).toThrow();
    expect(() =>
      plugin.update.resize(
        {
          edge: 'right',
          columns: [
            { colIndex: 0, width: 160 },
            { colIndex: 1, width: -1 },
          ],
        },
        { at: [0] }
      )
    ).toThrow();
    expect(editor.read.children()).toEqual([table]);
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  it('keeps preview work bounded to two widths for wide tables', () => {
    const { table, plugin } = createFixture(
      Array.from({ length: 2000 }, () => 120)
    );
    const resize = plugin.api.createResize(table, {
      edge: 'right',
      colIndex: 1000,
    });

    for (let delta = -100; delta <= 100; delta++) {
      const preview = resize(delta);

      expect(preview.edge).toBe('right');
      if (preview.edge === 'bottom') throw new Error('Expected column resize');
      expect(preview.columns).toHaveLength(2);
      expect(preview.columns.reduce((total, col) => total + col.width, 0)).toBe(
        240
      );
    }
  });
});
