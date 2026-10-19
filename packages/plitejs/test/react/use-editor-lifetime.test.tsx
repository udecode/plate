import { act, render, waitFor } from '@testing-library/react';
import {
  Activity,
  Component,
  type ReactNode,
  StrictMode,
  Suspense,
  use,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import * as Y from 'yjs';

import { createEditor, getEditorRuntimeOwner } from '../../src';
import {
  Editable,
  EditorRoot,
  useEditor,
  useEditorContext,
} from '../../src/react';
import {
  useYjsAdmissionStatus,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
  yjs,
} from '../../src/yjs/react';
import { FakeAwareness } from '../yjs/support/provider';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const afterTransactionListeners = (doc: Y.Doc) =>
  // Yjs keeps document listeners on lib0's observable map.
  (doc as unknown as { _observers: Map<string, Set<unknown>> })._observers.get(
    'afterTransaction'
  )?.size ?? 0;

const flushMicrotasks = () => act(async () => {});

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 20);
  });

/** A document whose shared content was written by an earlier, ended editor. */
const loadedDoc = (text: string) => {
  const doc = new Y.Doc();

  createEditor({
    initialValue: [paragraph(text)],
    plugins: [yjs({ doc, initialReady: true, seed: true })],
  }).destroy();

  return doc;
};

const Peer = ({
  children,
  compaction = false,
  doc,
  onCommit,
  onValueChange,
  version = 0,
}: {
  children?: ReactNode;
  compaction?: boolean;
  doc: Y.Doc;
  onCommit?: (
    context: Readonly<{
      commit: { changed: { hasAny: (kind: 'document') => boolean } };
    }>
  ) => void;
  onValueChange?: () => void;
  version?: number;
}) => {
  const editor = useEditor(
    {
      initialValue: [paragraph('local')],
      plugins: [
        yjs({
          doc,
          initialReady: true,
          seed: true,
          ...(compaction
            ? { sharedEffectCompaction: { authorityId: 'peer' } }
            : {}),
        }),
      ],
    },
    [version]
  );

  return (
    <EditorRoot
      editor={editor}
      onCommit={onCommit}
      onValueChange={onValueChange}
    >
      {children}
    </EditorRoot>
  );
};

class Boundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    return this.state.error
      ? (this.props.fallback ?? `caught: ${this.state.error}`)
      : this.props.children;
  }
}

describe('useEditor lifetime on one Yjs document', () => {
  test.each([false, true])(
    'mounts again after an unmount (Strict Mode %s)',
    (strict) => {
      const doc = new Y.Doc();
      const tree = () =>
        strict ? (
          <StrictMode>
            <Peer doc={doc} />
          </StrictMode>
        ) : (
          <Peer doc={doc} />
        );

      render(tree()).unmount();
      render(tree());

      expect(afterTransactionListeners(doc)).toBe(1);
    }
  );

  test('replaces the editor on an unkeyed deps change', () => {
    const doc = new Y.Doc();
    let bump = () => {};
    const Host = () => {
      const [version, setVersion] = useState(0);

      bump = () => setVersion((value) => value + 1);

      return <Peer doc={doc} version={version} />;
    };

    render(<Host />);
    act(() => bump());

    expect(afterTransactionListeners(doc)).toBe(1);
  });

  test('replaces the editor on a deps change outside act', async () => {
    const doc = new Y.Doc();
    const errors: unknown[] = [];
    const container = document.createElement('div');
    const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const actEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
    let bump = () => {};
    const Host = () => {
      const [version, setVersion] = useState(0);

      bump = () => setVersion((value) => value + 1);

      return <Peer doc={doc} version={version} />;
    };

    environment.IS_REACT_ACT_ENVIRONMENT = false;
    const root = createRoot(container, {
      onUncaughtError: (error) => errors.push(error),
    });

    try {
      root.render(<Host />);
      await settle();
      bump();
      await settle();

      expect({ errors, listeners: afterTransactionListeners(doc) }).toEqual({
        errors: [],
        listeners: 1,
      });
    } finally {
      root.unmount();
      environment.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    }
  });

  test('replaces the editor on a deps change with shared-effect compaction', () => {
    const doc = new Y.Doc();
    let bump = () => {};
    const Host = () => {
      const [version, setVersion] = useState(0);

      bump = () => setVersion((value) => value + 1);

      return <Peer compaction doc={doc} version={version} />;
    };

    render(<Host />);
    act(() => bump());

    expect(afterTransactionListeners(doc)).toBe(1);
  });

  test('holds nothing for a mount render that Suspense throws away', async () => {
    const doc = new Y.Doc();
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const Blocker = () => {
      use(gate);

      return null;
    };

    await act(async () => {
      render(
        <Suspense fallback="loading">
          <Peer doc={doc} />
          <Blocker />
        </Suspense>
      );
    });
    const whileSuspended = afterTransactionListeners(doc);

    await act(async () => {
      release();
      await gate;
    });

    expect({ after: afterTransactionListeners(doc), whileSuspended }).toEqual({
      after: 1,
      whileSuspended: 0,
    });
  });

  test('frees the document of a hidden Activity that is deleted', async () => {
    const doc = new Y.Doc();
    const tree = (mode: 'hidden' | 'visible' | null) =>
      mode ? (
        <Activity mode={mode}>
          <Peer doc={doc} />
        </Activity>
      ) : null;
    const view = render(tree('visible'));

    view.rerender(tree('hidden'));
    const whileHidden = afterTransactionListeners(doc);

    view.rerender(tree(null));
    await flushMicrotasks();

    expect({ deleted: afterTransactionListeners(doc), whileHidden }).toEqual({
      deleted: 0,
      whileHidden: 1,
    });
  });

  test('binds a new editor in the commit that deletes a hidden Activity', () => {
    const doc = new Y.Doc();
    const tree = (step: 'hidden' | 'replaced' | 'visible') =>
      step === 'replaced' ? (
        <Peer doc={doc} key="next" />
      ) : (
        <Activity key="first" mode={step}>
          <Peer doc={doc} />
        </Activity>
      );
    const view = render(tree('visible'));

    view.rerender(tree('hidden'));
    view.rerender(tree('replaced'));

    expect(afterTransactionListeners(doc)).toBe(1);
  });

  test('keeps a hidden Activity dormant through a deps change and frees the old editor', async () => {
    const doc = new Y.Doc();
    const tree = (mode: 'hidden' | 'visible', version: number) => (
      <Activity mode={mode}>
        <Peer doc={doc} version={version} />
      </Activity>
    );
    const view = render(tree('visible', 0));

    view.rerender(tree('hidden', 0));
    view.rerender(tree('hidden', 1));
    await flushMicrotasks();
    const whileHidden = afterTransactionListeners(doc);

    view.rerender(tree('visible', 1));

    expect({ revealed: afterTransactionListeners(doc), whileHidden }).toEqual({
      revealed: 1,
      whileHidden: 0,
    });
  });

  test('lets child cleanups update the editor when Suspense-hidden content is deleted outside act', async () => {
    const doc = new Y.Doc();
    const errors: unknown[] = [];
    const container = document.createElement('div');
    const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const actEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
    const never = new Promise<void>(() => {});
    const CleanupWriter = () => {
      // A view turns read-only at unmount; the component's editor does not.
      const editor = getEditorRuntimeOwner(
        useEditorContext()
      ) as unknown as ReturnType<typeof useEditorContext>;

      useEffect(
        () => () => {
          try {
            editor.update.text.insert('!', { at: { offset: 0, path: [0, 0] } });
          } catch (error) {
            errors.push(error);
          }
        },
        [editor]
      );

      return null;
    };
    const Suspender = ({ suspend }: { suspend: boolean }) => {
      if (suspend) use(never);

      return null;
    };
    const tree = (step: 'deleted' | 'shown' | 'suspended') =>
      step === 'deleted' ? null : (
        <Suspense fallback="loading">
          <Peer doc={doc}>
            <CleanupWriter />
          </Peer>
          <Suspender suspend={step === 'suspended'} />
        </Suspense>
      );

    environment.IS_REACT_ACT_ENVIRONMENT = false;
    const root = createRoot(container);

    try {
      root.render(tree('shown'));
      await settle();
      root.render(tree('suspended'));
      await settle();
      root.render(tree('deleted'));
      await settle();

      expect({ errors, listeners: afterTransactionListeners(doc) }).toEqual({
        errors: [],
        listeners: 0,
      });
    } finally {
      root.unmount();
      environment.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    }
  });

  test('renders the Yjs status and cursor hooks before the editor starts', () => {
    const doc = new Y.Doc();
    const awareness = new FakeAwareness(doc.clientID);

    awareness.attachDocument(doc);
    const seen: string[] = [];
    const Hooks = () => {
      // The hooks read the binding through the root editor's yjs API.
      const editor = useEditorContext() as never;

      seen.push(
        `${useYjsAdmissionStatus(editor).state}:${useYjsRemoteCursorIds(editor).length}`
      );

      return null;
    };
    const AwarePeer = () => {
      const editor = useEditor({
        initialValue: [paragraph('local')],
        plugins: [yjs({ awareness, doc, initialReady: true, seed: true })],
      });

      return (
        <EditorRoot editor={editor}>
          <Hooks />
        </EditorRoot>
      );
    };

    render(<AwarePeer />);

    expect({ first: seen[0], last: seen.at(-1) }).toEqual({
      first: 'waiting:0',
      last: 'ready:0',
    });
  });

  test('rejects a second live owner and recovers once the first unmounts', () => {
    const doc = new Y.Doc();
    let boundary: Boundary | null = null;
    const errors = mutedConsoleErrors();
    const Second = () => {
      const editor = useEditor({
        initialValue: [paragraph('second')],
        plugins: [yjs({ doc, initialReady: true, seed: true })],
      });

      return (
        <Boundary
          ref={(instance) => {
            boundary = instance;
          }}
        >
          <EditorRoot editor={editor}>{null}</EditorRoot>
        </Boundary>
      );
    };
    const tree = (first: boolean) => (
      <>
        {first ? <Peer doc={doc} /> : null}
        <Second />
      </>
    );

    try {
      const view = render(tree(true));
      const rejected = view.container.textContent;

      view.rerender(tree(false));
      act(() => boundary?.reset());

      expect({
        listeners: afterTransactionListeners(doc),
        recovered: view.container.textContent,
        rejected,
      }).toEqual({
        listeners: 1,
        recovered: '',
        rejected:
          'caught: Editor plugin "yjs" acquisition failed: Yjs namespace "document" already has an independent binding.',
      });
    } finally {
      errors.restore();
    }
  });

  test('reports the shared document loading once to onValueChange', async () => {
    const changes: string[] = [];
    const doc = loadedDoc('remote');
    let reveal = () => {};
    const Host = () => {
      const [mode, setMode] = useState<'hidden' | 'visible'>('visible');

      reveal = () =>
        setMode((value) => (value === 'visible' ? 'hidden' : 'visible'));

      return (
        <Activity mode={mode}>
          <Peer
            doc={doc}
            onCommit={({ commit }) => {
              if (commit.changed.hasAny('document')) changes.push('commit');
            }}
            onValueChange={() => changes.push('value')}
          >
            <Editable autoFocus />
          </Peer>
        </Activity>
      );
    };

    render(
      <StrictMode>
        <Host />
      </StrictMode>
    );
    act(() => reveal());
    act(() => reveal());

    expect(changes).toEqual(['commit', 'value']);
  });

  test('paints a remote cursor and stops rendering', async () => {
    const doc = new Y.Doc();
    const awareness = new FakeAwareness(doc.clientID);
    const rect = {
      bottom: 30,
      height: 18,
      left: 10,
      right: 50,
      top: 12,
      width: 40,
      x: 10,
      y: 12,
    };
    const { prototype } = window.Range;
    const previous = {
      bounding: Object.getOwnPropertyDescriptor(
        prototype,
        'getBoundingClientRect'
      ),
      rects: Object.getOwnPropertyDescriptor(prototype, 'getClientRects'),
    };
    let editor!: ReturnType<typeof useEditorContext>;
    let renders = 0;
    const Probe = ({
      editableRef,
    }: {
      editableRef: RefObject<HTMLDivElement | null>;
    }) => {
      renders += 1;
      editor = useEditorContext();
      const geometry = useYjsRemoteCursorGeometry(editor as never, 202, {
        editableRef,
      });

      return (
        <output data-testid="geometry">{geometry ? 'painted' : 'none'}</output>
      );
    };
    const App = () => {
      const editableRef = useRef<HTMLDivElement>(null);

      const local = useEditor({
        initialValue: [paragraph('remote cursor')],
        plugins: [yjs({ awareness, doc, initialReady: true, seed: true })],
      });

      return (
        <EditorRoot editor={local}>
          <Editable ref={editableRef} />
          <Probe editableRef={editableRef} />
        </EditorRoot>
      );
    };

    awareness.attachDocument(doc);
    Object.defineProperties(prototype, {
      getBoundingClientRect: { configurable: true, value: () => rect },
      getClientRects: { configurable: true, value: () => [rect] },
    });

    try {
      const view = render(<App />);

      act(() => {
        editor.update.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 6, path: [0, 0] },
        });
        awareness.setRemoteState(202, awareness.getLocalState() ?? {});
      });
      await waitFor(() => {
        expect(view.getByTestId('geometry').textContent).toBe('painted');
      });
      const painted = renders;

      await act(async () => {
        await settle();
      });

      expect(renders).toBe(painted);
    } finally {
      for (const [name, descriptor] of [
        ['getBoundingClientRect', previous.bounding],
        ['getClientRects', previous.rects],
      ] as const) {
        if (descriptor) Object.defineProperty(prototype, name, descriptor);
        else Reflect.deleteProperty(prototype, name);
      }
    }
  });

  test('keeps the autoFocus selection when the shared document loads', () => {
    const doc = loadedDoc('remote');
    let editor!: ReturnType<typeof useEditorContext>;
    const Capture = () => {
      editor = useEditorContext();

      return <Editable autoFocus />;
    };

    render(
      <Peer doc={doc}>
        <Capture />
      </Peer>
    );

    expect({
      selection: editor.read.selection() !== null,
      text: editor.read.text.string([]),
    }).toEqual({ selection: true, text: 'remote' });
  });
});

function mutedConsoleErrors() {
  const original = console.error;

  console.error = () => {};

  return { restore: () => (console.error = original) };
}
