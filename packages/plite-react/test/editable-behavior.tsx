import { act, fireEvent, render } from '@testing-library/react';
import { TextApi } from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
import { createRef } from 'react';
import {
  createReactEditor,
  defaultScrollSelectionIntoView,
  Editable,
  Plite,
} from '../src';

describe('plite-react editable behavior', () => {
  test('renders initial editor children into the editable DOM', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });

    const rendered = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );

    expect(
      rendered.container.querySelector('[data-plite-editor]')
    ).toHaveTextContent('test');
  });

  test('forwards ref to the editable DOM root', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const editableRef = createRef<HTMLDivElement>();

    const rendered = render(
      <Plite editor={editor}>
        <Editable ref={editableRef} />
      </Plite>
    );

    const editable = rendered.container.querySelector('[data-plite-editor]');

    expect(editableRef.current).toBe(editable);
    expect(editableRef.current).toHaveAttribute('contenteditable', 'true');
  });

  test('applies visible root defaults as CSS', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });

    const rendered = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );

    const editable = rendered.container.querySelector('[data-plite-editor]');

    expect(editable).toBeInstanceOf(HTMLElement);
    expect((editable as HTMLElement).style.position).toBe('relative');
    expect((editable as HTMLElement).style.whiteSpace).toBe('pre-wrap');
    expect((editable as HTMLElement).style.wordWrap).toBe('break-word');
    expect((editable as HTMLElement).style.zIndex).toBe('0');
    expect(editable).not.toHaveAttribute('zindex');
  });

  test('lets user styles override visible root defaults', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });

    const rendered = render(
      <Plite editor={editor}>
        <Editable style={{ zIndex: 2 }} />
      </Plite>
    );

    const editable = rendered.container.querySelector('[data-plite-editor]');

    expect(editable).toBeInstanceOf(HTMLElement);
    expect((editable as HTMLElement).style.zIndex).toBe('2');
  });

  test('keeps disableDefaultStyles as the root style opt-out', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });

    const rendered = render(
      <Plite editor={editor}>
        <Editable disableDefaultStyles />
      </Plite>
    );

    const editable = rendered.container.querySelector('[data-plite-editor]');

    expect(editable).toBeInstanceOf(HTMLElement);
    expect((editable as HTMLElement).style.position).toBe('');
    expect((editable as HTMLElement).style.whiteSpace).toBe('');
    expect((editable as HTMLElement).style.wordWrap).toBe('');
    expect((editable as HTMLElement).style.zIndex).toBe('');
  });

  test('calls onChange and onSelectionChange when editor selection changes', async () => {
    const initialValue = [
      { type: 'block', children: [{ text: 'te' }] },
      { type: 'block', children: [{ text: 'st' }] },
    ];
    const editor = createReactEditor({ initialValue });
    const onChange = jest.fn();
    const onSelectionChange = jest.fn();
    const onValueChange = jest.fn();

    act(() => {
      render(
        <Plite
          editor={editor}
          onChange={onChange}
          onSelectionChange={onSelectionChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </Plite>
      );
    });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    const expectedSelection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
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

  test('calls onChange and onValueChange when editor children change', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const onChange = jest.fn();
    const onSelectionChange = jest.fn();
    const onValueChange = jest.fn();

    act(() => {
      render(
        <Plite
          editor={editor}
          onChange={onChange}
          onSelectionChange={onSelectionChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </Plite>
      );
    });

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('Hello word!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    const expectedValue = [
      { type: 'block', children: [{ text: 'testHello word!' }] },
    ];

    expect(onChange).toHaveBeenCalledWith(
      expectedValue,
      expect.objectContaining({
        selectionChanged: false,
        valueChanged: true,
      })
    );
    expect(onValueChange).toHaveBeenCalledWith(
      expectedValue,
      expect.objectContaining({ valueChanged: true })
    );
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  test('calls value callbacks when setNodes changes text shape', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const onChange = jest.fn();
    const onValueChange = jest.fn();

    act(() => {
      render(
        <Plite
          editor={editor}
          onChange={onChange}
          onValueChange={onValueChange}
        >
          <Editable />
        </Plite>
      );
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.set(
          { bold: true },
          {
            at: { path: [0, 0], offset: 2 },
            match: TextApi.isText,
            split: true,
          }
        );
      });
    });

    expect(onChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalled();
  });

  test('Editable onKeyDown receives editor context for UI hotkeys', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const onChange = jest.fn();
    const onKeyDown = jest.fn((event, context) => {
      if (event.key !== 'x') {
        return;
      }

      context.editor.update((tx) => {
        tx.text.insert('x', { at: { path: [0, 0], offset: 4 } });
      });

      return true;
    });

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <Plite editor={editor} onChange={onChange}>
          <Editable onKeyDown={onKeyDown} />
        </Plite>
      );
    });

    const editable = rendered.container.querySelector('[data-plite-editor]');
    expect(editable).toBeTruthy();
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    await act(async () => {
      fireEvent.keyDown(editable!, { key: 'x' });
    });

    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'x' }),
      { editor }
    );
    expect(onChange).toHaveBeenCalledWith(
      [{ type: 'block', children: [{ text: 'testx' }] }],
      expect.objectContaining({ valueChanged: true })
    );
  });

  test('Editable onDOMBeforeInput exposes raw native format input', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const onDOMBeforeInput = jest.fn((event, context) => {
      if (event.inputType !== 'formatBold') {
        return;
      }

      expect(context.editor).toBe(editor);
      expect(context.inputType).toBe('formatBold');
      expect(context.native).toBe(false);
      return true;
    });

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <Plite editor={editor}>
          <Editable onDOMBeforeInput={onDOMBeforeInput} />
        </Plite>
      );
    });

    const editable = rendered.container.querySelector('[data-plite-editor]');
    expect(editable).toBeTruthy();
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    const event = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'formatBold',
    });

    await act(async () => {
      editable!.dispatchEvent(event);
    });

    expect(onDOMBeforeInput).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  test('Editable onBeforeInput is not replayed from native beforeinput', async () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });
    const onBeforeInput = jest.fn();
    const onDOMBeforeInput = jest.fn();

    let rendered!: ReturnType<typeof render>;
    act(() => {
      rendered = render(
        <Plite editor={editor}>
          <Editable
            onBeforeInput={onBeforeInput}
            onDOMBeforeInput={onDOMBeforeInput}
          />
        </Plite>
      );
    });

    const editable = rendered.container.querySelector('[data-plite-editor]');
    expect(editable).toBeTruthy();
    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });

    await act(async () => {
      editable!.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'formatBold',
        })
      );
    });

    expect(onDOMBeforeInput).toHaveBeenCalledTimes(1);
    expect(onBeforeInput).not.toHaveBeenCalled();
  });

  test('default scroll restores leaf measurement after scrolling a collapsed range', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [{ type: 'block', children: [{ text: 'test' }] }],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const leaf = document.createElement('span');
    const text = document.createTextNode('test');
    leaf.append(text);
    document.body.append(leaf);

    const range = {
      cloneRange: () => ({
        collapse: () => {},
        getBoundingClientRect: () =>
          ({
            bottom: 1,
            height: 1,
            left: 1,
            right: 1,
            top: 1,
            width: 1,
            x: 1,
            y: 1,
          }) as DOMRect,
        startContainer: text,
      }),
    } as unknown as DOMRange;

    try {
      defaultScrollSelectionIntoView(editor, range);

      expect(Object.hasOwn(leaf, 'getBoundingClientRect')).toBe(false);
      expect(typeof leaf.getBoundingClientRect).toBe('function');

      defaultScrollSelectionIntoView(editor, range);

      expect(Object.hasOwn(leaf, 'getBoundingClientRect')).toBe(false);
      expect(typeof leaf.getBoundingClientRect).toBe('function');
    } finally {
      leaf.remove();
    }
  });

  test('default scroll crosses a shadow root to reach an outer scroll container', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [{ type: 'block', children: [{ text: 'test' }] }],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
    });

    const outer = document.createElement('div');
    outer.style.overflow = 'auto';

    Object.defineProperties(outer, {
      clientHeight: { configurable: true, value: 100 },
      clientWidth: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 100 },
    });
    Object.defineProperty(outer, 'getBoundingClientRect', {
      configurable: true,
      value: () =>
        ({
          bottom: 100,
          height: 100,
          left: 0,
          right: 100,
          top: 0,
          width: 100,
          x: 0,
          y: 0,
        }) as DOMRect,
    });

    const host = document.createElement('div');
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const leaf = document.createElement('span');
    const text = document.createTextNode('test');
    leaf.append(text);
    shadowRoot.append(leaf);
    outer.append(host);
    document.body.append(outer);

    const range = {
      cloneRange: () => ({
        collapse: () => {},
        getBoundingClientRect: () =>
          ({
            bottom: 160,
            height: 20,
            left: 1,
            right: 2,
            top: 140,
            width: 1,
            x: 1,
            y: 140,
          }) as DOMRect,
        startContainer: text,
      }),
    } as unknown as DOMRange;

    try {
      defaultScrollSelectionIntoView(editor, range);

      expect(outer.scrollTop).toBeGreaterThan(0);
    } finally {
      outer.remove();
    }
  });
});
