'use client';

import * as React from 'react';

import type {
  YjsAwarenessChange,
  YjsAwarenessState,
  YjsProviderEvent,
  YjsProviderEventHandler,
  YjsProviderLike,
  YjsProviderStatus,
} from '@platejs/yjs';
import {
  useYjsProviderStatus,
  useYjsProviderSynced,
  YjsPlugin,
} from '@platejs/yjs/react';
import { RefreshCwIcon, Redo2Icon, Undo2Icon, UnplugIcon } from 'lucide-react';
import { createPlateEditor, Plate, useEditorSelector } from 'platejs/react';
import * as Y from 'yjs';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BasicNodesKit } from '@/registry/components/editor/plugins/basic-nodes-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { RemoteCursorOverlay } from '@/registry/ui/remote-cursor-overlay';

const ROOT_NAME = 'plate-collaboration-demo';
const SCHEMA = {
  id: 'plate-collaboration-demo',
  version: 1,
} as const;
const INITIAL_VALUE = [
  {
    children: [
      {
        text: 'Ada and Lin edit independent documents through a local Yjs room.',
      },
    ],
    type: 'paragraph',
  },
];

type DemoPeer = {
  clientId: number;
  color: string;
  id: 'ada' | 'lin';
  name: string;
};

const PEERS = [
  {
    clientId: 101,
    color: '#7C3AED',
    id: 'ada',
    name: 'Ada',
  },
  {
    clientId: 202,
    color: '#0891B2',
    id: 'lin',
    name: 'Lin',
  },
] as const satisfies readonly DemoPeer[];

const cloneInitialValue = () => structuredClone(INITIAL_VALUE);

class DemoAwareness {
  readonly clientID: number;
  readonly doc: { readonly clientID: number };

  private readonly listeners = new Set<(event: YjsAwarenessChange) => void>();
  private readonly publish: () => void;
  private localState: YjsAwarenessState | null = null;
  private readonly states = new Map<number, YjsAwarenessState>();
  private destroyed = false;

  constructor(clientId: number, publish: () => void) {
    this.clientID = clientId;
    this.doc = { clientID: clientId };
    this.publish = publish;
  }

  destroy() {
    this.destroyed = true;
    this.localState = null;
    this.states.clear();
    this.listeners.clear();
  }

  getLocalState() {
    return this.localState;
  }

  getStates() {
    return this.states;
  }

  listenerCount() {
    return this.listeners.size;
  }

  off(_event: 'change', handler: (event: YjsAwarenessChange) => void) {
    this.listeners.delete(handler);
  }

  on(_event: 'change', handler: (event: YjsAwarenessChange) => void) {
    this.listeners.add(handler);
  }

  removeRemoteState(clientId: number) {
    if (!this.states.delete(clientId)) return;

    this.emit({ added: [], removed: [clientId], updated: [] });
  }

  setLocalStateField(field: string, value: unknown) {
    if (this.destroyed) return;

    const hadLocalState = this.localState !== null;

    this.localState = Object.freeze({
      ...(this.localState ?? {}),
      [field]: value,
    });
    this.states.set(this.clientID, this.localState);
    this.emit({
      added: hadLocalState ? [] : [this.clientID],
      removed: [],
      updated: hadLocalState ? [this.clientID] : [],
    });
    this.publish();
  }

  setRemoteState(clientId: number, state: YjsAwarenessState) {
    if (this.destroyed) return;

    const added = !this.states.has(clientId);

    this.states.set(clientId, state);
    this.emit({
      added: added ? [clientId] : [],
      removed: [],
      updated: added ? [] : [clientId],
    });
  }

  private emit(event: YjsAwarenessChange) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

class DemoProvider implements YjsProviderLike {
  readonly awareness: DemoAwareness;
  readonly doc: Y.Doc;
  readonly peer: DemoPeer;
  status: YjsProviderStatus = 'connected';
  synced = true;

  private readonly eventListeners = new Map<
    YjsProviderEvent,
    Set<YjsProviderEventHandler>
  >();
  private readonly room: DemoRoom;
  private destroyed = false;
  private updateListenerAttached = true;

  constructor(peer: DemoPeer, room: DemoRoom) {
    this.peer = peer;
    this.room = room;
    this.doc = new Y.Doc();
    this.doc.clientID = peer.clientId;
    this.awareness = new DemoAwareness(peer.clientId, () => {
      this.room.publishAwareness(this);
    });
    this.doc.on('update', this.handleDocumentUpdate);
  }

  connect() {
    if (this.destroyed || this.status === 'connected') return;

    this.setStatus('connecting');
    this.setStatus('connected');
    this.room.connect(this);
    this.setSynced(true);
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.room.unregister(this);

    if (this.updateListenerAttached) {
      this.doc.off('update', this.handleDocumentUpdate);
      this.updateListenerAttached = false;
    }

    this.awareness.destroy();
    this.eventListeners.clear();
    this.doc.destroy();
  }

  disconnect() {
    if (this.destroyed || this.status === 'disconnected') return;

    this.room.disconnect(this);
    this.setStatus('disconnected');
  }

  listenerCount() {
    let count = this.updateListenerAttached ? 1 : 0;

    for (const listeners of this.eventListeners.values()) {
      count += listeners.size;
    }

    return count + this.awareness.listenerCount();
  }

  off(event: YjsProviderEvent, handler: YjsProviderEventHandler) {
    this.eventListeners.get(event)?.delete(handler);
  }

  on(event: YjsProviderEvent, handler: YjsProviderEventHandler) {
    const listeners = this.eventListeners.get(event) ?? new Set();

    listeners.add(handler);
    this.eventListeners.set(event, listeners);
  }

  receive(update: Uint8Array) {
    if (this.destroyed || this.status !== 'connected') return;

    Y.applyUpdate(this.doc, update, this.room);
  }

  private readonly handleDocumentUpdate = (
    update: Uint8Array,
    origin: unknown
  ) => {
    if (
      !this.destroyed &&
      this.status === 'connected' &&
      origin !== this.room
    ) {
      this.room.publishDocument(this, update);
    }
  };

  private emit(event: YjsProviderEvent, payload: unknown) {
    for (const listener of this.eventListeners.get(event) ?? []) {
      listener(payload as never);
    }
  }

  private setStatus(status: YjsProviderStatus) {
    this.status = status;
    this.emit('status', { status });
  }

  private setSynced(synced: boolean) {
    this.synced = synced;
    this.emit('sync', synced);
    this.emit('synced', synced);
  }
}

class DemoRoom {
  readonly providers: readonly [DemoProvider, DemoProvider];

  private readonly endpointProviders = new Set<DemoProvider>();
  private readonly roomDoc = new Y.Doc();
  private destroyed = false;

  constructor() {
    const providers = PEERS.map((peer) => new DemoProvider(peer, this)) as [
      DemoProvider,
      DemoProvider,
    ];

    this.providers = providers;

    for (const provider of providers) {
      this.endpointProviders.add(provider);
    }

    if (
      providers[0] === providers[1] ||
      providers[0].doc === providers[1].doc ||
      providers.some((provider) => provider.doc === this.roomDoc)
    ) {
      throw new Error(
        'The collaboration demo requires distinct providers and Y.Docs.'
      );
    }
  }

  connect(provider: DemoProvider) {
    if (this.destroyed || !this.endpointProviders.has(provider)) return;

    const outbound = Y.encodeStateAsUpdate(
      provider.doc,
      Y.encodeStateVector(this.roomDoc)
    );

    this.publishDocument(provider, outbound);
    provider.receive(
      Y.encodeStateAsUpdate(this.roomDoc, Y.encodeStateVector(provider.doc))
    );
    this.publishAwareness(provider);
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;

    for (const provider of this.providers) {
      provider.destroy();
    }

    this.roomDoc.destroy();

    const listenerCount = this.providers.reduce(
      (count, provider) => count + provider.listenerCount(),
      0
    );

    if (this.endpointProviders.size !== 0 || listenerCount !== 0) {
      throw new Error(
        `Collaboration demo teardown leaked ${this.endpointProviders.size} providers and ${listenerCount} listeners.`
      );
    }
  }

  disconnect(provider: DemoProvider) {
    if (!this.endpointProviders.has(provider)) return;

    for (const target of this.endpointProviders) {
      if (target !== provider && target.status === 'connected') {
        target.awareness.removeRemoteState(provider.peer.clientId);
      }
    }
  }

  publishAwareness(source: DemoProvider) {
    if (this.destroyed || !this.endpointProviders.has(source)) return;

    const localState = source.awareness.getLocalState();

    for (const target of this.endpointProviders) {
      if (target === source || target.status !== 'connected') continue;

      if (source.status === 'connected' && localState) {
        target.awareness.setRemoteState(source.peer.clientId, localState);
      } else {
        target.awareness.removeRemoteState(source.peer.clientId);
      }
    }
  }

  publishDocument(source: DemoProvider, update: Uint8Array) {
    if (
      this.destroyed ||
      source.status !== 'connected' ||
      !this.endpointProviders.has(source)
    ) {
      return;
    }

    Y.applyUpdate(this.roomDoc, update, source);

    for (const target of this.endpointProviders) {
      if (target !== source) {
        target.receive(update);
      }
    }
  }

  snapshot() {
    return Y.encodeStateAsUpdate(this.roomDoc);
  }

  unregister(provider: DemoProvider) {
    this.endpointProviders.delete(provider);
  }
}

class SchemaProbeProvider implements YjsProviderLike {
  readonly doc = new Y.Doc();
  status: YjsProviderStatus = 'disconnected';
  synced = false;

  private readonly eventListeners = new Map<
    YjsProviderEvent,
    Set<YjsProviderEventHandler>
  >();

  constructor(snapshot: Uint8Array) {
    Y.applyUpdate(this.doc, snapshot);
  }

  connect() {
    this.status = 'connected';
    this.emit('status', { status: this.status });
    this.synced = true;
    this.emit('sync', true);
    this.emit('synced', true);
  }

  destroy() {
    this.eventListeners.clear();
    this.doc.destroy();
  }

  disconnect() {
    this.synced = false;
    this.emit('sync', false);
    this.status = 'disconnected';
    this.emit('status', { status: this.status });
  }

  off(event: YjsProviderEvent, handler: YjsProviderEventHandler) {
    this.eventListeners.get(event)?.delete(handler);
  }

  on(event: YjsProviderEvent, handler: YjsProviderEventHandler) {
    const listeners = this.eventListeners.get(event) ?? new Set();

    listeners.add(handler);
    this.eventListeners.set(event, listeners);
  }

  private emit(event: YjsProviderEvent, payload: unknown) {
    for (const listener of this.eventListeners.get(event) ?? []) {
      listener(payload as never);
    }
  }
}

const createPeerEditor = (
  provider: DemoProvider,
  schemaVersion = SCHEMA.version
) => {
  const plugins = [
    ...BasicNodesKit,
    YjsPlugin.configure({
      initialState: {
        clientId: provider.peer.id,
        provider,
        rootName: ROOT_NAME,
      },
    }),
  ] as const;

  return createPlateEditor({
    id: `collaboration-demo-${provider.peer.id}-${schemaVersion}`,
    initialValue: cloneInitialValue(),
    plugins,
    schemaIdentity: {
      id: SCHEMA.id,
      version: schemaVersion,
    },
  });
};

type DemoEditor = ReturnType<typeof createPeerEditor>;

type DemoRuntime = {
  editors: readonly [DemoEditor, DemoEditor];
  room: DemoRoom;
};

const createDemoRuntime = (): DemoRuntime => {
  const room = new DemoRoom();

  try {
    return {
      editors: [
        createPeerEditor(room.providers[0]),
        createPeerEditor(room.providers[1]),
      ],
      room,
    };
  } catch (error) {
    room.destroy();
    throw error;
  }
};

const testSchemaJoin = (room: DemoRoom, version: number) => {
  const provider = new SchemaProbeProvider(room.snapshot());
  const plugins = [
    ...BasicNodesKit,
    YjsPlugin.configure({
      initialState: {
        clientId: `schema-probe-${version}`,
        provider,
        rootName: ROOT_NAME,
      },
    }),
  ] as const;

  try {
    const editor = createPlateEditor({
      id: `collaboration-demo-schema-probe-${version}`,
      initialValue: cloneInitialValue(),
      plugins,
      schemaIdentity: { id: SCHEMA.id, version },
    });

    editor.update.yjs.connect();
  } finally {
    provider.destroy();
  }
};

export default function CollaborativeEditingDemo(): React.ReactNode {
  const [runtime, setRuntime] = React.useState<DemoRuntime | null>(null);

  React.useEffect(() => {
    const nextRuntime = createDemoRuntime();
    let active = true;

    queueMicrotask(() => {
      if (active) {
        setRuntime(nextRuntime);
      }
    });

    return () => {
      active = false;
      nextRuntime.room.destroy();
    };
  }, []);

  if (!runtime) {
    return (
      <div
        className="flex min-h-96 items-center justify-center text-muted-foreground text-sm"
        role="status"
      >
        Starting a local collaboration room…
      </div>
    );
  }

  return <CollaborationRoom runtime={runtime} />;
}

function CollaborationRoom({ runtime }: { runtime: DemoRuntime }) {
  const [schemaResult, setSchemaResult] = React.useState<{
    kind: 'recovered' | 'rejected';
    message: string;
  } | null>(null);

  const rejectIncompatibleSchema = () => {
    try {
      testSchemaJoin(runtime.room, SCHEMA.version + 1);
      setSchemaResult({
        kind: 'rejected',
        message: 'The incompatible schema unexpectedly joined the room.',
      });
    } catch (error) {
      setSchemaResult({
        kind: 'rejected',
        message:
          error instanceof Error ? error.message : 'Schema join rejected.',
      });
    }
  };

  const recoverCompatibleSchema = () => {
    try {
      testSchemaJoin(runtime.room, SCHEMA.version);
      setSchemaResult({
        kind: 'recovered',
        message:
          'Schema v1 joined a fresh endpoint without replacing the editors.',
      });
    } catch (error) {
      setSchemaResult({
        kind: 'rejected',
        message:
          error instanceof Error ? error.message : 'Schema recovery failed.',
      });
    }
  };

  return (
    <div
      className="flex flex-col gap-4 p-4"
      data-collaboration-demo="local-yjs-room"
      data-doc-count="3"
      data-editor-count="2"
      data-provider-count="2"
    >
      <Alert>
        <AlertTitle>Development provider boundary</AlertTitle>
        <AlertDescription>
          This credential-free room uses two provider endpoints and three
          distinct Y.Docs. Production apps own transport, auth, persistence, and
          room names.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        {runtime.editors.map((editor, index) => {
          const peer = PEERS[index];

          return (
            <Plate editor={editor} key={peer.id}>
              <PeerCard editor={editor} peer={peer} />
            </Plate>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          data-schema-action="reject"
          onClick={rejectIncompatibleSchema}
          size="sm"
          variant="outline"
        >
          Reject schema v2
        </Button>
        <Button
          data-schema-action="recover"
          onClick={recoverCompatibleSchema}
          size="sm"
          variant="outline"
        >
          <RefreshCwIcon data-icon="inline-start" />
          Recover with schema v1
        </Button>
      </div>

      {schemaResult && (
        <Alert
          data-schema-status={schemaResult.kind}
          variant={schemaResult.kind === 'rejected' ? 'destructive' : 'default'}
        >
          <AlertTitle>
            {schemaResult.kind === 'rejected'
              ? 'Incompatible schema rejected'
              : 'Compatible schema recovered'}
          </AlertTitle>
          <AlertDescription>{schemaResult.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function PeerCard({ editor, peer }: { editor: DemoEditor; peer: DemoPeer }) {
  const providerStatus = useYjsProviderStatus(editor);
  const providerSynced = useYjsProviderSynced(editor);
  const connected = providerStatus === 'connected';

  return (
    <Card data-peer={peer.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>{peer.name}</CardTitle>
            <CardDescription>Independent editor and Y.Doc</CardDescription>
          </div>
          <Badge
            data-peer-status={providerStatus}
            variant={connected ? 'secondary' : 'destructive'}
          >
            {connected && providerSynced ? 'Synced' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <EditorContainer className="h-64" variant="demo">
          <Editor
            aria-label={`${peer.name} collaborative editor`}
            className="px-6 py-4"
            variant="demo"
          />
          <RemoteCursorOverlay />
        </EditorContainer>
      </CardContent>
      <PeerControls connected={connected} editor={editor} peer={peer} />
    </Card>
  );
}

function PeerControls({
  connected,
  editor,
  peer,
}: {
  connected: boolean;
  editor: DemoEditor;
  peer: DemoPeer;
}) {
  const undoDepth = useEditorSelector<number, DemoEditor>(
    (currentEditor) => currentEditor.read.history.undos().length
  );
  const redoDepth = useEditorSelector<number, DemoEditor>(
    (currentEditor) => currentEditor.read.history.redos().length
  );

  React.useEffect(() => {
    editor.update.yjs.sendCursorData({
      color: peer.color,
      name: peer.name,
    });
  }, [editor, peer.color, peer.name]);

  const toggleConnection = () => {
    if (connected) {
      editor.update.yjs.disconnect();
    } else {
      editor.update.yjs.connect();
    }
  };

  return (
    <CardFooter className="flex flex-wrap gap-2">
      <Button
        aria-label={`Undo ${peer.name}`}
        data-history-action="undo"
        disabled={undoDepth === 0}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.update.history.undo()}
        size="sm"
        variant="outline"
      >
        <Undo2Icon data-icon="inline-start" />
        Undo {undoDepth}
      </Button>
      <Button
        aria-label={`Redo ${peer.name}`}
        data-history-action="redo"
        disabled={redoDepth === 0}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.update.history.redo()}
        size="sm"
        variant="outline"
      >
        <Redo2Icon data-icon="inline-start" />
        Redo {redoDepth}
      </Button>
      <Button
        data-connection-action={connected ? 'disconnect' : 'connect'}
        onClick={toggleConnection}
        size="sm"
        variant="outline"
      >
        {connected ? <UnplugIcon data-icon="inline-start" /> : null}
        {connected ? 'Disconnect' : 'Reconnect'}
      </Button>
    </CardFooter>
  );
}
