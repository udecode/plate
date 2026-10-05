import { act, fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import { createDOMPhaseScheduler } from '../../src/dom/internal';
import { history } from '../../src/history';
import { createEditor, Editable, EditorRoot } from '../../src/react';
import type { TypedText } from '../../src/react';
import { createDOMRepairQueue } from '../../src/react/editable/dom-repair-queue';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { createAndroidInputManager } from '../../src/react/hooks/android-input-manager/android-input-manager';
import { ReactEditor } from '../../src/react/plugin/react-editor';

const point = (offset: number) => ({ path: [0, 0], offset });
const caret = (offset: number) => ({
  anchor: point(offset),
  focus: point(offset),
});

const mount = (
  text: string | Array<{ bold?: true; text: string }> = 'ab',
  labels = ['Left']
) => {
  const editor = createEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: typeof text === 'string' ? [{ text }] : text,
      },
    ],
    plugins: [history()],
  });
  const rendered = render(
    <EditorRoot editor={editor}>
      {labels.map((label) => (
        <Editable aria-label={label} key={label} />
      ))}
    </EditorRoot>
  );
  const editables = labels.map((label) => {
    const editable = rendered.getByRole('textbox', { name: label });

    Object.defineProperty(editable, 'isContentEditable', { value: true });

    return editable;
  });
  const reports: TypedText[] = [];

  editor.api.react.subscribeTypedText((typed) => {
    reports.push(typed);
  });

  return { editables, editor, rendered, reports };
};

type Mounted = ReturnType<typeof mount>;

const summarize = (reports: readonly TypedText[]) =>
  reports.map(({ editable, range, text }) => ({
    editable: editable.getAttribute('aria-label'),
    range,
    text,
  }));

const placeCaret = async (
  { editor }: Mounted,
  editable: HTMLElement,
  offset: number
) => {
  await act(async () => {
    editable.focus();
    editor.update((tx) => tx.selection.set(caret(offset)));
  });
};

const beforeInput = async (
  editable: HTMLElement,
  inputType: string,
  data: string
) => {
  await act(async () => {
    fireEvent(
      editable,
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data,
        inputType,
      })
    );
  });
};

const textNodeOf = (editable: HTMLElement) => {
  const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;

    if (node.parentElement?.closest('[data-editor-node="text"]')) return node;
  }

  throw new Error('Expected a rendered text node');
};

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 50);
  });

// Types `data` the way a browser does when it skips `beforeinput`: the DOM
// changes first and only `input` reports it.
const nativeInput = async (editable: HTMLElement, data: string) => {
  const selection = document.getSelection()!;

  await act(async () => {
    editable.focus();
    const text = textNodeOf(editable);
    const offset = selection.focusNode === text ? selection.focusOffset : 0;

    selection.setBaseAndExtent(text, offset, text, offset);
    document.dispatchEvent(new Event('selectionchange'));
    await settle();
  });
  await act(async () => {
    const text = textNodeOf(editable);
    const offset = selection.focusOffset;

    text.insertData(offset, data);
    selection.setBaseAndExtent(
      text,
      offset + data.length,
      text,
      offset + data.length
    );
    fireEvent.input(editable, { data, inputType: 'insertText' });
    await settle();
  });
};

const createAndroid = ({ editables }: Mounted) => {
  const runtime = findMountedEditableDOMRuntime(editables[0])!;
  const scheduler = createDOMPhaseScheduler({ getWindow: () => window });
  const debounced = () =>
    Object.assign(vi.fn(), { cancel: vi.fn(), flush: vi.fn() }) as never;
  const manager = createAndroidInputManager({
    editor: runtime.editor,
    inputController: runtime.inputController,
    onDOMSelectionChange: debounced(),
    receivedUserInput: { current: true },
    scheduleOnDOMSelectionChange: debounced(),
    scheduleTask: scheduler.schedule,
  });
  const resolveRange = vi.spyOn(ReactEditor, 'resolveRange');
  // Android lets the browser edit the DOM after `beforeinput`, then flushes
  // the stored diff into the model.
  const input = (inputType: string, data: string, from: number, to: number) => {
    const text = textNodeOf(editables[0]);

    resolveRange.mockReturnValueOnce({ anchor: point(from), focus: point(to) });
    manager.handleDOMBeforeInput({
      cancelable: true,
      data,
      getTargetRanges: () => [{} as StaticRange],
      inputType,
      preventDefault: vi.fn(),
    } as unknown as InputEvent);
    text.replaceData(from, to - from, data);
    document
      .getSelection()!
      .setBaseAndExtent(text, from + data.length, text, from + data.length);
  };

  return {
    destroy: () => {
      resolveRange.mockRestore();
      scheduler.destroy();
    },
    flush: () => act(async () => manager.flush()),
    handleInput: () =>
      act(async () => {
        manager.handleInput();
      }),
    input,
  };
};

describe('subscribeTypedText', () => {
  test('each Editable over one root reports only its own typed text', async () => {
    const mounted = mount('ab', ['Left', 'Right']);
    const [left, right] = mounted.editables;

    try {
      await placeCaret(mounted, left, 2);
      await beforeInput(left, 'insertText', '@');
      await placeCaret(mounted, right, 3);
      await beforeInput(right, 'insertText', 'x');

      expect(mounted.editor.read.text.string([])).toBe('ab@x');
      expect(summarize(mounted.reports)).toEqual([
        {
          editable: 'Left',
          range: { anchor: point(2), focus: point(3) },
          text: '@',
        },
        {
          editable: 'Right',
          range: { anchor: point(3), focus: point(4) },
          text: 'x',
        },
      ]);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a typed commit that a listener edits during delivery reports nothing', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    });
    let rewritten = false;

    // Subscribed before the report, so it rewrites the typed x first.
    editor.subscribeCommit(() => {
      if (rewritten || editor.read.text.string([]) !== 'abx') return;
      rewritten = true;
      editor.update((tx) => {
        tx.selection.set({ anchor: point(2), focus: point(3) });
        tx.text.insert('@');
      });
    });

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Left" />
      </EditorRoot>
    );
    const editable = rendered.getByRole('textbox', { name: 'Left' });
    const reports: TypedText[] = [];

    Object.defineProperty(editable, 'isContentEditable', { value: true });
    editor.api.react.subscribeTypedText((typed) => {
      reports.push(typed);
    });

    try {
      await act(async () => {
        editable.focus();
        editor.update((tx) => tx.selection.set(caret(2)));
      });
      await beforeInput(editable, 'insertText', 'x');

      expect(editor.read.text.string([])).toBe('ab@');
      expect(reports).toEqual([]);
    } finally {
      rendered.unmount();
    }
  });

  test('a listener that commits without editing the document keeps the report', async () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
    });
    let moved = false;

    // Subscribed before the report, so its selection-only commit runs first.
    editor.subscribeCommit(() => {
      if (moved || editor.read.text.string([]) !== 'abx') return;
      moved = true;
      editor.update((tx) => tx.selection.set(caret(0)));
    });

    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Left" />
      </EditorRoot>
    );
    const editable = rendered.getByRole('textbox', { name: 'Left' });
    const reports: TypedText[] = [];

    Object.defineProperty(editable, 'isContentEditable', { value: true });
    editor.api.react.subscribeTypedText((typed) => {
      reports.push(typed);
    });

    try {
      await act(async () => {
        editable.focus();
        editor.update((tx) => tx.selection.set(caret(2)));
      });
      await beforeInput(editable, 'insertText', 'x');

      expect(moved).toBe(true);
      expect(reports.map(({ text }) => text)).toEqual(['x']);
    } finally {
      rendered.unmount();
    }
  });

  test.each([
    {
      children: [{ text: 'Hi ' }, { bold: true as const, text: 'bold' }],
      at: point(3),
      range: {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 1 },
      },
      shape: 'next',
    },
    {
      children: [{ bold: true as const, text: 'Hi ' }, { text: 'x' }],
      at: { path: [0, 1], offset: 0 },
      range: { anchor: point(3), focus: point(4) },
      shape: 'previous',
    },
  ])(
    'typing with pending marks at a leaf edge reports the text in the $shape leaf',
    async ({ at, children, range }) => {
      const mounted = mount(children);
      const [editable] = mounted.editables;

      try {
        await act(async () => {
          editable.focus();
          mounted.editor.update((tx) => {
            tx.selection.set({ anchor: at, focus: at });
            tx.marks.add('bold', true);
          });
        });
        await beforeInput(editable, 'insertText', '@');

        expect(
          mounted.reports.map((typed) => ({
            range: typed.range,
            text: typed.text,
          }))
        ).toEqual([{ range, text: '@' }]);
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  test.each([
    'insertFromDrop',
    'insertFromPaste',
    'insertFromYank',
    'insertReplacementText',
  ])('%s with string data reports nothing', async (inputType) => {
    const mounted = mount();
    const [editable] = mounted.editables;

    try {
      await placeCaret(mounted, editable, 2);
      await beforeInput(editable, inputType, '@');

      expect(mounted.editor.read.text.string([])).toBe('ab@');
      expect(mounted.reports).toEqual([]);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('history replay and remote edits report nothing', async () => {
    const mounted = mount();
    const [editable] = mounted.editables;
    const { editor } = mounted;

    try {
      await placeCaret(mounted, editable, 2);
      await beforeInput(editable, 'insertText', '@');
      await act(async () => {
        editor.api.history.undo();
      });
      await act(async () => {
        editor.api.history.redo();
      });
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set(caret(3));
          tx.text.insert('!');
        });
      });

      expect(editor.read.text.string([])).toBe('ab@!');
      expect(mounted.reports.map(({ text }) => text)).toEqual(['@']);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('the input-event fallback reports its Editable', async () => {
    const mounted = mount('ab', ['Left', 'Right']);

    try {
      await nativeInput(mounted.editables[1], '@');

      expect(mounted.editor.read.text.string([])).toBe('@ab');
      expect(summarize(mounted.reports)).toEqual([
        {
          editable: 'Right',
          range: { anchor: point(0), focus: point(1) },
          text: '@',
        },
      ]);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a captured repair that leaves the caret elsewhere reports nothing', async () => {
    const mounted = mount([{ bold: true, text: 'Hi @' }, { text: 'x' }]);
    const [editable] = mounted.editables;
    const runtime = findMountedEditableDOMRuntime(editable)!;
    const elsewhere = document.createElement('button');

    try {
      await placeCaret(mounted, editable, 4);
      editable.append(elsewhere);
      document.getSelection()!.setBaseAndExtent(elsewhere, 0, elsewhere, 0);
      await act(async () => {
        createDOMRepairQueue({
          domPhaseScheduler: runtime.domPhaseScheduler,
          editor: runtime.editor,
          inputController: runtime.inputController,
          scrollSelectionIntoView: () => {},
          syncDOMSelectionToEditor: () => {},
        }).repairDOMInput(
          {
            data: '@',
            inputType: 'insertText',
            target: {
              insert: { offset: 0, text: '@' },
              path: [0, 1],
              preferCapturedInsert: true,
              selectionOffset: 1,
              text: '@x',
            },
          },
          editable,
          1
        );
      });

      expect(mounted.editor.read.text.string([])).toBe('Hi @@x');
      expect(mounted.reports).toEqual([]);
    } finally {
      elsewhere.remove();
      mounted.rendered.unmount();
    }
  });

  test('a composition commit reports its Editable', async () => {
    const mounted = mount('ab', ['Left', 'Right']);
    const right = mounted.editables[1];
    const selection = document.getSelection()!;

    try {
      await placeCaret(mounted, right, 2);
      await act(settle);
      const text = textNodeOf(right);

      await act(async () => {
        fireEvent.compositionStart(right);
        text.insertData(2, '@');
        selection.setBaseAndExtent(text, 3, text, 3);
        fireEvent.compositionEnd(right, { data: '@' });
        await settle();
      });

      expect(mounted.editor.read.text.string([])).toBe('ab@');
      expect(summarize(mounted.reports)).toEqual([
        {
          editable: 'Right',
          range: { anchor: point(2), focus: point(3) },
          text: '@',
        },
      ]);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('an Android composition rewrite reports only its new characters', async () => {
    const mounted = mount('hel');
    const android = createAndroid(mounted);

    try {
      await placeCaret(mounted, mounted.editables[0], 3);
      android.input('insertCompositionText', 'hello', 0, 3);
      await android.flush();

      expect(mounted.editor.read.text.string([])).toBe('hello');
      expect(summarize(mounted.reports)).toEqual([
        {
          editable: 'Left',
          range: { anchor: point(3), focus: point(5) },
          text: 'lo',
        },
      ]);
    } finally {
      android.destroy();
      mounted.rendered.unmount();
    }
  });

  test('an Android typed trigger followed by pasted text on the same leaf reports only the trigger', async () => {
    const mounted = mount();
    const android = createAndroid(mounted);

    try {
      await placeCaret(mounted, mounted.editables[0], 2);
      android.input('insertCompositionText', '@', 2, 2);
      await android.handleInput();
      android.input('insertFromPaste', 'XY', 3, 3);
      await android.handleInput();

      expect(mounted.editor.read.text.string([])).toBe('ab@XY');
      expect(summarize(mounted.reports)).toEqual([
        {
          editable: 'Left',
          range: { anchor: point(2), focus: point(3) },
          text: '@',
        },
      ]);
    } finally {
      android.destroy();
      mounted.rendered.unmount();
    }
  });

  test('an Android pending diff that merges typed and pasted text reports nothing', async () => {
    const mounted = mount();
    const android = createAndroid(mounted);

    try {
      await placeCaret(mounted, mounted.editables[0], 2);
      android.input('insertCompositionText', '@', 2, 2);
      android.input('insertFromPaste', 'XY', 3, 3);
      await android.flush();

      expect(mounted.editor.read.text.string([])).toBe('ab@XY');
      expect(mounted.reports).toEqual([]);
    } finally {
      android.destroy();
      mounted.rendered.unmount();
    }
  });
});

test('textToCaret returns null for an unmounted editor', () => {
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'ab' }] }],
  });

  expect(editor.api.dom.textToCaret(point(0))).toBeNull();
});

test('textToCaret returns null for a caret in a nested editor', async () => {
  const inner = createEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'inner' }] }],
  });
  const outer = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'outer' }] },
      { type: 'embed', children: [{ text: '' }] },
    ],
  });
  const rendered = render(
    <EditorRoot editor={outer}>
      <Editable
        aria-label="Outer"
        renderElement={({ attributes, children, element }) =>
          element.type === 'embed' ? (
            <div {...attributes}>
              <EditorRoot editor={inner}>
                <Editable aria-label="Inner" />
              </EditorRoot>
              {children}
            </div>
          ) : (
            <p {...attributes}>{children}</p>
          )
        }
      />
    </EditorRoot>
  );
  const innerEditable = rendered.getByRole('textbox', { name: 'Inner' });
  const outerView = findMountedEditableDOMRuntime(
    rendered.getByRole('textbox', { name: 'Outer' })
  )!.editor;

  try {
    await act(async () => {
      innerEditable.focus();
    });

    const text = textNodeOf(innerEditable);

    document.getSelection()!.setBaseAndExtent(text, 3, text, 3);

    expect(outerView.api.dom.textToCaret(point(0))).toBeNull();
  } finally {
    rendered.unmount();
  }
});
