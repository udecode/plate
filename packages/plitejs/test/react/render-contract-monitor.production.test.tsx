import { render } from '@testing-library/react';
import React from 'react';
import { createPortal, flushSync } from 'react-dom';
import { afterAll, expect, test, vi } from 'vitest';

import type { EditorLifecycleError } from '../../src';

// React and Testing Library keep their development builds, which own `act`.
vi.stubEnv('NODE_ENV', 'production');
vi.resetModules();
const {
  createEditor,
  Editable,
  EditorElement,
  EditorRoot,
  useEditorContext,
  useRootEditor,
} = await import('../../src/react');
const { DOMCoverageBoundaryRange } =
  await import('../../src/react/components/dom-coverage-boundary');
const { ElementContext } = await import('../../src/react/context');
const { findMountedEditableDOMRuntime } =
  await import('../../src/react/editable/editable-dom-runtime');
const { hasProbeDOM } =
  await import('../../src/react/editable/render-contract-monitor');
const {
  ELEMENT_TO_RENDER_BIND,
  getPliteNodeElementByKey,
  usePliteNodeRef,
  useRebuildLine,
} = await import('../../src/react/hooks/use-plite-node-ref');
const {
  createMainRootPliteViewSelection,
  savePliteViewSelectionHistoryEntry,
  writePliteViewSelection,
} = await import('../../src/react/view-selection');
const { VirtualizedEditable } = await import('../../src/react/virtualized');
const { history } = await import('../../src/history');
const { replace: editorReplace } = await import('../../src/testing');

type Editor = ReturnType<typeof createEditor>;
type RenderElement = NonNullable<
  React.ComponentProps<typeof Editable>['renderElement']
>;

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = false;

afterAll(() => {
  vi.unstubAllEnvs();
});

const step = async (change: () => unknown) => {
  await change();
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const nextCycle = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });

const waitLooks = async (cycles = 5) => {
  for (let cycle = 0; cycle < cycles; cycle++) {
    await nextCycle();
  }
};

const inNextFrameBeforeItsTask = (change: () => void) =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      flushSync(change);
      resolve();
    });
  });

const afterSecondLookFrameBeforeItsTask = async (change: () => void) => {
  await nextCycle();
  await inNextFrameBeforeItsTask(change);
};

const createRecordingEditor = (
  options: Parameters<typeof createEditor>[0] = {}
) => {
  const reports: Array<EditorLifecycleError<unknown>> = [];
  const editor = createEditor({
    ...options,
    lifecycleErrorSink: (error) => {
      reports.push(error);
    },
  });

  return { editor, reports };
};

const renderElementReports = (
  reports: ReadonlyArray<EditorLifecycleError<unknown>>
) =>
  reports.flatMap((report) =>
    'source' in report && report.source === 'render-element'
      ? [
          {
            childPath: report.childPath,
            path: report.path,
            phase: report.phase,
            type: report.element.type,
          },
        ]
      : []
  );

const shellReport = (path = [1]) => ({
  childPath: [...path, 0],
  path,
  phase: 'selection-export',
  type: 'shell',
});

const shellRenderer: RenderElement = ({ children, element }) => (
  <EditorElement>
    {element.type === 'shell' ? 'Shell only' : children}
  </EditorElement>
);

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const shell = (text = 'Hidden') => ({
  type: 'shell',
  children: [paragraph(text)],
});

const mountFocused = (
  editor: Editor,
  renderElement: RenderElement = shellRenderer,
  children: unknown[] = [paragraph('Visible')]
) => {
  editorReplace(editor, {
    children: children as never,
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  return render(
    <EditorRoot editor={editor}>
      <Editable autoFocus renderElement={renderElement} />
    </EditorRoot>
  );
};

const insertAndSelect = async (
  editor: Editor,
  node: unknown,
  selection: unknown = { path: [1, 0, 0], offset: 1 },
  at = [1]
) => {
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(node as never, { at });
      tx.selection.set(selection as never);
    });
  });
};

const getRuntime = () => {
  const root = document.querySelector<HTMLElement>('[data-editor="true"]');

  return root ? findMountedEditableDOMRuntime(root) : null;
};

const LateChildren = ({ children }: { children: React.ReactNode }) => {
  const [shown, setShown] = React.useState(false);

  React.useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      setShown(true);
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return shown ? children : null;
};

test('a renderer that omits a child with the selection in it reports once, at the second look', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await insertAndSelect(editor, shell());
  await waitLooks(1);

  expect(renderElementReports(reports)).toEqual([]);

  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test('a commit that only moves the selection into a mounted omitted child reports once', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor, shellRenderer, [paragraph('Visible'), shell()]);
  await waitLooks();
  await step(() => {
    editor.update((tx) => {
      tx.selection.set({ offset: 1, path: [1, 0, 0] });
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test('with no sink, the omitted child reaches reportError as one error that names the element and both paths', async () => {
  const reportError = vi.fn();
  const editor = createEditor();

  vi.stubGlobal('reportError', reportError);
  try {
    mountFocused(editor);
    await waitLooks();
    await insertAndSelect(editor, shell());
    await waitLooks();
  } finally {
    vi.unstubAllGlobals();
  }

  expect(
    reportError.mock.calls.map(([error]) => (error as Error).message)
  ).toEqual([
    'Editor render-element selection-export check failed: renderElement for "shell" at 1 omitted editable child 1.0 without a DOM coverage boundary. Render children or register a DOMCoverage boundary.',
  ]);
});

test('a range from a covered child into an omitted, uncovered child reports once', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor, ({ children, element }) =>
    element.type === 'shell' ? (
      <EditorElement>
        <DOMCoverageBoundaryRange boundaryId="shell-first" from={0}>
          Collapsed first
        </DOMCoverageBoundaryRange>
      </EditorElement>
    ) : (
      <EditorElement>{children}</EditorElement>
    )
  );
  await waitLooks();
  await insertAndSelect(
    editor,
    { type: 'shell', children: [paragraph('Covered'), paragraph('Omitted')] },
    {
      kind: 'text',
      anchor: { path: [1, 0, 0], offset: 1 },
      focus: { path: [1, 1, 0], offset: 1 },
    }
  );
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([
    { ...shellReport(), childPath: [1, 1] },
  ]);
});

test('a virtualized selection from an offscreen covered block into an omitted child of a mounted block reports once', async () => {
  const { editor, reports } = createRecordingEditor();

  editorReplace(editor, {
    children: [
      shell(),
      ...Array.from({ length: 30 }, (_, index) => paragraph(`Block ${index}`)),
    ] as never,
    selection: {
      kind: 'text',
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });
  render(
    <EditorRoot editor={editor}>
      <VirtualizedEditable
        autoFocus
        estimatedBlockSize={40}
        overscan={0}
        renderElement={shellRenderer}
      />
    </EditorRoot>
  );
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 0 } });
      tx.selection.set({
        kind: 'text',
        anchor: { path: [29, 0], offset: 1 },
        focus: { path: [0, 0, 0], offset: 1 },
      } as never);
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport([0])]);
});

test('a collapsed view caret in an omitted child reports once', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(shell() as never, { at: [1] });
    });
    writePliteViewSelection(
      getRuntime()!.editor,
      createMainRootPliteViewSelection({
        anchor: { path: [1, 0, 0], offset: 1 },
        focus: { path: [1, 0, 0], offset: 1 },
      })
    );
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test('an undo that restores a recorded view selection into an omitted child reports once', async () => {
  const { editor, reports } = createRecordingEditor({ plugins: [history()] });

  mountFocused(editor, shellRenderer, [paragraph('Visible'), shell()]);
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 0 } });
    });
    savePliteViewSelectionHistoryEntry(getRuntime()!.editor as never, {
      redo: null,
      undo: createMainRootPliteViewSelection({
        anchor: { path: [1, 0, 0], offset: 1 },
        focus: { path: [1, 0, 0], offset: 1 },
      }),
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);

  await step(async () => {
    await new Promise((resolve) => {
      getRuntime()?.dispatchHistory('undo', 'restore-root', resolve);
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test('a view selection whose endpoint lies in another view root reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(shell() as never, { at: [1] });
    });
    writePliteViewSelection(
      getRuntime()!.editor,
      createMainRootPliteViewSelection({
        anchor: { path: [1, 0, 0], offset: 1, root: 'notes' },
        focus: { path: [1, 0, 0], offset: 1, root: 'notes' },
      })
    );
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('a child that binds one macrotask late reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor, ({ children, element }) => (
    <EditorElement>
      {element.type === 'shell' ? (
        <LateChildren>{children}</LateChildren>
      ) : (
        children
      )}
    </EditorElement>
  ));
  await waitLooks();
  await insertAndSelect(editor, shell());
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('a second nomination whose parent commit lands after the first nomination frame, with its child one macrotask late, reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor, ({ children, element }) => (
    <EditorElement>
      {element.type === 'shell' ? (
        <LateChildren key={String(element.revision)}>{children}</LateChildren>
      ) : (
        children
      )}
    </EditorElement>
  ));
  await waitLooks();
  await insertAndSelect(editor, shell());
  await step(async () => {
    await nextCycle();
    editor.update((tx) => {
      tx.nodes.set({ revision: 1 } as never, { at: [1] });
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

const HiddenUntil = ({
  children,
  reveal,
}: {
  children: React.ReactNode;
  reveal: (show: (mode: 'as' | 'revision' | 'state') => void) => void;
}) => {
  const editor = useEditorContext();
  const nodeKey = React.useContext(ElementContext)?.nodeKey ?? null;
  const rebuildLine = useRebuildLine(editor);
  const [mode, setMode] = React.useState<'as' | 'revision' | 'state' | null>(
    null
  );

  reveal((next) => {
    setMode(next);
    if (next === 'revision' && nodeKey) rebuildLine(nodeKey);
  });

  return (
    <EditorElement as={mode === 'as' ? 'section' : 'div'}>
      {mode ? <LateChildren>{children}</LateChildren> : 'Loading'}
    </EditorElement>
  );
};

const mountRevealable = (editor: Editor, strict = false) => {
  let show: (mode: 'as' | 'revision' | 'state') => void = () => {};
  const renderElement: RenderElement = ({ children, element }) =>
    element.type === 'shell' ? (
      <HiddenUntil
        reveal={(next) => {
          show = next;
        }}
      >
        {children}
      </HiddenUntil>
    ) : (
      <EditorElement>{children}</EditorElement>
    );

  editorReplace(editor, {
    children: [paragraph('Visible')] as never,
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  const tree = (
    <EditorRoot editor={editor}>
      <Editable autoFocus renderElement={renderElement} />
    </EditorRoot>
  );

  render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);

  return (mode: 'as' | 'revision' | 'state') => show(mode);
};

test.each([
  ['an as change', 'as', false],
  ['a render revision bump', 'revision', false],
  ['an as change under StrictMode', 'as', true],
] as const)(
  'a parent that remounts on new DOM with the same node through %s between the looks, with its child one macrotask late, reports nothing',
  async (_name, mode, strict) => {
    const { editor, reports } = createRecordingEditor();
    const reveal = mountRevealable(editor, strict);

    await waitLooks();
    await insertAndSelect(editor, shell());
    await afterSecondLookFrameBeforeItsTask(() => {
      reveal(mode);
    });
    await waitLooks();

    expect(renderElementReports(reports)).toEqual([]);
  }
);

test('a loading fallback held through both looks reports once, even when the reveal starts before the second look', async () => {
  const { editor, reports } = createRecordingEditor();
  const reveal = mountRevealable(editor);

  await waitLooks();
  await insertAndSelect(editor, shell());
  await afterSecondLookFrameBeforeItsTask(() => {
    reveal('state');
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test('a renderer that remounts its own late children between the looks, with no parent bind, reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();
  let remount: () => void = () => {};
  const RemountingChildren = ({ children }: { children: React.ReactNode }) => {
    const [generation, setGeneration] = React.useState(0);

    remount = () => {
      setGeneration((value) => value + 1);
    };

    return generation === 0 ? (
      'Loading'
    ) : generation === 1 ? (
      children
    ) : (
      <LateChildren>{children}</LateChildren>
    );
  };

  mountFocused(editor, ({ children, element }) => (
    <EditorElement>
      {element.type === 'shell' ? (
        <RemountingChildren>{children}</RemountingChildren>
      ) : (
        children
      )}
    </EditorElement>
  ));
  await waitLooks();
  await insertAndSelect(editor, shell());
  await waitLooks(1);
  await step(async () => {
    flushSync(remount);
  });
  await inNextFrameBeforeItsTask(remount);
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

const SlowLoadChildren = ({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: React.ReactNode;
}) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(null);
  const [host, setHost] = React.useState<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    if (!host) return undefined;

    const timeout = setTimeout(() => {
      setTarget(host);
    }, 120);

    return () => {
      clearTimeout(timeout);
    };
  }, [host]);

  return (
    <div ref={setHost}>{target ? createPortal(children, target) : loading}</div>
  );
};

test.each([
  ['under a content boundary reports nothing', true, []],
  ['without a boundary reports once', false, [shellReport()]],
] as const)(
  'a child portaled into a target whose load is slower than two frames %s',
  async (_name, covered, expected) => {
    const { editor, reports } = createRecordingEditor();

    mountFocused(editor, ({ children, element, slots }) => (
      <EditorElement>
        {element.type === 'shell' ? (
          <SlowLoadChildren
            loading={
              covered
                ? slots.contentBoundary({
                    mounted: false,
                    scope: { from: 0, type: 'children' },
                    selectionPolicy: 'model',
                  })
                : null
            }
          >
            {children}
          </SlowLoadChildren>
        ) : (
          children
        )}
      </EditorElement>
    ));
    await waitLooks();
    await insertAndSelect(editor, shell());
    await step(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
    });
    await waitLooks();

    expect(renderElementReports(reports)).toEqual(expected);
  }
);

test('a lookup that refreshes the parent node cache while its render with the new child is pending reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();
  let renderPending = false;

  mountFocused(editor, ({ children }) => (
    <EditorElement>{children}</EditorElement>
  ));
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(shell('First') as never, { at: [1] });
    });
  });
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(paragraph('Second') as never, { at: [1, 1] });
      tx.selection.set({ path: [1, 1, 0], offset: 1 });
    });
    const parentDOM = document.querySelector('[data-editor-path="1"]');

    renderPending = !document.body.textContent?.includes('Second');
    if (parentDOM) editor.api.dom.resolveNode(parentDOM);
  });
  await waitLooks();

  expect(renderPending).toBe(true);
  expect(renderElementReports(reports)).toEqual([]);
});

test('a custom shell bound by node key alone, with a child insert pending, reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();
  const KeyOnlyShell = ({ children }: { children: React.ReactNode }) => {
    const nodeKey = React.useContext(ElementContext)?.nodeKey ?? null;

    return (
      <div ref={usePliteNodeRef(nodeKey)}>
        {React.Children.toArray(children).slice(0, 1)}
      </div>
    );
  };

  mountFocused(editor, ({ children, element }) =>
    element.type === 'shell' ? (
      <KeyOnlyShell>{children}</KeyOnlyShell>
    ) : (
      <EditorElement>{children}</EditorElement>
    )
  );
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(shell('First') as never, { at: [1] });
    });
  });
  await waitLooks();
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert(paragraph('Second') as never, { at: [1, 1] });
      tx.selection.set({ path: [1, 1, 0], offset: 1 });
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('a range with both ends in one omitted child reports once, and ten more commits report nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await insertAndSelect(editor, shell(), {
    kind: 'text',
    anchor: { path: [1, 0, 0], offset: 0 },
    focus: { path: [1, 0, 0], offset: 3 },
  });
  await waitLooks();
  for (let commit = 0; commit < 10; commit++) {
    await step(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 0 } });
      });
    });
    await waitLooks(1);
  }
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test.each([
  ['a parent whose property changes', 'after the changes', [1]],
  [
    'a sibling of the omitted child that gets a text insert',
    'during the changes, because a text edit does not rebind the parent',
    [1, 1],
  ],
] as const)(
  '%s on each of ten frames, with the selection in its omitted child, reports once %s',
  async (_name, when, changed) => {
    const { editor, reports } = createRecordingEditor();

    mountFocused(editor, ({ children, element }) => (
      <EditorElement>
        {element.type === 'shell'
          ? React.Children.toArray(children).slice(1)
          : children}
      </EditorElement>
    ));
    await waitLooks();
    await insertAndSelect(editor, {
      type: 'shell',
      children: [paragraph('Omitted'), paragraph('Shown')],
    });
    for (let frame = 0; frame < 10; frame++) {
      await step(async () => {
        await new Promise((resolve) => {
          requestAnimationFrame(resolve);
        });
        editor.update((tx) => {
          if (changed.length === 1) {
            tx.nodes.set({ revision: frame } as never, { at: [1] });
          } else {
            tx.text.insert('!', { at: { path: [1, 1, 0], offset: 0 } });
          }
        });
      });
    }

    expect(renderElementReports(reports)).toEqual(
      when.startsWith('during') ? [shellReport()] : []
    );

    await waitLooks();

    expect(renderElementReports(reports)).toEqual([shellReport()]);
  }
);

test('a covered child reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor, ({ children, element }) =>
    element.type === 'shell' ? (
      <EditorElement>
        <DOMCoverageBoundaryRange boundaryId="shell-body" from={0}>
          Collapsed
        </DOMCoverageBoundaryRange>
      </EditorElement>
    ) : (
      <EditorElement>{children}</EditorElement>
    )
  );
  await waitLooks();
  await insertAndSelect(editor, shell());
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('an omitted child during a composition reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await insertAndSelect(editor, shell());
  getRuntime()?.setComposing(true);
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('an editor unmounted before the second look reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();
  const rendered = mountFocused(editor);

  await waitLooks();
  await insertAndSelect(editor, shell());
  await waitLooks(1);
  rendered.unmount();
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('an editor removed from the document before its looks reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();
  const rendered = mountFocused(editor);

  await waitLooks();
  editor.update((tx) => {
    tx.nodes.insert(paragraph('Inserted') as never, { at: [0] });
    tx.selection.set({ path: [0, 0], offset: 1 });
  });
  rendered.container.remove();
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('a Suspense fallback that renders a content boundary reports nothing', async () => {
  const { editor, reports } = createRecordingEditor();
  const never = new Promise<never>(() => {});
  const Suspending = () => {
    throw never;
  };

  mountFocused(editor, ({ children, element, slots }) => (
    <EditorElement>
      {element.type === 'shell' ? (
        <React.Suspense
          fallback={slots.contentBoundary({
            mounted: false,
            scope: { from: 0, type: 'children' },
            selectionPolicy: 'model',
          })}
        >
          <Suspending />
          {children}
        </React.Suspense>
      ) : (
        children
      )}
    </EditorElement>
  ));
  await waitLooks();
  await insertAndSelect(editor, shell());
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});

test('a view editor reports its omitted child once', async () => {
  const { editor, reports } = createRecordingEditor({
    initialValue: {
      children: [paragraph('Main')],
      roots: { notes: [paragraph('Notes')] },
    },
  });
  let notes: Editor | null = null;
  const NotesProbe = () => {
    notes = useRootEditor('notes');

    return null;
  };

  render(
    <EditorRoot editor={editor}>
      <NotesProbe />
      <Editable renderElement={shellRenderer} />
      <Editable autoFocus renderElement={shellRenderer} root="notes" />
    </EditorRoot>
  );
  await waitLooks();
  await step(async () => {
    notes?.update((tx) => {
      tx.nodes.insert(shell() as never, { at: [1] });
      tx.selection.set({ path: [1, 0, 0], offset: 1 });
    });
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([shellReport()]);
});

test('in the stale-DOM window one commit after a text insert, nothing reports, and both inserts stop at a probe that has DOM', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();

  const runtime = getRuntime()!;
  const view = runtime.editor;
  const monitor = runtime.renderContract;
  const exportSelection = monitor.nominateSelection.bind(monitor);
  const nominate = vi.spyOn(monitor, 'nominate');
  const looks: Array<Record<string, boolean>> = [];
  let leafPath = [0, 0];

  vi.spyOn(monitor, 'nominateSelection').mockImplementation(() => {
    const parentElement = getPliteNodeElementByKey(
      view,
      view.key(leafPath.slice(0, -1))!,
      runtime.rootElement!
    );
    const record = parentElement
      ? ELEMENT_TO_RENDER_BIND.get(parentElement)
      : undefined;

    looks.push({
      leafHasDOM: !!document.querySelector(
        `[data-editor-node-key="${view.key(leafPath)}"]`
      ),
      probeHasDOM: hasProbeDOM(
        view,
        { offset: 0, path: leafPath },
        runtime.rootElement
      ),
      recordHasLeaf: (record?.node.children.length ?? 0) > leafPath.at(-1)!,
    });
    exportSelection();
  });

  await step(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 7 } });
      tx.selection.set({ path: [0, 0], offset: 8 });
    });
  });
  await waitLooks();
  const plainInsert = looks.splice(0);

  leafPath = [0, 1];
  await step(async () => {
    editor.update((tx) => {
      tx.nodes.insert({ bold: true, text: '?' } as never, { at: [0, 1] });
      tx.selection.set({ path: [0, 1], offset: 1 });
    });
  });
  await waitLooks();

  expect({ plainInsert: plainInsert[0], splitLeaf: looks[0] }).toEqual({
    plainInsert: { leafHasDOM: true, probeHasDOM: true, recordHasLeaf: true },
    splitLeaf: { leafHasDOM: false, probeHasDOM: true, recordHasLeaf: true },
  });
  expect(nominate).not.toHaveBeenCalled();
  expect(renderElementReports(reports)).toEqual([]);
});
