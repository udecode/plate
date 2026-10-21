import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  createEditorView,
  type Descendant,
  defineEditorSchema,
  type Element,
  type PluginReference,
  type Point,
  schema,
} from 'plitejs';
import { createAuthoredPlugin } from 'plitejs/authored';
import { history } from 'plitejs/history';
import { Children, type ReactNode, useId } from 'react';

import type { EditorRuntimeCarrier } from '../../src/core/editor-runtime';
import * as viewCarets from '../../src/core/view-carets';
import { type CoreWork, readCoreWork } from '../../src/core/work';
import * as syncMarks from '../../src/dom/plugin/dom-sync-mutation-ownership';
import * as selectionWrites from '../../src/dom/utils/selection-writes';
import { peekHistoryEntry } from '../../src/history/history-state';
import {
  createEditor,
  Editable,
  EditorElement,
  EditorRoot,
  useRootEditor,
} from '../../src/react';
import { DOMCoverageBoundaryRange } from '../../src/react/components/dom-coverage-boundary';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { SelectionClaims } from '../../src/react/editable/selection-claim';

const { changedBookmarks, getCaretOwner, getPlacementGeneration } = viewCarets;

type RootView = ReturnType<typeof useRootEditor>;

const KEYSTROKES = 20;
const GESTURE_STEPS = 10;
const VIEW_COUNTS = [2, 8, 32] as const;
const ROUTED_VIEW_COUNTS = [2, 8] as const;
const BODY_ROOT = 'details-slot:body';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const section = (): Element => ({
  type: 'section',
  children: [
    { type: 'summary', children: [{ text: 'Summary' }] },
    paragraph('Hidden alpha'),
  ],
});

const reviewed = (): Element => ({
  type: 'paragraph',
  children: [
    { text: 'Keep ' },
    {
      authored: [{ at: 1, author: 'carol', change: 'carol:1', kind: 'delete' }],
      text: 'old',
    },
    {
      authored: [{ at: 2, author: 'carol', change: 'carol:2', kind: 'insert' }],
      text: 'new',
    },
    { text: ' text' },
  ],
});

const restingBlocks = (views: number) =>
  Array.from({ length: views - 1 }, (_, index) => paragraph(`rest ${index}`));

const beforeInput = (label: string, inputType: string, data?: string) => {
  fireEvent(
    screen.getByLabelText(label),
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      ...(data === undefined ? {} : { data }),
      inputType,
    })
  );
};

const place = (view: RootView, at: Point) => {
  act(() => {
    view.update((tx) => tx.selection.set(at));
  });
};

const CollapsedSection = ({ children }: { children: ReactNode }) => {
  const boundaryId = useId();
  const nodes = Children.toArray(children);

  return (
    <EditorElement>
      {nodes.slice(0, 1)}
      <DOMCoverageBoundaryRange
        boundaryId={boundaryId}
        content={nodes.slice(1)}
        from={1}
        reason="app-collapse"
        selectionPolicy="skip"
        to={nodes.length - 1}
      >
        Collapsed body
      </DOMCoverageBoundaryRange>
    </EditorElement>
  );
};

const ViewEditable = ({
  collapsed,
  label,
  register,
  root,
}: {
  collapsed: boolean;
  label: string;
  register: (view: RootView) => void;
  root?: string;
}) => {
  register(useRootEditor(root));

  return (
    <Editable
      aria-label={label}
      renderElement={({ children, element }) =>
        element.type === 'section' && collapsed ? (
          <CollapsedSection>{children}</CollapsedSection>
        ) : (
          <EditorElement>{children}</EditorElement>
        )
      }
      root={root}
    />
  );
};

const RoutedHolder = ({ register }: { register: (view: RootView) => void }) => {
  register(useRootEditor());

  return (
    <Editable
      aria-label="holder"
      renderElement={({ attributes, children, element }) =>
        element.type === 'details-content' ? (
          <section {...attributes}>
            <div contentEditable={false}>
              <Editable aria-label="nested body" root={BODY_ROOT} />
            </div>
          </section>
        ) : (
          <p {...attributes}>{children}</p>
        )
      }
    />
  );
};

type Work = Readonly<{
  bookCopies: number;
  bookmarkVisits: number;
  clampWrites: number;
  coverageQueries: number;
  ownerChanges: number;
  placements: number;
}>;

const measure = (
  editor: EditorRuntimeCarrier,
  holder: RootView,
  keys: number,
  press: () => void
): Work => {
  const before = readCoreWork();
  const generation = getPlacementGeneration(editor);
  let held = getCaretOwner(holder);
  let ownerChanges = 0;

  for (let key = 0; key < keys; key++) {
    act(press);
    const owner = getCaretOwner(holder);

    if (
      owner?.presentation !== held?.presentation ||
      (owner?.root ?? 'main') !== (held?.root ?? 'main')
    ) {
      ownerChanges += 1;
    }
    held = owner;
  }

  const after = readCoreWork();
  const per = (kind: keyof CoreWork) => (after[kind] - before[kind]) / keys;

  return {
    bookCopies: per('bookCopies'),
    bookmarkVisits: per('mappedBookmarks'),
    clampWrites: per('clampWrites'),
    coverageQueries: per('coverageQueries'),
    ownerChanges,
    placements: (getPlacementGeneration(editor) - generation) / keys,
  };
};

type Layout = Readonly<{
  at: Point;
  collapsed?: boolean;
  plugins?: readonly PluginReference[];
  rest: (index: number) => Point;
  value: (views: number) => Descendant[];
}>;

const mountViews = (views: number, layout: Layout) => {
  const editor = createEditor({
    initialValue: layout.value(views),
    plugins: [...(layout.plugins ?? []), history({ maxDepth: 500 })],
  });
  const mounted: RootView[] = [];
  const { unmount } = render(
    <>
      {Array.from({ length: views }, (_, index) => (
        <EditorRoot editor={editor} key={index}>
          <ViewEditable
            collapsed={!!layout.collapsed}
            label={`V${index}`}
            register={(view) => {
              mounted[index] = view;
            }}
          />
        </EditorRoot>
      ))}
    </>
  );
  const holder = mounted[views - 1];
  const label = `V${views - 1}`;

  mounted
    .slice(0, -1)
    .forEach((view, index) => place(view, layout.rest(index)));
  place(holder, layout.at);
  act(() => {
    screen.getByLabelText(label).focus();
  });

  return { editor, holder, label, unmount };
};

const typeKeys = (
  views: number,
  layout: Layout,
  { primeCoverage = false }: { primeCoverage?: boolean } = {}
) => {
  const { editor, holder, label, unmount } = mountViews(views, layout);
  const press = () => beforeInput(label, 'insertText', 'k');

  if (primeCoverage) act(press);
  const work = measure(editor, holder, KEYSTROKES, press);
  const text = editor.read.text.string(layout.at.path.slice(0, -1));

  unmount();

  return { ...work, text };
};

const typed = (text: string) => 'k'.repeat(KEYSTROKES) + text;

const plain: Layout = {
  at: { offset: 0, path: [0, 0] },
  rest: (index) =>
    index % 2 === 0
      ? { offset: index + 1, path: [0, 0] }
      : { offset: 1, path: [index + 1, 0] },
  value: (views) => [paragraph('x'.repeat(40)), ...restingBlocks(views)],
};

const collapsedBeside: Layout = {
  at: { offset: 0, path: [0, 0] },
  collapsed: true,
  rest: (index) =>
    index % 2 === 0
      ? { offset: index + 1, path: [0, 0] }
      : { offset: 1, path: [index + 2, 0] },
  value: (views) => [
    paragraph('x'.repeat(40)),
    section(),
    ...restingBlocks(views),
  ],
};

const collapsedTitle: Layout = {
  at: { offset: 0, path: [0, 0, 0] },
  collapsed: true,
  rest: (index) =>
    index % 2 === 0
      ? { offset: (index % 7) + 1, path: [0, 0, 0] }
      : { offset: 1, path: [index + 1, 0] },
  value: (views) => [section(), ...restingBlocks(views)],
};

const blocks = schema.content.types(['paragraph'], {
  default: { type: 'paragraph' },
  min: 1,
});

// Every resting view parks outside carol's paragraph, whose leaves the
// accept-all projection merges.
const suggesting: Layout = {
  at: { offset: 0, path: [0, 0] },
  plugins: [
    defineEditorSchema('view-caret-work', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'view-caret-work',
      root: blocks,
      unknown: 'reject',
      version: 1,
    }),
    createAuthoredPlugin({
      authorId: 'bob',
      createChangeId: () => 'bob:1',
      intent: 'propose',
      now: () => 10,
    }),
  ],
  rest: (index) => ({ offset: 1, path: [index + 2, 0] }),
  value: (views) => [
    paragraph('x'.repeat(40)),
    reviewed(),
    ...restingBlocks(views),
  ],
};

const steady = (bookmarkVisits: number) => ({
  // One where the command's spec maps them, one where the update lands them.
  bookCopies: bookmarkVisits > 0 ? 2 : 0,
  bookmarkVisits,
  clampWrites: 0,
  coverageQueries: 0,
  ownerChanges: 0,
  placements: 0,
});

const inTypedNode = (views: number) => Math.ceil((views - 1) / 2);

describe('work per keystroke with resting carets', () => {
  test.each([
    ['no collapsed section', plain, 'x'.repeat(40), 0],
    [
      'a collapsed section beside the typed block',
      collapsedBeside,
      'x'.repeat(40),
      1,
    ],
    ["a collapsed section's title", collapsedTitle, 'Summary', 1],
  ] as const)(
    'typing with %s maps the resting carets in the typed text node alone, with two book copies however many it maps',
    (_name, layout, text, coverageQueries) => {
      expect(
        VIEW_COUNTS.map((views) => ({ ...typeKeys(views, layout), views }))
      ).toEqual(
        VIEW_COUNTS.map((views) => ({
          ...steady(inTypedNode(views)),
          coverageQueries,
          text: typed(text),
          views,
        }))
      );
    }
  );

  test('typing in a Suggesting editor converts no resting caret outside text that holds suggestions', () => {
    expect(
      VIEW_COUNTS.map((views) => ({
        ...typeKeys(views, suggesting, { primeCoverage: true }),
        views,
      }))
    ).toEqual(
      VIEW_COUNTS.map((views) => ({
        ...steady(0),
        text: `k${typed('x'.repeat(40))}`,
        views,
      }))
    );
  });

  test("typing in a collapsed section's title checks only the sections around the caret, however many are collapsed", () => {
    const keys = 40;

    expect(
      [1, 200].map((sections) => {
        const { editor, holder, label, unmount } = mountViews(2, {
          at: { offset: 0, path: [0, 0, 0] },
          collapsed: true,
          rest: () => ({ offset: 1, path: [sections, 0] }),
          value: (views) => [
            ...Array.from({ length: sections }, section),
            ...restingBlocks(views),
          ],
        });
        const before = readCoreWork().collapsedBoundaryVisits;

        measure(editor, holder, keys, () =>
          beforeInput(label, 'insertText', 'k')
        );
        const visits = (readCoreWork().collapsedBoundaryVisits - before) / keys;
        const text = editor.read.text.string([0, 0]);

        unmount();

        return { sections, text, visits };
      })
    ).toEqual(
      [1, 200].map((sections) => ({
        sections,
        text: `${'k'.repeat(keys)}Summary`,
        visits: 1,
      }))
    );
  });

  test('typing through a holder into a body root it mounts under itself does the same work', () => {
    expect(
      ROUTED_VIEW_COUNTS.map((views) => {
        const editor = createEditor({
          initialValue: {
            children: [
              paragraph('above'),
              {
                type: 'details-content',
                childRoots: { body: BODY_ROOT },
                children: [{ text: '' }],
              },
            ],
            roots: {
              [BODY_ROOT]: [paragraph('x'.repeat(40)), ...restingBlocks(views)],
            },
          },
          plugins: [
            defineEditorSchema('view-caret-work-body', {
              elements: {
                'details-content': {
                  content: schema.content.open(),
                  contentRoots: {
                    body: schema.content.not(schema.content.text()),
                  },
                },
              },
              id: 'view-caret-work-body',
              root: schema.content.not(schema.content.text()),
              unknown: 'preserve',
              version: 1,
            }),
            history(),
          ],
        });
        const resting: RootView[] = [];
        let holder!: RootView;
        const { unmount } = render(
          <>
            <EditorRoot editor={editor}>
              <RoutedHolder
                register={(view) => {
                  holder = view;
                }}
              />
            </EditorRoot>
            {Array.from(
              { length: views - 1 },
              (_, index) => `body ${index}`
            ).map((label, index) => (
              <EditorRoot editor={editor} key={label}>
                <ViewEditable
                  collapsed={false}
                  label={label}
                  register={(view) => {
                    resting[index] = view;
                  }}
                  root={BODY_ROOT}
                />
              </EditorRoot>
            ))}
          </>
        );
        resting.forEach((view, index) =>
          place(
            view,
            index % 2 === 0
              ? { offset: index + 1, path: [0, 0] }
              : { offset: 1, path: [index + 1, 0] }
          )
        );
        act(() => {
          holder.update((tx) =>
            tx.selection.set({ offset: 0, path: [0, 0], root: BODY_ROOT })
          );
          screen.getByLabelText('holder').focus();
        });

        const work = measure(editor, holder, KEYSTROKES, () => {
          const text = screen
            .getByLabelText('nested body')
            .querySelector('[data-editor-string]')!.firstChild!;
          const { offset } = editor.read.selection()!.anchor;

          document.getSelection()!.setBaseAndExtent(text, offset, text, offset);
          beforeInput('holder', 'insertText', 'k');
        });
        const measured = {
          ...work,
          owner: getCaretOwner(holder)?.root,
          text: createEditorView(editor, { root: BODY_ROOT }).read.text.string([
            0,
          ]),
          views,
        };

        unmount();

        return measured;
      })
    ).toEqual(
      ROUTED_VIEW_COUNTS.map((views) => ({
        ...steady(inTypedNode(views)),
        // Each body Editable re-renders every block per key, as at base
        // (t_4db92ab2), and its development-only guard and the selection export
        // query coverage, so the routed holder's queries are base work.
        coverageQueries: expect.any(Number),
        owner: BODY_ROOT,
        text: typed('x'.repeat(40)),
        views,
      }))
    );
  });

  test('typing in a lone editor whose caret the app placed places nothing per key', () => {
    const editor = createEditor({ initialValue: [paragraph('x'.repeat(40))] });
    let view!: RootView;
    const { unmount } = render(
      <EditorRoot editor={editor}>
        <ViewEditable
          collapsed={false}
          label="lone"
          register={(registered) => {
            view = registered;
          }}
        />
      </EditorRoot>
    );

    act(() => {
      editor.update((tx) => tx.selection.set({ offset: 0, path: [0, 0] }));
      screen.getByLabelText('lone').focus();
    });
    const work = measure(editor, view, KEYSTROKES, () =>
      beforeInput('lone', 'insertText', 'k')
    );
    const measured = { ...work, text: editor.read.text.string([0]) };

    unmount();

    expect(measured).toEqual({ ...steady(0), text: typed('x'.repeat(40)) });
  });

  test('ten Enter presses map no resting caret outside the block they split', () => {
    const views = 32;
    const { editor, holder, label } = mountViews(views, {
      at: { offset: 20, path: [0, 0] },
      rest: (index) => ({ offset: 1, path: [index + 1, 0] }),
      value: () => [paragraph('x'.repeat(40)), ...restingBlocks(views)],
    });
    const { bookmarkVisits, bookCopies } = measure(editor, holder, 10, () =>
      beforeInput(label, 'insertParagraph')
    );

    expect([bookmarkVisits, bookCopies, editor.read.children().length]).toEqual(
      [0, 0, 10 + views]
    );
  });

  test('deleting everything maps each resting caret once', () => {
    const views = 32;
    const { editor, holder, label } = mountViews(views, {
      at: { offset: 0, path: [0, 0] },
      rest: (index) => ({ offset: 1, path: [index + 1, 0] }),
      value: () => [paragraph('x'.repeat(40)), ...restingBlocks(views)],
    });

    act(() => {
      holder.update((tx) =>
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: tx.points.end([])!,
        })
      );
    });
    const { bookmarkVisits } = measure(editor, holder, 1, () =>
      beforeInput(label, 'deleteContentBackward')
    );

    expect([bookmarkVisits, editor.read.text.string([])]).toEqual([
      views - 1,
      '',
    ]);
  });

  test.each([
    [
      'in other blocks',
      (index: number) => ({ offset: 1, path: [index + 1, 0] }),
    ],
    [
      'in the typed text node',
      (index: number) => ({ offset: index + 1, path: [0, 0] }),
    ],
    [
      'half in the typed text node',
      (index: number) =>
        index % 2 === 0
          ? { offset: index + 1, path: [0, 0] }
          : { offset: 1, path: [index + 1, 0] },
    ],
  ] as const)(
    'five hundred history batches with 31 resting carets %s retain one book entry per bookmark change',
    (_name, rest) => {
      const views = 32;
      const { editor, holder } = mountViews(views, {
        at: { offset: 0, path: [0, 0] },
        rest,
        value: () => [paragraph('x'.repeat(40)), ...restingBlocks(views)],
      });
      // Books share the per-view maps a batch leaves alone, so each map counts
      // once.
      const entries = new Set<ReadonlyMap<string, unknown>>();
      let changes = 0;

      for (let batch = 0; batch < 500; batch++) {
        act(() => {
          holder.update({ tags: ['history-push'] }, (tx) =>
            tx.text.insert('k')
          );
        });
        const carets = peekHistoryEntry(editor, 'undos')?.carets;

        if (carets?.kind !== 'keyed') throw new Error('Expected keyed carets');
        for (const { carets: edge } of [carets.before, carets.after]) {
          for (const roots of edge.book.marks.values()) entries.add(roots);
        }
        changes += changedBookmarks(
          carets.after.carets.book,
          carets.before.carets.book
        ).length;
      }

      const retained = [...entries].reduce(
        (count, roots) => count + roots.size,
        0
      );
      expect([editor.read.history().undos.length, retained - changes]).toEqual([
        500,
        views - 1,
      ]);
    }
  );
});

const CLAIM_STATE = [
  'gesture',
  'lastImport',
  'observation',
  'peers',
  'rangeReceipt',
] as const;

type Scope = {
  compares: number;
  events: Array<'read' | 'write'>;
  handed: Set<SelectionClaims>;
  idlePeerReads: number;
  kind: 'arrival' | 'decision' | 'mark' | 'note' | 'open' | 'write';
  owner: SelectionClaims | null;
  polls: number;
  reads: number;
};

const emptyWork = () => ({
  arrivals: [] as Scope[],
  decisions: [] as Scope[],
  fieldReads: new Map<string, number>(),
  gestures: 0,
  keeps: 0,
  opens: [] as Scope[],
  turns: [] as Array<{ mark: number; note: number }>,
  unscoped: 0,
  writes: [] as Scope[],
});

const watchImportWork = () => {
  const stack: Scope[] = [];
  let work = emptyWork();
  let turn = { mark: 0, note: 0 };
  let observers = 0;

  const open = (kind: Scope['kind'], owner: SelectionClaims | null) => {
    const scope: Scope = {
      compares: 0,
      events: [],
      handed: new Set(),
      idlePeerReads: 0,
      kind,
      owner,
      polls: 0,
      reads: 0,
    };

    if (kind === 'arrival') work.arrivals.push(scope);
    if (kind === 'decision') work.decisions.push(scope);
    if (kind === 'open') work.opens.push(scope);
    if (kind === 'write') work.writes.push(scope);

    return scope;
  };
  const inside = <R,>(scope: Scope, run: () => R): R => {
    stack.push(scope);
    try {
      return run();
    } finally {
      stack.pop();
      if (scope.kind === 'note' && turn.mark + turn.note > 0) {
        work.turns.push(turn);
        turn = { mark: 0, note: 0 };
      }
    }
  };

  const { decide, observeSelection } = SelectionClaims.prototype;

  vi.spyOn(SelectionClaims.prototype, 'decide').mockImplementation(
    function countedDecide(this: SelectionClaims, sink, probe) {
      const scope = open('decision', this);
      const decision = inside(scope, () => decide.call(this, sink, probe));

      return 'write' in decision
        ? {
            ...decision,
            write: (writer) => inside(scope, () => decision.write(writer)),
          }
        : decision;
    }
  );
  vi.spyOn(SelectionClaims.prototype, 'observeSelection').mockImplementation(
    function countedArrival(this: SelectionClaims) {
      inside(open('arrival', this), () => observeSelection.call(this));
    }
  );

  const claimsClass = SelectionClaims as unknown as {
    endNoteTurn: (...args: unknown[]) => void;
    prototype: { openGesture: (...args: unknown[]) => void };
  };
  const { endNoteTurn } = claimsClass;
  const { openGesture } = claimsClass.prototype;

  vi.spyOn(claimsClass, 'endNoteTurn').mockImplementation((...args) => {
    inside(open('note', null), () => endNoteTurn(...args));
  });
  vi.spyOn(claimsClass.prototype, 'openGesture').mockImplementation(
    function countedOpen(this: SelectionClaims, ...args) {
      inside(open('open', this), () => openGesture.apply(this, args));
    }
  );

  const watchMarks = syncMarks.watchDOMSyncTextMarks;

  vi.spyOn(syncMarks, 'watchDOMSyncTextMarks').mockImplementation(
    (root, watcher) =>
      watchMarks(root, (target) => {
        inside(open('mark', null), () => watcher(target));
      })
  );

  const readPoints = selectionWrites.readDOMSelectionPoints;

  vi.spyOn(selectionWrites, 'readDOMSelectionPoints').mockImplementation(
    (selection) => {
      const scope = stack.at(-1);

      if (scope) scope.reads += 1;
      else work.unscoped += 1;
      if (scope?.kind === 'mark') turn.mark += 1;
      if (scope?.kind === 'note') turn.note += 1;

      return readPoints(selection);
    }
  );

  const samePoints = selectionWrites.sameDOMSelectionPoints;

  vi.spyOn(selectionWrites, 'sameDOMSelectionPoints').mockImplementation(
    (points, other) => {
      const scope = stack.at(-1);

      if (scope) scope.compares += 1;

      return samePoints(points, other);
    }
  );

  const write = selectionWrites.writeDOMSelection;

  vi.spyOn(selectionWrites, 'writeDOMSelection').mockImplementation(
    (tree, points) => {
      inside(open('write', null), () => write(tree, points));
    }
  );

  const keep = viewCarets.keepBookmark;

  vi.spyOn(viewCarets, 'keepBookmark').mockImplementation((...args) => {
    work.keeps += 1;

    return keep(...args);
  });

  // `writeDOMSelection` reads the selection back through a call inside its own
  // module, which no namespace spy sees, so the read shows as an anchor read.
  const event = (kind: 'read' | 'write') => {
    const scope = stack.at(-1);

    if (scope?.kind === 'write') scope.events.push(kind);
  };
  const anchorNode = Object.getOwnPropertyDescriptor(
    Selection.prototype,
    'anchorNode'
  )!.get!;
  const { removeAllRanges, setBaseAndExtent } = Selection.prototype;

  vi.spyOn(Selection.prototype, 'anchorNode', 'get').mockImplementation(
    function countedAnchor(this: Selection) {
      event('read');

      return anchorNode.call(this);
    }
  );
  vi.spyOn(Selection.prototype, 'setBaseAndExtent').mockImplementation(
    function countedSet(this: Selection, ...args) {
      event('write');
      setBaseAndExtent.apply(this, args);
    }
  );
  vi.spyOn(Selection.prototype, 'removeAllRanges').mockImplementation(
    function countedClear(this: Selection) {
      event('write');
      removeAllRanges.call(this);
    }
  );

  const { observe } = MutationObserver.prototype;

  vi.spyOn(MutationObserver.prototype, 'observe').mockImplementation(
    function countedObserve(this: MutationObserver, target, options) {
      if (
        options?.characterDataOldValue &&
        options.childList &&
        !options.attributes
      ) {
        observers += 1;
      }
      observe.call(this, target, options);
    }
  );

  const importScope = () =>
    stack.findLast(
      (scope) => scope.kind === 'arrival' || scope.kind === 'decision'
    );

  const watchClaimState = (claims: SelectionClaims) => {
    const observer = Reflect.get(
      claims,
      'noteObserver'
    ) as MutationObserver | null;

    if (observer) {
      const take = observer.takeRecords.bind(observer);

      observer.takeRecords = () => {
        const records = take();
        const scope = importScope();

        if (scope) scope.polls += 1;
        if (records.length > 0) scope?.handed.add(claims);

        return records;
      };
    }
    for (const field of CLAIM_STATE) {
      if (!Object.hasOwn(claims, field)) {
        throw new Error(`SelectionClaims has no ${field} field`);
      }
      let value: unknown = Reflect.get(claims, field);

      Object.defineProperty(claims, field, {
        configurable: true,
        get: () => {
          const scope = importScope();

          work.fieldReads.set(field, (work.fieldReads.get(field) ?? 0) + 1);
          if (scope && scope.owner !== claims && !scope.handed.has(claims)) {
            scope.idlePeerReads += 1;
          }

          return value;
        },
        set: (next: unknown) => {
          if (field === 'gesture' && next) work.gestures += 1;
          value = next;
        },
      });
    }
  };

  const run = async (steps: number, step: (index: number) => void) => {
    work = emptyWork();
    for (let index = 0; index < steps; index++) {
      await act(async () => {
        step(index);
        vi.advanceTimersByTime(101);
      });
    }

    const done = work;

    work = emptyWork();

    return done;
  };

  return { observers: () => observers, run, watchClaimState };
};

const claimsOf = (label: string) =>
  findMountedEditableDOMRuntime(screen.getByLabelText(label))!.selectionClaims!;

const longText = (label: string) => {
  const walker = document.createTreeWalker(
    screen.getByLabelText(label),
    NodeFilter.SHOW_TEXT
  );

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if ((node as Text).data.length > 4) return node as Text;
  }

  throw new Error('Expected a text node');
};

const caretIn = (label: string, offset: number) => {
  const text = longText(label);

  document.getSelection()!.setBaseAndExtent(text, offset, text, offset);

  return text;
};

const importPhases = async (
  watch: ReturnType<typeof watchImportWork>,
  label: string,
  { press }: { press: boolean }
) => ({
  keys: await watch.run(KEYSTROKES, () =>
    beforeInput(label, 'insertText', 'k')
  ),
  mouseup: await watch.run(KEYSTROKES, (step) => {
    const target = longText(label).parentElement!;

    if (press) fireEvent.mouseDown(target);
    caretIn(label, 3 + (step % 2));
    fireEvent.mouseUp(target);
  }),
  selectionchange: await watch.run(KEYSTROKES, (step) => {
    caretIn(label, 1 + (step % 2));
    document.dispatchEvent(new Event('selectionchange'));
  }),
});

const gesturePhases = async (
  watch: ReturnType<typeof watchImportWork>,
  label: string
) => {
  const gestureStep =
    (press: () => void, release: () => void) => (step: number) => {
      const judged = 3 + (step % 2);
      const unreported = 1 + (step % 2);

      press();
      caretIn(label, judged);
      document.dispatchEvent(new Event('selectionchange'));
      vi.advanceTimersByTime(101);
      caretIn(label, unreported);
      release();
    };
  const key = { key: 'ArrowRight' };

  return {
    caretKey: await watch.run(
      GESTURE_STEPS,
      gestureStep(
        () => fireEvent.keyDown(screen.getByLabelText(label), key),
        () => fireEvent.keyUp(screen.getByLabelText(label), key)
      )
    ),
    press: await watch.run(
      GESTURE_STEPS,
      gestureStep(
        () => fireEvent.mouseDown(longText(label).parentElement!),
        () => fireEvent.mouseUp(longText(label).parentElement!)
      )
    ),
  };
};

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);

const distinct = (values: number[]) =>
  [...new Set(values)].sort((a, b) => a - b);

const readBacks = (writes: Scope[]) =>
  writes
    .filter((scope) => scope.events.includes('write'))
    .map(
      (scope) =>
        scope.events
          .slice(scope.events.indexOf('write'))
          .filter((kind) => kind === 'read').length
    );

describe('selection import work', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('a lone editor checks for peers once per import and otherwise reads no claim state, attaches no note and opens no gesture', async () => {
    const watch = watchImportWork();
    const { label, unmount } = mountViews(1, plain);

    watch.watchClaimState(claimsOf(label));
    const phases = await importPhases(watch, label, { press: true });
    const observers = watch.observers();

    unmount();

    const measured = Object.entries(phases).map(([name, work]) => ({
      gestures: work.gestures,
      imports: work.arrivals.length + work.decisions.length,
      name,
      otherClaimReads: sum(
        [...work.fieldReads]
          .filter(([field]) => field !== 'peers')
          .map(([, reads]) => reads)
      ),
      peerChecks: work.fieldReads.get('peers') ?? 0,
      readBackOnce: readBacks(work.writes).filter((reads) => reads === 1)
        .length,
      selectionReads:
        work.unscoped +
        sum([...work.arrivals, ...work.decisions].map((scope) => scope.reads)),
      selectionWrites: readBacks(work.writes).length,
    }));

    expect({ measured, observers }).toEqual({
      measured: measured.map((phase) => ({
        ...phase,
        gestures: 0,
        otherClaimReads: 0,
        peerChecks: phase.imports,
        readBackOnce: phase.selectionWrites,
        selectionReads: 0,
      })),
      observers: 0,
    });
    expect(
      Math.min(
        phases.mouseup.decisions.length,
        phases.selectionchange.arrivals.length,
        readBacks(phases.keys.writes).length
      )
    ).toBeGreaterThanOrEqual(KEYSTROKES);
  });

  test.each(VIEW_COUNTS)(
    "with %i views each import reads the selection once, polls each view's observer once and reads no other view's claim state, a gesture's open reads it once, a decision in an open gesture compares at most twice, each turn of DOM changes reads it at most twice, and typing in the holder keeps nothing",
    async (views) => {
      const watch = watchImportWork();
      const { label, unmount } = mountViews(views, plain);

      for (let index = 0; index < views; index++) {
        watch.watchClaimState(claimsOf(`V${index}`));
      }
      const phases = await importPhases(watch, label, { press: false });
      const gestures = await gesturePhases(watch, label);

      unmount();

      const all = Object.values(phases);
      const opened = Object.values(gestures);
      const gestureDecisions = opened.flatMap((work) => work.decisions);
      const imports = [...all, ...opened].flatMap((work) => [
        ...work.arrivals,
        ...work.decisions,
      ]);
      const perPhase = (count: (scope: Scope) => number) =>
        Object.fromEntries(
          Object.entries(phases).map(([name, work]) => [
            name,
            sum([...work.arrivals, ...work.decisions].map(count)),
          ])
        );
      const arrivals = all.flatMap((work) => work.arrivals);
      const decisions = all.flatMap((work) => work.decisions);
      const turns = all.flatMap((work) => work.turns);
      const writes = readBacks(all.flatMap((work) => work.writes));

      expect({
        arrivalCompares: distinct(arrivals.map((scope) => scope.compares)),
        arrivalReads: distinct(arrivals.map((scope) => scope.reads)),
        decisionComparesWithObservationAndRecord: Math.max(
          ...decisions.map((scope) => scope.compares)
        ),
        decisionReads: distinct(decisions.map((scope) => scope.reads)),
        gestureDecisionCompares: Math.max(
          ...gestureDecisions.map((scope) => scope.compares)
        ),
        gestureDecisionReads: distinct(
          gestureDecisions.map((scope) => scope.reads)
        ),
        gestureOpenReads: distinct(
          opened.flatMap((work) => work.opens).map((scope) => scope.reads)
        ),
        importPolls: distinct(imports.map((scope) => scope.polls)),
        handedOver: perPhase((scope) => scope.handed.size),
        idlePeerClaimReads: perPhase((scope) => scope.idlePeerReads),
        keyGestures: phases.keys.gestures,
        keyKeeps: phases.keys.keeps,
        turnReadsAtTextWrite: Math.max(...turns.map((turn) => turn.mark)),
        turnReadsAtNote: Math.max(...turns.map((turn) => turn.note)),
        unscopedReads: sum(all.map((work) => work.unscoped)),
        writeReadBacks: distinct(writes),
      }).toEqual({
        arrivalCompares: [1],
        arrivalReads: [1],
        decisionComparesWithObservationAndRecord: 2,
        decisionReads: [1],
        gestureDecisionCompares: 2,
        gestureDecisionReads: [1],
        gestureOpenReads: [1],
        importPolls: [views],
        handedOver: { keys: 0, mouseup: 0, selectionchange: 0 },
        idlePeerClaimReads: { keys: 0, mouseup: 0, selectionchange: 0 },
        keyGestures: 0,
        keyKeeps: 0,
        turnReadsAtNote: 1,
        turnReadsAtTextWrite: 1,
        unscopedReads: 0,
        writeReadBacks: [1],
      });
      expect(
        Math.min(
          phases.selectionchange.arrivals.length,
          phases.mouseup.decisions.length,
          phases.keys.turns.length,
          writes.length
        )
      ).toBeGreaterThanOrEqual(KEYSTROKES);
      expect(
        Math.min(
          gestures.caretKey.opens.length,
          gestures.press.opens.length,
          gestures.press.decisions.length
        )
      ).toBeGreaterThanOrEqual(GESTURE_STEPS);
    }
  );
});
