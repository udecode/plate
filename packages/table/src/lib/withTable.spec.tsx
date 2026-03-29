/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';

jsxt;

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

const createDOMRangeMock = (rects: Partial<DOMRect>[]) =>
  ({
    getClientRects: () => rects.map(createClientRect),
  }) as any;

const mockToDOMRange = (
  editor: SlateEditor,
  ...ranges: ReturnType<typeof createDOMRangeMock>[]
) => {
  let index = 0;

  spyOn(editor.api, 'toDOMRange').mockImplementation(
    () => ranges[index++] as ReturnType<typeof editor.api.toDOMRange>
  );
};

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('withTable', () => {
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const tableRange = editor.api.range([0]);

    expect(editor.tf.selectAll()).toBe(true);
    if (!tableRange) throw new Error('Expected table range');
    expect(editor.selection).toEqual(tableRange);
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.api.isCollapsed()).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0, 0, 0] },
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const initialSelection = editor.selection;

    expect(editor.tf.moveLine({ reverse: false })).toBe(false);
    expect(editor.selection).toEqual(initialSelection);
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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.moveLine({ reverse: false })).toBe(true);
    expect(editor.selection).toEqual(output.selection!);
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const initialSelection = editor.selection;

    expect(editor.tf.moveLine({ reverse: true })).toBe(false);
    expect(editor.selection).toEqual(initialSelection);
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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    expect(editor.tf.moveLine({ reverse: true })).toBe(true);
    expect(editor.selection).toEqual(output.selection!);
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    const selection = {
      anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
      focus: { offset: 1, path: [0, 0, 0, 0, 0] },
    };
    editor.selection = selection;

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 20, height: 20, top: 0 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(editor.tf.moveLine({ reverse: false })).toBe(false);
    expect(editor.selection).toEqual(selection);
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    const selection = {
      anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
      focus: { offset: 1, path: [0, 0, 0, 0, 0] },
    };
    editor.selection = selection;

    spyOn(editor.api, 'toDOMRange').mockReturnValue(undefined as any);

    expect(editor.tf.moveLine({ reverse: false })).toBe(false);
    expect(editor.selection).toEqual(selection);
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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    editor.selection = {
      anchor: { offset: 5, path: [0, 0, 0, 0, 0] },
      focus: { offset: 5, path: [0, 0, 0, 0, 0] },
    };

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 40, height: 20, top: 20 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(editor.tf.moveLine({ reverse: false })).toBe(true);
    expect(editor.selection).toEqual(output.selection!);
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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    const selection = {
      anchor: { offset: 8, path: [0, 1, 0, 0, 0] },
      focus: { offset: 8, path: [0, 1, 0, 0, 0] },
    };
    editor.selection = selection;

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 40, height: 20, top: 20 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(editor.tf.moveLine({ reverse: true })).toBe(false);
    expect(editor.selection).toEqual(selection);
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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    editor.selection = {
      anchor: { offset: 1, path: [0, 1, 0, 0, 0] },
      focus: { offset: 1, path: [0, 1, 0, 0, 0] },
    };

    mockToDOMRange(
      editor,
      createDOMRangeMock([{ bottom: 20, height: 20, top: 0 }]),
      createDOMRangeMock([
        { bottom: 20, height: 20, top: 0 },
        { bottom: 40, height: 20, top: 20 },
      ])
    );

    expect(editor.tf.moveLine({ reverse: true })).toBe(true);
    expect(editor.selection).toEqual(output.selection!);
  });
});
