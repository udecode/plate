/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';
import { pipeHandler } from '@platejs/core/react/internal';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { TablePlugin } from './TablePlugin';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: [
      TablePlugin.configure({
        options: { disableMerge: true },
      }),
    ],
    selection: input.selection,
    initialValue: input.children,
  });

type TestKeyboardEvent = KeyboardEvent & {
  preventDefault: AnyTestMock;
  stopPropagation: AnyTestMock;
};

const createKeyboardEvent = (
  key: string,
  which: number,
  { shiftKey = true }: { shiftKey?: boolean } = {}
) =>
  ({
    altKey: false,
    ctrlKey: false,
    defaultPrevented: false,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    key,
    metaKey: false,
    preventDefault: mock(),
    shiftKey,
    stopPropagation: mock(),
    which,
  }) as unknown as TestKeyboardEvent;

const runKeyDown = (
  editor: ReturnType<typeof createTableEditor>,
  event: KeyboardEvent
) => {
  const handler = (editor.getPlugin(TablePlugin) as any).handlers?.onKeyDown;

  if (!handler) throw new Error('Expected TablePlugin onKeyDown handler');

  return handler({ editor, event });
};

describe('TablePlugin onKeyDown', () => {
  it('eagerly expands Shift+Down from one cell into the next cell', () => {
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

    const editor = createTableEditor(input);
    const event = createKeyboardEvent('ArrowDown', 40);

    runKeyDown(editor, event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 1, 0, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('keeps Shift+Down native while focus can still extend inside the current cell', () => {
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
    const event = createKeyboardEvent('ArrowDown', 40);

    runKeyDown(editor, event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(editor.read.selection()).toEqual(initialSelection);
  });

  it('eagerly expands Shift+Right from one cell into the next cell', () => {
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
    const event = createKeyboardEvent('ArrowRight', 39);
    const fallback = mock();
    const handler = pipeHandler(editor, {
      editableProps: { onKeyDown: fallback } as never,
      handlerKey: 'onKeyDown',
    });

    handler?.(event);

    expect(fallback).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 1, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('eagerly expands Shift+Up from one cell into the previous cell', () => {
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
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const event = createKeyboardEvent('ArrowUp', 38);

    runKeyDown(editor, event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('eagerly expands Shift+Left from one cell into the previous cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>
                <cursor />
                12
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const event = createKeyboardEvent('ArrowLeft', 37);

    runKeyDown(editor, event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(2);
  });

  it('extends an existing multi-cell selection with Shift+Right', () => {
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
            <htd>
              <hp>13</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);
    const event = createKeyboardEvent('ArrowRight', 39);

    runKeyDown(editor, event);

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 2, 0, 0] },
      kind: 'table-cell',
    });
    expect(editor.read.selection.ranges()).toHaveLength(3);
  });

  it('handles IME 229 by collapsing a multi-cell selection once', () => {
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
    const event = createKeyboardEvent('Process', 229, { shiftKey: false });
    const fallback = mock();
    const handler = pipeHandler(editor, {
      editableProps: { onKeyDown: fallback } as never,
      handlerKey: 'onKeyDown',
    });

    handler?.(event);

    expect(fallback).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [0, 0, 1, 0, 0] },
      focus: { offset: 2, path: [0, 0, 1, 0, 0] },
      kind: 'text',
    });
  });

  it('leaves IME 229 native for an expanded selection inside one cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <anchor />
                11
                <focus />
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
    const initialSelection = editor.read.selection();
    const event = createKeyboardEvent('Process', 229, { shiftKey: false });
    const fallback = mock();
    const handler = pipeHandler(editor, {
      editableProps: { onKeyDown: fallback } as never,
      handlerKey: 'onKeyDown',
    });

    handler?.(event);

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(editor.read.selection()).toEqual(initialSelection);
  });
});
