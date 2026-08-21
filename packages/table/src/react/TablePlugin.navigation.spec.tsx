/** @jsx jsxt */

import { DOMPlugin, Hotkeys } from '@platejs/core';
import { pipeHandler } from '@platejs/core/react/internal';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { createTestTableEditor } from '../lib/__tests__/getTestTablePlugins';
import { BaseTablePlugin } from '../lib/BaseTablePlugin';
import { TablePlugin } from './TablePlugin';

jsxt;

const moveLineTable = (
  editor: ReturnType<typeof createTableEditor>,
  { reverse = false }: { reverse?: boolean }
) => {
  const preventDefault = mock();
  const event = {
    altKey: false,
    ctrlKey: false,
    defaultPrevented: false,
    key: reverse ? 'ArrowUp' : 'ArrowDown',
    metaKey: false,
    preventDefault,
    shiftKey: false,
    stopPropagation: mock(),
    which: reverse ? 38 : 40,
  } as unknown as KeyboardEvent;
  const handler = pipeHandler(editor, { handlerKey: 'onKeyDown' });
  const hotkey = spyOn(
    Hotkeys,
    reverse ? 'isMoveLineBackward' : 'isMoveLineForward'
  ).mockReturnValue(true);

  if (!handler) throw new Error('Expected TablePlugin onKeyDown handler');

  try {
    handler(event);
  } finally {
    hotkey.mockRestore();
  }

  return preventDefault.mock.calls.length > 0;
};

const createClientRect = (rect: Partial<DOMRect> = {}) =>
  ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => rect,
    ...rect,
  }) as DOMRect;

const createDOMRangeMock = (rects: Partial<DOMRect>[]) => {
  const range = document.createRange();

  range.getClientRects = () => {
    const list = rects.map(createClientRect);

    return Object.assign(list, {
      item: (index: number) => list[index] ?? null,
    });
  };

  return range;
};

const domRanges = new WeakMap<
  object,
  { index: number; ranges: ReturnType<typeof createDOMRangeMock>[] }
>();

const TestDOMRangePlugin = DOMPlugin.extend(({ editor }) => ({
  api: () => ({
    resolveDOMRange: () => {
      const state = domRanges.get(editor);

      if (!state) return null;

      return state.ranges[state.index++] ?? null;
    },
  }),
}));

const mockToDOMRange = <E extends object>(
  editor: E,
  ...ranges: ReturnType<typeof createDOMRangeMock>[]
) => {
  domRanges.set(editor, { index: 0, ranges });
};

const createTableEditor = (input: TestEditor) =>
  createTestTableEditor({
    plugins: [
      TablePlugin.configure({
        initialState: { disableMerge: true },
      }),
      TestDOMRangePlugin,
    ],
    selection: input.selection,
    initialValue: input.children,
  });

describe('TablePlugin navigation', () => {
  it('keeps Enter inside the current cell by splitting the current paragraph', () => {
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

    const output = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
              <hp>
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

    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject(output.children!);
    expect(editor.read.selection()).toEqual(output.selection!);
  });

  it('keeps Backspace at the start of a cell inside the current cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
                11
              </hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
                11
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

    editor.update.text.deleteBackward();

    expect(editor.read.children()).toMatchObject(output.children!);
    expect(editor.read.selection()).toEqual(output.selection!);
  });

  it('selectAll selects the whole table when the cursor is inside it', () => {
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
    const tableRange = editor.read.ranges.get([0]);

    expect(editor.plugin(BaseTablePlugin).update.selectAll()).toBe(true);
    if (!tableRange) throw new Error('Expected table range');
    expect(editor.read.selection()).toEqual({ ...tableRange, kind: 'text' });
  });

  it('second selectAll escalates from the table to the whole document', () => {
    const input = (
      <editor>
        <hp>before</hp>
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
        <hp>after</hp>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const documentRange = editor.read.ranges.get([]);

    expect(editor.plugin(BaseTablePlugin).update.selectAll()).toBe(true);
    expect(editor.plugin(BaseTablePlugin).update.selectAll()).toBe(true);
    if (!documentRange) throw new Error('Expected document range');
    expect(editor.read.selection()).toEqual({
      ...documentRange,
      kind: 'text',
    });
  });

  it('collapses a multi-cell selection before tabbing', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                11
              </hp>
            </htd>
            <htd>
              <hp>
                12
                <focus />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    expect(editor.plugin(BaseTablePlugin).update.tab({ reverse: false })).toBe(
      true
    );
    expect(editor.read.selection.isCollapsed()).toBe(true);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
      kind: 'text',
    });
  });

  it('tabs forward to the next cell', () => {
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

    expect(editor.plugin(BaseTablePlugin).update.tab({ reverse: false })).toBe(
      true
    );
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
      kind: 'text',
    });
  });

  it('shift-tabs back to the previous cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
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

    expect(editor.plugin(BaseTablePlugin).update.tab({ reverse: true })).toBe(
      true
    );
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0, 0, 0] },
      kind: 'text',
    });
  });

  it('keeps ArrowDown inside a multi-block cell until the caret reaches the end', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
              <hp>12</hp>
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
    const initialSelection = editor.read.selection();

    expect(moveLineTable(editor, { reverse: false })).toBe(false);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('moves ArrowDown to the next cell after the last block in a multi-block cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
              <hp>
                12
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

    const output = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                <cursor />
                21
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    expect(moveLineTable(editor, { reverse: false })).toBe(true);
    expect(editor.read.selection()).toEqual(output.selection!);
  });

  it('keeps ArrowUp inside a multi-block cell until the caret reaches the start', () => {
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
              <hp>21</hp>
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
    const initialSelection = editor.read.selection();

    expect(moveLineTable(editor, { reverse: true })).toBe(false);
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('moves ArrowUp to the previous cell before the first block in a multi-block cell', () => {
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
                <cursor />
                21
              </hp>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
                11
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    expect(moveLineTable(editor, { reverse: true })).toBe(true);
    expect(editor.read.selection()).toEqual(output.selection!);
  });

  it('keeps ArrowDown native inside a soft-break cell before the last visual line', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>{'11\n12'}</hp>
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

    const selection = {
      anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
      focus: { offset: 1, path: [0, 0, 0, 0, 0] },
      kind: 'text' as const,
    };
    editor.update.selection.set(selection);

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 20, height: 20, top: 0 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(moveLineTable(editor, { reverse: false })).toBe(false);
    expect(editor.read.selection()).toEqual(selection);
  });

  it('keeps ArrowDown native when DOM ranges are unavailable', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>{'11\n12'}</hp>
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

    const selection = {
      anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
      focus: { offset: 1, path: [0, 0, 0, 0, 0] },
      kind: 'text' as const,
    };
    editor.update.selection.set(selection);

    spyOn(editor.api.dom, 'resolveDOMRange').mockReturnValue(null);

    expect(moveLineTable(editor, { reverse: false })).toBe(false);
    expect(editor.read.selection()).toEqual(selection);
  });

  it('moves ArrowDown to the next cell from the last visual line in a soft-break cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>{'11\n12'}</hp>
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

    const output = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>{'11\n12'}</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                <cursor />
                21
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.selection.set({
      anchor: { offset: 5, path: [0, 0, 0, 0, 0] },
      focus: { offset: 5, path: [0, 0, 0, 0, 0] },
      kind: 'text',
    });

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 40, height: 20, top: 20 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(moveLineTable(editor, { reverse: false })).toBe(true);
    expect(editor.read.selection()).toEqual(output.selection!);
  });

  it('keeps ArrowUp native inside a soft-wrapped cell after the first visual line', () => {
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
              <hp>abcdefghijklmnopqrstuvwxyz</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    const selection = {
      anchor: { offset: 8, path: [0, 1, 0, 0, 0] },
      focus: { offset: 8, path: [0, 1, 0, 0, 0] },
      kind: 'text' as const,
    };
    editor.update.selection.set(selection);

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 40, height: 20, top: 20 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(moveLineTable(editor, { reverse: true })).toBe(false);
    expect(editor.read.selection()).toEqual(selection);
  });

  it('moves ArrowUp to the previous cell from the first visual line in a soft-wrapped cell', () => {
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
              <hp>abcdefghijklmnopqrstuvwxyz</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <cursor />
                11
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>abcdefghijklmnopqrstuvwxyz</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 1, 0, 0, 0] },
      focus: { offset: 1, path: [0, 1, 0, 0, 0] },
    });

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 20, height: 20, top: 0 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(moveLineTable(editor, { reverse: true })).toBe(true);
    expect(editor.read.selection()).toEqual(output.selection!);
  });
});
