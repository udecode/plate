import { act, render, waitFor } from '@testing-library/react';

import {
  createEditor,
  Editable,
  Plite,
  useEditorEditableElement,
  useEditorRootElement,
  useEditorScrollElement,
  useEditorScrollElementRef,
} from '../../src/react';
import { ReactEditor } from '../../src/react/plugin/react-editor';

describe('plite-react DOM capability contract', () => {
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

  test('editor.api.dom owns root, editable, and scroll DOM scope', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });

    const ScopeProbe = () => {
      const root = useEditorRootElement(editor);
      const editable = useEditorEditableElement(editor);
      const scroll = useEditorScrollElement(editor);
      const scrollRef = useEditorScrollElementRef(editor);

      return (
        <>
          <div data-testid="scroll-root" ref={scrollRef} />
          <output
            data-testid="scope-probe"
            data-editable={editable?.dataset.pliteEditor ?? ''}
            data-root={root?.dataset.pliteEditor ?? ''}
            data-scroll={scroll?.dataset.testid ?? ''}
          />
        </>
      );
    };

    const rendered = render(
      <Plite editor={editor}>
        <ScopeProbe />
        <Editable aria-label="Body editor" />
      </Plite>
    );

    const editable = rendered.container.querySelector('[data-plite-editor]');
    const scroll = rendered.getByTestId('scroll-root');

    await waitFor(() => {
      expect(editor.api.dom.root()).toBe(editable);
      expect(editor.api.dom.editable()).toBe(editable);
      expect(editor.api.dom.scroll()).toBe(scroll);
      expect(rendered.getByTestId('scope-probe')).toHaveAttribute(
        'data-root',
        'true'
      );
      expect(rendered.getByTestId('scope-probe')).toHaveAttribute(
        'data-editable',
        'true'
      );
      expect(rendered.getByTestId('scope-probe')).toHaveAttribute(
        'data-scroll',
        'scroll-root'
      );
    });
  });

  test('DOM scope subscriptions follow mounted focus and retirement', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const ScopeProbe = () => (
      <output
        data-testid="scope"
        data-root={useEditorRootElement(editor)?.id ?? ''}
        data-editable={useEditorEditableElement(editor)?.id ?? ''}
        data-scroll={useEditorScrollElement(editor)?.id ?? ''}
      />
    );
    const probe = <ScopeProbe />;
    const tree = (views: number) => (
      <>
        {probe}
        <button type="button">Outside</button>
        <Plite editor={editor}>
          {views > 0 && <Editable id="first-view" />}
          {views > 1 && <Editable id="second-view" />}
        </Plite>
      </>
    );
    const rendered = render(tree(2));
    const expectScope = (id: string) => {
      for (const attribute of ['data-root', 'data-editable', 'data-scroll']) {
        expect(rendered.getByTestId('scope')).toHaveAttribute(attribute, id);
      }
    };
    try {
      const first =
        rendered.container.querySelector<HTMLElement>('#first-view')!;
      const second =
        rendered.container.querySelector<HTMLElement>('#second-view')!;
      await act(async () => first.focus());
      expect(editor.api.dom.root()).toBe(first);
      expectScope('first-view');
      await act(async () => second.focus());
      expectScope('second-view');
      await act(async () =>
        rendered.getByRole('button', { name: 'Outside' }).focus()
      );
      expectScope('');
      rendered.rerender(tree(1));
      expectScope('first-view');
      rendered.rerender(tree(0));
      expectScope('');
    } finally {
      rendered.unmount();
    }
  });

  test('editor.api.dom.focus initializes a null selection at the top of the document', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const expectedSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    act(() => {
      render(
        <Plite editor={editor}>
          <Editable />
        </Plite>
      );
    });

    expect(editor.read.selection()).toBe(null);

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(editor.read.selection()).toEqual(expectedSelection);

    const windowSelection = editor.api.dom.getWindow().getSelection();

    expect(windowSelection?.focusNode?.textContent).toBe('test');
    expect(windowSelection?.anchorNode?.textContent).toBe('test');
    expect(windowSelection?.anchorOffset).toBe(expectedSelection.anchor.offset);
    expect(windowSelection?.focusOffset).toBe(expectedSelection.focus.offset);
  });

  test('editor.api.dom.focus stays safe when called mid-transform', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
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
        <Plite editor={editor}>
          <Editable />
        </Plite>
      );
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.replace(propagatedValue, { at: [0] });
        tx.selection.set(expectedSelection);
      });
      editor.api.dom.focus();
    });

    expect(editor.read.selection()).toEqual(expectedSelection);

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(editor.read.selection()).toEqual(expectedSelection);
  });

  test('editor.api.dom.focus reports a selection change without a value change', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createEditor({ initialValue });
    const onCommit = vi.fn();
    const onSelectionChange = vi.fn();
    const onValueChange = vi.fn();

    act(() => {
      render(
        <Plite
          editor={editor}
          onCommit={onCommit}
          onSelectionChange={onSelectionChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </Plite>
      );
    });

    await act(async () => {
      editor.api.dom.focus();
    });

    expect(editor.read.selection()).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    const expectedSelection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    expect(onCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        editor,
        snapshot: expect.objectContaining({ selection: expectedSelection }),
      })
    );
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        editor,
        selection: expectedSelection,
        snapshot: expect.objectContaining({ selection: expectedSelection }),
      })
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test('native DOM selection export uses direct endpoints for common model selections', async () => {
    const initialValue = [
      { type: 'block', children: [{ text: 'alpha' }] },
      { type: 'block', children: [{ text: 'bravo' }] },
    ];
    const editor = createEditor({ initialValue });

    const mounted = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );
    const editable = mounted.container.querySelector('[data-plite-editor]')!;
    const assertDOMRange = vi.spyOn(ReactEditor, 'assertDOMRange');
    const [alphaText, bravoText] = Array.from(
      editable.querySelectorAll('[data-plite-string="true"]')
    ).map((node) => node.firstChild);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
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
          kind: 'text',
          anchor: tx.points.start([])!,
          focus: tx.points.end([])!,
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
    const editor = createEditor({ initialValue });

    const mounted = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );
    const editable = mounted.container.querySelector('[data-plite-editor]')!;
    const assertDOMRange = vi.spyOn(ReactEditor, 'assertDOMRange');

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: tx.points.start([])!,
          focus: tx.points.end([])!,
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
    const editor = createEditor({ initialValue });

    const mounted = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );
    const editable = mounted.container.querySelector('[data-plite-editor]') as
      | (HTMLDivElement & {
          __pliteBrowserHandle?: {
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
      editable?.__pliteBrowserHandle?.selectRange({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    });

    const first = createInsertTextBeforeInput('X');
    await act(async () => {
      editable?.dispatchEvent(first);
    });

    expect(first.defaultPrevented).toBe(true);
    await waitFor(() => expect(editor.read.text.string([])).toBe('Xalpha'));

    const second = createInsertTextBeforeInput('Y');
    await act(async () => {
      editable?.dispatchEvent(second);
    });

    expect(second.defaultPrevented).toBe(true);
    await waitFor(() => expect(editor.read.text.string([])).toBe('XYalpha'));
  });

  test('browser handle resolves mounted elements by Plite path without DOM scans', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'lookup' }] }];
    const editor = createEditor({ initialValue });

    const mounted = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );
    const editable = mounted.container.querySelector('[data-plite-editor]') as
      | (HTMLDivElement & {
          __pliteBrowserHandle?: {
            getElementByPath: (path: number[]) => HTMLElement | null;
          };
        })
      | null;
    const textElement = editable?.__pliteBrowserHandle?.getElementByPath([
      0, 0,
    ]);

    expect(textElement).toBeInstanceOf(HTMLElement);
    expect(textElement).toHaveAttribute('data-plite-node', 'text');
    expect(textElement?.textContent).toContain('lookup');
  });
});
