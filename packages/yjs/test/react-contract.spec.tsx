import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React, { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import type { Descendant, Editor, Range } from '@platejs/plite';
import type { PliteDecorationSource } from '@platejs/plite-react';

import type { YjsRemoteCursorDecorationData } from '../src';
import {
  useYjsProviderStatus,
  useYjsProviderSynced,
  useYjsRemoteCursorDecorationSource,
  useYjsRemoteCursorOverlayPositions,
} from '../src/react';
import {
  createYjsPeer,
  FakeAwareness,
  FakeProvider,
  type Peer,
  paragraph,
  runYjsUpdate,
  setEditorDomApi,
} from './support/collaboration';

const shouldUnregisterHappyDOM = !GlobalRegistrator.isRegistered;

if (shouldUnregisterHappyDOM) {
  GlobalRegistrator.register();
}
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

after(() => {
  if (shouldUnregisterHappyDOM) {
    GlobalRegistrator.unregister();
  }
});

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const selection = (
  path: Range['anchor']['path'] = [0, 0],
  offset = 1
): Range => ({
  anchor: { path, offset },
  focus: { path, offset: offset + 2 },
});

type CursorData = {
  readonly color: string;
  readonly name: string;
};

type LabelDecorationData = {
  readonly clientId: number;
  readonly label: string;
};

type RenderedView = {
  readonly container: HTMLDivElement;
  readonly unmount: () => void;
};

type EditorProbeProps = {
  readonly editor: Editor;
};

const render = (element: React.ReactNode): RenderedView => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
};

const sendRemoteSelection = (
  peer: Peer,
  awareness: FakeAwareness,
  range: Range,
  clientId = 101
): void => {
  runYjsUpdate(peer, (yjs) => {
    yjs.sendSelection(range);
    awareness.setRemoteState(clientId, {
      data: { color: 'tomato', name: 'Ada' },
      selection: awareness.getLocalState()?.selection,
    });
  });
};

describe('@platejs/yjs react contract', () => {
  it('rerenders provider status hooks from provider lifecycle events', () => {
    const provider = new FakeProvider({
      awarenessClientId: 7,
      status: 'connecting',
    });
    const peer = createYjsPeer({
      children: initialValue(),
      clientId: 'a',
      provider,
    });

    const ProviderProbe = ({
      editor,
    }: EditorProbeProps): React.ReactElement => {
      const status = useYjsProviderStatus(editor);
      const synced = useYjsProviderSynced(editor);

      return (
        <output>
          {status ?? 'none'}:{String(synced)}
        </output>
      );
    };

    const view = render(<ProviderProbe editor={peer.editor} />);

    assert.equal(view.container.textContent, 'connecting:false');

    act(() => {
      provider.emitStatus('connected');
    });
    assert.equal(view.container.textContent, 'connected:false');

    act(() => {
      provider.emitSynced(true);
    });
    assert.equal(view.container.textContent, 'connected:true');

    view.unmount();
    peer.cleanup();
  });

  it('exposes remote cursors as a DOM-neutral decoration source', () => {
    const awareness = new FakeAwareness(2);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'b',
      numericClientId: 2,
    });

    setEditorDomApi(peer.editor, { isFocused: () => true });

    let source: PliteDecorationSource<
      YjsRemoteCursorDecorationData<CursorData>
    > | null = null;
    let lastRefreshRequiresDOMSelectionExport: boolean | null = null;

    const DecorationProbe = ({
      editor,
    }: EditorProbeProps): React.ReactElement | null => {
      const cursorSource =
        useYjsRemoteCursorDecorationSource<CursorData>(editor);

      useEffect(() => {
        source = cursorSource;

        return cursorSource.subscribeProjectionRefresh((result) => {
          lastRefreshRequiresDOMSelectionExport =
            result.requiresDOMSelectionExport;
        });
      }, [cursorSource]);

      return null;
    };

    const view = render(<DecorationProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([0, 0], 1));
    });

    assert.ok(source);
    const slices = Object.values(source.getSnapshot()).flat();
    const [slice] = slices;

    assert.equal(lastRefreshRequiresDOMSelectionExport, true);
    assert.equal(slices.length, 1);
    assert.ok(slice);

    const data = slice.data;

    assert.equal(data.clientId, 101);
    assert.deepEqual(data.data, { color: 'tomato', name: 'Ada' });

    view.unmount();
    peer.cleanup();
  });

  it('refreshes remote cursor decorations when decoration deps change', () => {
    const awareness = new FakeAwareness(4);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'd',
      numericClientId: 4,
    });
    let source: PliteDecorationSource<LabelDecorationData> | null = null;
    let setLabel: ((label: string) => void) | null = null;

    const DecorationProbe = ({
      editor,
    }: EditorProbeProps): React.ReactElement | null => {
      const [label, updateLabel] = React.useState('Ada');
      const cursorSource = useYjsRemoteCursorDecorationSource<
        CursorData,
        LabelDecorationData
      >(editor, {
        decorate: (cursor) => ({ clientId: cursor.clientId, label }),
        deps: [label],
      });

      useEffect(() => {
        setLabel = updateLabel;
        source = cursorSource;
      }, [cursorSource, updateLabel]);

      return null;
    };

    const view = render(<DecorationProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([0, 0], 1));
    });

    assert.ok(source);
    assert.equal(
      Object.values(source.getSnapshot()).flat()[0]?.data.label,
      'Ada'
    );

    act(() => {
      setLabel?.('Grace');
    });

    assert.equal(
      Object.values(source.getSnapshot()).flat()[0]?.data.label,
      'Grace'
    );

    view.unmount();
    peer.cleanup();
  });

  it('resolves remote cursor overlay rectangles through the editor DOM API', () => {
    const awareness = new FakeAwareness(3);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'c',
      numericClientId: 3,
    });
    let rect = new DOMRect(10, 20, 20, 20);

    setEditorDomApi(peer.editor, { resolveRangeRect: () => rect });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [positions] = useYjsRemoteCursorOverlayPositions(editor);

      return (
        <output>
          {positions.map(
            (position) => `${position.clientId}:${position.rect?.x}`
          )}
        </output>
      );
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    assert.equal(view.container.textContent, '101:10');

    act(() => {
      rect = new DOMRect(25, 20, 20, 20);
      peer.editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 'alpha'.length } });
      });
    });

    assert.equal(view.container.textContent, '101:25');

    view.unmount();
    peer.cleanup();
  });

  it('ignores malformed remote cursor overlay rectangles', () => {
    const awareness = new FakeAwareness(6);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'f',
      numericClientId: 6,
    });

    setEditorDomApi(peer.editor, {
      resolveRangeRect: () => ({ x: 10 }),
    });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [positions] = useYjsRemoteCursorOverlayPositions(editor);

      return <output>{String(positions[0]?.rect === null)}</output>;
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    assert.equal(view.container.textContent, 'true');

    view.unmount();
    peer.cleanup();
  });

  it('keeps overlay positions stable across unrelated editor updates', () => {
    const awareness = new FakeAwareness(8);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'h',
      numericClientId: 8,
    });
    let renders = 0;

    setEditorDomApi(peer.editor, { resolveRangeRect: () => null });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [positions] = useYjsRemoteCursorOverlayPositions(editor);

      renders += 1;

      return <output>{positions.length}</output>;
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    const rendersAfterRemoteSelection = renders;

    act(() => {
      peer.editor.update((tx) => {
        tx.text.insert('!', { at: { path: [2, 0], offset: 'gamma'.length } });
      });
    });

    assert.equal(renders, rendersAfterRemoteSelection);

    view.unmount();
    peer.cleanup();
  });

  it('refreshes overlay positions when a remote cursor selection changes', () => {
    const awareness = new FakeAwareness(10);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'j',
      numericClientId: 10,
    });

    setEditorDomApi(peer.editor, { resolveRangeRect: () => null });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [positions] = useYjsRemoteCursorOverlayPositions(editor);
      const anchor = positions[0]?.range.anchor;

      return (
        <output>
          {anchor?.path.join('.') ?? 'none'}:{anchor?.offset}
        </output>
      );
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([0, 0], 1));
    });

    assert.equal(view.container.textContent, '0.0:1');

    act(() => {
      sendRemoteSelection(peer, awareness, selection([2, 0], 2));
    });

    assert.equal(view.container.textContent, '2.0:2');

    view.unmount();
    peer.cleanup();
  });

  it('refreshes remote cursor overlay data when overlay deps change', () => {
    const awareness = new FakeAwareness(5);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'e',
      numericClientId: 5,
    });
    let setLabel: ((label: string) => void) | null = null;

    setEditorDomApi(peer.editor, { resolveRangeRect: () => null });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [label, updateLabel] = React.useState('Ada');
      const [positions] = useYjsRemoteCursorOverlayPositions<
        { color: string; name: string },
        { label: string }
      >(editor, {
        data: () => ({ label }),
        deps: [label],
      });

      useEffect(() => {
        setLabel = updateLabel;
      }, [updateLabel]);

      return <output>{positions[0]?.data.label}</output>;
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    assert.equal(view.container.textContent, 'Ada');

    act(() => {
      setLabel?.('Grace');
    });

    assert.equal(view.container.textContent, 'Grace');

    view.unmount();
    peer.cleanup();
  });

  it('refreshes custom overlay data when it has a cursor-named object', () => {
    const awareness = new FakeAwareness(9);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'i',
      numericClientId: 9,
    });
    let setLabel: ((label: string) => void) | null = null;

    setEditorDomApi(peer.editor, { resolveRangeRect: () => null });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [label, updateLabel] = React.useState('Ada');
      const [positions] = useYjsRemoteCursorOverlayPositions<
        { color: string; name: string },
        { cursor: { clientId: number; label: string } }
      >(editor, {
        data: (cursor) => ({
          cursor: { clientId: cursor.clientId, label },
        }),
        deps: [label],
      });

      useEffect(() => {
        setLabel = updateLabel;
      }, [updateLabel]);

      return <output>{positions[0]?.data.cursor.label}</output>;
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    assert.equal(view.container.textContent, 'Ada');

    act(() => {
      setLabel?.('Grace');
    });

    assert.equal(view.container.textContent, 'Grace');

    view.unmount();
    peer.cleanup();
  });

  it('keeps custom cursor-named overlay data stable across unrelated editor updates', () => {
    const awareness = new FakeAwareness(11);
    const peer = createYjsPeer({
      awareness,
      children: initialValue(),
      clientId: 'k',
      numericClientId: 11,
    });
    let renders = 0;

    setEditorDomApi(peer.editor, { resolveRangeRect: () => null });

    const OverlayProbe = ({ editor }: EditorProbeProps): React.ReactElement => {
      const [positions] = useYjsRemoteCursorOverlayPositions<
        { color: string; name: string },
        { cursor: { clientId: number; label: string } }
      >(editor, {
        data: (cursor) => ({
          cursor: { clientId: cursor.clientId, label: cursor.data.name },
        }),
      });

      renders += 1;

      return <output>{positions[0]?.data.cursor.label}</output>;
    };

    const view = render(<OverlayProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    const rendersAfterRemoteSelection = renders;

    act(() => {
      peer.editor.update((tx) => {
        tx.text.insert('!', { at: { path: [2, 0], offset: 'gamma'.length } });
      });
    });

    assert.equal(view.container.textContent, 'Ada');
    assert.equal(renders, rendersAfterRemoteSelection);

    view.unmount();
    peer.cleanup();
  });
});
