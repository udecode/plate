import { act, fireEvent, render } from '@testing-library/react';
import { useSyncExternalStore } from 'react';

import {
  defineEditorSchema,
  defineEffect,
  definePlugin,
  defineStateField,
  editorCommands,
  schema,
  SelectionApi,
  TextApi,
  type Value,
} from '../../src';
import { createAuthoredPlugin } from '../../src/authored';
import { history } from '../../src/history';
import {
  createEditor,
  type DecorationSource,
  Editable,
  EditorRoot,
  type RenderLeafProps,
} from '../../src/react';
import { DECORATION_REFRESH_DEADLINE_MS } from '../../src/react/decoration-source';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';

// Desktop browsers dispatch `beforeinput`; without it React's polyfill turns
// compositionend into a second insert.
Object.defineProperty(InputEvent.prototype, 'getTargetRanges', {
  configurable: true,
  value: () => [],
});

type Shape = 'custom leaf' | 'text flow';

const SHAPES: readonly Shape[] = ['text flow', 'custom leaf'];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const inlineSchema = defineEditorSchema('schema:composition-lease', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  id: 'composition-lease',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const badgeStore = (() => {
  let tick = 0;
  const listeners = new Set<() => void>();

  return {
    bump: () => {
      tick += 1;
      for (const listener of listeners) listener();
    },
    read: () => tick,
    reset: () => {
      tick = 0;
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
})();

const StoreBadge = () => {
  const tick = useSyncExternalStore(badgeStore.subscribe, badgeStore.read);

  return <em contentEditable={false}>{`*${tick}`}</em>;
};

const renderCustomLeaf = ({ attributes, children, leaf }: RenderLeafProps) => (
  <span {...attributes}>
    {leaf.bold ? <strong>{children}</strong> : children}
    {(leaf as { badge?: boolean }).badge ? <StoreBadge /> : null}
  </span>
);

const fixedDecorations = (
  ranges: ReadonlyArray<readonly [number, number]>,
  at = '0,0'
): DecorationSource => ({
  id: 'composition-lease-decorations',
  read: ({ entry: [node, path] }) => {
    if (!TextApi.isText(node) || path.join(',') !== at) return [];

    return ranges.map(([from, to], index) => ({
      attributes: { 'data-deco': String(index) },
      key: `deco-${index}`,
      range: { anchor: { offset: from, path }, focus: { offset: to, path } },
    }));
  },
});

type Hooks = { onCompositionEnd?: () => boolean | void };

const Surface = ({
  decorations,
  editor,
  hooks,
  readOnly = false,
  shape,
}: {
  decorations?: DecorationSource;
  editor: ReturnType<typeof createEditor>;
  hooks?: Hooks;
  readOnly?: boolean;
  shape: Shape;
}) => (
  <EditorRoot
    decorations={decorations ? [decorations] : undefined}
    editor={editor}
  >
    <Editable
      onCompositionEnd={() => hooks?.onCompositionEnd?.()}
      readOnly={readOnly}
      renderLeaf={shape === 'custom leaf' ? renderCustomLeaf : undefined}
      scrollSelectionIntoView={() => {}}
    />
  </EditorRoot>
);

const normalizeHTML = (html: string) =>
  html
    .replaceAll(/ data-editor-node-key="[^"]*"/g, '')
    .replaceAll(/ data-editor-text-flow-(?!host)[a-z-]+="[^"]*"/g, '');

const readTextNodes = (element: Element | null) => {
  const values: string[] = [];

  if (!element) return values;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    values.push(node.nodeValue ?? '');
  }

  return values;
};

const readBlocks = (root: Element) =>
  [...root.querySelectorAll(':scope > [data-editor-node="element"]')].map(
    (element) => ({
      html: normalizeHTML(element.innerHTML),
      texts: readTextNodes(element),
    })
  );

const renderFresh = async ({
  decorations,
  plugins,
  shape,
  value,
}: {
  decorations?: DecorationSource;
  plugins?: readonly unknown[];
  shape: Shape;
  value: Value;
}) => {
  const editor = createEditor({
    initialValue: structuredClone(value),
    plugins,
  });

  editor.install(inlineSchema);
  const rendered = render(
    <Surface decorations={decorations} editor={editor} shape={shape} />
  );

  await act(async () => {
    await wait(30);
  });
  const blocks = readBlocks(
    rendered.container.querySelector<HTMLElement>('[data-editor]')!
  );

  rendered.unmount();
  return blocks;
};

type Point = { offset: number; path: number[] };

const mount = async ({
  anchor,
  decorations,
  focus = anchor,
  marks,
  plugins,
  shape,
  value,
}: {
  anchor: Point;
  decorations?: DecorationSource;
  focus?: Point;
  marks?: Record<string, true>;
  plugins?: readonly unknown[];
  shape: Shape;
  value: Value;
}) => {
  badgeStore.reset();
  const editor = createEditor({
    initialValue: structuredClone(value),
    plugins,
  });
  const hooks: Hooks = {};

  editor.install(inlineSchema);
  const rendered = render(
    <Surface
      decorations={decorations}
      editor={editor}
      hooks={hooks}
      shape={shape}
    />
  );
  const root = rendered.container.querySelector<HTMLElement>('[data-editor]')!;

  Object.defineProperty(root, 'isContentEditable', { value: true });
  const runtime = findMountedEditableDOMRuntime(root)!;
  const selection = document.getSelection()!;

  await act(async () => {
    root.focus();
    runtime.editor.update((tx) => {
      tx.selection.set({ anchor, focus });
      for (const mark of Object.keys(marks ?? {})) tx.marks.add(mark, true);
    });
    await wait(60);
  });

  const readModel = () =>
    editor.read((state) => structuredClone(state.children()));
  const block = (index: number) =>
    root.querySelector(
      `:scope > [data-editor-node="element"][data-editor-path="${index}"]`
    );

  return {
    block,
    editor,
    async freshAndLive() {
      if (decorations) {
        await act(async () => {
          await wait(DECORATION_REFRESH_DEADLINE_MS + 50);
        });
      }
      const live = readBlocks(root);
      const fresh = await renderFresh({
        decorations,
        plugins,
        shape,
        value: readModel(),
      });

      return { fresh, live };
    },
    hooks,
    readModel,
    rendered,
    root,
    runtime,
    selection,
    setReadOnly(readOnly: boolean) {
      rendered.rerender(
        <Surface
          decorations={decorations}
          editor={editor}
          hooks={hooks}
          readOnly={readOnly}
          shape={shape}
        />
      );
    },
    textNode(blockIndex: number, nth: number) {
      const walker = document.createTreeWalker(
        block(blockIndex)!,
        NodeFilter.SHOW_TEXT
      );
      let node = walker.nextNode();

      for (let index = 0; index < nth; index += 1) node = walker.nextNode();
      return node as globalThis.Text;
    },
  };
};

type Mounted = Awaited<ReturnType<typeof mount>>;

const lastText = (
  node: globalThis.Node | undefined
): globalThis.Text | null => {
  if (!node) return null;
  if (node instanceof Text) return node;
  for (let child = node.lastChild; child; child = child.previousSibling) {
    if (child instanceof Element && child.hasAttribute('contenteditable')) {
      continue;
    }
    const text = lastText(child);

    if (text) return text;
  }
  return null;
};

const compose = (m: Mounted) => {
  let drawNode: globalThis.Text | null = null;
  let drawOffset = 0;
  let drawnLength = 0;

  const write = (preedit: string) => {
    if (!drawNode) throw new Error('The composition has no text to draw in');
    drawNode.replaceData(drawOffset, drawnLength, preedit);
    drawnLength = preedit.length;
    m.selection.setBaseAndExtent(
      drawNode,
      drawOffset + preedit.length,
      drawNode,
      drawOffset + preedit.length
    );
  };
  const draw = (preedit: string) => {
    fireEvent.compositionUpdate(m.root, { data: preedit });
    m.root.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        data: preedit,
        inputType: 'insertCompositionText',
        isComposing: true,
      })
    );
    write(preedit);
    fireEvent.input(m.root, {
      data: preedit,
      inputType: 'insertCompositionText',
      isComposing: true,
    });
  };

  return {
    draw,
    get drawNode() {
      return drawNode;
    },
    async drawAll(preedits: readonly string[]) {
      for (const preedit of preedits) {
        await act(async () => {
          draw(preedit);
          await wait(20);
        });
      }
    },
    start() {
      fireEvent.compositionStart(m.root);
      const range =
        m.selection.rangeCount > 0 ? m.selection.getRangeAt(0) : null;

      if (range && !range.collapsed) {
        range.deleteContents();
        m.selection.collapse(range.startContainer, range.startOffset);
      }
      const node = m.selection.focusNode;
      const offset = m.selection.focusOffset;

      if (node instanceof Text) {
        drawNode = node;
        drawOffset = offset;
        return;
      }
      const textBefore =
        node instanceof Element ? lastText(node.childNodes[offset - 1]) : null;

      if (textBefore) {
        drawNode = textBefore;
        drawOffset = textBefore.length;
        return;
      }
      // Chrome replaces an empty line's placeholder with the preedit.
      const placeholder =
        node instanceof Element
          ? (node.closest('[data-editor-zero-width]') ??
            node.querySelector('[data-editor-zero-width]'))
          : null;

      if (!placeholder) {
        throw new Error(
          `The composition has no caret: ${node?.nodeName} ${offset} in ${m.root.innerHTML}`
        );
      }
      drawNode = document.createTextNode('');
      placeholder.replaceWith(drawNode);
      drawOffset = 0;
    },
    write,
  };
};

const startComposing = async (
  m: Mounted,
  preedits: readonly string[],
  domCaret?: { node: globalThis.Text; offset: number }
) => {
  const ime = compose(m);

  await act(async () => {
    if (domCaret) {
      m.selection.setBaseAndExtent(
        domCaret.node,
        domCaret.offset,
        domCaret.node,
        domCaret.offset
      );
    }
    ime.start();
  });
  await ime.drawAll(preedits);
  return ime;
};

const endComposition = async (m: Mounted, data: string) => {
  await act(async () => {
    fireEvent.compositionEnd(m.root, { data });
    await wait(60);
  });
};

const watchEditorWrites = (m: Mounted, element: () => Element | null) => {
  const writes: string[] = [];
  const target = element();
  const take = (records: MutationRecord[]) => {
    for (const record of records) {
      if (
        target?.contains(record.target) ||
        [...record.removedNodes].includes(target!)
      ) {
        writes.push(`${record.type} ${record.target.textContent}`);
      }
    }
  };
  const observer = new MutationObserver(take);

  observer.observe(m.root, {
    characterData: true,
    childList: true,
    subtree: true,
  });

  return {
    browser(callback: () => void) {
      take(observer.takeRecords());
      callback();
      observer.takeRecords();
    },
    stop() {
      take(observer.takeRecords());
      observer.disconnect();
      return writes;
    },
  };
};

const readBlockText = (value: Value, index: number) =>
  (
    value[index] as unknown as {
      children: Array<{ children?: Array<{ text: string }>; text?: string }>;
    }
  ).children
    .map(
      (child) =>
        child.text ?? child.children?.map(({ text }) => text).join('') ?? ''
    )
    .join('');

const paragraph = (...children: Array<Record<string, unknown>>) =>
  ({ children, type: 'paragraph' }) as unknown as Value[number];

const BASE_VALUE: Value = [
  paragraph({ text: 'abc' }, { italic: true, text: 'def' }),
  paragraph({ text: 'second' }),
];

const at = (path: number[], offset: number) => ({ offset, path });

const rewriteLandedWord = (m: Mounted, word: string, rewrite: string) => {
  const landed = readBlockText(m.readModel(), 0).indexOf(word);

  m.editor.update((tx) => {
    tx.text.delete({
      at: {
        anchor: at([0, 0], landed),
        focus: at([0, 0], landed + word.length),
      },
    });
    tx.text.insert(rewrite, { at: at([0, 0], landed) });
  });
};

describe.each(SHAPES)('composition lease in %s', (shape) => {
  test('keeps the drawn text node when the word lands where the browser drew it', async () => {
    const m = await mount({
      anchor: at([0, 0], 1),
      shape,
      value: [paragraph({ text: 'abc' }), paragraph({ text: 'second' })],
    });

    try {
      const ime = await startComposing(m, ['k', 'か']);
      const drawn = ime.drawNode!;
      const writes = watchEditorWrites(m, () => drawn.parentElement);

      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({
        connected: drawn.isConnected,
        live,
        model: readBlockText(m.readModel(), 0),
        value: drawn.nodeValue,
        writes: shape === 'text flow' ? writes.stop() : [],
      }).toEqual({
        connected: true,
        live: fresh,
        model: 'aかbc',
        value: 'aかbc',
        writes: [],
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test.each([
    { name: 'refuses the word', write: () => {}, expected: 'abcdef' },
    {
      name: 'rewrites the word',
      write: (m: Mounted) =>
        m.editor.update((tx) => tx.text.insert('カ', { at: at([0, 0], 1) })),
      expected: 'aカbcdef',
    },
    {
      name: 'moves the word to the next line',
      write: (m: Mounted) =>
        m.editor.update((tx) => tx.text.insert('か', { at: at([1, 0], 0) })),
      expected: 'abcdef',
    },
  ])(
    'the line shows the model when the commit $name',
    async ({ expected, write }) => {
      const m = await mount({
        anchor: at([0, 0], 1),
        shape,
        value: BASE_VALUE,
      });

      m.hooks.onCompositionEnd = () => {
        write(m);
        return true;
      };
      try {
        await startComposing(m, ['k', 'か']);
        await endComposition(m, 'か');
        const { fresh, live } = await m.freshAndLive();

        expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
          live: fresh,
          model: expected,
        });
      } finally {
        m.rendered.unmount();
      }
    }
  );

  test.each([
    { name: 'lands in place', moved: false, refused: false },
    { name: 'is refused', moved: false, refused: true },
    { name: 'moves', moved: true, refused: false },
  ])(
    'a mark change mid-composition leaves the line matching the model when the word $name',
    async ({ moved, refused }) => {
      const m = await mount({
        anchor: at([0, 0], 1),
        shape,
        value: BASE_VALUE,
      });

      if (moved || refused) {
        m.hooks.onCompositionEnd = () => {
          if (moved) {
            m.editor.update((tx) =>
              tx.text.insert('か', { at: at([1, 0], 0) })
            );
          }
          return true;
        };
      }
      try {
        await startComposing(m, ['k', 'か']);
        await act(async () => {
          m.editor.update((tx) =>
            tx.nodes.set(
              { bold: true },
              {
                at: { anchor: at([0, 0], 2), focus: at([0, 0], 3) },
                match: TextApi.isText,
                split: true,
              }
            )
          );
          await wait(40);
        });
        await endComposition(m, 'か');
        const { fresh, live } = await m.freshAndLive();

        expect(live).toEqual(fresh);
      } finally {
        m.rendered.unmount();
      }
    }
  );

  test.each(['first', 'second'] as const)(
    'a decorated こ|こ shows こ|こ|こ when the word lands at the %s segment edge',
    async (segment) => {
      const decorations = fixedDecorations([[1, 2]]);
      const m = await mount({
        anchor: at([0, 0], 1),
        decorations,
        shape,
        value: [paragraph({ text: 'ここ' })],
      });

      try {
        const first = m.textNode(0, 0);
        const second = m.textNode(0, 1);

        await startComposing(
          m,
          ['こ'],
          segment === 'first'
            ? { node: first, offset: first.length }
            : { node: second, offset: 0 }
        );
        await endComposition(m, 'こ');
        const { fresh, live } = await m.freshAndLive();

        expect({ live, texts: live[0].texts }).toEqual({
          live: fresh,
          texts: ['こ', 'こ', 'こ'],
        });
      } finally {
        m.rendered.unmount();
      }
    }
  );

  test('a unique letter drawn at a decoration segment end shows once', async () => {
    const decorations = fixedDecorations([[1, 2]]);
    const m = await mount({
      anchor: at([0, 0], 1),
      decorations,
      shape,
      value: [paragraph({ text: 'ab' })],
    });

    try {
      const first = m.textNode(0, 0);

      await startComposing(m, ['か'], { node: first, offset: first.length });
      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, text: m.block(0)?.textContent }).toEqual({
        live: fresh,
        text: 'aかb',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test.each([
    { offset: 2, text: 'abか' },
    { offset: 0, text: 'かab' },
  ])(
    'a word drawn at offset $offset of a leaf one decoration covers shows once',
    async ({ offset, text }) => {
      const decorations = fixedDecorations([[0, 2]]);
      const m = await mount({
        anchor: at([0, 0], offset),
        decorations,
        shape,
        value: [paragraph({ text: 'ab' })],
      });

      try {
        await startComposing(m, ['か']);
        await endComposition(m, 'か');
        const committed = m.block(0)?.textContent;
        const { fresh, live } = await m.freshAndLive();

        expect({ committed, live, text: m.block(0)?.textContent }).toEqual({
          committed: text,
          live: fresh,
          text,
        });
      } finally {
        m.rendered.unmount();
      }
    }
  );

  test('leaves a decorated host the composition did not touch', async () => {
    const decorations = fixedDecorations([
      [0, 2],
      [2, 4],
      [4, 6],
    ]);
    const m = await mount({
      anchor: at([0, 1], 1),
      decorations,
      shape,
      value: [paragraph({ bold: true, text: 'goすしne' }, { text: ' beta' })],
    });

    try {
      await startComposing(m, ['す', 'すし']);
      await endComposition(m, 'すし');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, text: m.block(0)?.textContent }).toEqual({
        live: fresh,
        text: 'goすしne すしbeta',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('leaves an untouched line whose decorated text equals the word', async () => {
    const decorations = fixedDecorations([[0, 2]]);
    const m = await mount({
      anchor: at([1, 0], 1),
      decorations,
      shape,
      value: [paragraph({ text: 'すし好き' }), paragraph({ text: 'ab' })],
    });

    try {
      await startComposing(m, ['す', 'すし']);
      await endComposition(m, 'すし');
      const { fresh, live } = await m.freshAndLive();

      expect({ first: live[0].texts, live }).toEqual({
        first: ['すし', '好き'],
        live: fresh,
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('takes a repeated letter back out of the segment the browser drew it in', async () => {
    const decorations = fixedDecorations([[1, 2]]);
    const m = await mount({
      anchor: at([0, 0], 2),
      decorations,
      shape,
      value: [paragraph({ text: 'ここ' }), paragraph({ text: 'tail' })],
    });

    m.hooks.onCompositionEnd = () => {
      m.editor.update((tx) => tx.text.insert('こ', { at: at([1, 0], 0) }));
      return true;
    };
    try {
      const second = m.textNode(0, 1);

      await startComposing(m, ['こ'], { node: second, offset: second.length });
      await endComposition(m, 'こ');
      const { fresh, live } = await m.freshAndLive();

      expect({ first: live[0].texts, live }).toEqual({
        first: ['こ', 'こ'],
        live: fresh,
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a word that lands after a decorated leaf leaves no copy in it', async () => {
    const decorations = fixedDecorations([[0, 2]]);
    const m = await mount({
      anchor: at([0, 0], 4),
      decorations,
      shape,
      value: [paragraph({ text: 'Link' }, { italic: true, text: ' after' })],
    });

    m.hooks.onCompositionEnd = () => {
      m.editor.update((tx) => tx.text.insert('文', { at: at([0, 1], 0) }));
      return true;
    };
    try {
      await startComposing(m, ['文']);
      await endComposition(m, '文');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, text: m.block(0)?.textContent }).toEqual({
        live: fresh,
        text: 'Link文 after',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a word that lands as a new leaf before the drawn host leaves no copy in it', async () => {
    const m = await mount({
      anchor: at([0, 0], 5),
      marks: { italic: true },
      shape,
      value: [paragraph({ bold: true, text: 'Alpha' }, { text: ' beta' })],
    });

    try {
      await startComposing(m, ['す', 'すし'], {
        node: m.textNode(0, 1),
        offset: 0,
      });
      await endComposition(m, 'すし');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, text: m.block(0)?.textContent }).toEqual({
        live: fresh,
        text: 'Alphaすし beta',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a caret drawn at the next leaf start shows the word once', async () => {
    const m = await mount({ anchor: at([0, 0], 3), shape, value: BASE_VALUE });

    try {
      await startComposing(m, ['k', 'か'], {
        node: m.textNode(0, 1),
        offset: 0,
      });
      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'abcかdef',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('the first syllable on an empty line shows once', async () => {
    const m = await mount({
      anchor: at([0, 0], 0),
      shape,
      value: [paragraph({ text: '' }), paragraph({ text: 'second' })],
    });

    try {
      await startComposing(m, ['k', 'か']);
      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'か',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a reconversion across a leaf edge shows the word once', async () => {
    const m = await mount({
      anchor: at([0, 0], 2),
      focus: at([0, 1], 1),
      shape,
      value: BASE_VALUE,
    });

    try {
      await startComposing(m, ['か']);
      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'abかef',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a Korean backspace that recomposes a syllable shows it once', async () => {
    const m = await mount({
      anchor: at([0, 0], 1),
      focus: at([0, 0], 2),
      shape,
      value: [paragraph({ text: '한글' })],
    });

    try {
      await startComposing(m, ['그']);
      await endComposition(m, '그');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: '한그',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('Safari’s direct route writes nothing in the drawn host before compositionend', async () => {
    const m = await mount({ anchor: at([0, 0], 1), shape, value: BASE_VALUE });

    try {
      const ime = await startComposing(m, ['k', 'か']);
      const host = ime.drawNode!.parentElement!.closest(
        '[data-editor-node="text"]'
      );
      const writes = watchEditorWrites(m, () => host);

      await act(async () => {
        m.root.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data: 'か',
            inputType: 'insertFromComposition',
            isComposing: true,
          })
        );
        rewriteLandedWord(m, 'か', 'カ');
        // WebKit finalizes the preedit after the final input.
        writes.browser(() => ime.write('か'));
        await wait(20);
        fireEvent.keyDown(m.root, { key: 'ArrowRight' });
        m.editor.update((tx) => tx.text.insert('Z', { at: at([0, 0], 0) }));
        await wait(40);
      });
      const beforeEnd = writes.stop();

      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({
        live,
        model: readBlockText(m.readModel(), 0).replace('カ', ''),
        writesBeforeEnd: beforeEnd,
      }).toEqual({
        live: fresh,
        model: 'Zabcdef',
        writesBeforeEnd: [],
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test.each(['compositionend', 'compositionupdate'] as const)(
    'a composition that gets a read-only %s hands its line back to the model',
    async (event) => {
      const m = await mount({
        anchor: at([0, 0], 2),
        shape,
        value: [paragraph({ text: 'ab' })],
      });

      try {
        await startComposing(m, ['か']);
        await act(async () => {
          m.setReadOnly(true);
          await wait(20);
        });
        if (event === 'compositionend') {
          await endComposition(m, 'か');
        } else {
          await act(async () => {
            fireEvent.compositionUpdate(m.root, { data: 'か' });
            await wait(20);
          });
        }
        await act(async () => {
          m.setReadOnly(false);
          await wait(20);
        });
        await act(async () => {
          m.editor.update((tx) => tx.text.insert('X', { at: at([0, 0], 2) }));
          await wait(40);
        });
        const { fresh, live } = await m.freshAndLive();

        expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
          live: fresh,
          model: 'abX',
        });
      } finally {
        m.rendered.unmount();
      }
    }
  );

  test('a key after a composition with no compositionend applies the intent switch and hands the line back', async () => {
    const m = await mount({
      anchor: at([0, 0], 2),
      plugins: [
        createAuthoredPlugin({
          authorId: 'dan',
          createChangeId: () => 'dan:1',
          intent: 'edit',
          now: () => 1000,
        }),
      ],
      shape,
      value: [paragraph({ text: 'ab' })],
    });

    try {
      await startComposing(m, ['か']);
      await act(async () => {
        m.runtime.editor.api.authored.setView({ intent: 'propose' });
        await wait(20);
      });
      await act(async () => {
        fireEvent.keyDown(m.root, { key: 'ArrowRight' });
        await wait(20);
      });
      await act(async () => {
        m.runtime.editor.update((tx) => {
          tx.command(editorCommands.insertText, { text: 'z' });
        });
        await wait(40);
      });
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: m.readModel() }).toEqual({
        live: fresh,
        model: [
          paragraph(
            { text: 'ab' },
            {
              authored: [
                { at: 1000, author: 'dan', change: 'dan:1', kind: 'insert' },
              ],
              text: 'z',
            }
          ),
        ],
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a key between compositionend and its commit still commits the word', async () => {
    const m = await mount({
      anchor: at([0, 0], 2),
      shape,
      value: [paragraph({ text: 'ab' })],
    });

    try {
      await startComposing(m, ['か']);
      await act(async () => {
        fireEvent.compositionEnd(m.root, { data: 'か' });
        fireEvent.keyDown(m.root, { key: 'ArrowRight' });
        await wait(60);
      });
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'abか',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('a composition over a selection that crosses a link rebuilds the lines it covered', async () => {
    const m = await mount({
      anchor: at([0, 0], 2),
      focus: at([1, 0], 2),
      shape,
      value: [
        paragraph(
          { text: 'one ' },
          { children: [{ text: 'two' }], type: 'link' },
          { text: ' three' }
        ),
        paragraph({ text: 'four' }),
      ],
    });

    try {
      await startComposing(m, ['か']);
      await endComposition(m, 'か');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'onかur',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  test('two compositions in one task land in order', async () => {
    const m = await mount({
      anchor: at([0, 0], 1),
      marks: { bold: true },
      shape,
      value: BASE_VALUE,
    });

    try {
      const first = await startComposing(m, ['k', 'か']);
      let second: ReturnType<typeof compose> | null = null;

      await act(async () => {
        fireEvent.compositionEnd(m.root, { data: 'か' });
        second = compose(m);
        second.start();
        second.draw('き');
        await wait(40);
      });
      expect(first.drawNode).not.toBeNull();
      await endComposition(m, 'き');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'aかきbcdef',
      });
    } finally {
      m.rendered.unmount();
    }
  });
});

test('a badge that renders its own text inside the composing leaf rebuilds the line', async () => {
  const m = await mount({
    anchor: at([0, 0], 1),
    shape: 'custom leaf',
    value: [paragraph({ badge: true, text: 'abc' }), paragraph({ text: 'x' })],
  });

  try {
    const line = m.block(0);

    await startComposing(m, ['k', 'か']);
    await act(async () => {
      badgeStore.bump();
      await wait(20);
    });
    await endComposition(m, 'か');
    const { fresh, live } = await m.freshAndLive();

    expect({ live, rebuilt: m.block(0) !== line }).toEqual({
      live: fresh,
      rebuilt: true,
    });
  } finally {
    m.rendered.unmount();
  }
});

const QUERY_METHODS = [
  'closest',
  'getElementsByClassName',
  'getElementsByName',
  'getElementsByTagName',
  'getElementsByTagNameNS',
  'querySelector',
  'querySelectorAll',
] as const;

const TEXT_READS = [
  [Node.prototype, 'childNodes'],
  [Node.prototype, 'nodeValue'],
  [Node.prototype, 'textContent'],
  [CharacterData.prototype, 'data'],
] as const;

const countCommitWork = async (blocks: number) => {
  const m = await mount({
    anchor: at([0, 0], 1),
    shape: 'text flow',
    value: Array.from({ length: blocks }, (_, index) =>
      paragraph({ text: `line ${index}` })
    ),
  });
  const restores: Array<() => void> = [];

  try {
    await startComposing(m, ['か']);
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((batch) => records.push(...batch));
    const { closest } = Element.prototype;
    const hostsRead = new Set<Element>();
    let queries = 0;
    let queriedElements = 0;

    for (const owner of [
      Document.prototype,
      DocumentFragment.prototype,
      Element.prototype,
    ]) {
      for (const name of QUERY_METHODS) {
        const descriptor = Object.getOwnPropertyDescriptor(owner, name);
        const query = descriptor?.value as
          | ((...args: unknown[]) => Element | Iterable<Element> | null)
          | undefined;

        if (!descriptor || !query) continue;
        Object.defineProperty(owner, name, {
          ...descriptor,
          value(this: unknown, ...args: unknown[]) {
            const result = query.apply(this, args);

            queries += 1;
            queriedElements +=
              result instanceof Element ? 1 : result ? [...result].length : 0;
            return result;
          },
        });
        restores.push(() => Object.defineProperty(owner, name, descriptor));
      }
    }
    for (const [owner, name] of TEXT_READS) {
      const descriptor = Object.getOwnPropertyDescriptor(owner, name)!;
      const read = descriptor.get!;

      Object.defineProperty(owner, name, {
        ...descriptor,
        get(this: globalThis.Node) {
          const element = this instanceof Element ? this : this.parentElement;
          const host = element
            ? closest.call(element, '[data-editor-node="text"]')
            : null;

          if (host && m.root.contains(host)) hostsRead.add(host);
          return read.call(this);
        },
      });
      restores.push(() => Object.defineProperty(owner, name, descriptor));
    }
    observer.observe(m.root, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    await endComposition(m, 'か');
    records.push(...observer.takeRecords());
    observer.disconnect();
    return {
      domWrites: records.length,
      queriedElements,
      queries,
      textHostsRead: hostsRead.size,
    };
  } finally {
    for (const restore of restores.reverse()) restore();
    m.rendered.unmount();
  }
};

describe('composition commit routes', () => {
  const rewriteWord = definePlugin('rewrite-word', {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) =>
        input.text === 'か'
          ? state.transaction((tx) => {
              tx.text.insert(
                'カ',
                input.options?.at ? { at: input.options.at } : {}
              );
            })
          : false
      ),
    ],
  });
  const finalInput = (
    m: Mounted,
    inputType: 'insertFromComposition' | 'insertText',
    isComposing: boolean
  ) =>
    m.root.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: 'か',
        inputType,
        isComposing,
      })
    );
  const composeUndrawnThenFinalInput = async (
    m: Mounted,
    inputType: 'insertFromComposition' | 'insertText'
  ) => {
    await startComposing(m, []);
    await act(async () => {
      fireEvent.compositionEnd(m.root, { data: 'か' });
      finalInput(m, inputType, false);
      await wait(60);
    });
  };

  test.each([
    [
      'a typed letter',
      async (m: Mounted) => {
        await act(async () => {
          finalInput(m, 'insertText', false);
          await wait(60);
        });
      },
    ],
    [
      'a compositionend with no final input',
      async (m: Mounted) => {
        await startComposing(m, ['か']);
        await endComposition(m, 'か');
      },
    ],
    [
      'Safari’s final input',
      async (m: Mounted) => {
        const ime = await startComposing(m, ['か']);

        await act(async () => {
          // WebKit erases the preedit before its final input and draws the
          // committed text after it.
          ime.write('');
          finalInput(m, 'insertFromComposition', true);
          ime.write('か');
          await wait(20);
        });
        await endComposition(m, 'か');
      },
    ],
    [
      'a final input after compositionend',
      (m: Mounted) => composeUndrawnThenFinalInput(m, 'insertFromComposition'),
    ],
  ] as const)('%s reaches the insert handler', async (_, enter) => {
    const m = await mount({
      anchor: at([0, 0], 1),
      plugins: [rewriteWord],
      shape: 'text flow',
      value: BASE_VALUE,
    });

    try {
      await enter(m);
      const { fresh, live } = await m.freshAndLive();

      expect({
        caret: m.editor.read((state) => state.selection()?.focus),
        live,
        model: readBlockText(m.readModel(), 0),
      }).toEqual({ caret: at([0, 0], 2), live: fresh, model: 'aカbcdef' });
    } finally {
      m.rendered.unmount();
    }
  });

  const takeWord = (take: 'keep' | 'node-select') => {
    const calls = { count: 0 };
    const plugin = definePlugin('take-word', {
      commands: ({ handle }) => [
        handle(editorCommands.insertText, ({ input, state }) => {
          if (input.text !== 'か') return false;
          calls.count += 1;

          return state.transaction((tx) => {
            if (take === 'node-select') {
              tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
            }
          });
        }),
      ],
    });

    return { calls, plugin };
  };
  const composeUndrawnThenFinalInputAfterFallback =
    (inputType: 'insertFromComposition' | 'insertText') =>
    async (m: Mounted) => {
      await startComposing(m, []);
      await act(async () => {
        fireEvent.compositionEnd(m.root, { data: 'か' });
        setTimeout(() => finalInput(m, inputType, false), 0);
        await wait(60);
      });
    };

  test.each([
    [
      'keep',
      'before the fallback',
      (m: Mounted) => composeUndrawnThenFinalInput(m, 'insertFromComposition'),
    ],
    [
      'keep',
      'after the fallback',
      composeUndrawnThenFinalInputAfterFallback('insertFromComposition'),
    ],
    [
      'node-select',
      'after the fallback',
      composeUndrawnThenFinalInputAfterFallback('insertText'),
    ],
  ] as const)(
    'an insert handler that takes the word without editing (%s) runs once with a final input %s',
    async (take, _, enter) => {
      const { calls, plugin } = takeWord(take);
      const m = await mount({
        anchor: at([0, 0], 1),
        plugins: [plugin],
        shape: 'text flow',
        value: BASE_VALUE,
      });

      try {
        await enter(m);

        expect({
          calls: calls.count,
          model: readBlockText(m.readModel(), 0),
        }).toEqual({ calls: 1, model: 'abcdef' });
      } finally {
        m.rendered.unmount();
      }
    }
  );

  test('a final insertText after compositionend splits the crossed-out text it composed in', async () => {
    const m = await mount({
      anchor: at([0, 1], 2),
      plugins: [
        createAuthoredPlugin({
          authorId: 'dan',
          createChangeId: () => 'dan:1',
          intent: 'propose',
          now: () => 1000,
        }),
      ],
      shape: 'text flow',
      value: [
        paragraph(
          { text: 'a ' },
          {
            authored: [
              { at: 1, author: 'carol', change: 'carol:1', kind: 'delete' },
            ],
            text: 'gone',
          },
          { text: ' b' }
        ),
      ],
    });

    try {
      await composeUndrawnThenFinalInput(m, 'insertText');
      const { fresh, live } = await m.freshAndLive();

      expect({ live, model: readBlockText(m.readModel(), 0) }).toEqual({
        live: fresh,
        model: 'a goかne b',
      });
    } finally {
      m.rendered.unmount();
    }
  });

  const editing = () =>
    createAuthoredPlugin({
      authorId: 'dan',
      createChangeId: () => 'dan:1',
      intent: 'edit',
      now: () => 1000,
    });

  test('an intent switch on the owner editor leaves the word a mounted view composes under Editing', async () => {
    const authoring = editing();
    const m = await mount({
      anchor: at([0, 0], 2),
      plugins: [authoring],
      shape: 'text flow',
      value: [paragraph({ text: 'ab' })],
    });

    try {
      await startComposing(m, ['か']);
      await act(async () => {
        m.editor.plugin(authoring).api.setView({ intent: 'propose' });
        await wait(20);
      });
      await endComposition(m, 'か');

      expect(m.readModel()).toEqual([paragraph({ text: 'abか' })]);
    } finally {
      m.rendered.unmount();
    }
  });

  test('a forward Delete after a composition with no compositionend deletes under the intent switch it asked for', async () => {
    const m = await mount({
      anchor: at([0, 0], 1),
      plugins: [editing()],
      shape: 'text flow',
      value: [paragraph({ text: 'abc' })],
    });

    try {
      await startComposing(m, []);
      await act(async () => {
        m.runtime.editor.api.authored.setView({ intent: 'propose' });
        await wait(20);
      });
      await act(async () => {
        fireEvent.keyDown(m.root, { key: 'Delete' });
        await wait(20);
      });

      expect(m.readModel()).toEqual([
        paragraph(
          { text: 'a' },
          {
            authored: [
              { at: 1000, author: 'dan', change: 'dan:1', kind: 'delete' },
            ],
            text: 'b',
          },
          { text: 'c' }
        ),
      ]);
    } finally {
      m.rendered.unmount();
    }
  });

  test('typing after a composition with no compositionend starts its own undo step', async () => {
    const bump = defineEffect<number>({
      invert: (value) => -value,
      key: 'test.recovered-composition-bump',
    });
    const bumps = defineStateField<number>({
      initial: () => 0,
      key: 'test.recovered-composition-bumps',
      reduce: (value, effect) =>
        effect.type === bump ? value + effect.value : value,
    });
    const undoable = history();
    const m = await mount({
      anchor: at([0, 0], 1),
      focus: at([0, 0], 3),
      plugins: [
        undoable,
        definePlugin('recovered-composition-bump', {
          commands: ({ around }) => [
            around(editorCommands.insertText, ({ input, next, state }) =>
              input.text
                ? state.transaction((tx) => {
                    tx.effects.emit(bump, 1);
                  })
                : next()
            ),
          ],
          effectTypes: [bump],
          stateFields: [bumps],
        }),
      ],
      shape: 'text flow',
      value: [paragraph({ text: 'abcd' })],
    });
    const read = () => ({
      bumps: m.editor.read.getField(bumps),
      text: readBlockText(m.readModel(), 0),
    });

    try {
      await startComposing(m, []);
      await act(async () => {
        fireEvent.keyDown(m.root, { key: 'ArrowRight' });
        await wait(20);
      });
      await act(async () => {
        m.root.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data: 'x',
            inputType: 'insertText',
          })
        );
        await wait(20);
      });
      const typed = read();
      const undone: Array<ReturnType<typeof read>> = [];

      for (let step = 0; step < 2; step += 1) {
        await act(async () => {
          m.editor.plugin(undoable).api.undo();
          await wait(20);
        });
        undone.push(read());
      }

      expect({ typed, undone }).toEqual({
        typed: { bumps: 1, text: 'ad' },
        undone: [
          { bumps: 0, text: 'ad' },
          { bumps: 0, text: 'abcd' },
        ],
      });
    } finally {
      m.rendered.unmount();
    }
  });
});

test('a commit does the same DOM work from 30 to 300 blocks', async () => {
  const [small, medium, large] = [
    await countCommitWork(30),
    await countCommitWork(100),
    await countCommitWork(300),
  ];

  expect({
    at100: medium,
    at300: large,
    measured: Object.values(small).every((count) => count > 0),
  }).toEqual({ at100: small, at300: small, measured: true });
});
