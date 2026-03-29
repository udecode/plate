/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { overrideSelectionFromCell } from './overrideSelectionFromCell';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('overrideSelectionFromCell', () => {
  const originalSetTimeout = global.setTimeout;
  let editorForTimer: SlateEditor | undefined;

  beforeEach(() => {
    global.setTimeout = ((fn: () => void) => {
      if (editorForTimer) {
        editorForTimer.dom.currentKeyboardEvent = null as any;
      }

      fn();

      return 0 as any;
    }) as any;
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
    editorForTimer = undefined;
    mock.restore();
  });

  it('routes shift+down through moveSelectionFromCell when the new focus leaves the current cell', () => {
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
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    editorForTimer = editor;

    editor.dom.currentKeyboardEvent = { shiftKey: true, which: 40 } as any;
    editor.api.isAt = mock().mockReturnValue(true) as any;

    overrideSelectionFromCell(editor, {
      anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
      focus: { offset: 0, path: [0, 1, 0, 0, 0] },
    });

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 1, 0, 0, 0] },
    });
  });

  it('skips shift-edge expansion when the previous selection already spans many cells', () => {
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
    editorForTimer = editor;
    const initialSelection = editor.selection;

    editor.dom.currentKeyboardEvent = { shiftKey: true, which: 39 } as any;
    editor.api.isAt = mock()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false) as any;

    overrideSelectionFromCell(editor, {
      anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
      focus: { offset: 0, path: [0, 0, 1, 0, 0] },
    });

    expect(editor.selection).toEqual(initialSelection);
  });

  it('does nothing when there is no active keyboard event', () => {
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
    editorForTimer = editor;
    const initialSelection = editor.selection;

    editor.dom.currentKeyboardEvent = null as any;

    overrideSelectionFromCell(editor, {
      anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0, 0, 0] },
    });

    expect(editor.selection).toEqual(initialSelection);
  });
});
