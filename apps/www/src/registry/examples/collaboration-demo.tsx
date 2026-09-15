'use client';

import { RefreshCwIcon, Redo2Icon, Undo2Icon, UnplugIcon } from 'lucide-react';
import { createEditor, EditorRoot, useEditorRuntimeState } from 'platejs/react';
import {
  yjs,
  type YjsAwarenessChange,
  type YjsAwarenessState,
} from 'platejs/yjs';
import { useYjsAdmissionStatus } from 'platejs/yjs/react';
import * as React from 'react';
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
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { CollaborationPlugin } from '@/registry/components/editor/remote-cursor-overlay';

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
  readonly doc: Y.Doc;

  private readonly listeners = new Set<(event: YjsAwarenessChange) => void>();
  private readonly publish: () => void;
  private localState: YjsAwarenessState | null = null;
  private readonly states = new Map<number, YjsAwarenessState>();
  private destroyed = false;

  constructor(doc: Y.Doc, publish: () => void) {
    this.clientID = doc.clientID;
    this.doc = doc;
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

  removeRemoteStates() {
    const removed = [...this.states.keys()].filter(
      (clientId) => clientId !== this.clientID
    );

    if (removed.length === 0) return;

    for (const clientId of removed) {
      this.states.delete(clientId);
    }

    this.emit({ added: [], removed, updated: [] });
  }

  setLocalStateField(field: string, value: unknown) {
    if (this.destroyed) return;

    const hadLocalState = this.localState !== null;

    this.localState = Object.freeze({
      ...this.localState,
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

type DemoProviderSnapshot = Readonly<{
  status: 'connected' | 'connecting' | 'disconnected';
  synced: boolean;
}>;

class DemoProvider {
  readonly awareness: DemoAwareness;
  readonly doc: Y.Doc;
  readonly peer: DemoPeer;

  private readonly listeners = new Set<() => void>();
  private readonly room: DemoRoom;
  private destroyed = false;
  private snapshot: DemoProviderSnapshot = Object.freeze({
    status: 'disconnected',
    synced: false,
  });
  private updateListenerAttached = true;

  constructor(peer: DemoPeer, room: DemoRoom) {
    this.peer = peer;
    this.room = room;
    this.doc = new Y.Doc();
    this.doc.clientID = peer.clientId;
    this.awareness = new DemoAwareness(this.doc, () => {
      this.room.publishAwareness(this);
    });
    this.doc.on('update', this.handleDocumentUpdate);
  }

  connect() {
    if (this.destroyed || this.snapshot.status === 'connected') return;

    this.setSnapshot({ status: 'connecting', synced: false });
    this.setSnapshot({ status: 'connected', synced: false });
    this.room.connect(this);
    this.setSnapshot({ status: 'connected', synced: true });
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
    this.listeners.clear();
    this.doc.destroy();
  }

  disconnect() {
    if (this.destroyed || this.snapshot.status === 'disconnected') return;

    this.room.disconnect(this);
    this.setSnapshot({ status: 'disconnected', synced: false });
  }

  getSnapshot = () => this.snapshot;

  listenerCount() {
    const count = this.updateListenerAttached ? 1 : 0;

    return count + this.listeners.size + this.awareness.listenerCount();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    let active = true;

    return () => {
      if (!active) return;

      active = false;
      this.listeners.delete(listener);
    };
  };

  receive(update: Uint8Array) {
    if (this.destroyed || this.snapshot.status !== 'connected') return;

    Y.applyUpdate(this.doc, update, this.room);
  }

  private readonly handleDocumentUpdate = (
    update: Uint8Array,
    origin: unknown
  ) => {
    if (
      !this.destroyed &&
      this.snapshot.status === 'connected' &&
      origin !== this.room
    ) {
      this.room.publishDocument(this, update);
    }
  };

  private setSnapshot(snapshot: DemoProviderSnapshot) {
    if (
      snapshot.status === this.snapshot.status &&
      snapshot.synced === this.snapshot.synced
    ) {
      return;
    }

    this.snapshot = Object.freeze(snapshot);

    for (const listener of this.listeners) listener();
  }
}

const seedRoomDocument = (doc: Y.Doc) => {
  const editor = createEditor({
    id: 'collaboration-demo-seed-owner',
    initialValue: cloneInitialValue(),
    plugins: BasicNodesKit,
    schema: SCHEMA,
  });
  const uninstall = editor.install(
    yjs({
      doc,
      initialReady: true,
      rootName: ROOT_NAME,
      seed: true,
    })
  );

  uninstall();
};

class DemoRoom {
  readonly providers: readonly [DemoProvider, DemoProvider];

  private readonly endpointProviders = new Set<DemoProvider>();
  private readonly roomDoc = new Y.Doc();
  private destroyed = false;

  constructor() {
    seedRoomDocument(this.roomDoc);

    const providers = PEERS.map((peer) => new DemoProvider(peer, this)) as [
      DemoProvider,
      DemoProvider,
    ];

    this.providers = providers;

    for (const provider of providers) {
      this.endpointProviders.add(provider);
      provider.connect();
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

    for (const source of this.endpointProviders) {
      if (source === provider || source.getSnapshot().status !== 'connected') {
        continue;
      }

      const localState = source.awareness.getLocalState();

      if (localState) {
        provider.awareness.setRemoteState(source.peer.clientId, localState);
      }
    }

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

    provider.awareness.removeRemoteStates();

    for (const target of this.endpointProviders) {
      if (target !== provider && target.getSnapshot().status === 'connected') {
        target.awareness.removeRemoteState(provider.peer.clientId);
      }
    }
  }

  publishAwareness(source: DemoProvider) {
    if (this.destroyed || !this.endpointProviders.has(source)) return;

    const localState = source.awareness.getLocalState();

    for (const target of this.endpointProviders) {
      if (target === source || target.getSnapshot().status !== 'connected') {
        continue;
      }

      if (source.getSnapshot().status === 'connected' && localState) {
        target.awareness.setRemoteState(source.peer.clientId, localState);
      } else {
        target.awareness.removeRemoteState(source.peer.clientId);
      }
    }
  }

  publishDocument(source: DemoProvider, update: Uint8Array) {
    if (
      this.destroyed ||
      source.getSnapshot().status !== 'connected' ||
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

const createPeerEditor = (
  provider: DemoProvider,
  schemaVersion = SCHEMA.version
) => {
  const plugins = [
    ...BasicNodesKit,
    CollaborationPlugin.create({
      awareness: provider.awareness,
      cursorData: {
        validate: (value): value is { color: string; name: string } =>
          typeof value === 'object' &&
          value !== null &&
          'color' in value &&
          typeof value.color === 'string' &&
          'name' in value &&
          typeof value.name === 'string',
      },
      doc: provider.doc,
      initialReady: true,
      rootName: ROOT_NAME,
    }),
  ] as const;

  return createEditor({
    id: `collaboration-demo-${provider.peer.id}-${schemaVersion}`,
    initialValue: cloneInitialValue(),
    plugins,
    schema: {
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
  const doc = new Y.Doc();

  Y.applyUpdate(doc, room.snapshot());

  try {
    const editor = createEditor({
      id: `collaboration-demo-schema-probe-${version}`,
      initialValue: cloneInitialValue(),
      plugins: BasicNodesKit,
      schema: { id: SCHEMA.id, version },
    });
    const uninstall = editor.install(
      yjs({
        doc,
        initialReady: true,
        rootName: ROOT_NAME,
      })
    );

    uninstall();
  } finally {
    doc.destroy();
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
      <output className="flex min-h-96 items-center justify-center text-sm text-muted-foreground">
        Starting a local collaboration room…
      </output>
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
      className="flex min-w-0 flex-col gap-4 p-4"
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

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {runtime.editors.map((editor, index) => {
          const peer = PEERS[index];

          return (
            <EditorRoot editor={editor} key={peer.id}>
              <PeerCard
                editor={editor}
                peer={peer}
                provider={runtime.room.providers[index]}
              />
            </EditorRoot>
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

function PeerCard({
  editor,
  peer,
  provider,
}: {
  editor: DemoEditor;
  peer: DemoPeer;
  provider: DemoProvider;
}) {
  const admission = useYjsAdmissionStatus(editor);
  const providerSnapshot = React.useSyncExternalStore(
    provider.subscribe,
    provider.getSnapshot,
    provider.getSnapshot
  );
  const connected = providerSnapshot.status === 'connected';
  const ready = admission.state === 'ready';

  return (
    <Card className="min-w-0" data-peer={peer.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>{peer.name}</CardTitle>
            <CardDescription>Independent editor and Y.Doc</CardDescription>
          </div>
          <Badge
            data-peer-status={providerSnapshot.status}
            variant={connected ? 'secondary' : 'destructive'}
          >
            {connected && providerSnapshot.synced ? 'Synced' : 'Disconnected'}
          </Badge>
          <Badge
            data-admission-status={admission.state}
            variant={ready ? 'secondary' : 'outline'}
          >
            {ready ? 'Ready' : admission.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {admission.state === 'error' && (
          <Alert className="mb-3" variant="destructive">
            <AlertTitle>Collaboration import failed</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>
                {admission.cause instanceof Error
                  ? admission.cause.message
                  : String(admission.cause)}
              </span>
              <Button
                onClick={() => editor.api.yjs.retryImport()}
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <EditorContainer className="h-64" variant="demo">
          <Editor
            aria-label={`${peer.name} collaborative editor`}
            aria-busy={admission.state === 'waiting'}
            className="px-6 py-4"
            readOnly={!ready}
            variant="demo"
          />
        </EditorContainer>
      </CardContent>
      <PeerControls
        connected={connected}
        editor={editor}
        peer={peer}
        provider={provider}
      />
    </Card>
  );
}

function PeerControls({
  connected,
  editor,
  peer,
  provider,
}: {
  connected: boolean;
  editor: DemoEditor;
  peer: DemoPeer;
  provider: DemoProvider;
}) {
  const history = useEditorRuntimeState(editor, (state) => state.history());
  const redoDepth = history.redos.length;
  const undoDepth = history.undos.length;

  React.useEffect(() => {
    editor.api.yjs.setCursorData({
      color: peer.color,
      name: peer.name,
    });
  }, [editor, peer.color, peer.name]);

  const toggleConnection = () => {
    if (connected) {
      editor.api.yjs.clearSelection();
      provider.disconnect();
    } else {
      provider.connect();

      if (editor.api.yjs.admissionStatus().state === 'ready') {
        editor.api.yjs.syncSelection();
      }
    }
  };

  return (
    <CardFooter className="flex flex-wrap gap-2">
      <Button
        aria-label={`Undo ${peer.name}`}
        data-history-action="undo"
        disabled={undoDepth === 0}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          editor.update.history.undo();
        }}
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
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          editor.update.history.redo();
        }}
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
