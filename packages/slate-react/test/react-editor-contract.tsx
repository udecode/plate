import { act, render, waitFor } from '@testing-library/react';
import { Editor } from '@platejs/slate/internal';
import { createReactEditor, Editable, Slate } from '../src';
import { ReactEditor } from '../src/plugin/react-editor';

describe('slate-react DOM capability contract', () => {
  const createInsertTextBeforeInput = (data: string) => {
    const event = new Event('beforeinput', {
      bubbles: true,
      cancelable: true,
    }) as InputEvent;

    Object.defineProperties(event, {
      data: { value: data },
      inputType: { value: 'insertText' },
    });

    return event;
  };

  test('editor.api.dom.focus initializes a null selection at the top of the document', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const expectedSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    act(() => {
      render(
        <Slate editor={editor}>
          <Editable />
        </Slate>
      );
    });

    expect(Editor.getSelection(editor)).toBe(null);

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(Editor.getSelection(editor)).toEqual(expectedSelection);

    const windowSelection = editor.api.dom.getWindow().getSelection();

    expect(windowSelection?.focusNode?.textContent).toBe('test');
    expect(windowSelection?.anchorNode?.textContent).toBe('test');
    expect(windowSelection?.anchorOffset).toBe(expectedSelection.anchor.offset);
    expect(windowSelection?.focusOffset).toBe(expectedSelection.focus.offset);
  });

  test('editor.api.dom.focus stays safe when called mid-transform', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const propagatedValue = [
      { type: 'block', children: [{ text: 'foo' }] },
      { type: 'block', children: [{ text: 'bar' }] },
    ];
    const expectedSelection = {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    };

    act(() => {
      render(
        <Slate editor={editor}>
          <Editable />
        </Slate>
      );
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        tx.nodes.insert(propagatedValue);
        tx.selection.set(expectedSelection);
      });
      editor.api.dom.focus();
    });

    expect(Editor.getSelection(editor)).toEqual(expectedSelection);

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(Editor.getSelection(editor)).toEqual(expectedSelection);
  });

  test('editor.api.dom.focus reports a selection change without a value change', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const onChange = jest.fn();
    const onSelectionChange = jest.fn();
    const onValueChange = jest.fn();

    act(() => {
      render(
        <Slate
          editor={editor}
          onChange={onChange}
          onSelectionChange={onSelectionChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </Slate>
      );
    });

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    const expectedSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    expect(onChange).toHaveBeenCalledWith(
      initialValue,
      expect.objectContaining({
        selection: expectedSelection,
        selectionChanged: true,
        valueChanged: false,
      })
    );
    expect(onSelectionChange).toHaveBeenCalledWith(
      expectedSelection,
      expect.objectContaining({ selectionChanged: true })
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('native DOM selection export uses direct endpoints for common model selections', async () => {
    const initialValue = [
      { type: 'block', children: [{ text: 'alpha' }] },
      { type: 'block', children: [{ text: 'bravo' }] },
    ];
    const editor = createReactEditor({ initialValue });

    const mounted = render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );
    const editable = mounted.container.querySelector('[data-slate-editor]')!;
    const assertDOMRange = jest.spyOn(ReactEditor, 'assertDOMRange');
    const [alphaText, bravoText] = Array.from(
      editable.querySelectorAll('[data-slate-string="true"]')
    ).map((node) => node.firstChild);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [1, 0], offset: 2 },
          focus: { path: [1, 0], offset: 2 },
        });
      });
    });

    expect(assertDOMRange).not.toHaveBeenCalled();
    expect(document.getSelection()?.anchorNode?.textContent).toBe('bravo');
    expect(document.getSelection()?.anchorOffset).toBe(2);

    assertDOMRange.mockClear();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: tx.points.start([]),
          focus: tx.points.end([]),
        });
      });
    });

    expect(assertDOMRange).not.toHaveBeenCalled();
    expect(document.getSelection()?.anchorNode).toBe(alphaText);
    expect(document.getSelection()?.anchorOffset).toBe(0);
    expect(document.getSelection()?.focusNode).toBe(bravoText);
    expect(document.getSelection()?.focusOffset).toBe('bravo'.length);
    expect(document.getSelection()?.toString()).toBe('alphabravo');

    assertDOMRange.mockRestore();
  });

  test('large full-document selections stay model-backed instead of selecting every DOM child', async () => {
    const initialValue = Array.from({ length: 1001 }, (_, index) => ({
      type: 'block',
      children: [{ text: `block-${index}` }],
    }));
    const editor = createReactEditor({ initialValue });

    const mounted = render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );
    const editable = mounted.container.querySelector('[data-slate-editor]')!;
    const assertDOMRange = jest.spyOn(ReactEditor, 'assertDOMRange');

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: tx.points.start([]),
          focus: tx.points.end([]),
        });
      });
    });

    expect(assertDOMRange).not.toHaveBeenCalled();
    expect(document.getSelection()?.anchorNode).not.toBe(editable);
    expect(document.getSelection()?.focusNode).not.toBe(editable);

    assertDOMRange.mockRestore();
  });

  test('model-owned text insert keeps untrusted printable input model-owned', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'alpha' }] }];
    const editor = createReactEditor({ initialValue });

    const mounted = render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );
    const editable = mounted.container.querySelector('[data-slate-editor]') as
      | (HTMLDivElement & {
          __slateBrowserHandle?: {
            selectRange: (selection: {
              anchor: { offset: number; path: number[] };
              focus: { offset: number; path: number[] };
            }) => void;
          };
        })
      | null;
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    await act(async () => {
      editable?.__slateBrowserHandle?.selectRange({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    const first = createInsertTextBeforeInput('X');
    await act(async () => {
      editable?.dispatchEvent(first);
    });

    expect(first.defaultPrevented).toBe(true);
    await waitFor(() => expect(Editor.string(editor, [])).toBe('Xalpha'));

    const second = createInsertTextBeforeInput('Y');
    await act(async () => {
      editable?.dispatchEvent(second);
    });

    expect(second.defaultPrevented).toBe(true);
    await waitFor(() => expect(Editor.string(editor, [])).toBe('XYalpha'));
  });

  test('browser handle resolves mounted elements by Slate path without DOM scans', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'lookup' }] }];
    const editor = createReactEditor({ initialValue });

    const mounted = render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );
    const editable = mounted.container.querySelector('[data-slate-editor]') as
      | (HTMLDivElement & {
          __slateBrowserHandle?: {
            getElementByPath: (path: number[]) => HTMLElement | null;
          };
        })
      | null;
    const textElement = editable?.__slateBrowserHandle?.getElementByPath([
      0, 0,
    ]);

    expect(textElement).toBeInstanceOf(HTMLElement);
    expect(textElement).toHaveAttribute('data-slate-node', 'text');
    expect(textElement?.textContent).toContain('lookup');
  });
});
