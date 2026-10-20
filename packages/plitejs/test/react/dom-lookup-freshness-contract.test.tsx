import { act, render } from '@testing-library/react';
import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react';

import { NodeApi, TextApi } from '../../src';
import {
  auditDOMTextProofs,
  EDITOR_TO_PENDING_DIFFS,
  findDOMRootRuntime,
  IS_COMPOSING,
  setDOMTextFlowRecordIndex,
} from '../../src/dom/internal';
import { EDITOR_TO_RUNTIME_ID_TO_ELEMENTS } from '../../src/dom/utils/weak-maps';
import { getEditorRuntime, getNodeKey } from '../../src/internal';
import {
  createEditor,
  type DecorationSource,
  Editable,
  EditorRoot,
  type RenderElementProps,
  type RenderLeafProps,
  useEditorContext,
  useEditorSelector,
  useEditorState,
} from '../../src/react';
import { ReactEditor } from '../../src/react/plugin/react-editor';
import { defineTestSchema } from '../support/schema';

type ViewEditor = ReturnType<typeof useEditorContext>;
type Point = { path: number[]; offset: number };
type Seen = { dom: string | null; model: string };

const paragraphs = (...texts: string[]) =>
  texts.map((text) => ({ type: 'paragraph', children: [{ text }] }));

const readRange = (
  editor: ViewEditor,
  anchor: Point,
  focus: Point = anchor
) => {
  const range = editor.api.dom.resolveDOMRange({ anchor, focus });

  if (!range) return null;
  if (range.collapsed) {
    const block = range.startContainer.parentElement?.closest(
      '[data-editor-node="element"]'
    );

    range.setStartBefore(block!.firstChild!);
  }
  return range.toString().replaceAll('\uFEFF', '');
};

const modelText = (editor: ViewEditor, paths: number[][]) =>
  editor.read((state) => paths.map((path) => state.text.string(path)).join(''));

const staleReads = (seen: Seen[]) =>
  seen.filter(({ dom, model }) => dom !== null && dom !== model);

const mount = (
  texts: string[],
  Watcher: () => null,
  editableProps: Parameters<typeof Editable>[0] = {}
) => {
  const editor = createEditor({ initialValue: paragraphs(...texts) });
  let view!: ViewEditor;
  const Capture = () => {
    view = useEditorContext();
    return null;
  };
  const mounted = render(
    <EditorRoot editor={editor}>
      <Capture />
      <Watcher />
      <Editable {...editableProps} />
    </EditorRoot>
  );

  return { editor, mounted, view: () => view };
};

const insertX = (editor: ReturnType<typeof mount>['editor']) =>
  act(async () => {
    editor.update((tx) => {
      tx.text.insert('x', { at: { path: [0, 0], offset: 2 } });
    });
  });

const draftPrefix = (editor: ViewEditor): Seen => ({
  dom: readRange(editor, { path: [0, 0], offset: 3 }),
  model: modelText(editor, [[0]]).slice(0, 3),
});

test('a layout effect after a text insert never resolves into the old text', async () => {
  const seen: Seen[] = [];
  const Watcher = () => {
    const editor = useEditorContext();
    const text = useEditorState((state) => state.text.string([0]));

    useLayoutEffect(() => {
      if (text !== 'draft') seen.push(draftPrefix(editor));
    }, [editor, text]);
    return null;
  };
  const { editor, mounted } = mount(['draft'], Watcher);

  await act(async () => {});
  await insertX(editor);

  expect(seen).toHaveLength(1);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

test('a commit listener never resolves into the old text', async () => {
  const seen: Seen[] = [];
  const { editor, mounted, view } = mount(['draft'], () => null);

  await act(async () => {});
  const stop = editor.subscribeCommit(() => seen.push(draftPrefix(view())));
  await insertX(editor);
  stop();

  expect(seen).toHaveLength(1);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

test('an assert in a commit listener throws instead of returning the old text', async () => {
  const seen: string[] = [];
  const { editor, mounted, view } = mount(['draft'], () => null);
  const at = { path: [0, 0], offset: 3 };
  const read = (assert: () => readonly [globalThis.Node, number]) => {
    try {
      const [node, offset] = assert();

      return (node.textContent ?? '').slice(0, offset);
    } catch {
      return 'threw';
    }
  };

  await act(async () => {});
  const stop = editor.subscribeCommit(() => {
    seen.push(read(() => view().api.dom.assertDOMPoint(at)));
    seen.push(
      read(() => {
        const range = view().api.dom.assertDOMRange({ anchor: at, focus: at });

        return [range.startContainer, range.startOffset] as const;
      })
    );
  });
  await insertX(editor);
  stop();

  expect(seen).toHaveLength(2);
  expect(seen.filter((text) => text !== 'drx' && text !== 'threw')).toEqual([]);
  mounted.unmount();
});

test('the internal lookup maps into page text Android input put ahead of the editor', async () => {
  const { mounted, view } = mount(['draft'], () => null);

  await act(async () => {});
  firstText(
    mounted.container.querySelector('[data-editor-node="text"]')!
  ).nodeValue = 'drxaft';
  EDITOR_TO_PENDING_DIFFS.set(view(), [
    { diff: { end: 2, start: 2, text: 'x' }, id: 0, path: [0, 0] },
  ]);

  try {
    expect(
      ReactEditor.resolveDOMPoint(view(), { path: [0, 0], offset: 2 })
    ).not.toBeNull();
  } finally {
    EDITOR_TO_PENDING_DIFFS.delete(view());
  }
  mounted.unmount();
});

test('a selector over a custom leaf never resolves into the old text', async () => {
  const seen: Seen[] = [];
  const Watcher = () => {
    useEditorSelector(
      useCallback((editor: ViewEditor) => {
        seen.push(draftPrefix(editor));
        return modelText(editor, [[0]]);
      }, [])
    );
    return null;
  };
  const { editor, mounted } = mount(['draft'], Watcher, {
    renderLeaf: ({ attributes, children }: RenderLeafProps) => (
      <span {...attributes}>{children}</span>
    ),
  });

  await act(async () => {});
  seen.length = 0;
  await insertX(editor);

  expect(seen.length).toBeGreaterThan(0);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

const watchWholeRange = (seen: Seen[], blocks: () => number) => () => {
  useEditorSelector(
    useCallback((editor: ViewEditor) => {
      const paths = Array.from({ length: blocks() }, (_, index) => [index]);
      const last = paths.at(-1)!;
      const model = modelText(editor, paths);

      seen.push({
        dom: readRange(
          editor,
          { path: [0, 0], offset: 0 },
          { path: [...last, 0], offset: modelText(editor, [last]).length }
        ),
        model,
      });
      return model;
    }, [])
  );
  return null;
};

test('a range across a paragraph whose text changed never reads the old text', async () => {
  const seen: Seen[] = [];
  const { editor, mounted } = mount(
    ['first', 'draft', 'last'],
    watchWholeRange(seen, () => 3)
  );

  await act(async () => {});
  seen.length = 0;
  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('x', { at: { path: [1, 0], offset: 2 } });
    });
  });

  expect(seen.length).toBeGreaterThan(0);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

test.each([
  ['a removed', 2],
  ['an inserted', 4],
] as const)(
  'a range across %s paragraph never reads the old blocks',
  async (kind, blocksAfter) => {
    const seen: Seen[] = [];
    let blocks = 3;
    const { editor, mounted } = mount(
      ['first', 'draft', 'last'],
      watchWholeRange(seen, () => blocks)
    );

    await act(async () => {});
    seen.length = 0;
    blocks = blocksAfter;
    await act(async () => {
      editor.update((tx) => {
        if (kind === 'a removed') tx.nodes.remove({ at: [1] });
        else {
          tx.nodes.insert(
            { type: 'paragraph', children: [{ text: 'new' }] },
            { at: [1] }
          );
        }
      });
    });

    expect(seen.length).toBeGreaterThan(0);
    expect(staleReads(seen)).toEqual([]);
    mounted.unmount();
  }
);

test('a layout effect above the editable never reads around an inserted paragraph', async () => {
  const seen: Seen[] = [];
  const Watcher = () => {
    const editor = useEditorContext();
    const middle = useEditorState((state) => state.text.string([1]));

    useLayoutEffect(() => {
      if (middle === 'last') return;
      seen.push({
        dom: readRange(
          editor,
          { path: [0, 0], offset: 0 },
          { path: [2, 0], offset: 4 }
        ),
        model: modelText(editor, [[0], [1], [2]]),
      });
    }, [editor, middle]);
    return null;
  };
  const { editor, mounted } = mount(['first', 'last'], Watcher);

  await act(async () => {});
  await act(async () => {
    editor.update((tx) => {
      tx.nodes.insert(
        { type: 'paragraph', children: [{ text: 'draft' }] },
        { at: [1] }
      );
    });
  });

  expect(seen).toHaveLength(1);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

test('a range never reads blocks a remount has not painted yet', async () => {
  const listeners = new Set<() => void>();
  let wrapped = false;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const getSnapshot = () => wrapped;
  const seen: Seen[] = [];
  const Watcher = () => {
    const editor = useEditorContext();
    const isWrapped = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    useLayoutEffect(() => {
      if (!isWrapped) return;
      seen.push({
        dom: readRange(
          editor,
          { path: [0, 0], offset: 0 },
          { path: [2, 0], offset: 4 }
        ),
        model: modelText(editor, [[0], [1], [2]]),
      });
    }, [editor, isWrapped]);
    return null;
  };
  const WrappedElement = ({
    attributes,
    children,
    element,
  }: RenderElementProps) => {
    const isWrapped = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const isMiddle = NodeApi.string(element) === 'draft';

    return (
      <div {...attributes}>
        {isWrapped && isMiddle ? <section>{children}</section> : children}
      </div>
    );
  };
  const { mounted } = mount(['first', 'draft', 'last'], Watcher, {
    renderElement: (props: RenderElementProps) => <WrappedElement {...props} />,
  });

  await act(async () => {});
  await act(async () => {
    wrapped = true;
    for (const listener of listeners) listener();
  });

  expect(seen).toHaveLength(1);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

test('a point never resolves into page text the editor has not applied', async () => {
  const { mounted, view } = mount(['draft'], () => null);

  await act(async () => {});
  const host = mounted.container.querySelector('[data-editor-node="text"]')!;
  const textNode = document
    .createTreeWalker(host, NodeFilter.SHOW_TEXT)
    .nextNode() as Text;
  textNode.nodeValue = 'drft';

  expect(readRange(view(), { path: [0, 0], offset: 3 })).toBeNull();
  mounted.unmount();
});

test('a range never reads text no flow segment owns', async () => {
  const editor = createEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'dr' }, { text: 'aft', bold: true }],
      },
    ],
  });
  let view!: ViewEditor;
  const Capture = () => {
    view = useEditorContext();
    return <Editable />;
  };
  const mounted = render(
    <EditorRoot editor={editor}>
      <Capture />
    </EditorRoot>
  );

  await act(async () => {});
  const host = mounted.container.querySelector('[data-editor-text-flow-host]')!;
  const first = document
    .createTreeWalker(host, NodeFilter.SHOW_TEXT)
    .nextNode() as Text;
  first.after(document.createTextNode('x'));

  expect(
    readRange(view, { path: [0, 0], offset: 0 }, { path: [0, 1], offset: 3 })
  ).toBeNull();
  mounted.unmount();
});

const firstText = (root: Element) =>
  document.createTreeWalker(root, NodeFilter.SHOW_TEXT).nextNode() as Text;

const plainLeaf = ({ attributes, children }: RenderLeafProps) => (
  <span {...attributes}>{children}</span>
);

test('a range never reads blocks the page still shows in the old order', async () => {
  const seen: Array<string | null> = [];
  const { editor, mounted, view } = mount(['A', 'B'], () => null);

  await act(async () => {});
  const stop = editor.subscribeCommit(() =>
    seen.push(
      readRange(
        view(),
        { path: [0, 0], offset: 0 },
        { path: [1, 0], offset: 1 }
      )
    )
  );
  await act(async () => {
    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });
  });
  stop();

  expect(seen).toHaveLength(1);
  expect(seen.filter((dom) => dom !== null && dom !== 'BA')).toEqual([]);
  mounted.unmount();
});

test('a point never resolves into text nodes the page removed', async () => {
  const seen: boolean[] = [];
  const { editor, mounted, view } = mount(['draft'], () => null);

  await act(async () => {});
  mounted.container
    .querySelector('[data-editor-text-flow-host]')!
    .replaceChildren();
  const stop = editor.subscribeCommit(() => {
    const point = view().api.dom.resolveDOMPoint({ path: [0, 0], offset: 0 });

    seen.push(point === null || point[0].isConnected);
  });
  await act(async () => {
    editor.update((tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
      });
    });
  });
  stop();

  expect(seen).toEqual([true]);
  mounted.unmount();
});

test('a range never reads text in place of a display newline', async () => {
  const { mounted, view } = mount(['foo\n', 'last'], () => null);

  await act(async () => {});
  const block = mounted.container.querySelector(
    '[data-editor-node="element"]'
  )!;
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let suffixed: Text | null = null;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue?.endsWith('\n\n')) suffixed = node as Text;
  }
  suffixed!.nodeValue = `${suffixed!.nodeValue!.slice(0, -1)}x`;

  expect(
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [1, 0], offset: 4 })
  ).toBeNull();
  mounted.unmount();
});

test('a point never resolves into text inside an empty leaf placeholder', async () => {
  const seen: Array<string | null> = [];
  const { editor, mounted, view } = mount([''], () => null, {
    renderLeaf: plainLeaf,
  });

  await act(async () => {});
  mounted.container
    .querySelector('[data-editor-zero-width]')!
    .replaceChildren(document.createTextNode('a'));
  const stop = editor.subscribeCommit(() =>
    seen.push(readRange(view(), { path: [0, 0], offset: 0 }))
  );
  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('a', { at: { path: [0, 0], offset: 0 } });
    });
  });
  stop();

  expect(seen).toHaveLength(1);
  expect(seen.filter((dom) => dom !== null && dom !== '')).toEqual([]);
  mounted.unmount();
});

const mountDecorated = (
  children: Array<{ text: string; bold?: boolean }>,
  length: number
) => {
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children }],
  });
  const source: DecorationSource<typeof editor> = {
    id: 'decorated-start',
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node) && path.at(-1) === 0
        ? [
            {
              attributes: { 'data-decorated': 'true' },
              key: 'decorated:start',
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: length },
              },
            },
          ]
        : [],
  };
  let view!: ViewEditor;
  const Capture = () => {
    view = useEditorContext();
    return <Editable />;
  };
  const mounted = render(
    <EditorRoot decorations={[source]} editor={editor}>
      <Capture />
    </EditorRoot>
  );

  return { mounted, view: () => view };
};

test('a point never counts text nested below a leaf', async () => {
  const { mounted, view } = mountDecorated([{ text: 'abcd' }], 4);

  await act(async () => {});
  const bold = document.createElement('b');

  bold.textContent = 'b';
  mounted.container
    .querySelector('[data-decorated]')!
    .replaceChildren('a', bold, 'cd');

  expect([null, 'ab']).toContain(
    readRange(view(), { path: [0, 0], offset: 2 })
  );
  mounted.unmount();
});

test('a range never reads a text split around another text', async () => {
  const { mounted, view } = mountDecorated(
    [{ text: 'ab' }, { text: 'CD', bold: true }],
    1
  );

  await act(async () => {});
  const host = mounted.container.querySelector('[data-editor-text-flow-host]')!;
  const b = [...host.childNodes].find((node) => node.nodeValue === 'b')!;

  host.append(b);

  expect(
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [0, 1], offset: 2 })
  ).not.toBe('aCD');
  mounted.unmount();
});

test.each([
  ['the default leaf', {}],
  ['a custom leaf', { renderLeaf: plainLeaf }],
] as const)(
  'a point and a range resolve inside a void whose child text is not empty, with %s',
  async (_, editableProps) => {
    const editor = createEditor({
      initialValue: [
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'caption', children: [{ text: 'x' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ],
      plugins: [
        defineTestSchema('void-caption', { caption: { void: 'block' } }),
      ],
    });
    let view!: ViewEditor;
    const Capture = () => {
      view = useEditorContext();
      return <Editable {...editableProps} />;
    };
    const mounted = render(
      <EditorRoot editor={editor}>
        <Capture />
      </EditorRoot>
    );

    await act(async () => {});

    expect(
      view.read(
        (state) => (state.nodes.get([1, 0])![0] as { text: string }).text
      )
    ).toBe('x');
    expect(
      view.api.dom.resolveDOMPoint({ path: [1, 0], offset: 0 })
    ).not.toBeNull();
    expect(
      view.api.dom.resolveDOMRange({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [2, 0], offset: 1 },
      })
    ).not.toBeNull();
    mounted.unmount();
  }
);

test('textToCaret reads composed text the editor has not applied yet', async () => {
  const { mounted, view } = mount(['@'], () => null);

  await act(async () => {});
  const text = firstText(
    mounted.container.querySelector('[data-editor-node="text"]')!
  );

  text.nodeValue = '@に';
  window.getSelection()!.collapse(text, 2);
  IS_COMPOSING.set(view(), true);

  try {
    expect(view().api.dom.textToCaret({ path: [0, 0], offset: 1 })).toBe('に');
  } finally {
    IS_COMPOSING.delete(view());
  }
  mounted.unmount();
});

test('a lookup during composition never reads another text the page has not painted', async () => {
  const seen: Seen[] = [];
  const { editor, mounted, view } = mount(['first', 'draft'], () => null);

  await act(async () => {});
  IS_COMPOSING.set(view(), true);
  const stop = editor.subscribeCommit(() =>
    seen.push({
      dom: readRange(view(), { path: [1, 0], offset: 3 }),
      model: modelText(view(), [[1]]).slice(0, 3),
    })
  );

  try {
    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('x', { at: { path: [1, 0], offset: 2 } });
      });
    });
  } finally {
    stop();
    IS_COMPOSING.delete(view());
  }

  expect(seen).toHaveLength(1);
  expect(staleReads(seen)).toEqual([]);
  mounted.unmount();
});

test('a lookup while Android input is pending never maps past the old segment end', async () => {
  const seen: Array<string | null> = [];
  const { editor, mounted, view } = mount(['draft'], () => null);

  await act(async () => {});
  firstText(
    mounted.container.querySelector('[data-editor-node="text"]')!
  ).nodeValue = 'drxaft';
  EDITOR_TO_PENDING_DIFFS.set(view(), [
    { diff: { end: 2, start: 2, text: 'x' }, id: 0, path: [0, 0] },
  ]);
  const stop = editor.subscribeCommit(() =>
    seen.push(readRange(view(), { path: [0, 0], offset: 6 }))
  );

  try {
    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('x', { at: { path: [0, 0], offset: 2 } });
      });
    });
  } finally {
    stop();
    EDITOR_TO_PENDING_DIFFS.delete(view());
  }

  expect(seen).toHaveLength(1);
  expect([null, 'drxaft']).toContain(seen[0]);
  mounted.unmount();
});

test('a point inside a void never resolves into text nodes the page removed', async () => {
  const editor = createEditor({
    initialValue: [{ type: 'caption', children: [{ text: 'x' }] }],
    plugins: [defineTestSchema('void-caption', { caption: { void: 'block' } })],
  });
  let view!: ViewEditor;
  const Capture = () => {
    view = useEditorContext();
    return <Editable />;
  };
  const mounted = render(
    <EditorRoot editor={editor}>
      <Capture />
    </EditorRoot>
  );

  await act(async () => {});
  mounted.container
    .querySelector('[data-editor-text-flow-host]')!
    .replaceChildren();
  const point = view.api.dom.resolveDOMPoint({ path: [0, 0], offset: 0 });

  expect(point === null || point[0].isConnected).toBe(true);
  mounted.unmount();
});

test('a DOM range resolves into the new text once the DOM catches up', async () => {
  const { editor, mounted, view } = mount(['draft'], () => null);

  await act(async () => {});
  await insertX(editor);

  expect(readRange(view(), { path: [0, 0], offset: 3 })).toBe('drx');
  mounted.unmount();
});

test('a selection-only change resolves an expanded range at once', async () => {
  const { editor, mounted, view } = mount(['first', 'draft'], () => null);
  const anchor = { path: [0, 0], offset: 1 };
  const focus = { path: [1, 0], offset: 3 };
  let dom: string | null = null;

  await act(async () => {});
  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({ anchor, focus });
    });
    dom = readRange(view(), anchor, focus);
  });

  expect(dom).toBe('irstdra');
  mounted.unmount();
});

test('a custom leaf ending in a newline resolves once it paints', async () => {
  const { editor, mounted, view } = mount(['foo'], () => null, {
    renderLeaf: ({ attributes, children }: RenderLeafProps) => (
      <span {...attributes}>{children}</span>
    ),
  });

  await act(async () => {});
  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('\n', { at: { path: [0, 0], offset: 3 } });
    });
  });

  expect(readRange(view(), { path: [0, 0], offset: 2 })).toBe('fo');
  mounted.unmount();
});

const readTwice = (
  read: () => string | null,
  lookup: 'point' | 'range' = 'range'
) => {
  const first = read();
  const hits = auditDOMTextProofs()[lookup];

  expect(read()).toBe(first);
  expect(auditDOMTextProofs()[lookup]).toBeGreaterThan(hits);
  return first;
};

const unrepaired = (container: Element, edit: () => void) =>
  findDOMRootRuntime(
    container.querySelector('[data-editor="true"]')!
  )!.runUnobservedDOMMutation(edit);

const observerDelivery = [
  ['at the next lookup', null],
  [
    'after the observer callback',
    () =>
      new Promise<void>((resolve) => {
        queueMicrotask(resolve);
      }),
  ],
] as const;

describe.each(observerDelivery)(
  'a kept read, with records taken %s,',
  (_, deliver) => {
    test('never survives page text the editor has not applied', async () => {
      const { mounted, view } = mount(['draft'], () => null);
      const read = () => readRange(view(), { path: [0, 0], offset: 3 });

      await act(async () => {});
      expect(readTwice(read, 'point')).toBe('dra');
      unrepaired(mounted.container, () => {
        firstText(
          mounted.container.querySelector('[data-editor-node="text"]')!
        ).nodeValue = 'drft';
      });
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives blocks reordered on the page alone', async () => {
      const { mounted, view } = mount(['A', 'B', 'C'], () => null);
      const read = () =>
        readRange(
          view(),
          { path: [0, 0], offset: 0 },
          { path: [2, 0], offset: 1 }
        );

      await act(async () => {});
      expect(readTwice(read)).toBe('ABC');
      const blocks = mounted.container.querySelectorAll(
        '[data-editor-node="element"]'
      );
      unrepaired(mounted.container, () => blocks[0].before(blocks[1]));
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives a block turning into a nested editor root', async () => {
      const { mounted, view } = mount(['A', 'B', 'C'], () => null);
      const read = () =>
        readRange(
          view(),
          { path: [0, 0], offset: 0 },
          { path: [2, 0], offset: 1 }
        );

      await act(async () => {});
      expect(readTwice(read)).toBe('ABC');
      const blocks = mounted.container.querySelectorAll(
        '[data-editor-node="element"]'
      );
      unrepaired(mounted.container, () =>
        blocks[1].setAttribute('data-editor', 'true')
      );
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives a text host the page added between two read hosts', async () => {
      const { mounted, view } = mount(['A', 'B'], () => null);
      const read = () =>
        readRange(
          view(),
          { path: [0, 0], offset: 0 },
          { path: [1, 0], offset: 1 }
        );

      await act(async () => {});
      expect(readTwice(read)).toBe('AB');
      const stray = document.createElement('p');

      stray.innerHTML =
        '<span data-editor-node="text" data-editor-node-key="stray"><span data-editor-string="true">z</span></span>';
      unrepaired(mounted.container, () =>
        mounted.container
          .querySelectorAll('[data-editor-node="element"]')[1]
          .before(stray)
      );
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives an element between two read hosts turning into a text host', async () => {
      const { mounted, view } = mount(['A', 'C'], () => null);
      const read = () =>
        readRange(
          view(),
          { path: [0, 0], offset: 0 },
          { path: [1, 0], offset: 1 }
        );

      await act(async () => {});
      const between = document.createElement('span');

      between.append(document.createTextNode(''));
      unrepaired(mounted.container, () =>
        mounted.container
          .querySelectorAll('[data-editor-node="element"]')[1]
          .before(between)
      );
      expect(readTwice(read)).toBe('AC');
      unrepaired(mounted.container, () => {
        between.setAttribute('data-editor-node', 'text');
        between.setAttribute('data-editor-node-key', 'between');
        between.firstChild!.nodeValue = 'X';
      });
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives a wrapper inside a read host turning into a text host', async () => {
      const leaf = ({ attributes, children }: RenderLeafProps) => (
        <span {...attributes}>
          <span className="wrapper">{children}</span>
        </span>
      );
      const { mounted, view } = mount(['draft'], () => null, {
        renderLeaf: leaf,
      });
      const read = () => readRange(view(), { path: [0, 0], offset: 3 });

      await act(async () => {});
      expect(readTwice(read, 'point')).toBe('dra');
      const wrapper = mounted.container.querySelector('.wrapper')!;

      unrepaired(mounted.container, () => {
        wrapper.setAttribute('data-editor-node', 'text');
        firstText(wrapper).nodeValue = 'drxaft';
      });
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives a nested editor changing text the outer flow reads', async () => {
      const { mounted, view } = mount(['draft'], () => null);
      const read = () =>
        readRange(
          view(),
          { path: [0, 0], offset: 0 },
          { path: [0, 0], offset: 5 }
        );

      await act(async () => {});
      const nested = document.createElement('span');

      nested.setAttribute('data-editor', 'true');
      nested.append(document.createTextNode('﻿'));
      unrepaired(mounted.container, () =>
        mounted.container
          .querySelector('[data-editor-text-flow-host]')!
          .append(nested)
      );
      expect(readTwice(read)).toBe('draft');
      unrepaired(mounted.container, () => {
        nested.firstChild!.nodeValue = 'x';
      });
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives flow bounds moved without a page write', async () => {
      const { mounted, view } = mount(['draft'], () => null);
      const read = () => readRange(view(), { path: [0, 0], offset: 3 });

      await act(async () => {});
      const host = mounted.container.querySelector<HTMLElement>(
        '[data-editor-text-flow-host]'
      )!;
      const textNode = firstText(host);
      const segment = {
        bindingHost: null,
        bindingRecord: null,
        domLength: 5,
        end: 5,
        start: 0,
        stringElement: textNode.parentElement,
        textNode,
      };

      setDOMTextFlowRecordIndex(host, {
        nodeKey: getNodeKey(view(), [0, 0])!,
        path: [0, 0],
        segments: [segment],
      });
      expect(readTwice(read, 'point')).toBe('dra');
      segment.end = 3;
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test.each([
      [
        'bounds',
        (record: { segments: Array<{ end: number }> }) => {
          record.segments[0].end = 3;
        },
      ],
      [
        'key',
        (record: { nodeKey: string }) => {
          record.nodeKey = 'moved';
        },
      ],
    ] as const)(
      'a kept range read never survives an inner flow record whose %s moved without a page write',
      async (_field, move) => {
        const { mounted, view } = mount(['A', 'draft', 'C'], () => null);
        const read = () =>
          readRange(
            view(),
            { path: [0, 0], offset: 0 },
            { path: [2, 0], offset: 1 }
          );

        await act(async () => {});
        const host = mounted.container.querySelectorAll<HTMLElement>(
          '[data-editor-text-flow-host]'
        )[1];
        const textNode = firstText(host);
        const record = {
          nodeKey: getNodeKey(view(), [1, 0])!,
          path: [1, 0],
          segments: [
            {
              bindingHost: null,
              bindingRecord: null,
              domLength: 5,
              end: 5,
              start: 0,
              stringElement: textNode.parentElement,
              textNode,
            },
          ],
        };

        setDOMTextFlowRecordIndex(host, record);
        expect(readTwice(read)).toBe('AdraftC');
        (move as (record: unknown) => void)(record);
        if (deliver) await deliver();

        expect(read()).toBeNull();
        mounted.unmount();
      }
    );

    test('never survives a text host the page added inside a read host', async () => {
      const { mounted, view } = mount(['A', 'B', 'C'], () => null, {
        renderLeaf: plainLeaf,
      });
      const read = () =>
        readRange(
          view(),
          { path: [0, 0], offset: 0 },
          { path: [2, 0], offset: 1 }
        );

      await act(async () => {});
      expect(readTwice(read)).toBe('ABC');
      const inner = document.createElement('span');

      inner.setAttribute('data-editor-node', 'text');
      inner.setAttribute('data-editor-node-key', 'inner');
      inner.innerHTML = '<span data-editor-string="true">X</span>';
      unrepaired(mounted.container, () =>
        mounted.container
          .querySelectorAll('[data-editor-node="text"]')[1]
          .append(inner)
      );
      if (deliver) await deliver();

      expect(read()).toBeNull();
      mounted.unmount();
    });

    test('never survives a host removed with its block and put back inside another host', async () => {
      const { mounted, view } = mount(['drxaft', 'other'], () => null);
      const read = () => readRange(view(), { path: [0, 0], offset: 3 });

      await act(async () => {});
      expect(readTwice(read, 'point')).toBe('drx');
      const [host, other] = mounted.container.querySelectorAll(
        '[data-editor-node="text"]'
      );
      const block = host.parentElement!;

      unrepaired(mounted.container, () => {
        host.remove();
        block.remove();
      });
      if (deliver) await deliver();
      unrepaired(mounted.container, () => {
        firstText(host).nodeValue = 'draft';
        other.append(host);
      });

      expect(read()).toBeNull();
      mounted.unmount();
    });
  }
);

test('a kept range read never survives a paragraph move the page has not painted', async () => {
  const seen: Array<string | null> = [];
  const { editor, mounted, view } = mount(['A', 'B'], () => null);
  const read = () =>
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [1, 0], offset: 1 });

  await act(async () => {});
  expect(readTwice(read)).toBe('AB');
  const stop = editor.subscribeCommit(() => seen.push(read()));
  await act(async () => {
    editor.update((tx) => {
      tx.nodes.move({ at: [1], to: [0] });
    });
  });
  stop();

  expect(seen).toHaveLength(1);
  expect([null, 'BA']).toContain(seen[0]);
  expect(read()).toBe('BA');
  mounted.unmount();
});

test('a kept range read never vouches for a text the editor gave a new key', async () => {
  const seen: Array<string | null> = [];
  const { editor, mounted, view } = mount(['A', 'B', 'C'], () => null);
  const read = () =>
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [2, 0], offset: 1 });

  await act(async () => {});
  expect(readTwice(read)).toBe('ABC');
  const block = editor.read((state) => state.nodes.get([1])?.[0]) as
    | ReturnType<typeof paragraphs>[number]
    | undefined;

  if (!block) throw new Error('block 1 is missing');
  const stop = editor.subscribeCommit(() => seen.push(read()));
  await act(async () => {
    editor.update((tx) => {
      tx.nodes.remove({ at: [1] });
      tx.nodes.insert(block, { at: [1] });
    });
  });
  stop();

  expect(seen).toHaveLength(1);
  expect(read()).toBe('ABC');
  mounted.unmount();
});

test('a kept range read never survives a host removed from a block that then moved into a nested editor', async () => {
  const { mounted, view } = mount(['A', 'B', 'C'], () => null);
  const read = () =>
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [2, 0], offset: 1 });
  const nestedRoot = document.createElement('div');
  const outside = document.createElement('div');

  nestedRoot.setAttribute('data-editor', 'true');
  document.body.append(outside);
  await act(async () => {});
  const blocks = mounted.container.querySelectorAll(
    '[data-editor-node="element"]'
  );
  unrepaired(mounted.container, () => blocks[0].append(nestedRoot));
  expect(readTwice(read)).toBe('ABC');
  const host = blocks[1].querySelector('[data-editor-node="text"]')!;

  unrepaired(mounted.container, () => {
    host.remove();
    blocks[1].remove();
    nestedRoot.append(blocks[1]);
    outside.append(host);
  });

  expect(read()).toBeNull();
  outside.remove();
  mounted.unmount();
});

test('a kept point read never survives a mapped host of its key entering the page', async () => {
  const { mounted, view } = mount(['draft'], () => null, {
    renderLeaf: plainLeaf,
  });
  const read = () => readRange(view(), { path: [0, 0], offset: 3 });
  const nodeKey = getNodeKey(view(), [0, 0])!;
  const extra = document.createElement('span');

  extra.setAttribute('data-editor-node', 'text');
  extra.setAttribute('data-editor-node-key', nodeKey);
  extra.innerHTML = '<span data-editor-string="true">draft</span>';
  await act(async () => {});
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(getEditorRuntime(view()))!
    .get(nodeKey)!
    .add(extra);
  expect(readTwice(read, 'point')).toBe('dra');
  unrepaired(mounted.container, () =>
    mounted.container.querySelector('[data-editor-node="text"]')!.after(extra)
  );

  expect(read()).toBeNull();
  mounted.unmount();
});

test('a text host that draws another text host inside it resolves nothing', async () => {
  const { mounted, view } = mount(['drxaft'], () => null, {
    renderLeaf: plainLeaf,
  });

  await act(async () => {});
  const nested = document.createElement('span');

  nested.setAttribute('data-editor-node', 'text');
  nested.setAttribute('data-editor-node-key', 'nested');
  nested.innerHTML = '<span data-editor-string="true">draft</span>';
  unrepaired(mounted.container, () =>
    mounted.container
      .querySelector('[data-editor-node="text"]')!
      .prepend(nested)
  );

  expect(
    view().api.dom.resolveDOMRange({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    })
  ).toBeNull();
  expect(readRange(view(), { path: [0, 0], offset: 6 })).toBeNull();
  const point = ReactEditor.resolveDOMPoint(view(), {
    path: [0, 0],
    offset: 3,
  });

  expect([point?.[0].nodeValue, point?.[1]]).toEqual(['drxaft', 3]);
  mounted.unmount();
});

const mountPlain = (children: Array<{ text: string; bold?: boolean }>) => {
  const editor = createEditor({
    initialValue: [{ type: 'paragraph', children }],
  });
  let view!: ViewEditor;
  const Capture = () => {
    view = useEditorContext();
    return <Editable renderLeaf={plainLeaf} />;
  };
  const mounted = render(
    <EditorRoot editor={editor}>
      <Capture />
    </EditorRoot>
  );

  return { editor, mounted, view: () => view };
};

test('a range never spans text a plain host draws outside its strings', async () => {
  const { editor, mounted, view } = mountPlain([
    { text: 'drx' },
    { text: 'aft', bold: true },
  ]);

  await act(async () => {});
  const host = mounted.container.querySelector('[data-editor-node="text"]')!;
  const string = host.querySelector('[data-editor-string]')!;

  unrepaired(mounted.container, () => {
    host.append((string.firstChild as globalThis.Text).splitText(2));
  });
  const seen: Array<string | null> = [];
  const stop = editor.subscribeCommit(() =>
    seen.push(
      readRange(
        view(),
        { path: [0, 0], offset: 0 },
        { path: [0, 1], offset: 3 }
      )
    )
  );
  await act(async () => {
    editor.update((tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 3 },
        },
      });
    });
  });
  stop();

  expect(seen).toHaveLength(1);
  expect(seen.filter((dom) => dom !== null && dom !== 'draft')).toEqual([]);
  mounted.unmount();
});

test('a point never resolves into a text host behind a shadow root', async () => {
  const { mounted, view } = mount(['drxaft'], () => null, {
    renderLeaf: plainLeaf,
  });

  await act(async () => {});
  const host = mounted.container.querySelector('[data-editor-node="text"]')!;
  const block = host.closest('[data-editor-node="element"]')!;

  unrepaired(mounted.container, () => {
    const holder = document.createElement('span');

    block.append(holder);
    holder.attachShadow({ mode: 'open' }).append(host);
    host.querySelector('[data-editor-string]')!.firstChild!.nodeValue = 'draft';
  });
  const point = view().api.dom.resolveDOMPoint({ path: [0, 0], offset: 3 });

  expect(point && [point[0].nodeValue, point[1]]).toBeNull();
  expect(
    view().api.dom.resolveDOMRange({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    })
  ).toBeNull();
  mounted.unmount();
});

test('a kept read never survives its root losing data-editor', async () => {
  const { mounted, view } = mount(['drxaft'], () => null, {
    renderLeaf: plainLeaf,
  });

  await act(async () => {});
  expect(readRange(view(), { path: [0, 0], offset: 3 })).toBe('drx');
  unrepaired(mounted.container, () => {
    mounted.container
      .querySelector('[data-editor="true"]')!
      .removeAttribute('data-editor');
    mounted.container.querySelector(
      '[data-editor-string]'
    )!.firstChild!.nodeValue = 'draft';
  });

  expect(
    view().api.dom.resolveDOMRange({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    })
  ).toBeNull();
  mounted.unmount();
});

test('a placeholder still lets an empty paragraph resolve', async () => {
  const { mounted, view } = mount([''], () => null, {
    placeholder: 'Type here',
    renderLeaf: plainLeaf,
  });

  await act(async () => {});
  expect(
    mounted.container.querySelector('[data-editor-placeholder]')?.textContent
  ).toBe('Type here');
  expect(
    view().api.dom.resolveDOMPoint({ path: [0, 0], offset: 0 })
  ).not.toBeNull();
  mounted.unmount();
});

test('a range never spans text drawn between two text hosts', async () => {
  const { mounted, view } = mountPlain([
    { text: 'dr' },
    { text: 'aft', bold: true },
  ]);

  await act(async () => {});
  const host = mounted.container.querySelector('[data-editor-node="text"]')!;

  unrepaired(mounted.container, () => {
    host.after(document.createTextNode('x'));
  });

  expect(
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [0, 1], offset: 3 })
  ).toBeNull();
  mounted.unmount();
});

test('a kept range read never survives text drawn between its hosts', async () => {
  const { mounted, view } = mountPlain([
    { text: 'dr' },
    { text: 'aft', bold: true },
  ]);
  const read = () =>
    readRange(view(), { path: [0, 0], offset: 0 }, { path: [0, 1], offset: 3 });

  await act(async () => {});
  expect(readTwice(read)).toBe('draft');
  const host = mounted.container.querySelector('[data-editor-node="text"]')!;

  unrepaired(mounted.container, () => {
    host.after(document.createTextNode('x'));
  });

  expect(read()).toBeNull();
  mounted.unmount();
});

test('non-editable chrome between blocks still lets a range resolve', async () => {
  const { mounted, view } = mount(['draft', 'next'], () => null, {
    renderElement: ({ attributes, children }: RenderElementProps) => (
      <div {...attributes}>
        <span contentEditable={false}>§</span>
        {children}
      </div>
    ),
  });
  const read = () =>
    readRange(view(), { path: [0, 0], offset: 1 }, { path: [1, 0], offset: 2 });

  await act(async () => {});
  expect(readTwice(read)).toBe('raft§ne');
  mounted.unmount();
});
