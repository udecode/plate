import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import type { Descendant, Range } from '../../src/core';
import { BaseParagraphPlugin } from '../../src/core';
import type {
  Editor as ReactViewEditor,
  PlateLeafProps,
} from '../../src/react/core';
import {
  createEditor,
  Plate,
  PlateContent,
  PlateLeaf,
} from '../../src/react/core';
import {
  useYjsProviderStatus,
  useYjsProviderSynced,
  useYjsRemoteCursor,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from '../../src/yjs/react';
import { YjsPlugin } from '../../src/yjs/react/index';
import {
  FakeAwareness,
  FakeProvider,
  type Peer,
  paragraph,
  runYjsUpdate,
} from './support/collaboration';
import { createYjsReactPeer } from './support/react-collaboration';

const shouldUnregisterHappyDOM = !GlobalRegistrator.isRegistered;

if (shouldUnregisterHappyDOM) {
  GlobalRegistrator.register();
}
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

after(() => {
  if (shouldUnregisterHappyDOM) {
    void GlobalRegistrator.unregister();
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

type RenderedView = {
  readonly container: HTMLDivElement;
  readonly unmount: () => void;
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

const YjsLeaf = (props: PlateLeafProps<typeof YjsPlugin>) => {
  const cursor = props.leaf.yjsRemoteCursor;

  return (
    <PlateLeaf
      {...props}
      attributes={{
        ...props.attributes,
        ...(cursor ? { 'data-yjs-client': cursor.clientId } : {}),
      }}
    />
  );
};

void describe('platejs/yjs react contract', () => {
  void it('rerenders provider status hooks from provider lifecycle events', () => {
    const provider = new FakeProvider({
      awarenessClientId: 7,
      status: 'connecting',
    });
    const peer = createYjsReactPeer({
      children: initialValue(),
      clientId: 'a',
      provider,
    });

    const ProviderProbe = ({
      editor,
    }: {
      readonly editor: ReactViewEditor;
    }): React.ReactElement => {
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

  void it('rerenders provider status after a Plate update portal disconnect', () => {
    const provider = new FakeProvider({
      awarenessClientId: 7,
      status: 'connected',
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'alpha' }], type: 'paragraph' }],
      plugins: [
        BaseParagraphPlugin,
        YjsPlugin.configure({
          initialState: { clientId: 'a', provider },
        }),
      ],
      schema: { id: 'plate:yjs-react-contract', version: 1 },
    });

    const ProviderProbe = (): React.ReactElement => {
      const status = useYjsProviderStatus(editor);

      return <output>{status ?? 'none'}</output>;
    };

    const view = render(<ProviderProbe />);

    assert.equal(view.container.textContent, 'connected');

    act(() => {
      editor.update.yjs.disconnect();
    });

    assert.equal(view.container.textContent, 'disconnected');

    view.unmount();
  });

  void it('publishes YjsPlugin selections through its keyed decoration source', () => {
    const provider = new FakeProvider({
      awarenessClientId: 101,
      status: 'connected',
      synced: true,
    });
    const editor = createEditor({
      initialValue: initialValue(),
      plugins: [
        BaseParagraphPlugin,
        YjsPlugin.configure({
          initialState: { clientId: 'local', provider },
          render: { leaf: YjsLeaf },
        }),
      ],
      schema: { id: 'plate:yjs-keyed-decoration', version: 1 },
    });
    const view = render(
      <Plate editor={editor}>
        <PlateContent aria-label="Editor" />
      </Plate>
    );

    act(() => {
      editor.update.selection.set(selection([0, 0], 1));
      editor.update.yjs.sendSelection();
      provider.awareness.setRemoteState(202, {
        data: { name: 'Ada' },
        selection: provider.awareness.getLocalState()?.selection,
      });
    });

    assert.equal(
      view.container.querySelector('[data-yjs-client="202"]')?.textContent,
      'lp'
    );

    act(() => {
      editor.update.selection.set(selection([1, 0], 0));
      editor.update.yjs.sendSelection();
      provider.awareness.setRemoteState(202, {
        data: { name: 'Ada' },
        selection: provider.awareness.getLocalState()?.selection,
      });
    });

    assert.equal(
      view.container.querySelector('[data-yjs-client="202"]')?.textContent,
      'be'
    );

    view.unmount();
  });

  void it('removes and restores keyed YjsPlugin selections across reconnect', () => {
    const provider = new FakeProvider({
      awarenessClientId: 101,
      status: 'connected',
      synced: true,
    });
    const editor = createEditor({
      initialValue: initialValue(),
      plugins: [
        BaseParagraphPlugin,
        YjsPlugin.configure({
          initialState: { clientId: 'local', provider },
          render: { leaf: YjsLeaf },
        }),
      ],
      schema: { id: 'plate:yjs-keyed-decoration-reconnect', version: 1 },
    });
    const view = render(
      <Plate editor={editor}>
        <PlateContent aria-label="Editor" />
      </Plate>
    );

    act(() => {
      editor.update.selection.set(selection([0, 0], 1));
      editor.update.yjs.sendSelection();
      provider.awareness.setRemoteState(202, {
        data: { name: 'Ada' },
        selection: provider.awareness.getLocalState()?.selection,
      });
    });

    assert.equal(
      view.container.querySelectorAll('[data-yjs-client="202"]').length,
      1
    );

    act(() => {
      editor.update.yjs.disconnect();
    });
    assert.equal(
      view.container.querySelectorAll('[data-yjs-client="202"]').length,
      0
    );

    act(() => {
      editor.update.yjs.connect();
    });
    assert.equal(
      view.container.querySelectorAll('[data-yjs-client="202"]').length,
      1
    );

    view.unmount();
  });

  void it('fans remote cursor React updates out by client id', () => {
    const awareness = new FakeAwareness(3);
    const peer = createYjsReactPeer({
      awareness,
      children: initialValue(),
      clientId: 'c',
      numericClientId: 3,
    });
    const renders = new Map<number, number>();

    const CursorProbe = ({
      clientId,
      editor,
    }: {
      readonly editor: ReactViewEditor;
    } & { readonly clientId: number }) => {
      const cursor = useYjsRemoteCursor(editor, clientId);

      renders.set(clientId, (renders.get(clientId) ?? 0) + 1);

      return (
        <output data-client-id={clientId}>
          {typeof cursor?.data?.name === 'string' ? cursor.data.name : 'none'}
        </output>
      );
    };

    const CursorList = ({ editor }: { readonly editor: ReactViewEditor }) => {
      const ids = useYjsRemoteCursorIds(editor);

      return ids.map((clientId) => (
        <CursorProbe clientId={clientId} editor={editor} key={clientId} />
      ));
    };

    const view = render(<CursorList editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([0, 0], 1), 101);
      sendRemoteSelection(peer, awareness, selection([1, 0], 1), 102);
    });

    const secondRenders = renders.get(102);

    act(() => {
      awareness.setRemoteState(101, {
        data: { name: 'Grace' },
        selection: awareness.getStates().get(101)?.selection,
      });
    });

    assert.equal(
      view.container.querySelector('[data-client-id="101"]')?.textContent,
      'Grace'
    );
    assert.equal(renders.get(102), secondRenders);

    view.unmount();
    peer.cleanup();
  });

  void it('returns null geometry without the exact mounted Editable', () => {
    const awareness = new FakeAwareness(5);
    const peer = createYjsReactPeer({
      awareness,
      children: initialValue(),
      clientId: 'e',
      numericClientId: 5,
    });

    const GeometryProbe = ({
      editor,
    }: {
      readonly editor: ReactViewEditor;
    }) => {
      const editableRef = React.useRef<HTMLDivElement>(null);
      const geometry = useYjsRemoteCursorGeometry(editor, 101, {
        editableRef,
      });

      return <output>{geometry ? 'measured' : 'none'}</output>;
    };

    const view = render(<GeometryProbe editor={peer.editor} />);

    act(() => {
      sendRemoteSelection(peer, awareness, selection([1, 0], 1));
    });

    assert.equal(view.container.textContent, 'none');

    view.unmount();
    peer.cleanup();
  });
});
