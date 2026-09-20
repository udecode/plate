/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import * as Y from 'yjs';

import {
  getEditorLiveSelection,
  jsxt,
  type TestEditor,
} from '#platejs-test-internal';

import { DefaultAuthoredPlugin } from '../../../authored';
import type { BasePluginInput, Element, Value } from '../../../core';
import {
  ContentSlice,
  createEditorView,
  ElementIdPlugin,
  NodeApi,
} from '../../../core';
import type { Editor } from '../../../react/core';
import { YjsPlugin } from '../../../yjs/react';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import type { TableElement } from './BaseTablePlugin';
import { BaseTablePlugin } from './BaseTablePlugin';
import { compileTableGrid } from './internal/grid';

jsxt;

const tableText = (editor: Editor & { read: { children: () => Value } }) => {
  const table = editor.read.children()[0] as TableElement;
  const grid = compileTableGrid(table);

  return grid.slots.map((row) =>
    row.map((anchor) => (anchor ? NodeApi.string(anchor.cell) : ''))
  );
};

const createTarget = (
  plugins: readonly BasePluginInput[] = getTestTablePlugins(),
  userId?: string
) => {
  const input = (
    <editor>
      <htable>
        <htr>
          <htd>
            <hp>
              <anchor />a
            </hp>
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
              d<focus />
            </hp>
          </htd>
        </htr>
      </htable>
    </editor>
  ) as TestEditor;

  return createTestTableEditor({
    plugins,
    selection: input.selection,
    initialValue: input.children,
    userId,
  });
};

describe('BaseTablePlugin prepared paste', () => {
  it('publishes one history entry with stable undo and redo', () => {
    const editor = createTarget();
    const before = editor.read.value();
    const source = (
      <fragment>
        <htable>
          <htr>
            <htd>
              <hp>x</hp>
            </htd>
            <htd>
              <hp>y</hp>
            </htd>
          </htr>
        </htable>
      </fragment>
    ) as Element[];

    expect(editor.read.history().undos).toHaveLength(0);
    expect(editor.update.fragment.replace(source)).toBe(true);
    expect(editor.read.history().undos).toHaveLength(1);
    expect(tableText(editor)).toEqual([
      ['x', 'y'],
      ['x', 'y'],
    ]);

    editor.api.history.undo();
    expect(editor.read.value()).toEqual(before);

    editor.api.history.redo();
    expect(tableText(editor)).toEqual([
      ['x', 'y'],
      ['x', 'y'],
    ]);
    expect(editor.read.history().undos).toHaveLength(1);
  });

  it('undoes and redoes edge expansion in an authored markup view', async () => {
    const model = createTarget(
      [DefaultAuthoredPlugin, ...getTestTablePlugins()],
      'alice'
    );
    model.update.selection.set({
      anchor: { offset: 1, path: [0, 1, 1, 0, 0] },
      focus: { offset: 1, path: [0, 1, 1, 0, 0] },
      kind: 'text',
    });
    const editor = createEditorView(model, {
      authored: { intent: 'edit', projection: 'markup' },
    });
    const source = (
      <fragment>
        <htable>
          <htr>
            <htd>
              <hp>x</hp>
            </htd>
            <htd>
              <hp>y</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>z</hp>
            </htd>
            <htd>
              <hp>w</hp>
            </htd>
          </htr>
        </htable>
      </fragment>
    ) as Element[];

    const before = structuredClone(editor.read.children());

    expect(editor.update.fragment.replace(source)).toBe(true);
    const after = structuredClone(editor.read.children());

    expect(after).not.toEqual(before);
    expect(editor.read.history().undos).toHaveLength(1);

    expect(await editor.api.history.undo()).toEqual({ status: 'applied' });
    expect(editor.read.children()).toEqual(before);
    expect(await editor.api.history.redo()).toEqual({ status: 'applied' });
    expect(editor.read.children()).toEqual(after);
  });

  it('gives an exact model slice precedence over conflicting HTML and text', () => {
    const sourceInput = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                exact-a
              </hp>
            </htd>
            <htd>
              <hp>
                exact-b
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const source = createTestTableEditor({
      plugins: getTestTablePlugins(),
      selection: sourceInput.selection,
      initialValue: sourceInput.children,
    });
    const target = createTarget();
    const data = new DataTransfer();

    source.api.dom.clipboard.writeSlice(data, {
      slice: source.read.slice.export(),
    });
    data.setData(
      'text/html',
      '<table><tbody><tr><td>html-a</td><td>html-b</td></tr></tbody></table>'
    );
    data.setData('text/plain', 'plain-a\tplain-b');

    const commits: unknown[] = [];
    const unsubscribe = target.subscribeCommit((commit) =>
      commits.push(commit)
    );

    expect(target.api.dom.clipboard.insertData(data)).toBe(true);
    unsubscribe();

    expect(tableText(target)).toEqual([
      ['exact-a', 'exact-b'],
      ['exact-a', 'exact-b'],
    ]);
    expect(commits).toHaveLength(1);
  });

  it.each(['embedded metadata', 'fragment MIME'] as const)(
    'consumes corrupt exact %s without using valid fallback payloads',
    (format) => {
      const editor = createTarget();
      const before = editor.read.value();
      const data = new DataTransfer();

      if (format === 'fragment MIME') {
        data.setData('application/x-editor-fragment', 'not-valid-base64');
        data.setData(
          'text/html',
          '<table><tbody><tr><td>html fallback</td></tr></tbody></table>'
        );
      } else {
        data.setData(
          'text/html',
          '<table data-editor-fragment="not-valid-base64" data-editor-fragment-format="x-editor-fragment"><tbody><tr><td>html fallback</td></tr></tbody></table>'
        );
      }
      data.setData('text/plain', 'plain fallback');

      const commits: unknown[] = [];
      const unsubscribe = editor.subscribeCommit((commit) =>
        commits.push(commit)
      );

      expect(
        editor.plugin(BaseTablePlugin).read.selection()?.cells.length
      ).toBeGreaterThan(1);
      expect(editor.api.dom.clipboard.insertData(data)).toBe(true);
      unsubscribe();

      expect(editor.read.value()).toEqual(before);
      expect(editor.read.history().undos).toHaveLength(0);
      expect(commits).toHaveLength(0);
    }
  );

  it('keeps generic plain-text fallback for corrupt exact data at a caret', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />a
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins(),
      selection: input.selection,
      initialValue: input.children,
    });
    const data = new DataTransfer();

    data.setData('application/x-editor-fragment', 'not-valid-base64');
    data.setData('text/plain', 'plain fallback');

    expect(editor.plugin(BaseTablePlugin).read.selection()?.cells.length).toBe(
      1
    );
    expect(editor.api.dom.clipboard.insertData(data)).toBe(true);
    expect(tableText(editor)).toEqual([['plain fallbacka']]);
    expect(editor.read.history().undos).toHaveLength(1);
  });

  it('rejects a recognized invalid table without partial publication', () => {
    const editor = createTarget();
    const before = editor.read.value();
    const commits: unknown[] = [];
    const unsubscribe = editor.subscribeCommit((commit) =>
      commits.push(commit)
    );

    expect(
      editor.update.fragment.replace([
        { children: [], type: 'table' },
      ] as Element[])
    ).toBe(false);
    unsubscribe();

    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history().undos).toHaveLength(0);
    expect(commits).toHaveLength(0);
  });

  it.each([
    {
      name: 'a partial source tile across the selected rectangle',
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
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
                <hp>e</hp>
              </htd>
              <htd>
                <hp>f</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor,
      paths: [
        [0, 0, 0],
        [0, 0, 1],
        [0, 0, 2],
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 2],
      ],
      expected: [
        ['x', 'y', 'x'],
        ['x', 'y', 'x'],
      ],
      source: (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>x</hp>
              </htd>
              <htd>
                <hp>y</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[],
    },
    {
      name: 'a paste rectangle that intersects a merged cell',
      input: (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
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
              <htd colSpan={2}>
                <hp>merged</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor,
      paths: [[0, 0, 1]],
      expected: [
        ['a', 'x', 'c'],
        ['d', 'y', ''],
      ],
      source: (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>x</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>y</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[],
    },
  ])(
    'pastes $name and replays it through history',
    async ({ expected, input, paths, source }) => {
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        initialValue: input.children,
      });
      editor.update.selection.setNodes(paths);
      const before = editor.read.value();
      const selection = getEditorLiveSelection(editor);
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => {
        commits += 1;
      });

      expect(
        editor.update.slice.replace(
          ContentSlice.fromJSON({ content: source, openEnd: 0, openStart: 0 })
        )
      ).toBe(true);
      unsubscribe();

      const after = editor.read.value();
      expect(after).not.toEqual(before);
      expect(tableText(editor)).toEqual(expected);
      expect(commits).toBe(1);
      expect(
        compileTableGrid(editor.read.children()[0] as TableElement).problems
      ).toEqual([]);
      expect(await editor.api.history.undo()).toEqual({ status: 'applied' });
      expect(editor.read.value()).toEqual(before);
      expect(getEditorLiveSelection(editor)).toEqual(selection);
      expect(await editor.api.history.redo()).toEqual({ status: 'applied' });
      expect(editor.read.value()).toEqual(after);
    }
  );

  it('publishes one canonical Yjs update and exact replay', () => {
    const initialValue: Value = [
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
            ],
            id: 'row',
            type: 'tableRow',
          },
        ],
        id: 'table',
        type: 'table',
      },
    ];
    const selection = {
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
      kind: 'text' as const,
    };
    const sourceDoc = new Y.Doc();
    const SourceCollaboration = YjsPlugin.create({
      doc: sourceDoc,
      initialReady: true,
      seed: true,
    });
    const source = createTestTableEditor({
      plugins: [ElementIdPlugin, BaseTablePlugin, SourceCollaboration],
      selection,
      initialValue,
    });
    const replayDoc = new Y.Doc();

    Y.applyUpdate(replayDoc, Y.encodeStateAsUpdate(sourceDoc));

    const ReplayCollaboration = YjsPlugin.create({
      doc: replayDoc,
      initialReady: true,
    });
    const replay = createTestTableEditor({
      plugins: [ElementIdPlugin, BaseTablePlugin, ReplayCollaboration],
      initialValue: [{ children: [{ text: 'local' }], type: 'paragraph' }],
    });
    const pasted = (
      <fragment>
        <htable>
          <htr>
            <htd>
              <hp>x</hp>
            </htd>
            <htd>
              <hp>y</hp>
            </htd>
          </htr>
        </htable>
      </fragment>
    ) as Element[];
    let updateCount = 0;

    sourceDoc.on('update', (update) => {
      updateCount += 1;
      Y.applyUpdate(replayDoc, update);
    });
    expect(source.update.fragment.replace(pasted)).toBe(true);

    expect(updateCount).toBe(1);
    assert.deepEqual(replay.read.children(), source.read.children());
    expect(tableText(source)).toEqual([['x', 'y']]);
  });
});
