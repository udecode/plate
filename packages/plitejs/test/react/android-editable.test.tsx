import { act, fireEvent, render } from '@testing-library/react';
import { TextApi, type Value } from 'plitejs';
import * as Y from 'yjs';

import { definePlugin, editorCommands } from '../../src';
import { createAuthoredPlugin } from '../../src/authored';
import { history } from '../../src/history';
import {
  createEditor,
  type DecorationSource,
  Editable,
  type EditableDOMBeforeInputHandler,
  type Editor,
  EditorRoot,
  type EditorRootProps,
} from '../../src/react';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { getNodeKey } from '../../src/react/editable/runtime-editor-api';
import { createPliteReactRenderCounter } from '../../src/react/render-profiler';
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

const createParagraphs = <
  const TPlugins extends readonly unknown[] = readonly [],
>(
  texts: string[],
  plugins?: TPlugins
) =>
  createEditor({
    initialValue: texts.map((text) => ({
      type: 'paragraph',
      children: [{ text }],
    })),
    plugins,
  });

const mountEditor = <TEditor extends EditorRootProps['editor']>(
  editor: TEditor,
  {
    onDOMBeforeInput,
    placeholder,
    rendering = 'custom-leaf',
  }: {
    onDOMBeforeInput?: EditableDOMBeforeInputHandler;
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
          onDOMBeforeInput={onDOMBeforeInput}
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

const mount = (
  texts: string[],
  options?: { placeholder?: string; rendering?: Rendering }
) => mountEditor(createParagraphs(texts), options);

const blockText = <V extends Value, const TPlugins extends readonly unknown[]>(
  editor: Editor<V, TPlugins>,
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
  mounted: Pick<ReturnType<typeof mount>, 'block' | 'root'>,
  index: number
) => {
  const { block, root } = mounted;
  const selection = document.getSelection()!;
  const line = block(index);
  const text = firstTextNode(line)!;
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
    line.querySelector('[data-editor-node="text"]')!.remove();
    line.append(document.createElement('br'));
    selection.setBaseAndExtent(line, 0, line, 0);
    fireEvent.input(root, { inputType: 'deleteContentBackward' });
    await wait(100);
  });
};

// The user taps the end of the paragraph, so the editor imports the DOM
// selection.
const placeCaretAtEnd = async (
  mounted: Pick<ReturnType<typeof mount>, 'block' | 'root'>,
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

const spyOnWrites = (text: Text, root: HTMLElement) => {
  const writes: string[] = [];
  let native = false;

  for (
    let node: Node | null = text;
    node && node !== root;
    node = node.parentNode
  ) {
    const target = node;
    const props =
      target === text
        ? ['data', 'nodeValue', 'textContent']
        : ['textContent', 'innerHTML'];

    for (const prop of props) {
      let proto: object | null = Object.getPrototypeOf(target);
      let descriptor: PropertyDescriptor | undefined;

      while (
        proto &&
        !(descriptor = Object.getOwnPropertyDescriptor(proto, prop))
      ) {
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
    for (const method of [
      'appendChild',
      'insertBefore',
      'remove',
      'removeChild',
      'replaceChild',
      'replaceChildren',
      'replaceData',
      'replaceWith',
    ]) {
      const original = (target as unknown as Record<string, unknown>)[method];

      if (typeof original !== 'function') continue;
      (target as unknown as Record<string, unknown>)[method] =
        function recordDOMWrite(this: Node, ...args: unknown[]) {
          if (!native) writes.push(`${method} on ${target.nodeName}`);
          return (original as (...values: unknown[]) => unknown).apply(
            this,
            args
          );
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
  mounted: Pick<ReturnType<typeof mount>, 'block' | 'root'>,
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
  let text = existing ?? document.createTextNode('');
  const caret =
    existing && selection.focusNode === existing
      ? selection.focusOffset
      : text.data.length;
  const base = from ?? caret;
  let composed = text.data.slice(base, caret);
  let spy: ReturnType<typeof spyOnWrites> | null = null;
  const replacedSpies: Array<ReturnType<typeof spyOnWrites>> = [];

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
      selection.setBaseAndExtent(
        text,
        base + next.length,
        text,
        base + next.length
      );
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
    get text() {
      return text;
    },
    replaceTextNode: async () => {
      await act(async () => {
        const replacement = document.createTextNode(text.data);
        const edit = () => text.replaceWith(replacement);
        if (spy) spy.native(edit);
        else edit();
        text = replacement;
        if (spy) replacedSpies.push(spy);
        spy = spyOnWrites(text, root);
        selection.setBaseAndExtent(
          text,
          base + composed.length,
          text,
          base + composed.length
        );
        await wait(60);
      });
    },
    update,
    writes: () => [
      ...replacedSpies.flatMap((previous) => previous.writes),
      ...(spy?.writes ?? []),
    ],
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
        let commits = 0;
        const release = mounted.editor.subscribeCommit((commit) => {
          if (commit.changed.hasAny('document')) commits += 1;
        });

        await placeCaretAtEnd(mounted, 0);

        const ime = composeIn(mounted, 0);

        await ime.start();
        const previousProfiler = globalThis.__EDITOR_REACT_RENDER_PROFILER__;
        const counter = createPliteReactRenderCounter();
        globalThis.__EDITOR_REACT_RENDER_PROFILER__ = counter.profiler;
        const selection = document.getSelection()!;
        const selectionWrites = [
          'setBaseAndExtent',
          'collapse',
          'extend',
          'addRange',
          'removeAllRanges',
        ].map((method) => vi.spyOn(selection, method as 'collapse'));
        let keyRenders = 0;
        for (const next of ['ㅎ', '하', '한']) {
          const before = counter.snapshot().byKind.editable ?? 0;
          await ime.update(next);
          if (next === '하') await ime.replaceTextNode();
          keyRenders += (counter.snapshot().byKind.editable ?? 0) - before;
          await mounted.renderElsewhere(0, 1);
        }

        return {
          ime,
          mounted,
          commits: () => commits,
          selectionWrites,
          fullRenders: () => keyRenders,
          release: () => {
            release();
            globalThis.__EDITOR_REACT_RENDER_PROFILER__ = previousProfiler;
            selectionWrites.forEach((spy) => spy.mockRestore());
          },
        };
      };

      test('holds the model still while the draft is open', async () => {
        const { mounted, release } = await composeHangul();

        try {
          expect(blockText(mounted.editor, 0)).toBe(initial);
        } finally {
          release();
          mounted.rendered.unmount();
        }
      });

      test('leaves the draft alone through renders it did not cause', async () => {
        const { ime, mounted, commits, selectionWrites, fullRenders, release } =
          await composeHangul();

        try {
          expect({
            connected: ime.text.isConnected,
            text: ime.text.data,
            writes: ime.writes(),
            selectionWrites: selectionWrites.map(
              (spy) => spy.mock.calls.length
            ),
            commits: commits(),
            fullRenders: fullRenders(),
          }).toEqual({
            connected: true,
            text: `${initial}한`,
            writes: [],
            selectionWrites: [4, 0, 0, 0, 0],
            commits: 3,
            fullRenders: 0,
          });
        } finally {
          release();
          mounted.rendered.unmount();
        }
      });

      test('commits the composed word once when the composition ends', async () => {
        const { ime, mounted, commits, release } = await composeHangul();

        try {
          const during = commits();
          await ime.end();

          expect({
            dom: mounted.block(0).textContent,
            hosts: mounted
              .block(0)
              .querySelectorAll('[data-editor-node="text"]').length,
            model: blockText(mounted.editor, 0),
            during,
            commits: commits(),
          }).toEqual({
            dom: `${initial}한`,
            hosts: 1,
            model: `${initial}한`,
            during: 3,
            commits: 4,
          });
        } finally {
          release();
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

const placeholderShown = (root: HTMLElement) => {
  const element = root.querySelector<HTMLElement>('[data-editor-placeholder]');

  if (!element) return false;

  const { display, visibility } = getComputedStyle(element);

  return display !== 'none' && visibility !== 'hidden';
};

describe('Android composition boundaries', () => {
  test.each(['custom-leaf', 'retained'] as const)(
    'a draft before a trailing soft break excludes the display newline (%s)',
    async (rendering) => {
      const mounted = mount(['ab\n'], { rendering });

      try {
        const text = firstTextNode(mounted.block(0))!;
        await act(async () => {
          mounted.root.focus();
          document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(100);
        });
        const ime = composeIn(mounted, 0);

        await ime.start();
        await ime.update('한글');
        await act(async () => {
          ime.text.splitText(ime.text.length);
        });
        await ime.end();

        expect({
          model: blockText(mounted.editor, 0),
          dom: mounted.block(0).textContent,
          selection: mounted.editor.read((state) => state.selection()),
        }).toEqual({
          model: 'ab한글\n',
          dom: 'ab한글\n\n',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        });
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  test('a handled replacement after a draft cannot redirect later typing', async () => {
    const mounted = mountEditor(createParagraphs(['teh ']), {
      onDOMBeforeInput: (event) => {
        if (event.inputType === 'insertReplacementText') {
          event.preventDefault();
          return true;
        }
        return false;
      },
    });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('한');
      await nativeInput(mounted.root, {
        cancelable: true,
        data: 'the',
        inputType: 'insertReplacementText',
        range: {
          endContainer: ime.text,
          endOffset: 3,
          startContainer: ime.text,
          startOffset: 0,
        },
      });
      const text = firstTextNode(mounted.block(0))!;

      await nativeInput(mounted.root, {
        applyNative: () => {
          text.insertData(5, 'x');
          document.getSelection()!.setBaseAndExtent(text, 6, text, 6);
        },
        cancelable: true,
        data: 'x',
        inputType: 'insertText',
        range: caretIn(text, 5),
      });

      expect({
        model: blockText(mounted.editor, 0),
        dom: mounted.root.textContent,
      }).toEqual({ model: 'teh 한x', dom: 'teh 한x' });
    } finally {
      mounted.rendered.unmount();
    }
  });

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
        fireEvent.keyDown(mounted.root, {
          isComposing: false,
          key: 'Unidentified',
        });
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

  test.each([
    ['custom-leaf', true],
    ['custom-leaf', false],
    ['retained', true],
    ['retained', false],
  ] as const)(
    'a replacement of an earlier word keeps its own range while a draft is open (%s, cancelable %s)',
    async (rendering, cancelable) => {
      const mounted = mount(['teh ', 'second'], { rendering });

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

      expect(mounted.editor.read((state) => state.selection())).toMatchObject({
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
        const host = mounted
          .block(1)
          .querySelector('[data-editor-node="text"]')!;

        host.replaceWith(document.createElement('br'));
        document
          .getSelection()!
          .setBaseAndExtent(mounted.block(1), 0, mounted.block(1), 0);
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

  test.each(['custom-leaf', 'retained'] as const)(
    'a keyboard reporting a wrong final range keeps marks, caret and following input (%s)',
    async (rendering) => {
      const mounted = mount(['some ', 'second'], { rendering });
      try {
        await placeCaretAtEnd(mounted, 0);
        await act(async () => {
          mounted.editor.update((tx) => tx.marks.set({ bold: true }));
        });
        const ime = composeIn(mounted, 0, { targetRanges: false });
        await ime.start();
        await ime.update('text');
        await ime.end();
        expect(mounted.block(0).textContent).toBe('some text');
        expect({
          line: mounted.editor.read((state) => state.nodes.get([0])?.[0]),
          selection: mounted.editor.read((state) => state.selection()),
        }).toMatchObject({
          line: { children: [{ text: 'some ' }, { bold: true, text: 'text' }] },
          selection: {
            anchor: { path: [0, 1], offset: 4 },
            focus: { path: [0, 1], offset: 4 },
          },
        });
        await nativeInput(mounted.root, {
          cancelable: true,
          inputType: 'insertText',
          data: '!',
        });
        expect({
          dom: mounted.block(0).textContent,
          line: mounted.editor.read((state) => state.nodes.get([0])?.[0]),
        }).toMatchObject({
          dom: 'some text!',
          line: {
            children: [{ text: 'some ' }, { bold: true, text: 'text!' }],
          },
        });
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

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

  test('a line edit immediately followed by editable teardown commits the pending draft once', async () => {
    const inputs: string[] = [];
    const editor = createParagraphs(
      ['', 'second'],
      [
        definePlugin('android-pending-teardown', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, next }) => {
              inputs.push(input.text);
              return next();
            }),
          ],
        }),
      ]
    );
    const mounted = mountEditor(editor);
    let textCommits = 0;
    const release = editor.subscribeCommit((commit) => {
      if (commit.changed.nodeKeysAll('text').length > 0) textCommits += 1;
    });

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);
      await ime.start();
      await ime.update('한');
      act(() => {
        editor.update((tx) =>
          tx.nodes.set({ type: 'heading-one' }, { at: [0] })
        );
        mounted.hideEditable();
      });
      await act(async () => {
        await wait(100);
      });

      expect({
        model: blockText(editor, 0),
        inputs,
        textCommits,
        composing: mounted.runtime.state.isComposing,
      }).toEqual({
        model: '한',
        inputs: ['한'],
        textCommits: 1,
        composing: false,
      });
    } finally {
      release();
      mounted.rendered.unmount();
    }
  });
});

describe('Android composition commits through the editor', () => {
  test('a long line commits the syllable the keyboard shows', async () => {
    const initial = `${'abcdefghij'.repeat(5)}kl`;
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
      const offset = !after.data.includes('cd') ? 2 : after.data.indexOf('cd');

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
                tx.text.insert(
                  '漢',
                  input.options?.at ? { at: input.options.at } : {}
                );
              });
            }),
          ],
        }),
      ]
    );
    const mounted = mountEditor(editor);

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

  test('a word composed inside crossed-out text lands where the keyboard drew it', async () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            {
              authored: [
                { at: 1, author: 'carol', change: 'carol:1', kind: 'delete' },
              ],
              text: 'gone',
            },
            { text: ' b' },
          ],
        },
        { type: 'paragraph', children: [{ text: 'second' }] },
      ],
      plugins: [
        createAuthoredPlugin({
          authorId: 'dan',
          createChangeId: () => 'dan:1',
          intent: 'propose',
          now: () => 1000,
        }),
      ],
    });
    const mounted = mountEditor(editor);

    try {
      const text = firstTextNode(mounted.block(0), { visible: true })!;

      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      const ime = composeIn(mounted, 0);

      await ime.start();
      await ime.update('か');
      await ime.end();

      expect({
        dom: mounted.block(0).textContent,
        model: blockText(mounted.editor, 0),
      }).toEqual({ dom: 'goかne b', model: 'goかne b' });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('an intent switch waiting through a composition that ends with no word applies, so the next key records under it', async () => {
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'ab' }] },
        { type: 'paragraph', children: [{ text: 'second' }] },
      ],
      plugins: [
        createAuthoredPlugin({
          authorId: 'dan',
          createChangeId: () => 'dan:1',
          intent: 'edit',
          now: () => 1000,
        }),
      ],
    });
    const mounted = mountEditor(editor);

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      mounted.runtime.editor.api.authored.setView({ intent: 'propose' });
      await ime.end();
      mounted.runtime.editor.update((tx) => {
        tx.command(editorCommands.insertText, { text: 'z' });
      });

      expect(editor.read.children()[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'ab' },
          {
            authored: [
              { at: 1000, author: 'dan', change: 'dan:1', kind: 'insert' },
            ],
            text: 'z',
          },
        ],
      });
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
    const mounted = mountEditor(editor);

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

    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);

      await ime.start();
      for (const next of ['ㅇ', '아', '안', '안ㄴ', '안녀', '안녕']) {
        fireEvent.keyDown(mounted.root, {
          isComposing: true,
          key: 'Unidentified',
          keyCode: 229,
          which: 229,
        });
        await ime.update(next);
      }

      const during = placeholderShown(mounted.root);
      const modelDuring = blockText(mounted.editor, 0);

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
        modelDuring,
        selection: mounted.editor.read((state) => state.selection()),
      }).toMatchObject({
        blocks: ['안녕', ''],
        during: false,
        modelDuring: '',
        selection: { anchor: { offset: 0, path: [1, 0] } },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test.each([false, true])(
    'canceling a draft after an IME keydown restores the placeholder (erased %s)',
    async (erased) => {
      const mounted = mount([''], { placeholder: 'Type here' });

      try {
        await placeCaretAtEnd(mounted, 0);
        const ime = composeIn(mounted, 0);

        fireEvent.keyDown(mounted.root, {
          key: 'Unidentified',
          keyCode: 229,
          which: 229,
        });
        await ime.start();
        if (erased) {
          await ime.update('ㅇ');
          await ime.update('');
        }
        await ime.end();

        expect({
          shown: placeholderShown(mounted.root),
          text: blockText(mounted.editor, 0),
        }).toEqual({ shown: true, text: '' });
      } finally {
        mounted.rendered.unmount();
      }
    }
  );
});

describe('Android composition range and recovery', () => {
  test('composition protection stays in its mounted root and clears after the run', async () => {
    const mounted = mount(['ab', 'other']);
    const foreign = document.body.appendChild(document.createElement('div'));
    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);
      await ime.start();
      await ime.update('한');
      expect({
        own: mounted.runtime.isCompositionDOMNodeProtected(ime.text),
        other: mounted.runtime.isCompositionDOMNodeProtected(mounted.block(1)),
        foreign: mounted.runtime.isCompositionDOMNodeProtected(foreign),
      }).toEqual({ own: true, other: false, foreign: false });
      await ime.end();
      expect({
        model: blockText(mounted.editor, 0),
        own: mounted.runtime.isCompositionDOMNodeProtected(mounted.block(0)),
      }).toEqual({ model: 'ab한', own: false });
      mounted.runtime.inputController.domInputRuntime.beginComposition({
        anchor: foreign,
        owner: 'native',
        phase: 'native-composing',
      });
      mounted.runtime.setComposing(true);
      expect({
        protected: mounted.runtime.isCompositionDOMNodeProtected(foreign),
        deferred: mounted.runtime.shouldDeferCompositionSelectionExport(),
      }).toEqual({ protected: false, deferred: false });
      mounted.runtime.setComposing(false);
    } finally {
      foreign.remove();
      mounted.rendered.unmount();
    }
  });

  const beginReplacement = async (
    mounted: Pick<ReturnType<typeof mount>, 'block' | 'root'>,
    topology: string,
    reverse = false
  ) => {
    const first = firstTextNode(mounted.block(0))!;
    const second =
      topology === 'blocks'
        ? firstTextNode(mounted.block(1))!
        : topology === 'marked leaves'
          ? [...mounted.block(0).querySelectorAll('[data-editor-string]')].map(
              (element) => firstTextNode(element)!
            )[1]
          : first;
    const end = second === first ? 5 : 2;

    await act(async () => {
      mounted.root.focus();
      document
        .getSelection()!
        .setBaseAndExtent(
          reverse ? second : first,
          reverse ? end : 1,
          reverse ? first : second,
          reverse ? 1 : end
        );
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
    });
    await act(async () => {
      fireEvent.compositionStart(mounted.root, { data: '' });
      first.data = 'af';
      if (topology === 'blocks') mounted.block(1).remove();
      else if (topology === 'marked leaves') {
        second.parentElement!.closest('[data-editor-node="text"]')!.remove();
      }
      document.getSelection()!.setBaseAndExtent(first, 1, first, 1);
    });
    const ime = composeIn(mounted, 0);
    await ime.update('한');
    return { first, ime };
  };

  test.each(['same leaf', 'marked leaves', 'blocks'])(
    'rejection restores the original selection, marks and keys across %s',
    async (topology) => {
      let reject = true;
      const editor = createEditor({
        initialValue:
          topology === 'blocks'
            ? [
                { children: [{ bold: true, text: 'abc' }], type: 'paragraph' },
                {
                  children: [{ italic: true, text: 'def' }],
                  type: 'paragraph',
                },
              ]
            : [
                {
                  children:
                    topology === 'marked leaves'
                      ? [
                          { bold: true, text: 'abc' },
                          { italic: true, text: 'def' },
                        ]
                      : [{ bold: true, text: 'abcdef' }],
                  type: 'paragraph',
                },
              ],
        plugins: [
          definePlugin('android-terminal-reject', {
            commands: ({ around }) => [
              around(editorCommands.insertText, ({ next }) =>
                reject ? false : next()
              ),
            ],
          }),
        ],
      });
      const mounted = mountEditor(editor);
      const original = editor.read((state) => state.children());
      const keys = original.map((_, index) => getNodeKey(editor, [index]));
      let commits = 0;
      const release = editor.subscribeCommit((commit) => {
        if (commit.changed.hasAny('document')) commits += 1;
      });

      try {
        const { ime } = await beginReplacement(mounted, topology, true);
        const selected = editor.read((state) => state.selection());
        expect({
          children: editor.read((state) => state.children()),
          commits,
        }).toEqual({ children: original, commits: 0 });
        await ime.end();
        expect({
          children: editor.read((state) => state.children()),
          commits,
          selection: editor.read((state) => state.selection()),
          keys: original.map((_, index) => getNodeKey(editor, [index])),
          dom: original.map((_, index) => mounted.block(index).textContent),
          composing: mounted.runtime.state.isComposing,
        }).toEqual({
          children: original,
          commits: 0,
          selection: selected,
          keys,
          dom: topology === 'blocks' ? ['abc', 'def'] : ['abcdef'],
          composing: false,
        });
        reject = false;
        await nativeInput(mounted.root, {
          cancelable: true,
          inputType: 'insertText',
          data: 'x',
        });
        expect(blockText(editor, 0)).toBe('axf');
      } finally {
        release();
        mounted.rendered.unmount();
      }
    }
  );

  test.each(['same leaf', 'marked leaves', 'blocks'])(
    'a restored native draft cancels without losing the original %s',
    async (topology) => {
      const editor = createEditor({
        initialValue:
          topology === 'blocks'
            ? [
                { children: [{ bold: true, text: 'abc' }], type: 'paragraph' },
                {
                  children: [{ italic: true, text: 'def' }],
                  type: 'paragraph',
                },
              ]
            : [
                {
                  children:
                    topology === 'marked leaves'
                      ? [
                          { bold: true, text: 'abc' },
                          { italic: true, text: 'def' },
                        ]
                      : [{ bold: true, text: 'abcdef' }],
                  type: 'paragraph',
                },
              ],
      });
      const mounted = mountEditor(editor);
      const original = editor.read((state) => state.children());
      const lines = original.map((_, index) => mounted.block(index));
      const keys = original.map((_, index) => getNodeKey(editor, [index]));
      let commits = 0;
      const release = editor.subscribeCommit((commit) => {
        if (commit.changed.hasAny('document')) commits += 1;
      });
      try {
        const { first } = await beginReplacement(mounted, topology);
        await act(async () => {
          first.data = topology === 'blocks' ? 'abc' : 'abcdef';
          if (topology === 'blocks') lines[0].after(lines[1]);
          fireEvent.compositionEnd(mounted.root, { data: '' });
          await wait(100);
        });
        expect({
          children: editor.read((state) => state.children()),
          commits,
          keys: original.map((_, index) => getNodeKey(editor, [index])),
          dom: original.map((_, index) => mounted.block(index).textContent),
          composing: mounted.runtime.state.isComposing,
        }).toEqual({
          children: original,
          commits: 0,
          keys,
          dom: topology === 'blocks' ? ['abc', 'def'] : ['abcdef'],
          composing: false,
        });
        await nativeInput(mounted.root, {
          cancelable: true,
          inputType: 'insertText',
          data: 'x',
        });
        expect(blockText(editor, 0)).toBe('axf');
      } finally {
        release();
        mounted.rendered.unmount();
      }
    }
  );

  test('a model-owned removal keeps its rendered parent bound to the live view', async () => {
    const mounted = mount(['abcdef', 'second']);
    await placeCaretAtEnd(mounted, 0);
    try {
      await act(async () => {
        mounted.runtime.editor.update((tx) =>
          tx.command(editorCommands.insertText, {
            options: {
              at: {
                anchor: { path: [0, 0], offset: 1 },
                focus: { path: [0, 0], offset: 5 },
              },
            },
            text: '',
          })
        );
        await wait(100);
      });
      expect(blockText(mounted.editor, 0)).toBe('af');
    } finally {
      mounted.rendered.unmount();
    }
  });
  test('an empty compositionend still commits a removal-only replacement', async () => {
    const mounted = mount(['abcdef', 'second']);
    try {
      const { first } = await beginReplacement(mounted, 'same leaf');
      await act(async () => {
        first.data = 'af';
        document.getSelection()!.setBaseAndExtent(first, 1, first, 1);
        fireEvent.compositionEnd(mounted.root, { data: '' });
        await wait(100);
      });
      expect({
        model: blockText(mounted.editor, 0),
        dom: mounted.block(0).textContent,
        selection: mounted.editor.read((state) => state.selection()),
      }).toEqual({
        model: 'af',
        dom: 'af',
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a throwing insert handler releases the run and the next input succeeds', async () => {
    let fail = true;
    const editor = createParagraphs(
      ['abc'],
      [
        definePlugin('android-throw', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ next }) => {
              if (fail) throw new Error('Rejected composition');
              return next();
            }),
          ],
        }),
      ]
    );
    const mounted = mountEditor(editor);
    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);
      await ime.start();
      await ime.update('한');
      await act(async () => {
        expect(() =>
          mounted.runtime.finishAndroidComposition('settle')
        ).toThrow('Rejected composition');
        await wait(60);
      });
      expect({
        model: blockText(editor, 0),
        dom: mounted.block(0).textContent,
        composing: mounted.runtime.state.isComposing,
      }).toEqual({ model: 'abc', dom: 'abc', composing: false });
      fail = false;
      const next = composeIn(mounted, 0);
      await next.start();
      await next.update('x');
      await next.end();
      expect({
        model: blockText(editor, 0),
        dom: mounted.block(0).textContent,
      }).toEqual({ model: 'abcx', dom: 'abcx' });
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('committing the same selected text still collapses the selection and runs insertion policy', async () => {
    const inputs: string[] = [];
    const editor = createParagraphs(
      ['abc'],
      [
        definePlugin('android-same-text', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, next }) => {
              inputs.push(input.text);
              return next();
            }),
          ],
        }),
      ]
    );
    const mounted = mountEditor(editor);
    try {
      const text = firstTextNode(mounted.block(0))!;
      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 1, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await act(async () => {
        fireEvent.compositionStart(mounted.root, { data: '' });
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        fireEvent.compositionEnd(mounted.root, { data: 'b' });
        await wait(100);
      });
      expect({
        inputs,
        model: blockText(editor, 0),
        selection: editor.read((state) => state.selection()),
      }).toEqual({
        inputs: ['b'],
        model: 'abc',
        selection: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      });
      await nativeInput(mounted.root, {
        cancelable: true,
        inputType: 'insertText',
        data: 'x',
      });
      expect(blockText(editor, 0)).toBe('abxc');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a deferred line edit keeps its replacement in that line after a preceding block is inserted', async () => {
    const mounted = mount(['ab', 'second']);
    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);
      await ime.start();
      await ime.update('한');
      await act(async () => {
        mounted.editor.update((tx) =>
          tx.nodes.set({ type: 'heading-one' }, { at: [0] })
        );
        mounted.editor.update((tx) =>
          tx.nodes.insert(
            { type: 'paragraph', children: [{ text: 'before' }] },
            { at: [0] }
          )
        );
        await wait(100);
      });
      expect(
        mounted.editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        )
      ).toEqual(['before', 'ab한', 'second']);
      expect(mounted.block(1).textContent).toBe('ab한');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test.each(['move', 'type change and move'] as const)(
    'a %s keeps the queued draft in its composing block',
    async (change) => {
      const editor = createParagraphs(['ab', 'second'], [history()]);
      const mounted = mountEditor(editor);
      const blocks = () =>
        editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        );

      try {
        await placeCaretAtEnd(mounted, 0);
        const ime = composeIn(mounted, 0);
        await ime.start();
        await ime.update('한');
        await act(async () => {
          editor.update((tx) => {
            if (change === 'type change and move') {
              tx.nodes.set({ type: 'heading-one' }, { at: [0] });
            }
            tx.nodes.move({ at: [0], to: [2] });
          });
          await wait(100);
        });
        expect({
          blocks: blocks(),
          dom: mounted.root.textContent,
          composing: mounted.runtime.state.isComposing,
          selection: editor.read((state) => state.selection()),
          domSelection: mounted.runtime.editor.api.dom.resolveRange(
            document.getSelection()!,
            { exactMatch: false }
          ),
        }).toEqual({
          blocks: ['second', 'ab한'],
          dom: 'secondab한',
          composing: false,
          selection: {
            anchor: { path: [1, 0], offset: 3 },
            focus: { path: [1, 0], offset: 3 },
          },
          domSelection: {
            anchor: { path: [1, 0], offset: 3 },
            focus: { path: [1, 0], offset: 3 },
          },
        });
        await act(async () => {
          editor.api.history.undo();
          await wait(60);
        });
        expect({ blocks: blocks(), dom: mounted.root.textContent }).toEqual({
          blocks: ['second', 'ab'],
          dom: 'secondab',
        });
        await act(async () => {
          editor.api.history.redo();
          await wait(60);
        });
        expect({ blocks: blocks(), dom: mounted.root.textContent }).toEqual({
          blocks: ['second', 'ab한'],
          dom: 'secondab한',
        });
        await nativeInput(mounted.root, {
          cancelable: true,
          inputType: 'insertText',
          data: 'x',
        });
        expect({ blocks: blocks(), dom: mounted.root.textContent }).toEqual({
          blocks: ['second', 'ab한x'],
          dom: 'secondab한x',
        });
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  test('deleting the composing line drops its queued draft without changing the surviving line', async () => {
    const mounted = mount(['ab', 'second']);
    try {
      await placeCaretAtEnd(mounted, 0);
      const ime = composeIn(mounted, 0);
      await ime.start();
      await ime.update('한');
      await act(async () => {
        mounted.editor.update((tx) =>
          tx.nodes.set({ type: 'heading-one' }, { at: [0] })
        );
        mounted.editor.update((tx) => tx.nodes.remove({ at: [0] }));
        await wait(100);
      });
      expect({
        blocks: mounted.editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        ),
        dom: mounted.root.textContent,
        composing: mounted.runtime.state.isComposing,
        selection: mounted.editor.read((state) => state.selection()),
        domSelection: mounted.runtime.editor.api.dom.resolveRange(
          document.getSelection()!,
          { exactMatch: false }
        ),
      }).toEqual({
        blocks: ['second'],
        dom: 'second',
        composing: false,
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        domSelection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      });
      await nativeInput(mounted.root, {
        cancelable: true,
        inputType: 'insertText',
        data: 'x',
      });
      expect(blockText(mounted.editor, 0)).toBe('xsecond');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('a prefix edit maps both ends of a keyboard replacement without removing preceding text', async () => {
    const mounted = mount(['abcDEFghi']);
    try {
      const text = firstTextNode(mounted.block(0))!;
      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 6, text, 6);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await act(async () => {
        fireEvent.compositionStart(mounted.root, { data: '' });
        text.data = 'abc한ghi';
        document.getSelection()!.setBaseAndExtent(text, 4, text, 4);
        fireEvent.compositionUpdate(mounted.root, { data: '한' });
        mounted.editor.update((tx) =>
          tx.text.insert('X', { at: { path: [0, 0], offset: 0 } })
        );
        await wait(100);
      });
      expect({
        model: blockText(mounted.editor, 0),
        dom: mounted.root.textContent,
        selection: mounted.editor.read((state) => state.selection()),
      }).toEqual({
        model: 'Xabc한ghi',
        dom: 'Xabc한ghi',
        selection: {
          anchor: { path: [0, 0], offset: 5 },
          focus: { path: [0, 0], offset: 5 },
        },
      });
      await nativeInput(mounted.root, {
        cancelable: true,
        inputType: 'insertText',
        data: 'x',
      });
      expect(blockText(mounted.editor, 0)).toBe('Xabc한xghi');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test.each(['rejected', 'throwing'] as const)(
    'a %s pending draft finishes once and the next input succeeds',
    async (outcome) => {
      let fail = true;
      const inputs: string[] = [];
      const editor = createParagraphs(
        ['abc', 'second'],
        [
          definePlugin('android-pending-failure', {
            commands: ({ around }) => [
              around(editorCommands.insertText, ({ input, next, state }) => {
                inputs.push(input.text);
                if (fail) {
                  if (outcome === 'throwing') {
                    throw new Error('Rejected pending composition');
                  }
                  return state.transaction(() => {});
                }
                return next();
              }),
            ],
          }),
        ]
      );
      const mounted = mountEditor(editor);
      try {
        await placeCaretAtEnd(mounted, 0);
        const ime = composeIn(mounted, 0);
        await ime.start();
        await ime.update('한');
        await act(async () => {
          editor.update((tx) =>
            tx.nodes.set({ type: 'heading-one' }, { at: [0] })
          );
          if (outcome === 'throwing') {
            expect(() =>
              mounted.runtime.finishAndroidComposition('settle')
            ).toThrow('Rejected pending composition');
          } else mounted.runtime.finishAndroidComposition('settle');
          await wait(100);
        });
        expect({
          inputs,
          model: blockText(editor, 0),
          dom: mounted.block(0).textContent,
          composing: mounted.runtime.state.isComposing,
        }).toEqual({
          inputs: ['한'],
          model: 'abc',
          dom: 'abc',
          composing: false,
        });
        fail = false;
        const next = composeIn(mounted, 0);
        await next.start();
        await next.update('x');
        await next.end();
        expect({ inputs, model: blockText(editor, 0) }).toEqual({
          inputs: ['한', 'x'],
          model: 'abcx',
        });
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  test('repeated text replaces both ends of the initial selection', async () => {
    const inputs: Array<{ text: string; range: unknown }> = [];
    const editor = createParagraphs(
      ['aaa'],
      [
        definePlugin('android-range', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, next }) => {
              inputs.push({ text: input.text, range: input.options?.at });
              return next();
            }),
          ],
        }),
      ]
    );
    const mounted = mountEditor(editor);
    try {
      const text = firstTextNode(mounted.block(0))!;
      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 0, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await act(async () => {
        fireEvent.compositionStart(mounted.root, { data: '' });
        text.data = 'aa';
        document.getSelection()!.setBaseAndExtent(text, 1, text, 1);
        fireEvent.compositionEnd(mounted.root, { data: 'a' });
        await wait(100);
      });
      expect({
        inputs,
        model: blockText(editor, 0),
        selection: editor.read((state) => state.selection()),
      }).toEqual({
        inputs: [
          {
            text: 'a',
            range: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 2 },
            },
          },
        ],
        model: 'aa',
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
      await nativeInput(mounted.root, {
        cancelable: true,
        inputType: 'insertText',
        data: 'x',
      });
      expect(blockText(editor, 0)).toBe('axa');
    } finally {
      mounted.rendered.unmount();
    }
  });

  test('selectionchange inside the composing line preserves the base selection', async () => {
    const mounted = mount(['abcd']);
    try {
      const text = firstTextNode(mounted.block(0))!;
      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(text, 2, text, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      const ime = composeIn(mounted, 0);
      await ime.start();
      await ime.update('한');
      await act(async () => {
        document.getSelection()!.setBaseAndExtent(ime.text, 1, ime.text, 1);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      expect(
        {
          model: blockText(mounted.editor, 0),
          selection: mounted.editor.read((state) => state.selection()),
          nativeOffset: document.getSelection()!.focusOffset,
          nativeText: document.getSelection()!.focusNode?.textContent,
        },
        'selectionchange must preserve the base model selection'
      ).toEqual({
        model: 'abcd',
        selection: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
        nativeOffset: 1,
        nativeText: 'ab한cd',
      });
      await ime.end();
      await act(async () => {
        mounted.runtime.settleInput();
        await wait(60);
      });
      expect(
        mounted.editor.read((state) => state.selection()),
        'selectionchange must preserve the committed model caret'
      ).toEqual({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
      await nativeInput(mounted.root, {
        cancelable: true,
        inputType: 'insertText',
        data: 'x',
      });
      expect(blockText(mounted.editor, 0)).toBe('ab한xcd');
    } finally {
      mounted.rendered.unmount();
    }
  });
});

describe('Android composition over a selection', () => {
  test.each(['accepted', 'rejected'] as const)(
    'a native replacement across a nested block is %s without losing its DOM owner',
    async (outcome) => {
      const inputs: string[] = [];
      const editor = createEditor({
        initialValue: [
          { type: 'paragraph', children: [{ text: 'abc' }] },
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'M' }] }],
          },
          { type: 'paragraph', children: [{ text: 'def' }] },
        ],
        plugins: [
          history(),
          definePlugin('android-nested-replacement', {
            commands: ({ around }) => [
              around(editorCommands.insertText, ({ input, next, state }) => {
                inputs.push(input.text);
                return outcome === 'rejected' && input.text === '한'
                  ? state.transaction(() => {})
                  : next();
              }),
            ],
          }),
        ],
      });
      const mounted = mountEditor(editor);
      const original = editor.read((state) => state.children());

      try {
        const first = firstTextNode(mounted.block(0))!;
        const last = firstTextNode(mounted.block(2))!;
        const nested = mounted.block(1);
        await act(async () => {
          mounted.root.focus();
          document.getSelection()!.setBaseAndExtent(first, 1, last, 2);
          document.dispatchEvent(new Event('selectionchange'));
          await wait(100);
        });
        await act(async () => {
          fireEvent.compositionStart(mounted.root, { data: '' });
          first.data = 'a한f';
          nested.remove();
          mounted.block(2).remove();
          document.getSelection()!.setBaseAndExtent(first, 2, first, 2);
          fireEvent.compositionUpdate(mounted.root, { data: '한' });
          await wait(20);
          fireEvent.compositionEnd(mounted.root, { data: '한' });
          await wait(100);
        });
        expect({
          inputs,
          model: editor.read((state) => state.children()),
          dom: mounted.root.textContent,
        }).toEqual({
          inputs: ['한'],
          model:
            outcome === 'rejected'
              ? original
              : [{ type: 'paragraph', children: [{ text: 'a한f' }] }],
          dom: outcome === 'rejected' ? 'abcMdef' : 'a한f',
        });
        if (outcome === 'rejected') expect(mounted.block(1)).toBe(nested);
        else {
          await act(async () => {
            editor.api.history.undo();
            await wait(60);
          });
          expect({
            model: editor.read((state) => state.children()),
            dom: mounted.root.textContent,
          }).toEqual({ model: original, dom: 'abcMdef' });
          await act(async () => {
            editor.api.history.redo();
            await wait(60);
          });
          expect(mounted.root.textContent).toBe('a한f');
        }
        await nativeInput(mounted.root, {
          cancelable: true,
          inputType: 'insertText',
          data: 'x',
        });
        expect({
          model: blockText(editor, 0),
          dom: mounted.root.textContent,
        }).toEqual({
          model: outcome === 'rejected' ? 'axf' : 'a한xf',
          dom: outcome === 'rejected' ? 'axf' : 'a한xf',
        });
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  test.each([false, true])(
    'removing only a paragraph boundary commits its directed range once (reverse %s)',
    async (reverse) => {
      const inputs: Array<{ range: unknown; text: string }> = [];
      const editor = createParagraphs(
        ['abc', 'def'],
        [
          history(),
          definePlugin('android-boundary', {
            commands: ({ around }) => [
              around(editorCommands.insertText, ({ input, next }) => {
                inputs.push({ range: input.options?.at, text: input.text });
                return next();
              }),
            ],
          }),
        ]
      );
      const mounted = mountEditor(editor);
      const blocks = () =>
        editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        );

      try {
        const first = firstTextNode(mounted.block(0))!;
        const second = firstTextNode(mounted.block(1))!;
        await act(async () => {
          mounted.root.focus();
          document
            .getSelection()!
            .setBaseAndExtent(
              reverse ? second : first,
              reverse ? 0 : 3,
              reverse ? first : second,
              reverse ? 3 : 0
            );
          document.dispatchEvent(new Event('selectionchange'));
          await wait(100);
        });
        await act(async () => {
          fireEvent.compositionStart(mounted.root, { data: '' });
          first.data = 'abc한def';
          mounted.block(1).remove();
          document.getSelection()!.setBaseAndExtent(first, 4, first, 4);
          fireEvent.compositionUpdate(mounted.root, { data: '한' });
          first.data = 'abcdef';
          document.getSelection()!.setBaseAndExtent(first, 3, first, 3);
          fireEvent.compositionEnd(mounted.root, { data: '' });
          await wait(100);
        });
        expect({
          blocks: blocks(),
          inputs,
          dom: mounted.block(0).textContent,
          selection: editor.read((state) => state.selection()),
        }).toEqual({
          blocks: ['abcdef'],
          inputs: [
            {
              range: {
                anchor: {
                  path: reverse ? [1, 0] : [0, 0],
                  offset: reverse ? 0 : 3,
                },
                focus: {
                  path: reverse ? [0, 0] : [1, 0],
                  offset: reverse ? 3 : 0,
                },
              },
              text: '',
            },
          ],
          dom: 'abcdef',
          selection: {
            anchor: { path: [0, 0], offset: 3 },
            focus: { path: [0, 0], offset: 3 },
          },
        });
        await act(async () => {
          editor.api.history.undo();
          await wait(60);
        });
        expect(blocks()).toEqual(['abc', 'def']);
        await act(async () => {
          editor.api.history.redo();
          await wait(60);
        });
        expect(blocks()).toEqual(['abcdef']);
        await nativeInput(mounted.root, {
          cancelable: true,
          inputType: 'insertText',
          data: 'x',
        });
        expect(blocks()).toEqual(['abcxdef']);
      } finally {
        mounted.rendered.unmount();
      }
    }
  );

  const markedLine = <const TPlugins extends readonly unknown[] = readonly []>(
    plugins?: TPlugins
  ) =>
    createEditor({
      initialValue: [
        {
          children: [{ text: 'ab' }, { bold: true, text: 'cd' }],
          type: 'paragraph',
        },
        { children: [{ text: 'second' }], type: 'paragraph' },
      ],
      plugins,
    });

  // Chrome deletes the selected text itself, then composes at the caret.
  const composeOverLeaves = async (
    mounted: Pick<ReturnType<typeof mount>, 'block' | 'root'>
  ) => {
    const [first, second] = [
      ...mounted.block(0).querySelectorAll('[data-editor-string]'),
    ].map((element) => firstTextNode(element)!);

    await act(async () => {
      mounted.root.focus();
      document.getSelection()!.setBaseAndExtent(first, 1, second, 1);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
    });
    await act(async () => {
      fireEvent.compositionStart(mounted.root, { data: '' });
      first.deleteData(1, 1);
      second.deleteData(0, 1);
      document.getSelection()!.setBaseAndExtent(first, 1, first, 1);
    });

    const ime = composeIn(mounted, 0, { from: 1 });

    await ime.update('한');
    await ime.end();
  };

  test('across two leaves, one command replaces it and the first leaf keeps its marks', async () => {
    const editor = markedLine();
    const mounted = mountEditor(editor);

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
          handle(editorCommands.insertText, ({ state }) =>
            state.transaction(() => {})
          ),
        ],
      }),
    ]);
    const mounted = mountEditor(editor);

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

  test.each([false, true])(
    'across two blocks, the model waits for one replacement and undo restores both blocks (reverse %s)',
    async (reverse) => {
      const editor = createParagraphs(['abc', 'def'], [history()]);
      const mounted = mountEditor(editor);
      let commits = 0;
      const release = editor.subscribeCommit((commit) => {
        if (commit.changed.hasAny('document')) commits += 1;
      });
      const blocks = () =>
        editor.read((state) =>
          state.nodes.children().map((_, index) => state.text.string([index]))
        );

      try {
        const first = firstTextNode(mounted.block(0))!;
        const second = firstTextNode(mounted.block(1))!;

        await act(async () => {
          mounted.root.focus();
          document
            .getSelection()!
            .setBaseAndExtent(
              reverse ? second : first,
              reverse ? 2 : 1,
              reverse ? first : second,
              reverse ? 1 : 2
            );
          document.dispatchEvent(new Event('selectionchange'));
          await wait(100);
        });
        await act(async () => {
          fireEvent.compositionStart(mounted.root, { data: '' });
          await wait(60);
        });
        expect({ blocks: blocks(), commits }).toEqual({
          blocks: ['abc', 'def'],
          commits: 0,
        });
        await act(async () => {
          first.data = 'af';
          mounted.block(1).remove();
          document.getSelection()!.setBaseAndExtent(first, 1, first, 1);
        });
        const ime = composeIn(mounted, 0);

        await ime.update('한');
        expect({ blocks: blocks(), commits }).toEqual({
          blocks: ['abc', 'def'],
          commits: 0,
        });
        await ime.end();
        expect({
          blocks: blocks(),
          commits,
          dom: mounted.block(0).textContent,
          selection: editor.read((state) => state.selection()),
        }).toEqual({
          blocks: ['a한f'],
          commits: 1,
          dom: 'a한f',
          selection: {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          },
        });
        await act(async () => {
          editor.api.history.undo();
          await wait(60);
        });
        expect(blocks()).toEqual(['abc', 'def']);
        await act(async () => {
          editor.api.history.redo();
          await wait(60);
        });
        expect(blocks()).toEqual(['a한f']);
      } finally {
        release();
        mounted.rendered.unmount();
      }
    }
  );
});

describe('Android composition ends when the user leaves the draft', () => {
  test('leaving a draft across blocks keeps the caret in the tapped surviving block', async () => {
    const mounted = mount(['abc', 'def', 'tapped', 'untouched']);

    try {
      const first = firstTextNode(mounted.block(0))!;
      const second = firstTextNode(mounted.block(1))!;
      const tapped = firstTextNode(mounted.block(2))!;

      await act(async () => {
        mounted.root.focus();
        document.getSelection()!.setBaseAndExtent(first, 1, second, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });
      await act(async () => {
        fireEvent.compositionStart(mounted.root, { data: '' });
        first.data = 'a한f';
        mounted.block(1).remove();
        document.getSelection()!.setBaseAndExtent(first, 2, first, 2);
        fireEvent.compositionUpdate(mounted.root, { data: '한' });
        document.getSelection()!.setBaseAndExtent(tapped, 2, tapped, 2);
        document.dispatchEvent(new Event('selectionchange'));
        await wait(100);
      });

      expect({
        model: mounted.editor.read((state) => state.children()),
        selection: mounted.editor.read((state) => state.selection()),
        nativeText: document.getSelection()!.focusNode?.textContent,
        nativeOffset: document.getSelection()!.focusOffset,
      }).toEqual({
        model: [
          { type: 'paragraph', children: [{ text: 'a한f' }] },
          { type: 'paragraph', children: [{ text: 'tapped' }] },
          { type: 'paragraph', children: [{ text: 'untouched' }] },
        ],
        selection: {
          anchor: { path: [1, 0], offset: 2 },
          focus: { path: [1, 0], offset: 2 },
        },
        nativeText: 'tapped',
        nativeOffset: 2,
      });
      await nativeInput(mounted.root, {
        cancelable: true,
        data: 'x',
        inputType: 'insertText',
      });
      expect(blockText(mounted.editor, 1)).toBe('taxpped');
    } finally {
      mounted.rendered.unmount();
    }
  });

  const draftThen = async (
    leave: (mounted: ReturnType<typeof mount>) => void
  ) => {
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
        Object.defineProperty(
          Document.prototype,
          'visibilityState',
          visibility
        );
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
    const local = createYjsPeerWithEditor(editor, {
      children,
      clientId: 'local',
    });
    const remote = createYjsPeerWithEditor(
      createParagraphs(texts, [history()]),
      {
        children,
        clientId: 'remote',
        seedUpdate: Y.encodeStateAsUpdate(local.doc),
      }
    );
    const mounted = mountEditor(editor);
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
        tx.nodes.set({ type: 'heading-one' }, { at: [0] })
      );
      await sync();
      await sync();

      const read = <V extends Value, const TPlugins extends readonly unknown[]>(
        editor: Editor<V, TPlugins>
      ) =>
        editor.read((state) => [
          (state.nodes.get([0])?.[0] as { type?: string } | undefined)?.type,
          state.text.string([0]),
        ]);

      expect({
        local: read(mounted.editor),
        remote: read(remote.editor),
      }).toEqual({
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
    const local = createYjsPeerWithEditor(editor, {
      children,
      clientId: 'local',
    });
    const remote = createYjsPeerWithEditor(
      createParagraphs(['ab', 'second'], [history()]),
      {
        children,
        clientId: 'remote',
        seedUpdate: Y.encodeStateAsUpdate(local.doc),
      }
    );
    const mounted = mountEditor(editor);
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
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 2, path: [0, 0] },
          },
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
        undone: {
          local: blockText(mounted.editor, 0),
          remote: blockText(remote.editor, 0),
        },
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

      const host = mounted.block(1).querySelector('[data-editor-node="text"]');

      expect(host?.isConnected).toBe(true);
    } finally {
      mounted.rendered.unmount();
    }
  });
});
