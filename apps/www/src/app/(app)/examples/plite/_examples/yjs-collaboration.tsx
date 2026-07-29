import { createYjsExtension, type YjsAwarenessChange } from '@platejs/yjs';
import { useYjsRemoteCursors } from '@platejs/yjs/react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  createEditor,
  defineEditorSchema,
  defineExtensionSlot,
  type Descendant,
  type ElementIn,
  type Editor,
  type EditorSchemaIdentity,
  type EditorUpdateTransaction,
  type EditorValueFromExtensions,
  NodeApi,
  type Path,
  property,
  type Range,
  schema,
  type TextIn,
  TextApi,
} from '@platejs/plite';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  Plite,
  type ReactEditor,
  usePliteEditor,
} from '@platejs/plite-react';
import * as Y from 'yjs';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type NamedSchemaIdentity = Extract<EditorSchemaIdentity, { kind: 'named' }>;

type PeerId = 'a' | 'b' | 'c' | 'd';

type PeerDefinition = {
  appendText: string;
  clientId: number;
  id: PeerId;
  name: string;
  replacementText: string;
};

type PeerCommandTx =
  YjsEditor extends Editor<infer V, infer TExtensions>
    ? EditorUpdateTransaction<V, TExtensions>
    : never;
type PeerCommand = (tx: PeerCommandTx) => void;

type ExamplePeer = PeerDefinition & {
  awareness: ExampleAwareness;
  connected: boolean;
  doc: Y.Doc;
  editor?: YjsEditor;
  redoDepth: number;
  renderEpoch: number;
  undoDepth: number;
};

type ExampleNetwork = {
  notify: () => void;
  peers: ExamplePeer[];
  registerPeerEditor: (peer: ExamplePeer, editor: YjsEditor) => () => void;
  roomSchemaIdentity: NamedSchemaIdentity;
  subscribeNotify: (notify: () => void) => () => void;
  syncAll: () => void;
  syncAwareness: () => void;
  syncing: boolean;
};

const PEERS: PeerDefinition[] = [
  {
    appendText: ' Ada',
    clientId: 101,
    id: 'a',
    name: 'Ada',
    replacementText: 'Ada canonical snapshot.',
  },
  {
    appendText: ' Lin',
    clientId: 202,
    id: 'b',
    name: 'Lin',
    replacementText: 'Lin canonical snapshot.',
  },
  {
    appendText: ' Ken',
    clientId: 303,
    id: 'c',
    name: 'Ken',
    replacementText: 'Ken canonical snapshot.',
  },
  {
    appendText: ' Eve',
    clientId: 404,
    id: 'd',
    name: 'Eve',
    replacementText: 'Eve canonical snapshot.',
  },
] as const;

const ROOT_NAME = '@platejs/plite';
const schemaSlot = defineExtensionSlot('yjs-collaboration-schema');

const createCollaborationSchema = (version: number) =>
  defineEditorSchema({
    elements: {
      'block-quote': {
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'yjs-collaboration-example',
    properties: [
      schema.textProperty(
        'bold',
        property.boolean({ default: false, omitDefault: true })
      ),
    ],
    root: {
      content: schema.content.types(['block-quote', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    unknown: 'preserve',
    version,
  });

type CollaborationValue = EditorValueFromExtensions<
  readonly [ReturnType<typeof createCollaborationSchema>]
>;
type CollaborationElement = ElementIn<CollaborationValue>;
type CollaborationText = TextIn<CollaborationValue>;
type YjsEditor = ReactEditor<
  CollaborationValue,
  readonly [ReturnType<typeof createYjsExtension>]
>;

const syncPeerHistoryDepths = (peer: ExamplePeer, editor: YjsEditor) => {
  peer.undoDepth = editor.read.history.undos().length;
  peer.redoDepth = editor.read.history.redos().length;
};

const INITIAL_VALUE: CollaborationValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Hello world!' }],
  },
];

class ExampleAwareness {
  readonly clientID: number;
  readonly doc: { clientID: number };

  onLocalStateChange?: () => void;

  private readonly listeners = new Set<(event: YjsAwarenessChange) => void>();
  private localState: Record<string, unknown> | null = null;
  private readonly states = new Map<number, Record<string, unknown>>();

  constructor(clientID: number) {
    this.clientID = clientID;
    this.doc = { clientID };
  }

  getLocalState() {
    return this.localState;
  }

  getStates() {
    return this.states;
  }

  off(_event: 'change', handler: (event: YjsAwarenessChange) => void) {
    this.listeners.delete(handler);
  }

  on(_event: 'change', handler: (event: YjsAwarenessChange) => void) {
    this.listeners.add(handler);
  }

  removeRemoteState(clientId: number) {
    if (!this.states.delete(clientId)) {
      return;
    }

    this.emit();
  }

  setLocalStateField(field: string, value: unknown) {
    this.localState = {
      ...(this.localState ?? {}),
      [field]: value,
    };
    this.states.set(this.clientID, this.localState);
    this.emit();
    this.onLocalStateChange?.();
  }

  setRemoteState(clientId: number, state: Record<string, unknown>) {
    this.states.set(clientId, state);
    this.emit();
  }

  private emit() {
    const event: YjsAwarenessChange = {
      added: [],
      removed: [],
      updated: [this.clientID],
    };

    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

const paragraph = (text: string): CollaborationElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createSeedSnapshot = () => {
  const seedDoc = new Y.Doc();

  const seedEditor = createEditor({
    extensions: [
      schemaSlot.of(createCollaborationSchema(1)),
      createYjsExtension({
        clientId: 'seed',
        doc: seedDoc,
        rootName: ROOT_NAME,
      }),
    ],
    initialValue: cloneValue(INITIAL_VALUE),
  });
  const identity = seedEditor.read.schema.identity();

  if (identity?.kind !== 'named') {
    throw new Error(
      'The Yjs collaboration example requires a named schema identity.'
    );
  }

  return {
    identity,
    update: Y.encodeStateAsUpdate(seedDoc),
  };
};

const createExampleNetwork = (): ExampleNetwork => {
  const seed = createSeedSnapshot();
  const peers: ExamplePeer[] = PEERS.map((definition) => {
    const doc = new Y.Doc();

    doc.clientID = definition.clientId;
    Y.applyUpdate(doc, seed.update);

    return {
      ...definition,
      awareness: new ExampleAwareness(definition.clientId),
      connected: true,
      doc,
      redoDepth: 0,
      renderEpoch: 0,
      undoDepth: 0,
    };
  });

  const network: ExampleNetwork = {
    notify: () => {},
    peers,
    registerPeerEditor(peer, editor) {
      peer.editor = editor;

      return () => {
        if (peer.editor === editor) {
          peer.editor = undefined;
        }
      };
    },
    roomSchemaIdentity: seed.identity,
    subscribeNotify(notify) {
      network.notify = notify;

      return () => {
        if (network.notify === notify) {
          network.notify = () => {};
        }
      };
    },
    syncAll() {
      if (network.syncing) {
        return;
      }

      network.syncing = true;

      try {
        for (const source of peers) {
          if (!source.connected) {
            continue;
          }

          for (const target of peers) {
            if (source === target || !target.connected) {
              continue;
            }

            const update = Y.encodeStateAsUpdate(
              source.doc,
              Y.encodeStateVector(target.doc)
            );

            Y.applyUpdate(target.doc, update, source.doc);
          }
        }

        for (const peer of peers) {
          if (!peer.connected || !peer.editor) {
            continue;
          }

          peer.editor.update.yjs.reconcile();
        }

        network.syncAwareness();
      } finally {
        network.syncing = false;
      }

      network.notify();
    },
    syncAwareness() {
      for (const target of peers) {
        for (const source of peers) {
          if (source === target) {
            continue;
          }

          const localState = source.awareness.getLocalState();

          if (source.connected && target.connected && localState) {
            target.awareness.setRemoteState(source.clientId, localState);
          } else {
            target.awareness.removeRemoteState(source.clientId);
          }
        }
      }

      network.notify();
    },
    syncing: false,
  };

  for (const peer of peers) {
    peer.awareness.onLocalStateChange = () => network.syncAwareness();
  }

  return network;
};

const getEditorValue = (editor: YjsEditor): CollaborationValue =>
  cloneValue([...editor.read.children()]);

type TextEntry = {
  path: Path;
  text: string;
};

const hasDescendantChildren = (
  node: Descendant
): node is Descendant & { children: readonly Descendant[] } =>
  'children' in node && Array.isArray(node.children);

const findFirstTextEntryInNode = (
  node: Descendant,
  path: Path
): TextEntry | null => {
  if (TextApi.isText(node)) {
    return { path, text: node.text };
  }

  if (!hasDescendantChildren(node)) {
    return null;
  }

  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];

    if (!child) {
      continue;
    }

    const entry = findFirstTextEntryInNode(child, [...path, index]);

    if (entry) {
      return entry;
    }
  }

  return null;
};

const findLastTextEntryInNode = (
  node: Descendant,
  path: Path
): TextEntry | null => {
  if (TextApi.isText(node)) {
    return { path, text: node.text };
  }

  if (!hasDescendantChildren(node)) {
    return null;
  }

  for (let index = node.children.length - 1; index >= 0; index--) {
    const child = node.children[index];

    if (!child) {
      continue;
    }

    const entry = findLastTextEntryInNode(child, [...path, index]);

    if (entry) {
      return entry;
    }
  }

  return null;
};

const findLastTextEntry = (
  nodes: readonly Descendant[],
  basePath: Path = []
): TextEntry | null => {
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index];

    if (!node) {
      continue;
    }

    const entry = findLastTextEntryInNode(node, [...basePath, index]);

    if (entry) {
      return entry;
    }
  }

  return null;
};

const getTextEntryAtPath = (
  nodes: readonly Descendant[],
  path: Path
): TextEntry | null => {
  let current: Descendant | undefined;
  let children: readonly Descendant[] = nodes;

  for (let depth = 0; depth < path.length; depth++) {
    const index = path[depth];

    if (index === undefined) {
      return null;
    }

    current = children[index];

    if (!current) {
      return null;
    }

    if (TextApi.isText(current)) {
      return depth === path.length - 1 ? { path, text: current.text } : null;
    }

    if (!hasDescendantChildren(current)) {
      return null;
    }

    children = current.children;
  }

  return current && TextApi.isText(current)
    ? { path, text: current.text }
    : null;
};

const getFirstBlockTextEntry = (
  value: readonly Descendant[],
  position: 'first' | 'last'
) => {
  const [block] = value;

  if (!block) {
    return null;
  }

  return position === 'first'
    ? findFirstTextEntryInNode(block, [0])
    : findLastTextEntryInNode(block, [0]);
};

const pointAtTextEnd = (entry: TextEntry) => ({
  path: entry.path,
  offset: entry.text.length,
});

const readEditorSelection = (editor: YjsEditor) =>
  editor.read.selection() as Range | null;

const isCollapsedSelection = (selection: Range) =>
  selection.anchor.path.join('.') === selection.focus.path.join('.') &&
  selection.anchor.offset === selection.focus.offset;

const isSamePath = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const isSelectionAtTextEnd = (value: CollaborationValue, selection: Range) => {
  if (!isCollapsedSelection(selection)) {
    return false;
  }

  const entry = getTextEntryAtPath(value, selection.anchor.path);

  return entry ? selection.anchor.offset === entry.text.length : false;
};

const isSelectionAtDocumentEnd = (
  value: CollaborationValue,
  selection: Range
) => {
  if (!isCollapsedSelection(selection)) {
    return false;
  }

  const entry = findLastTextEntry(value);

  return (
    !!entry &&
    isSamePath(selection.anchor.path, entry.path) &&
    selection.anchor.offset === entry.text.length
  );
};

const normalizeHistorySelection = (
  value: CollaborationValue,
  selection: Range | null,
  options: {
    preferDocumentEnd?: boolean | null;
    preferEndOfPreviousEndSelection?: Range | null;
  } = {}
): Range | null => {
  const fallbackEntry = findLastTextEntry(value);

  if (options.preferDocumentEnd && fallbackEntry) {
    const point = pointAtTextEnd(fallbackEntry);

    return { anchor: point, focus: point };
  }

  if (options.preferEndOfPreviousEndSelection) {
    const entry =
      getTextEntryAtPath(
        value,
        options.preferEndOfPreviousEndSelection.anchor.path
      ) ?? fallbackEntry;

    if (entry) {
      const point = pointAtTextEnd(entry);

      return { anchor: point, focus: point };
    }
  }

  if (!selection) {
    if (!fallbackEntry) {
      return null;
    }

    const point = pointAtTextEnd(fallbackEntry);

    return { anchor: point, focus: point };
  }

  const anchorEntry = getTextEntryAtPath(value, selection.anchor.path);
  const focusEntry = getTextEntryAtPath(value, selection.focus.path);

  if (!anchorEntry || !focusEntry) {
    if (!fallbackEntry) {
      return null;
    }

    const point = pointAtTextEnd(fallbackEntry);

    return { anchor: point, focus: point };
  }

  return {
    anchor: {
      path: anchorEntry.path,
      offset: Math.min(selection.anchor.offset, anchorEntry.text.length),
    },
    focus: {
      path: focusEntry.path,
      offset: Math.min(selection.focus.offset, focusEntry.text.length),
    },
  };
};

const syncPeerSelectionAfterHistory = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor,
  previousValue: CollaborationValue,
  previousSelection: Range | null
) => {
  const value = getEditorValue(editor);
  const selection = normalizeHistorySelection(
    value,
    readEditorSelection(editor),
    {
      preferDocumentEnd:
        previousSelection &&
        isSelectionAtDocumentEnd(previousValue, previousSelection),
      preferEndOfPreviousEndSelection:
        previousSelection &&
        !isSelectionAtDocumentEnd(previousValue, previousSelection) &&
        isSelectionAtTextEnd(previousValue, previousSelection)
          ? previousSelection
          : null,
    }
  );

  if (!selection) {
    network.syncAwareness();
    return;
  }

  editor.update((tx) => {
    tx.selection.set(selection);
    tx.yjs.sendSelection(selection, {
      name: peer.name,
    });
  });
  editor.api.dom.focus({ retries: 1 });
  network.syncAwareness();
};

const documentText = (editor: YjsEditor) =>
  getEditorValue(editor)
    .map((node) => NodeApi.string(node))
    .join('\n');

const selectedText = (editor: YjsEditor) =>
  editor.api.dom
    .getWindow()
    .getSelection()
    ?.toString()
    .replaceAll('\uFEFF', '');

const syncSelectionFromDom = (editor: YjsEditor) => {
  const selection = editor.api.dom.getWindow().getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = editor.api.dom.resolvePliteRange(selection, {
    exactMatch: false,
  });

  if (!range) {
    return;
  }

  editor.update.selection.set(range);
};

const runPeerCommand = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor,
  command: PeerCommand
) => {
  syncSelectionFromDom(editor);

  editor.update({ history: 'new-batch' }, command);
  syncPeerHistoryDepths(peer, editor);

  editor.api.dom.focus({ retries: 1 });
  network.syncAll();
};

const setConnected = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor,
  connected: boolean
) => {
  peer.connected = connected;
  editor.update((tx) => {
    if (connected) {
      tx.yjs.connect();
    } else {
      tx.yjs.disconnect();
    }
  });

  if (connected) {
    network.syncAll();
  } else {
    network.syncAwareness();
  }

  network.notify();
};

const selectHello = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor
) => {
  const entry = getFirstBlockTextEntry(getEditorValue(editor), 'first');

  if (!entry) {
    return;
  }

  const length = Math.min(5, entry.text.length);
  const range: Range = {
    anchor: { path: entry.path, offset: 0 },
    focus: { path: entry.path, offset: length },
  };

  editor.update((tx) => {
    tx.selection.set(range);
    tx.yjs.sendSelection(range, {
      name: peer.name,
    });
  });

  network.syncAwareness();
};

const appendText = (peer: ExamplePeer, tx: PeerCommandTx) => {
  const entry = getFirstBlockTextEntry(tx.value().children, 'last');

  if (!entry) {
    return;
  }

  const offset = entry.text.length + peer.appendText.length;

  tx.text.insert(peer.appendText, {
    at: { path: entry.path, offset: entry.text.length },
  });
  tx.selection.set({
    anchor: { path: entry.path, offset },
    focus: { path: entry.path, offset },
  });
};

const insertExclamation = (tx: PeerCommandTx) => {
  const entry = getFirstBlockTextEntry(tx.value().children, 'last');

  if (!entry) {
    return;
  }

  const offset = entry.text.length + 1;

  tx.text.insert('!', {
    at: { path: entry.path, offset: entry.text.length },
  });
  tx.selection.set({
    anchor: { path: entry.path, offset },
    focus: { path: entry.path, offset },
  });
};

const selectDefaultBoldRange = (tx: PeerCommandTx) => {
  const selection = tx.selection();

  if (
    selection &&
    (selection.anchor.path.join('.') !== selection.focus.path.join('.') ||
      selection.anchor.offset !== selection.focus.offset)
  ) {
    return;
  }

  const entry = getFirstBlockTextEntry(tx.value().children, 'first');

  if (!entry) {
    return;
  }

  const length = Math.min(5, entry.text.length);

  tx.selection.set({
    anchor: { path: entry.path, offset: 0 },
    focus: { path: entry.path, offset: length },
  });
};

const toggleBold = (tx: PeerCommandTx) => {
  selectDefaultBoldRange(tx);
  tx.marks.toggle('bold');
};

const replaceDocument = (peer: ExamplePeer, tx: PeerCommandTx) => {
  const selection = {
    anchor: { path: [0, 0], offset: peer.replacementText.length },
    focus: { path: [0, 0], offset: peer.replacementText.length },
  } satisfies Range;

  tx.nodes.replaceChildren([paragraph(peer.replacementText)], { at: [] });
  tx.selection.set(selection);
};

const replaceWithEmptyParagraph = (tx: PeerCommandTx) => {
  tx.nodes.replaceChildren([paragraph('')], { at: [] });
  tx.selection.set({
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
};

const replaceBlockTextWithEmpty = (blockIndex: number, tx: PeerCommandTx) => {
  const value = tx.value().children;
  const block = value[blockIndex];

  if (!block || !('children' in block)) {
    return;
  }

  tx.nodes.replaceChildren([{ text: '' }], { at: [blockIndex] });
  tx.selection.set({
    anchor: { path: [blockIndex, 0], offset: 0 },
    focus: { path: [blockIndex, 0], offset: 0 },
  });
};

const removeBlock = (blockIndex: number, tx: PeerCommandTx) => {
  const value = tx.value().children;
  const node = value[blockIndex];

  if (!node) {
    return;
  }

  if (value.length === 1) {
    replaceWithEmptyParagraph(tx);
    return;
  }

  tx.nodes.remove({ at: [blockIndex] });
};

const shouldReplaceWholeDocumentSelection = (
  event: KeyboardEvent<HTMLDivElement>,
  editor: YjsEditor
) => {
  if (event.key !== 'Backspace' && event.key !== 'Delete') {
    return false;
  }

  const text = selectedText(editor);

  return !!text && text === documentText(editor);
};

const selectedParagraphNodeIndex = (
  event: KeyboardEvent<HTMLDivElement>,
  editor: YjsEditor
) => {
  const datasetIndex = event.currentTarget.dataset.yjsSelectedParagraphNode;

  if (datasetIndex) {
    delete event.currentTarget.dataset.yjsSelectedParagraphNode;

    return Number(datasetIndex);
  }

  const selection = editor.api.dom.getWindow().getSelection();

  if (!selection || selection.rangeCount === 0) {
    return -1;
  }

  const range = selection.getRangeAt(0);

  if (
    range.startContainer !== event.currentTarget ||
    range.endContainer !== event.currentTarget ||
    range.endOffset - range.startOffset !== 1
  ) {
    return -1;
  }

  const selectedNode = event.currentTarget.childNodes[range.startOffset];

  return [...event.currentTarget.querySelectorAll('p')].indexOf(
    selectedNode as HTMLParagraphElement
  );
};

const selectedBlockTextIndex = (editor: YjsEditor) => {
  const text = selectedText(editor);

  if (!text) {
    return -1;
  }

  return getEditorValue(editor).findIndex(
    (node) => NodeApi.string(node) === text
  );
};

const handleDeleteKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor
) => {
  if (!shouldReplaceWholeDocumentSelection(event, editor)) {
    const nodeIndex = selectedParagraphNodeIndex(event, editor);

    if (nodeIndex !== -1) {
      event.preventDefault();
      runPeerCommand(network, peer, editor, (tx) => removeBlock(nodeIndex, tx));

      return true;
    }

    const blockIndex = selectedBlockTextIndex(editor);

    if (blockIndex === -1) {
      return false;
    }

    event.preventDefault();
    runPeerCommand(network, peer, editor, (tx) =>
      replaceBlockTextWithEmpty(blockIndex, tx)
    );

    return true;
  }

  event.preventDefault();
  runPeerCommand(network, peer, editor, replaceWithEmptyParagraph);

  return true;
};

const splitFirstText = (peer: ExamplePeer, tx: PeerCommandTx) => {
  const value = tx.value().children;
  const [block] = value;

  if (!block) {
    return;
  }

  const entry = findFirstTextEntryInNode(block, [0]);

  if (!entry || entry.text.length < 2) {
    return;
  }

  const offset = Math.max(1, Math.floor(entry.text.length / 2));

  tx.selection.set({
    anchor: { path: entry.path, offset },
    focus: { path: entry.path, offset },
  });
  tx.break.insert();
  peer.renderEpoch += 1;
};

const wrapFirstBlock = (tx: PeerCommandTx) => {
  tx.selection.clear();
  tx.nodes.wrap({ children: [], type: 'block-quote' }, { at: [0] });
  tx.selection.clear();
};

const ensureParagraphCount = (count: number, tx: PeerCommandTx) => {
  const paragraphCount = tx.value().children.length;

  if (paragraphCount >= count) {
    return;
  }

  for (let index = paragraphCount; index < count; index++) {
    tx.nodes.insert(paragraph(`block ${index + 1}`), { at: [index] });
  }
};

const removeSecondBlock = (tx: PeerCommandTx) => {
  if (tx.value().children.length < 2) {
    return;
  }

  tx.nodes.remove({ at: [1] });
};

const mergeSecondBlock = (peer: ExamplePeer, tx: PeerCommandTx) => {
  if (tx.value().children.length < 2) {
    return;
  }

  tx.nodes.merge({ at: [1] });
  peer.renderEpoch += 1;
};

const moveFirstBlockDown = (tx: PeerCommandTx) => {
  ensureParagraphCount(2, tx);
  tx.nodes.move({ at: [0], to: [1] });
};

const setFirstBlockRole = (tx: PeerCommandTx) =>
  tx.nodes.set({ role: 'title' }, { at: [0] });

const unsetFirstBlockRole = (tx: PeerCommandTx) => {
  const [firstBlock] = tx.value().children;

  if (!firstBlock || !('role' in firstBlock)) {
    return;
  }

  tx.nodes.unset('role', { at: [0] });
};

const firstBlockIsQuote = (tx: PeerCommandTx) => {
  const [firstBlock] = tx.value().children;

  return (
    firstBlock && 'type' in firstBlock && firstBlock.type === 'block-quote'
  );
};

const unwrapFirstBlock = (tx: PeerCommandTx) => {
  if (!firstBlockIsQuote(tx)) {
    return;
  }

  tx.nodes.unwrap({ at: [0] });
};

const liftFirstWrappedBlock = (tx: PeerCommandTx) => {
  if (!firstBlockIsQuote(tx)) {
    return;
  }

  tx.nodes.lift({ at: [0, 0] });
};

const insertFragmentText = (peer: ExamplePeer, tx: PeerCommandTx) => {
  const entry = getFirstBlockTextEntry(tx.value().children, 'last');

  if (!entry) {
    return;
  }

  tx.selection.set({
    anchor: { path: entry.path, offset: entry.text.length },
    focus: { path: entry.path, offset: entry.text.length },
  });
  tx.fragment.replace([{ text: `${peer.name} fragment` }]);
};

const moveFirstBlockAfterSecond = (tx: PeerCommandTx) => {
  if (tx.value().children.length < 2) {
    return;
  }

  tx.nodes.move({ at: [0], to: [1] });
};

const deleteFirstFragment = (tx: PeerCommandTx) => {
  const entry = getFirstBlockTextEntry(tx.value().children, 'first');

  if (!entry) {
    return;
  }

  const length = Math.min(5, entry.text.length);

  if (length === 0) {
    return;
  }

  tx.selection.set({
    anchor: { path: entry.path, offset: 0 },
    focus: { path: entry.path, offset: length },
  });
  tx.fragment.delete();
};

const deleteBackwardFromFirstBlockEnd = (tx: PeerCommandTx) => {
  const entry = getFirstBlockTextEntry(tx.value().children, 'last');

  if (!entry || entry.text.length === 0) {
    return;
  }

  tx.selection.set({
    anchor: { path: entry.path, offset: entry.text.length },
    focus: { path: entry.path, offset: entry.text.length },
  });
  tx.text.deleteBackward({ unit: 'character' });
};

const undoPeer = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor
) => {
  const previousValue = getEditorValue(editor);
  const previousSelection = readEditorSelection(editor);

  editor.update.history.undo();

  syncPeerHistoryDepths(peer, editor);
  syncPeerSelectionAfterHistory(
    network,
    peer,
    editor,
    previousValue,
    previousSelection
  );
  network.syncAll();
};

const redoPeer = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor
) => {
  const previousValue = getEditorValue(editor);
  const previousSelection = readEditorSelection(editor);

  editor.update.history.redo();

  syncPeerHistoryDepths(peer, editor);
  syncPeerSelectionAfterHistory(
    network,
    peer,
    editor,
    previousValue,
    previousSelection
  );
  network.syncAll();
};

const handleHistoryKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor
) => {
  const isModifier = event.metaKey || event.ctrlKey;

  if (!isModifier || event.key.toLowerCase() !== 'z') {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();

  if (event.shiftKey) {
    redoPeer(network, peer, editor);
  } else {
    undoPeer(network, peer, editor);
  }

  return true;
};

const handleEditableKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: YjsEditor
) => {
  if (handleDeleteKeyDown(event, network, peer, editor)) {
    return;
  }

  handleHistoryKeyDown(event, network, peer, editor);
};

const handleCommandClick = (
  event: MouseEvent<HTMLButtonElement>,
  command: () => void
) => {
  if (event.detail === 0) {
    command();
  }
};

const handleCommandPointerDown = (
  event: PointerEvent<HTMLButtonElement>,
  command: () => void
) => {
  event.preventDefault();
  command();
};

const Element = ({
  attributes,
  children,
  element,
}: RenderElementProps<CollaborationElement>) => {
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote
          {...attributes}
          className="border-l-2 border-slate-300 pl-3 text-slate-700"
        >
          {children}
        </blockquote>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps<CollaborationText>) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return <span {...attributes}>{children}</span>;
};

const CursorStatus = ({ editor }: { editor: YjsEditor }) => {
  const cursors = useYjsRemoteCursors(editor);

  return (
    <span className="text-xs text-slate-500">
      {cursors.length === 0
        ? 'remote:none'
        : cursors
            .map((cursor) => {
              const selection = cursor.selection;

              if (!selection) {
                return `${cursor.clientId}:null`;
              }

              return `${cursor.clientId}:${selection.anchor.path.join('.')}:${
                selection.anchor.offset
              }-${selection.focus.path.join('.')}:${selection.focus.offset}`;
            })
            .join(' | ')}
    </span>
  );
};

const CommandButton = ({
  children,
  className,
  disabled,
  onRun,
  testId,
}: {
  children: string;
  className?: string;
  disabled?: boolean;
  onRun: () => void;
  testId: string;
}) => (
  <Button
    className={cn('h-8 rounded-md px-2 text-xs', className)}
    data-test-id={testId}
    disabled={disabled}
    onClick={(event) => handleCommandClick(event, onRun)}
    onPointerDown={(event) => handleCommandPointerDown(event, onRun)}
    size="sm"
    type="button"
    variant="outline"
  >
    {children}
  </Button>
);

type IncompatibleJoinResult = {
  error: string;
  localText: string;
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const attemptIncompatibleJoin = (roomDoc: Y.Doc): IncompatibleJoinResult => {
  const candidateDoc = new Y.Doc();
  const errors: unknown[] = [];
  const initialValue = [paragraph('Candidate local')];

  Y.applyUpdate(candidateDoc, Y.encodeStateAsUpdate(roomDoc));

  try {
    const candidate = createEditor({
      extensions: [
        schemaSlot.of(createCollaborationSchema(2)),
        createYjsExtension({
          clientId: 'incompatible-candidate',
          doc: candidateDoc,
          rootName: ROOT_NAME,
        }),
      ],
      initialValue,
      lifecycleErrorSink: ({ cause }) => errors.push(cause),
    });

    return {
      error: errors[0] ? errorMessage(errors[0]) : 'accepted',
      localText: candidate.read.children().map(NodeApi.string).join('\n'),
    };
  } catch (error) {
    return {
      error: errorMessage(error),
      localText: initialValue.map(NodeApi.string).join('\n'),
    };
  }
};

const PeerPanel = ({
  network,
  peer,
  version: _version,
}: {
  network: ExampleNetwork;
  peer: ExamplePeer;
  version: number;
}) => {
  const editor = usePliteEditor({
    extensions: [
      schemaSlot.of(createCollaborationSchema(1)),
      createYjsExtension({
        awareness: peer.awareness,
        clientId: peer.id,
        doc: peer.doc,
        rootName: ROOT_NAME,
      }),
    ],
    initialValue: cloneValue(INITIAL_VALUE),
  });
  const [incompatibleJoin, setIncompatibleJoin] =
    useState<IncompatibleJoinResult | null>(null);
  const [reconfigureError, setReconfigureError] = useState<string | null>(null);

  const canUndo = peer.undoDepth > 0;
  const canRedo = peer.redoDepth > 0;
  const connected = peer.connected;
  const label = `Peer ${peer.id.toUpperCase()}`;

  useEffect(
    () => network.registerPeerEditor(peer, editor),
    [editor, network, peer]
  );

  return (
    <Plite
      editor={editor}
      onCommit={() => {
        syncPeerHistoryDepths(peer, editor);
        network.syncAll();
      }}
    >
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
            <div
              className="mt-0.5"
              data-test-id={`yjs-peer-${peer.id}-cursors`}
            >
              <CursorStatus editor={editor} />
            </div>
            <div
              className="mt-0.5 text-xs text-slate-500"
              data-test-id={`yjs-peer-${peer.id}-history`}
            >
              undo:{peer.undoDepth};redo:{peer.redoDepth}
            </div>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              connected
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            )}
          >
            {connected ? 'connected' : 'offline'}
          </span>
        </div>

        {peer.id === 'a' && (
          <div className="grid gap-2 border-b border-slate-200 px-3 py-2 text-xs">
            <div className="flex flex-wrap gap-1.5">
              <CommandButton
                onRun={() =>
                  setIncompatibleJoin(attemptIncompatibleJoin(peer.doc))
                }
                testId="yjs-schema-incompatible-join"
              >
                Join with schema v2
              </CommandButton>
              <CommandButton
                onRun={() => {
                  try {
                    editor.update.extensions.reconfigure(
                      schemaSlot,
                      createCollaborationSchema(2)
                    );
                    setReconfigureError('accepted');
                  } catch (error) {
                    setReconfigureError(errorMessage(error));
                  }
                }}
                testId="yjs-schema-incompatible-reconfigure"
              >
                Reconfigure to v2
              </CommandButton>
            </div>
            <output data-test-id="yjs-schema-incompatible-join-status">
              {incompatibleJoin
                ? `error:${incompatibleJoin.error};local:${incompatibleJoin.localText}`
                : 'not-run'}
            </output>
            <output data-test-id="yjs-schema-incompatible-reconfigure-status">
              {reconfigureError ? `error:${reconfigureError}` : 'not-run'}
            </output>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-3 py-2">
          <CommandButton
            onRun={() => selectHello(network, peer, editor)}
            testId={`yjs-peer-${peer.id}-select`}
          >
            Select
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) => toggleBold(tx))
            }
            testId={`yjs-peer-${peer.id}-mark-bold`}
          >
            Bold
          </CommandButton>
          <CommandButton
            onRun={() => setConnected(network, peer, editor, false)}
            testId={`yjs-peer-${peer.id}-disconnect`}
          >
            Offline
          </CommandButton>
          <CommandButton
            onRun={() => setConnected(network, peer, editor, true)}
            testId={`yjs-peer-${peer.id}-connect`}
          >
            Online
          </CommandButton>
          <CommandButton
            onRun={() => {
              editor.update.yjs.reconcile();
              network.notify();
            }}
            testId={`yjs-peer-${peer.id}-reconcile`}
          >
            Reconcile
          </CommandButton>
          <CommandButton
            disabled={!canUndo}
            onRun={() => undoPeer(network, peer, editor)}
            testId={`yjs-peer-${peer.id}-undo`}
          >
            Undo
          </CommandButton>
          <CommandButton
            disabled={!canRedo}
            onRun={() => redoPeer(network, peer, editor)}
            testId={`yjs-peer-${peer.id}-redo`}
          >
            Redo
          </CommandButton>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-3 py-2">
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                appendText(peer, tx)
              )
            }
            testId={`yjs-peer-${peer.id}-append`}
          >
            Append
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                replaceDocument(peer, tx)
              )
            }
            testId={`yjs-peer-${peer.id}-replace`}
          >
            Replace
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                removeSecondBlock(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-remove-node`}
          >
            Remove
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                splitFirstText(peer, tx)
              )
            }
            testId={`yjs-peer-${peer.id}-split-node`}
          >
            Split
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                mergeSecondBlock(peer, tx)
              )
            }
            testId={`yjs-peer-${peer.id}-merge-node`}
          >
            Merge
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                moveFirstBlockDown(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-move-down`}
          >
            Down
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                setFirstBlockRole(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-set-node`}
          >
            Set Role
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                unsetFirstBlockRole(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-unset-node`}
          >
            Unset Role
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) => wrapFirstBlock(tx))
            }
            testId={`yjs-peer-${peer.id}-wrap-node`}
          >
            Wrap
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                unwrapFirstBlock(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-unwrap`}
          >
            Unwrap
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                liftFirstWrappedBlock(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-lift`}
          >
            Lift
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                insertFragmentText(peer, tx)
              )
            }
            testId={`yjs-peer-${peer.id}-insert-fragment`}
          >
            Fragment
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                deleteFirstFragment(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-delete-fragment`}
          >
            Delete
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                deleteBackwardFromFirstBlockEnd(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-delete-backward`}
          >
            Back
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                insertExclamation(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-insert-text`}
          >
            Insert !
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (tx) =>
                moveFirstBlockAfterSecond(tx)
              )
            }
            testId={`yjs-peer-${peer.id}-move`}
          >
            Move
          </CommandButton>
        </div>

        <div
          className="min-h-40 px-3 py-3"
          id={`yjs-peer-${peer.id}-editor-surface`}
          onKeyDownCapture={(event) =>
            handleHistoryKeyDown(event, network, peer, editor)
          }
        >
          <Editable
            autoFocus={peer.id === 'a'}
            className="min-h-28 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-slate-400 focus:bg-white"
            key={peer.renderEpoch}
            onKeyDown={(event) =>
              handleEditableKeyDown(event, network, peer, editor)
            }
            placeholder="Start typing"
            renderElement={Element}
            renderLeaf={Leaf}
            spellCheck={false}
          />
        </div>
      </section>
    </Plite>
  );
};

const YjsCollaborationExample = () => {
  const network = useMemo(() => createExampleNetwork(), []);
  const [version, setVersion] = useState(0);

  useEffect(
    () =>
      network.subscribeNotify(() => {
        setVersion((current) => current + 1);
      }),
    [network]
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950">
      <div className="mx-auto mb-4 max-w-7xl rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
        <span className="font-medium">Claimed room schema: </span>
        <output
          data-schema-fingerprint={network.roomSchemaIdentity.fingerprint}
          data-test-id="yjs-schema-room-claim"
        >
          {network.roomSchemaIdentity.id}@{network.roomSchemaIdentity.version}
        </output>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
        {network.peers.map((peer) => (
          <PeerPanel
            key={peer.id}
            network={network}
            peer={peer}
            version={version}
          />
        ))}
      </div>
    </main>
  );
};

export default YjsCollaborationExample;
