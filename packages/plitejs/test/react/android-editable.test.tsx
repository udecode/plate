import { act, fireEvent, render } from '@testing-library/react';

import { TextApi } from 'plitejs';
import * as Y from 'yjs';

import { definePlugin, editorCommands } from '../../src';
import { history } from '../../src/history';
import {
  createEditor,
  type DecorationSource,
  Editable,
  EditorRoot,
} from '../../src/react';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { getNodeKey } from '../../src/react/editable/runtime-editor-api';
import {
  createYjsPeerWithEditor,
  paragraph,
  syncConnectedPeers,
} from '../yjs/support/collaboration';

Object.defineProperty(window.navigator, 'userAgent', {
  configurable: true,
  value:
    'Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
});

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

type Rendering = 'custom-leaf' | 'retained';

const createParagraphs = (
  texts: string[],
  plugins: NonNullable<Parameters<typeof createEditor>[0]>['plugins'] = []
) =>
  createEditor({
    initialValue: texts.map((text) => ({
      type: 'paragraph',
      children: [{ text }],
    })),
    plugins,
  });

const mount = (
  texts: string[],
  {
    editor = createParagraphs(texts),
    placeholder,
    rendering = 'custom-leaf',
  }: {
    editor?: ReturnType<typeof createParagraphs>;
    placeholder?: string;
    rendering?: Rendering;
  } = {}
) => {
  let decorationVersion = 0;
  let refreshDecorations:
    | Parameters<NonNullable<DecorationSource['observe']>>[0]['refresh']
    | undefined;
  // Decorates the first character of each text, and an empty text too, so a
  // refresh re-renders every line it reaches.
  const decorations: DecorationSource<typeof editor> = {
    id: 'android-editable',
    observe: ({ refresh }) => {
      refreshDecorations = refresh;
      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node) && decorationVersion > 0
        ? [
            {
              attributes: { 'data-test-decoration': String(decorationVersion) },
              key: `test:${path.join(',')}`,
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: Math.min(1, node.text.length) },
              },
            },
          ]
        : [],
  };
  const view = (showEditable: boolean) => (
    <EditorRoot decorations={[decorations]} editor={editor}>
      {showEditable && (
        <Editable
          placeholder={placeholder}
          renderLeaf={
            rendering === 'custom-leaf'
              ? (props) => <span {...props.attributes}>{props.children}</span>
              : undefined
          }
          scrollSelectionIntoView={() => {}}
        />
      )}
    </EditorRoot>
  );
  const rendered = render(view(true));
  const hideEditable = () => rendered.rerender(view(false));
  const root = rendered.container.querySelector<HTMLElement>('[data-editor]')!;

  Object.defineProperty(root, 'isContentEditable', { value: true });

  const runtime = findMountedEditableDOMRuntime(root)!;
  const block = (index: number) =>
    root.querySelector<HTMLElement>(`[data-editor-path="${index}"]`)!;
  // A render that the composition did not cause: a decoration refresh on
  // the line and a commit to another block.
  const renderElsewhere = async (index: number, otherIndex: number) => {
    await act(async () => {
      decorationVersion += 1;
      refreshDecorations?.({ nodeKeys: [getNodeKey(editor, [index, 0])!] });
      runtime.editor.update((tx) =>
        tx.text.insert('x', { at: { path: [otherIndex, 0], offset: 0 } })
      );
      await wait(60);
    });
  };

  return {
    block,
    editor,
    hideEditable,
    renderElsewhere,
    rendered,
    root,
    runtime,
  };
};

const blockText = (
  editor: Pick<ReturnType<typeof createEditor>, 'read'>,
  index: number
) => editor.read((state) => state.text.string([index]));

const firstTextNode = (
  element: Element,
  { visible = false }: { visible?: boolean } = {}
) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const editable = !node.parentElement?.closest('[contenteditable="false"]');

    if (
      !visible ||
      (editable && (node as Text).data.replace(/\uFEFF/g, '') !== '')
    ) {
      return node as Text;
    }
  }

  return null;
};

// Chrome on Android deletes the last character of a paragraph natively: the
// event cannot be prevented, the text host goes with the character, a <br>
// takes its place and the DOM selection lands on the paragraph.
const backspaceLastCharacter = async (
  mounted: ReturnType<typeof mount>,
  index: number
) => {
  const { block, root } = mounted;
  const selection = document.getSelection()!;
  const paragraph = block(index);
  const text = firstTextNode(paragraph)!;
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: false,
    inputType: 'deleteContentBackward',
  });

  Object.defineProperty(event, 'getTargetRanges', {
    value: () => [
      {
        collapsed: false,
        endContainer: text,
        endOffset: text.data.length,
        startContainer: text,
        startOffset: text.data.length - 1,
      },
    ],
  });

  await act(async () => {
    fireEvent(root, event);
    paragraph.querySelector('[data-editor-node="text"]')!.remove();
    paragraph.append(document.createElement('br'));
    selection.setBaseAndExtent(paragraph, 0, paragraph, 0);
    fireEvent.input(root, { inputType: 'deleteContentBackward' });
    await wait(100);
  });
};

// The user taps the end of the paragraph, so the editor imports the DOM
// selection.
const placeCaretAtEnd = async (
  mounted: ReturnType<typeof mount>,
  index: number
) => {
  const { block, root } = mounted;
  const text = firstTextNode(block(index), { visible: true });
  // An empty line has no text node; its caret sits in the zero-width span.
  const [node, offset] = text
    ? [text, text.data.length]
    : [block(index).querySelector('[data-editor-zero-width]')!, 0];

  await act(async () => {
    root.focus();
    document.getSelection()!.setBaseAndExtent(node, offset, node, offset);
    document.dispatchEvent(new Event('selectionchange'));
    await wait(100);
  });
};

// Records every write a script makes to a node on the path from the
// composing text node up to the editor root.
const spyOnWrites = (text: Text, root: HTMLElement) => {
  const writes: string[] = [];
  let native = false;

  for (let node: Node | null = text; node && node !== root; node = node.parentNode) {
    const target = node;
    const props = target === text ? ['data', 'nodeValue', 'textContent'] : ['textContent', 'innerHTML'];

    for (const prop of props) {
      let proto: object | null = Object.getPrototypeOf(target);
      let descriptor: PropertyDescriptor | undefined;

      while (proto && !(descriptor = Object.getOwnPropertyDescriptor(proto, prop))) {
        proto = Object.getPrototypeOf(proto);
      }
      if (!descriptor?.set) continue;
      const { get, set } = descriptor;

      Object.defineProperty(target, prop, {
        configurable: true,
        get() {
          return get!.call(this);
        },
        set(value) {
          if (!native) writes.push(`${prop} on ${target.nodeName}`);
          set.call(this, value);
        },
      });
    }
    for (const method of ['appendChild', 'insertBefore', 'remove', 'removeChild', 'replaceChild', 'replaceChildren', 'replaceData', 'replaceWith']) {
      const original = (target as unknown as Record<string, unknown>)[method];

      if (typeof original !== 'function') continue;
      (target as unknown as Record<string, unknown>)[method] = function (
        this: Node,
        ...args: unknown[]
      ) {
        if (!native) writes.push(`${method} on ${target.nodeName}`);
        return (original as (...values: unknown[]) => unknown).apply(this, args);
      };
    }
  }

  return {
    native: (edit: () => void) => {
      native = true;
      try {
        edit();
      } finally {
        native = false;
      }
    },
    writes,
  };
};

// Emulates Chrome on Android composing in a line, from the device traces:
// composition events cannot be prevented, Chrome edits the DOM after
// beforeinput, and in an empty line it replaces the <br> placeholder with the
// composed text inside the zero-width span.
const composeIn = (
  mounted: ReturnType<typeof mount>,
  index: number,
  {
    from,
    targetRanges = true,
  }: {
    /** Where the keyboard's composing region starts; the caret by default. */
    from?: number;
    /** False reports a wrong range, as SwiftKey does on its final event. */
    targetRanges?: boolean;
  } = {}
) => {
  const { block, root } = mounted;
  const selection = document.getSelection()!;
  const line = block(index);
  const existing = firstTextNode(line, { visible: true });
  const empty = !existing;
  const text = existing ?? document.createTextNode('');
  const caret =
    existing && selection.focusNode === existing
      ? selection.focusOffset
      : text.data.length;
  const base = from ?? caret;
  let composed = text.data.slice(base, caret);
  let spy: ReturnType<typeof spyOnWrites> | null = null;

  const update = async (next: string) => {
    const event = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: false,
      data: next,
      inputType: 'insertCompositionText',
    });

    Object.defineProperty(event, 'getTargetRanges', {
      value: () => [
        {
          collapsed: composed.length === 0,
          endContainer: text,
          endOffset: targetRanges ? base + composed.length : 0,
          startContainer: text,
          startOffset: targetRanges ? base : 0,
        },
      ],
    });
    await act(async () => {
      fireEvent(root, event);
      const edit = () => {
        if (empty && !text.isConnected) {
          const zeroWidth = line.querySelector('[data-editor-zero-width]')!;

          zeroWidth.querySelector('br')?.remove();
          text.data = next;
          zeroWidth.append(text);
        } else {
          text.replaceData(base, composed.length, next);
        }
      };

      if (spy) spy.native(edit);
      else edit();
      composed = next;
      selection.setBaseAndExtent(text, base + next.length, text, base + next.length);
      spy ??= spyOnWrites(text, root);
      fireEvent.input(root, {
        data: next,
        inputType: 'insertCompositionText',
        isComposing: true,
      });
      await wait(60);
    });
  };

  return {
    end: async () => {
      await act(async () => {
        fireEvent.compositionEnd(root, { data: composed });
        await wait(150);
      });
    },
    start: async () => {
      await act(async () => {
        fireEvent.compositionStart(root, { data: '' });
      });
    },
    text,
    update,
    writes: () => spy?.writes ?? [],
  };
};

describe.each(['custom-leaf', 'retained'] as const)(
  'Android composition, %s rendering',
  (rendering) => {
    describe.each([
      ['an empty line', ''],
      ['a line end', 'abc'],
    ])('in %s', (_where, initial) => {
      const composeHangul = async () => {
        const mounted = mount([initial, 'second'], { rendering });

        await placeCaretAtEnd(mounted, 0);

        const ime = composeIn(mounted, 0);

        await ime.start();
        for (const next of ['ㅎ', '하', '한']) {
          await ime.update(next);
          await mounted.renderElsewhere(0, 1);
        }

        return { ime, mounted };
      };

      test('holds the model still while the draft is open', async () => {
        const { mounted } = await composeHangul();

        try {
          expect(blockText(mounted.editor, 0)).toBe(initial);
        } finally {
          mounted.rendered.unmount();
        }
      });

      test('leaves the draft alone through renders it did not cause', async () => {
        const { ime, mounted } = await composeHangul();

        try {
          expect({
            connected: ime.text.isConnected,
            text: ime.text.data,
            writes: ime.writes(),
          }).toEqual({ connected: true, text: `${initial}한`, writes: [] });
        } finally {
          mounted.rendered.unmount();
        }
      });

      test('commits the composed word once when the composition ends', async () => {
        const { ime, mounted } = await composeHangul();

        try {
          await ime.end();

          expect({
            dom: mounted.block(0).textContent,
            hosts: mounted.block(0).querySelectorAll('[data-editor-node="text"]')
              .length,
            model: blockText(mounted.editor, 0),
          }).toEqual({ dom: `${initial}한`, hosts: 1, model: `${initial}한` });
        } finally {
          mounted.rendered.unmount();
        }
      });
    });
  }
);

type StaticRangeLike = {
  endContainer: Node;
  endOffset: number;
  startContainer: Node;
  startOffset: number;
};

// Fires a non-composition beforeinput and, unless the editor prevented it,
// applies Chrome's own edit and fires input, as Chrome does. Returns whether
// it was prevented.
const nativeInput = async (
  root: HTMLElement,
  {
    applyNative,
    cancelable,
    data = null,
    inputType,
    range,
  }: {
    applyNative?: () => void;
    cancelable: boolean;
    data?: string | null;
    inputType: string;
    range?: StaticRangeLike;
  }
) => {
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable,
    data,
    inputType,
  });

  Object.defineProperty(event, 'getTargetRanges', {
    value: () =>
      range
        ? [
            {
              ...range,
              collapsed:
                range.startContainer === range.endContainer &&
                range.startOffset === range.endOffset,
            },
          ]
        : [],
  });

  let prevented = false;

  await act(async () => {
    fireEvent(root, event);
    prevented = event.defaultPrevented;
    if (!prevented) {
      applyNative?.();
      fireEvent.input(root, { data, inputType });
    }
    await wait(100);
  });

  return prevented;
};

const caretIn = (text: Text, offset: number): StaticRangeLike => ({
  endContainer: text,
  endOffset: offset,
  startContainer: text,
  startOffset: offset,
});

describe('Android composition boundaries', () => {
  test('reports only the characters a composition adds to the word it rewrites', async () => {
    const mounted = mount(['hel', 'second']);
    const reports: Array<{ range: unknown; text: string }> = [];

    mounted.editor.api.react.subscribeTypedText(({ range, text }) => {
      reports.push({ range, text });
    });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0, { from: 0 });

      await ime.start();
      await ime.update('hello');
      await ime.end();

      expect(reports).toEqual([
        {
          range: {
            anchor: { path: [0, 0], offset: 3 },
            focus: { path: [0, 0], offset: 5 },
          },
          text: 'lo',
        },
      ]);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a paste ends the composition, and only the composed text counts as typed', async () => {
    const mounted = mount(['ab', 'second']);
    const reports: string[] = [];

    mounted.editor.api.react.subscribeTypedText(({ text }) => {
      reports.push(text);
    });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('@');
      await nativeInput(mounted.root, {
        applyNative: () => ime.text.insertData(3, 'XY'),
        cancelable: true,
        data: 'XY',
        inputType: 'insertFromPaste',
        range: caretIn(ime.text, 3),
      });

      expect({ model: blockText(mounted.editor, 0), reports }).toEqual({
        model: 'ab@XY',
        reports: ['@'],
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('keeps the text after the draft when Chrome splits the text node', async () => {
    const mounted = mount(['abcd', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const text = firstTextNode(mounted.block(0))!;

      await act(async () => {
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });

      const tail = text.splitText(2);
      const ime = composeIn(mounted, 0, { from: 2 });

      await ime.start();
      await ime.update('한');
      await ime.end();

      expect(blockText(mounted.editor, 0)).toBe('ab한cd');
      expect(tail.data).toBe('cd');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a cancelable space after compositions that never ended commits the word, then the space', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const first = composeIn(mounted, 0);

      await first.start();
      for (const next of ['ㅎ', '하', '한']) await first.update(next);

      const second = composeIn(mounted, 0);

      await second.start();
      for (const next of ['ㄱ', '그', '글']) await second.update(next);

      const prevented = await nativeInput(mounted.root, {
        applyNative: () => second.text.appendData(' '),
        cancelable: true,
        data: ' ',
        inputType: 'insertText',
        range: caretIn(second.text, second.text.data.length),
      });

      expect({
        hosts: mounted.block(0).querySelectorAll('[data-editor-node="text"]')
          .length,
        model: blockText(mounted.editor, 0),
        prevented,
      }).toEqual({ hosts: 1, model: '한글 ', prevented: true });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a keydown that is not composing during the end wait commits the word', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      await act(async () => {
        fireEvent.compositionEnd(mounted.root, { data: '한' });
        fireEvent.keyDown(mounted.root, { isComposing: false, key: 'Unidentified' });
      });

      expect(blockText(mounted.editor, 0)).toBe('한');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a keyboard that replaces each syllable through its composing region builds the word', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const first = composeIn(mounted, 0);

      await first.start();
      for (const next of ['ㅎ', '하', '한']) await first.update(next);
      await act(async () => {
        fireEvent.compositionEnd(mounted.root, { data: '한' });
      });

      const second = composeIn(mounted, 0);

      await second.start();
      for (const next of ['ㄱ', '그', '글']) await second.update(next);
      await second.end();

      expect(blockText(mounted.editor, 0)).toBe('한글');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test.each([true, false])(
    'a replacement of an earlier word keeps its own range while a draft is open (cancelable %s)',
    async (cancelable) => {
      const mounted = mount(['teh ', 'second']);

      try {
        await placeCaretAtEnd(mounted, 0);
        const ime = composeIn(mounted, 0);

        await ime.start();
        await ime.update('한');
        await nativeInput(mounted.root, {
          applyNative: () => ime.text.replaceData(0, 3, 'the'),
          cancelable,
          data: 'the',
          inputType: 'insertReplacementText',
          range: {
            endContainer: ime.text,
            endOffset: 3,
            startContainer: ime.text,
            startOffset: 0,
          },
        });

        expect(blockText(mounted.editor, 0)).toBe('the 한');
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  test('a composition over selected text replaces the selection once', async () => {
    const mounted = mount(['abcdef', 'second']);

    try {
      const text = firstTextNode(mounted.block(0))!;

      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 4);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await act(async () => {
        fireEvent.compositionStart(mounted.root, { data: '' });
        text.replaceData(2, 2, '');
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
      });

      const ime = composeIn(mounted, 0, { from: 2 });

      await ime.update('한');
      await ime.end();

      expect(blockText(mounted.editor, 0)).toBe('ab한ef');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a repeated letter lands where it was typed', async () => {
    const mounted = mount(['ㅋㅋ', 'second']);

    try {
      const text = firstTextNode(mounted.block(0))!;

      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 0, text, 0);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });

      const ime = composeIn(mounted, 0, { from: 0 });

      await ime.start();
      await ime.update('ㅋ');
      await ime.end();

      expect(
        mounted.editor.read((state) => state.selection())
      ).toMatchObject({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('erasing a draft to nothing leaves its empty paragraph, and the next letter lands in it', async () => {
    const mounted = mount(['a', '']);

    try {
      const key = getNodeKey(mounted.editor, [1]);

      await placeCaretAtEnd(mounted, 1);
      const ime = composeIn(mounted, 1);

      await ime.start();
      await ime.update('ㅎ');
      await act(async () => {
        // Chrome takes the text host with the last letter.
        const host = mounted.block(1).querySelector('[data-editor-node="text"]')!;

        host.replaceWith(document.createElement('br'));
        document.getSelection()!.setBaseAndExtent(mounted.block(1), 0, mounted.block(1), 0);
      });
      await ime.end();
      await placeCaretAtEnd(mounted, 1);

      const next = composeIn(mounted, 1);

      await next.start();
      await next.update('x');
      await next.end();

      expect({
        blocks: mounted.editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        ),
        key: getNodeKey(mounted.editor, [1]),
      }).toEqual({ blocks: ['a', 'x'], key });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a block-type change from a toolbar during a draft keeps the composed text', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      await act(async () => {
        mounted.editor.update((tx) =>
          tx.nodes.set({ type: 'heading-one' } as never, { at: [0] })
        );
        await wait(100);
      });

      expect(
        mounted.editor.read((state) => [
          state.nodes.get([0])?.[0],
          state.text.string([0]),
        ])
      ).toMatchObject([{ type: 'heading-one' }, '한']);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('composition events that trail a forced end add only the text they change', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      await act(async () => {
        mounted.runtime.settleInput();
      });

      // The commit gave the line back to React, so Chrome reports the
      // keyboard's next event against the text React rendered.
      const trailing = composeIn(mounted, 0, { from: 0 });

      await trailing.update('한ㄱ');
      await trailing.end();

      const later = composeIn(mounted, 0);

      await later.start();
      await later.update('ㅎ');
      await later.end();

      expect(blockText(mounted.editor, 0)).toBe('한ㄱㅎ');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('settleInput during the end wait commits the word and reports it settled', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');

      let settled = false;

      await act(async () => {
        fireEvent.compositionEnd(mounted.root, { data: '한' });
        settled = mounted.runtime.settleInput();
      });

      expect({ model: blockText(mounted.editor, 0), settled }).toEqual({
        model: '한',
        settled: true,
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a keyboard that reports a wrong range on its final event still commits what it shows', async () => {
    const mounted = mount(['some ', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0, { targetRanges: false });

      await ime.start();
      await ime.update('text');
      await ime.end();

      expect(blockText(mounted.editor, 0)).toBe('some text');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('unmounting the editable during a draft commits it once', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      const scheduled = vi.spyOn(mounted.runtime.domPhaseScheduler, 'schedule');

      act(() => {
        mounted.hideEditable();
      });
      await act(async () => {
        await wait(100);
      });

      expect({
        model: blockText(mounted.editor, 0),
        scheduled: scheduled.mock.calls.map(([, label]) => label),
      }).toEqual({ model: '한', scheduled: [] });
    } finally {
      mounted.rendered.unmount();
    }
  });
});

describe('Android composition commits through the editor', () => {
  test('a long line commits the syllable the keyboard shows', async () => {
    const initial = 'abcdefghij'.repeat(5) + 'kl';
    const mounted = mount([initial, 'second'], { rendering: 'retained' });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('ㅎ');
      await ime.update('하');
      await ime.end();

      expect(blockText(mounted.editor, 0)).toBe(`${initial}하`);
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a cancelled composition in a split node leaves the text, and the next letter lands once', async () => {
    const mounted = mount(['abcd', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const text = firstTextNode(mounted.block(0))!;

      await act(async () => {
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      text.splitText(2);

      const ime = composeIn(mounted, 0, { from: 2 });

      await ime.start();
      await ime.update('한');
      await ime.update('');
      await ime.end();

      const after = firstTextNode(mounted.block(0), { visible: true })!;
      const offset = after.data.indexOf('cd') === -1 ? 2 : after.data.indexOf('cd');

      await act(async () => {
        document.getSelection()!.setBaseAndExtent(after, offset, after, offset);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await nativeInput(mounted.root, {
        applyNative: () => after.insertData(offset, 'x'),
        cancelable: true,
        data: 'x',
        inputType: 'insertText',
        range: caretIn(after, offset),
      });

      expect(blockText(mounted.editor, 0)).toBe('abxcd');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('bold turned on in an empty line commits the word bold', async () => {
    const mounted = mount(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      await act(async () => {
        mounted.editor.update((tx) => tx.marks.add('bold', true));
        await wait(60);
      });

      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      await ime.end();

      expect(
        mounted.editor.read((state) => state.nodes.get([0])?.[0])
      ).toMatchObject({ children: [{ bold: true, text: '한' }] });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('an insert handler that rewrites the word runs once at the commit', async () => {
    const seen: string[] = [];
    const editor = createParagraphs(
      ['', 'second'],
      [
        definePlugin('android-rewrite', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, ({ input, state }) => {
              seen.push(input.text);
              if (input.text !== '한') return false;

              return state.transaction((tx) => {
                tx.text.insert('漢', input.options?.at ? { at: input.options.at } : {});
              });
            }),
          ],
        }),
      ]
    );
    const mounted = mount(['', 'second'], { editor });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('ㅎ');
      await ime.update('한');
      await ime.end();

      expect({
        dom: mounted.block(0).textContent,
        model: blockText(mounted.editor, 0),
        seen,
      }).toEqual({ dom: '漢', model: '漢', seen: ['한'] });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('an insert handler that rejects the word leaves the line as it was', async () => {
    const editor = createParagraphs(
      ['abc', 'second'],
      [
        definePlugin('android-reject', {
          commands: ({ handle }) => [
            handle(editorCommands.insertText, ({ state }) =>
              state.transaction(() => {})
            ),
          ],
        }),
      ]
    );
    const mounted = mount(['abc', 'second'], { editor });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      await ime.end();

      expect({
        dom: mounted.block(0).textContent,
        model: blockText(mounted.editor, 0),
      }).toEqual({ dom: 'abc', model: 'abc' });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('Enter during a draft under the placeholder commits the word, then splits', async () => {
    const mounted = mount([''], { placeholder: 'Type here' });
    const placeholderShown = () => {
      const element = mounted.root.querySelector<HTMLElement>(
        '[data-editor-placeholder]'
      );

      return !!element && element.style.display !== 'none';
    };

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      for (const next of ['ㅇ', '아', '안', '안ㄴ', '안녀', '안녕']) {
        await ime.update(next);
      }

      const during = placeholderShown();

      await nativeInput(mounted.root, {
        cancelable: true,
        inputType: 'insertParagraph',
        range: caretIn(ime.text, ime.text.data.length),
      });

      expect({
        blocks: mounted.editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        ),
        during,
        selection: mounted.editor.read((state) => state.selection()),
      }).toMatchObject({
        blocks: ['안녕', ''],
        during: false,
        selection: { anchor: { offset: 0, path: [1, 0] } },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });
});

describe('Android composition over a selection', () => {
  const markedLine = (plugins: Parameters<typeof createParagraphs>[1] = []) =>
    createEditor({
      initialValue: [
        { children: [{ text: 'ab' }, { bold: true, text: 'cd' }], type: 'paragraph' },
        { children: [{ text: 'second' }], type: 'paragraph' },
      ],
      plugins,
    });

  // Chrome deletes the selected text itself, then composes at the caret.
  const composeOverLeaves = async (mounted: ReturnType<typeof mount>) => {
    const [first, second] = [...mounted.block(0).querySelectorAll('[data-editor-string]')].map(
      (element) => firstTextNode(element)!
    );

    await act(async () => {
      mounted.root.focus();
      document.getSelection()!.setBaseAndExtent(first!, 1, second!, 1);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
    });
    await act(async () => {
      fireEvent.compositionStart(mounted.root, { data: '' });
      first!.deleteData(1, 1);
      second!.deleteData(0, 1);
      document.getSelection()!.setBaseAndExtent(first!, 1, first!, 1);
    });

    const ime = composeIn(mounted, 0, { from: 1 });

    await ime.update('한');
    await ime.end();
  };

  test('across two leaves, one command replaces it and the first leaf keeps its marks', async () => {
    const editor = markedLine();
    const mounted = mount([], { editor });

    try {
      await composeOverLeaves(mounted);

      expect({
        dom: mounted.block(0).textContent,
        line: mounted.editor.read((state) => state.nodes.get([0])?.[0]),
      }).toMatchObject({
        dom: 'a한d',
        line: { children: [{ text: 'a한' }, { bold: true, text: 'd' }] },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('an insert handler that rejects the word keeps the selected text and its marks', async () => {
    const editor = markedLine([
      definePlugin('android-reject', {
        commands: ({ handle }) => [
          handle(editorCommands.insertText, ({ state }) => state.transaction(() => {})),
        ],
      }),
    ]);
    const mounted = mount([], { editor });

    try {
      await composeOverLeaves(mounted);

      expect({
        dom: mounted.block(0).textContent,
        line: mounted.editor.read((state) => state.nodes.get([0])?.[0]),
      }).toMatchObject({
        dom: 'abcd',
        line: { children: [{ text: 'ab' }, { bold: true, text: 'cd' }] },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('across two blocks, the word replaces the selection and the blocks join', async () => {
    const mounted = mount(['abc', 'def']);

    try {
      const first = firstTextNode(mounted.block(0))!;
      const second = firstTextNode(mounted.block(1))!;

      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(first, 1, second, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await act(async () => {
        fireEvent.compositionStart(mounted.root, { data: '' });
        await wait(60);
      });

      const joined = firstTextNode(mounted.block(0), { visible: true })!;

      await act(async () => {
        document.getSelection()!.setBaseAndExtent(joined, 1, joined, 1);
      });

      const ime = composeIn(mounted, 0);

      await ime.update('한');
      await ime.end();

      expect({
        blocks: mounted.editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        ),
        dom: mounted.block(0).textContent,
      }).toEqual({ blocks: ['a한f'], dom: 'a한f' });
    } finally {
      mounted.rendered.unmount();
    }
  });
});

describe('Android composition ends when the user leaves the draft', () => {
  const draftThen = async (leave: (mounted: ReturnType<typeof mount>) => void) => {
    const mounted = mount(['', 'second']);

    await placeCaretAtEnd(mounted, 0);
    const ime = composeIn(mounted, 0);

    await ime.start();
    await ime.update('한');
    await act(async () => {
      leave(mounted);
      await wait(100);
    });

    return mounted;
  };

  test('blur commits the word', async () => {
    const mounted = await draftThen(({ root }) => root.blur());

    try {
      expect(blockText(mounted.editor, 0)).toBe('한');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('the page going hidden commits the word', async () => {
    const visibility = Object.getOwnPropertyDescriptor(
      Document.prototype,
      'visibilityState'
    );
    const mounted = await draftThen(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    try {
      expect(blockText(mounted.editor, 0)).toBe('한');
    } finally {
      delete (document as { visibilityState?: unknown }).visibilityState;
      if (visibility) {
        Object.defineProperty(Document.prototype, 'visibilityState', visibility);
      }
      mounted.rendered.unmount();
    }
  });

  test('a press outside the editor commits the word', async () => {
    const outside = document.body.appendChild(document.createElement('button'));
    const mounted = await draftThen(() => {
      fireEvent.pointerDown(outside);
    });

    try {
      expect(blockText(mounted.editor, 0)).toBe('한');
    } finally {
      outside.remove();
      mounted.rendered.unmount();
    }
  });

  test('moving the caret to another line commits the word and keeps the new caret', async () => {
    const mounted = await draftThen(({ block }) => {
      const text = firstTextNode(block(1))!;

      document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
      document.dispatchEvent(new Event('selectionchange'));
    });

    try {
      await act(async () => {
        await wait(100);
      });

      expect({
        model: blockText(mounted.editor, 0),
        selection: mounted.editor.read((state) => state.selection()),
      }).toMatchObject({
        model: '한',
        selection: {
          anchor: { offset: 2, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });
});

describe('Android composition with a collaborator', () => {
  const connect = (texts: string[]) => {
    const children = texts.map((text) => paragraph(text));
    const editor = createParagraphs(texts, [history()]);
    const local = createYjsPeerWithEditor(editor as never, {
      children,
      clientId: 'local',
    });
    const remote = createYjsPeerWithEditor(createParagraphs(texts) as never, {
      children,
      clientId: 'remote',
      seedUpdate: Y.encodeStateAsUpdate(local.doc),
    });
    const mounted = mount(texts, { editor });
    const sync = async () => {
      await act(async () => {
        syncConnectedPeers([local, remote]);
        await wait(60);
      });
    };

    return {
      cleanup: () => {
        mounted.rendered.unmount();
        local.cleanup();
        remote.cleanup();
      },
      mounted,
      remote,
      sync,
    };
  };

  test('an edit to another block leaves the draft open, and the word reaches the collaborator once it ends', async () => {
    const { cleanup, mounted, remote, sync } = connect(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      remote.editor.update((tx) =>
        tx.text.insert('x', { at: { path: [1, 0], offset: 0 } })
      );
      await sync();

      const during = {
        connected: ime.text.isConnected,
        model: blockText(mounted.editor, 0),
        other: blockText(mounted.editor, 1),
      };

      await ime.end();
      await sync();

      expect({
        during,
        local: blockText(mounted.editor, 0),
        remote: blockText(remote.editor, 0),
      }).toEqual({
        during: { connected: true, model: '', other: 'xsecond' },
        local: '한',
        remote: '한',
      });
    } finally {
      cleanup();
    }
  });

  test('an edit to the composing block ends the draft, and the word reaches the collaborator', async () => {
    const { cleanup, mounted, remote, sync } = connect(['', 'second']);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      remote.editor.update((tx) =>
        tx.nodes.set({ type: 'heading-one' } as never, { at: [0] })
      );
      await sync();
      await sync();

      const read = (editor: Pick<typeof mounted.editor, 'read'>) =>
        editor.read((state) => [
          (state.nodes.get([0])?.[0] as { type?: string } | undefined)?.type,
          state.text.string([0]),
        ]);

      expect({ local: read(mounted.editor), remote: read(remote.editor) }).toEqual({
        local: ['heading-one', '한'],
        remote: ['heading-one', '한'],
      });
    } finally {
      cleanup();
    }
  });
});

describe('Android composition with a collaborator who empties the line', () => {
  test('the word lands in the emptied line on both clients, and undo removes it in one step', async () => {
    const children = ['ab', 'second'].map((text) => paragraph(text));
    const editor = createParagraphs(['ab', 'second'], [history()]);
    const local = createYjsPeerWithEditor(editor as never, { children, clientId: 'local' });
    const remote = createYjsPeerWithEditor(createParagraphs(['ab', 'second']) as never, {
      children,
      clientId: 'remote',
      seedUpdate: Y.encodeStateAsUpdate(local.doc),
    });
    const mounted = mount([], { editor });
    const sync = async () => {
      await act(async () => {
        syncConnectedPeers([local, remote]);
        await wait(60);
      });
    };

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      remote.editor.update((tx) =>
        tx.text.delete({
          at: { anchor: { offset: 0, path: [0, 0] }, focus: { offset: 2, path: [0, 0] } },
        })
      );
      await sync();
      await sync();

      const merged = {
        local: blockText(mounted.editor, 0),
        remote: blockText(remote.editor, 0),
      };

      await act(async () => {
        mounted.editor.api.history.undo();
        await wait(60);
      });
      await sync();

      expect({
        merged,
        undone: { local: blockText(mounted.editor, 0), remote: blockText(remote.editor, 0) },
      }).toEqual({
        merged: { local: '한', remote: '한' },
        undone: { local: '', remote: '' },
      });
    } finally {
      mounted.rendered.unmount();
      local.cleanup();
      remote.cleanup();
    }
  });
});

describe('Android Backspace on the last character of a paragraph', () => {
  test('mounts a text host again so the next letter lands inside it', async () => {
    const mounted = mount(['a', 'ㅎ']);

    try {
      expect(mounted.runtime.isAndroidHost).toBe(true);
      await placeCaretAtEnd(mounted, 1);
      await backspaceLastCharacter(mounted, 1);

      const host = mounted
        .block(1)
        .querySelector('[data-editor-node="text"]');

      expect(host?.isConnected).toBe(true);
    } finally {
      mounted.rendered.unmount();
    }
  });
});
