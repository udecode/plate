import assert from 'node:assert/strict';

import { act, render } from '@testing-library/react';
import * as React from 'react';

import type { TableResize } from '../../../features/table';
import { createTestTableEditor } from '../../../features/table/lib/__tests__/getTestTablePlugins';
import { Plate } from '../../core';
import { TablePlugin } from './TablePlugin';
import { useTableResize } from './useTableResize';

const pointer = (
  target: EventTarget,
  type: string,
  x: number,
  pointerId = 1
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x,
  });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: pointerId },
  });
  act(() => {
    target.dispatchEvent(event);
  });
};

const createFixture = (container?: HTMLElement) => {
  const editor = createTestTableEditor({
    plugins: [TablePlugin],
    initialValue: [
      {
        type: 'table',
        columnWidths: [120, 180],
        children: [
          {
            type: 'tableRow',
            children: ['one', 'two'].map((text) => ({
              type: 'tableCell',
              children: [{ type: 'paragraph', children: [{ text }] }],
            })),
          },
        ],
      },
    ],
  });
  const entry = editor.read.nodes.get([0], { type: TablePlugin });
  assert.ok(entry);
  const element = entry[0];
  const previews: TableResize[] = [];
  const ended = vi.fn();

  const Probe = () => {
    const tableRef = React.useRef<HTMLTableElement>(null);
    const start = useTableResize({
      element,
      tableRef,
      onResize: (resize) => {
        previews.push(resize);
      },
      onResizeEnd: ended,
    });

    return (
      <table ref={tableRef}>
        <tbody>
          <tr>
            <td>
              <button
                type="button"
                onPointerDown={(event) => {
                  start(event, { edge: 'right', colIndex: 0 });
                }}
              >
                Resize
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };
  const view = (readOnly = false) => (
    <Plate editor={editor} readOnly={readOnly} suppressInstanceWarning>
      <Probe />
    </Plate>
  );
  const mounted = render(view(), container ? { container } : undefined);
  const button = mounted.container.getElementsByTagName('button')[0];
  assert.ok(button);

  return { editor, element, previews, ended, mounted, button, view };
};

describe('table resize pointer lifecycle', () => {
  it.each([false, true])(
    'starts from current table state after a cell edit (undo: %s)',
    (undo) => {
      const f = createFixture();
      act(() => {
        f.editor.update.text.insert('!', {
          at: { path: [0, 0, 0, 0, 0], offset: 3 },
        });
        if (undo) f.editor.update.history.undo();
      });
      const before = f.editor.read.children();

      pointer(f.button, 'pointerdown', 100);
      pointer(window, 'pointermove', 130);
      expect(f.previews).toHaveLength(1);
      expect(f.editor.read.children()).toEqual(before);
      pointer(window, 'pointerup', 140);
      expect(f.editor.read.children()[0]).toMatchObject({
        columnWidths: [160, 140],
      });
      expect(f.ended).toHaveBeenCalledTimes(1);
      f.editor.update.history.undo();
      expect(f.editor.read.children()).toEqual(before);
      f.mounted.unmount();
    }
  );

  it('previews without writes and commits one complete undoable gesture', () => {
    const f = createFixture();

    pointer(f.button, 'pointerdown', 100);
    pointer(window, 'pointermove', 125);
    pointer(window, 'pointermove', 140);
    expect(f.previews).toHaveLength(2);
    expect(f.editor.read.children()).toEqual([f.element]);
    pointer(window, 'pointerup', 150);
    expect(f.editor.read.children()[0]).toMatchObject({
      columnWidths: [170, 130],
    });
    expect(f.editor.read.history.undos()).toHaveLength(1);
    expect(f.ended).toHaveBeenCalledTimes(1);
    pointer(window, 'pointermove', 160);
    expect(f.previews).toHaveLength(2);
    f.editor.update.history.undo();
    expect(f.editor.read.children()).toEqual([f.element]);
    f.mounted.unmount();
  });

  it('ignores other pointers and discards a cancelled gesture', () => {
    const f = createFixture();

    pointer(f.button, 'pointerdown', 100);
    pointer(window, 'pointermove', 180, 2);
    pointer(window, 'pointerup', 180, 2);
    expect(f.previews).toHaveLength(0);
    expect(f.ended).not.toHaveBeenCalled();
    pointer(window, 'pointermove', 130);
    pointer(window, 'pointercancel', 130);
    pointer(window, 'pointerup', 180);
    expect(f.previews).toHaveLength(1);
    expect(f.ended).toHaveBeenCalledTimes(1);
    expect(f.editor.read.children()).toEqual([f.element]);
    expect(f.editor.read.history.undos()).toHaveLength(0);
    f.mounted.unmount();
  });

  it('discards the preview when the host window loses focus', () => {
    const f = createFixture();

    pointer(f.button, 'pointerdown', 100);
    pointer(window, 'pointermove', 130);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    pointer(window, 'pointerup', 150);
    expect(f.editor.read.children()).toEqual([f.element]);
    expect(f.ended).toHaveBeenCalledTimes(1);
    f.mounted.unmount();
  });

  it('cleans up when the view unmounts', () => {
    const f = createFixture();

    pointer(f.button, 'pointerdown', 100);
    pointer(window, 'pointermove', 130);
    f.mounted.unmount();
    pointer(window, 'pointermove', 180);
    pointer(window, 'pointerup', 180);
    expect(f.editor.read.children()).toEqual([f.element]);
    expect(f.previews).toHaveLength(1);
    expect(f.ended).toHaveBeenCalledTimes(1);
  });

  it('cancels an active gesture when the editor becomes read-only', () => {
    const f = createFixture();

    pointer(f.button, 'pointerdown', 100);
    pointer(window, 'pointermove', 130);
    f.mounted.rerender(f.view(true));
    pointer(window, 'pointerup', 180);
    expect(f.editor.read.children()).toEqual([f.element]);
    expect(f.ended).toHaveBeenCalledTimes(1);
    f.mounted.unmount();
  });

  it('does not write a removed table or overwrite an external resize', () => {
    for (const remove of [false, true]) {
      const f = createFixture();

      pointer(f.button, 'pointerdown', 100);
      pointer(window, 'pointermove', 130);
      act(() => {
        if (remove) f.editor.update.nodes.remove({ at: [0] });
        else {
          f.editor
            .plugin(TablePlugin)
            .update.setColumnWidth({ colIndex: 0, width: 200 }, { at: [0] });
        }
      });
      const current = f.editor.read.children();
      pointer(window, 'pointerup', 180);
      expect(f.editor.read.children()).toEqual(current);
      expect(f.ended).toHaveBeenCalledTimes(1);
      f.mounted.unmount();
    }
  });

  it('listens to the table owner window when rendered inside an iframe', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    assert.ok(frame.contentDocument);
    assert.ok(frame.contentWindow);
    const f = createFixture(frame.contentDocument.body);

    pointer(f.button, 'pointerdown', 100);
    pointer(window, 'pointermove', 180);
    pointer(window, 'pointerup', 180);
    expect(f.previews).toHaveLength(0);
    pointer(frame.contentWindow, 'pointermove', 130);
    pointer(frame.contentWindow, 'pointerup', 140);
    expect(f.previews).toHaveLength(1);
    expect(f.editor.read.children()[0]).toMatchObject({
      columnWidths: [160, 140],
    });
    f.mounted.unmount();
    frame.remove();
  });
});
