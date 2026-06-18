import {
  createYjsExtension,
  type YjsAwarenessChange,
  type YjsTx,
} from '@platejs/yjs';
import { useYjsRemoteCursors } from '@platejs/yjs/react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  createEditor,
  type Descendant,
  NodeApi,
  type Operation,
  type Range,
} from '@platejs/slate';
import { history } from '@platejs/slate-history';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  Slate,
  useSlateEditor,
} from '@platejs/slate-react';
import * as Y from 'yjs';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type {
  CustomEditor,
  CustomElement,
  CustomText,
  CustomValue,
} from './custom-types.d';

type PeerId = 'a' | 'b' | 'c' | 'd';

type PeerDefinition = {
  appendText: string;
  clientId: number;
  id: PeerId;
  name: string;
  replacementText: string;
};

type ExampleUndoGroup = {
  kind: 'command' | 'keyboard';
  size: number;
};

type KeyboardInputType = 'delete' | 'enter' | 'text';

type ExamplePeer = PeerDefinition & {
  awareness: ExampleAwareness;
  connected: boolean;
  doc: Y.Doc;
  editor?: CustomEditor;
  pendingKeyboardInputType?: KeyboardInputType;
  pendingLocalChangeKind?: ExampleUndoGroup['kind'];
  redoDepth: number;
  redoGroups: ExampleUndoGroup[];
  renderEpoch: number;
  undoDepth: number;
  undoGroups: ExampleUndoGroup[];
};

type ExampleNetwork = {
  notify: () => void;
  peers: ExamplePeer[];
  recordLocalChange: (
    peer: ExamplePeer,
    operations: readonly Operation[]
  ) => void;
  runWithoutLocalHistory: (fn: () => void) => void;
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

const syncPeerHistoryDepths = (peer: ExamplePeer) => {
  peer.undoDepth = peer.undoGroups.length;
  peer.redoDepth = peer.redoGroups.length;
};

const recordPeerUndoGroup = (
  peer: ExamplePeer,
  kind: ExampleUndoGroup['kind'],
  inputType?: KeyboardInputType
) => {
  const previous = peer.undoGroups.at(-1);

  if (
    kind === 'keyboard' &&
    inputType !== 'enter' &&
    previous?.kind === 'keyboard'
  ) {
    previous.size += 1;
  } else {
    peer.undoGroups.push({ kind, size: 1 });
  }

  peer.redoGroups = [];
  syncPeerHistoryDepths(peer);
};

const areJsonEqual = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const changesDocument = (operation: Operation) => {
  switch (operation.type) {
    case 'set_selection':
      return false;
    case 'replace_children':
    case 'replace_fragment':
      return !areJsonEqual(operation.children, operation.newChildren);
    default:
      return true;
  }
};

const INITIAL_VALUE: CustomValue = [
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

const paragraph = (text: string): CustomElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const yjsTx = (tx: unknown) => (tx as { yjs: YjsTx }).yjs;

const createSeedUpdate = () => {
  const seedDoc = new Y.Doc();

  createEditor({
    extensions: [
      createYjsExtension({
        clientId: 'seed',
        doc: seedDoc,
        rootName: '@platejs/slate',
      }),
    ],
    initialValue: cloneValue(INITIAL_VALUE),
  });

  return Y.encodeStateAsUpdate(seedDoc);
};

const createExampleNetwork = (): ExampleNetwork => {
  const seedUpdate = createSeedUpdate();
  const peers: ExamplePeer[] = PEERS.map((definition) => {
    const doc = new Y.Doc();

    doc.clientID = definition.clientId;
    Y.applyUpdate(doc, seedUpdate);

    return {
      ...definition,
      awareness: new ExampleAwareness(definition.clientId),
      connected: true,
      doc,
      redoDepth: 0,
      redoGroups: [],
      renderEpoch: 0,
      undoDepth: 0,
      undoGroups: [],
    };
  });

  const network: ExampleNetwork = {
    notify: () => {},
    peers,
    recordLocalChange(peer, operations) {
      if (network.syncing) {
        return;
      }
      if (operations.some(changesDocument)) {
        recordPeerUndoGroup(
          peer,
          peer.pendingLocalChangeKind ?? 'keyboard',
          peer.pendingKeyboardInputType
        );
      }
    },
    runWithoutLocalHistory(fn) {
      const wasSyncing = network.syncing;

      network.syncing = true;
      try {
        fn();
      } finally {
        network.syncing = wasSyncing;
      }
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

          peer.editor.update((tx) => {
            yjsTx(tx).reconcile();
          });
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

const getEditorValue = (editor: CustomEditor): CustomValue =>
  editor.read((state) => cloneValue(state.value.get().children)) as CustomValue;

type TextEntry = {
  path: number[];
  text: string;
};

const isCustomText = (node: Descendant): node is CustomText => 'text' in node;

const hasDescendantChildren = (
  node: Descendant
): node is Descendant & { children: readonly Descendant[] } =>
  'children' in node && Array.isArray(node.children);

const findFirstTextEntryInNode = (
  node: Descendant,
  path: number[]
): TextEntry | null => {
  if (isCustomText(node)) {
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
  path: number[]
): TextEntry | null => {
  if (isCustomText(node)) {
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
  basePath: number[] = []
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
  path: number[]
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

    if (isCustomText(current)) {
      return depth === path.length - 1 ? { path, text: current.text } : null;
    }

    if (!hasDescendantChildren(current)) {
      return null;
    }

    children = current.children;
  }

  return current && isCustomText(current) ? { path, text: current.text } : null;
};

const getFirstBlockTextEntry = (
  editor: CustomEditor,
  position: 'first' | 'last'
) => {
  const [block] = getEditorValue(editor);

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

const readEditorSelection = (editor: CustomEditor) =>
  editor.read((state) => state.selection.get()) as Range | null;

const isCollapsedSelection = (selection: Range) =>
  selection.anchor.path.join('.') === selection.focus.path.join('.') &&
  selection.anchor.offset === selection.focus.offset;

const isSamePath = (left: readonly number[], right: readonly number[]) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const isSelectionAtTextEnd = (value: CustomValue, selection: Range) => {
  if (!isCollapsedSelection(selection)) {
    return false;
  }

  const entry = getTextEntryAtPath(value, selection.anchor.path);

  return entry ? selection.anchor.offset === entry.text.length : false;
};

const isSelectionAtDocumentEnd = (value: CustomValue, selection: Range) => {
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
  value: CustomValue,
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
  editor: CustomEditor,
  previousValue: CustomValue,
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
    yjsTx(tx).sendSelection(selection, {
      name: peer.name,
    });
  });
  editor.api.dom.focus({ retries: 1 });
  network.syncAwareness();
};

const getBlockText = (editor: CustomEditor, index: number) =>
  editor.read((state) => {
    const node = state.nodes.children()[index];

    return node ? NodeApi.string(node) : '';
  });

const getParagraphCount = (editor: CustomEditor) =>
  editor.read((state) => state.nodes.children().length);

const clearPeerHistory = (peer: ExamplePeer) => {
  peer.undoGroups = [];
  peer.redoGroups = [];
  syncPeerHistoryDepths(peer);
};

const documentText = (editor: CustomEditor) =>
  getEditorValue(editor)
    .map((node) => NodeApi.string(node))
    .join('\n');

const selectedText = (editor: CustomEditor) =>
  editor.api.dom
    .getWindow()
    .getSelection()
    ?.toString()
    .replaceAll('\uFEFF', '');

const hasCanonicalSnapshot = (editor: CustomEditor) =>
  getBlockText(editor, 0).includes('canonical snapshot.');

const syncSelectionFromDom = (editor: CustomEditor) => {
  const selection = editor.api.dom.getWindow().getSelection();

  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = editor.api.dom.resolveSlateRange(selection, {
    exactMatch: false,
  });

  if (!range) {
    return;
  }

  editor.update((tx) => {
    tx.selection.set(range);
  });
};

const runPeerCommand = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: CustomEditor,
  command: (editor: CustomEditor) => void,
  { undoable = true }: { undoable?: boolean } = {}
) => {
  syncSelectionFromDom(editor);
  const previousKind = peer.pendingLocalChangeKind;

  peer.pendingLocalChangeKind = undoable ? 'command' : undefined;
  try {
    editor.api.history.withNewBatch(() => {
      command(editor);
    });
  } finally {
    peer.pendingLocalChangeKind = previousKind;
  }

  network.syncAll();
};

const setConnected = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: CustomEditor,
  connected: boolean
) => {
  peer.connected = connected;
  editor.update((tx) => {
    if (connected) {
      yjsTx(tx).connect();
    } else {
      yjsTx(tx).disconnect();
    }
  });

  if (connected) {
    network.syncAll();

    if (hasCanonicalSnapshot(editor)) {
      clearPeerHistory(peer);
    }
  } else {
    network.syncAwareness();
  }

  network.notify();
};

const selectHello = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: CustomEditor
) => {
  const entry = getFirstBlockTextEntry(editor, 'first');

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
    yjsTx(tx).sendSelection(range, {
      name: peer.name,
    });
  });

  network.syncAwareness();
};

const appendText = (peer: ExamplePeer, editor: CustomEditor) => {
  const entry = getFirstBlockTextEntry(editor, 'last');

  if (!entry) {
    return;
  }

  const offset = entry.text.length + peer.appendText.length;

  editor.update((tx) => {
    tx.text.insert(peer.appendText, {
      at: { path: entry.path, offset: entry.text.length },
    });
    tx.selection.set({
      anchor: { path: entry.path, offset },
      focus: { path: entry.path, offset },
    });
  });
};

const insertExclamation = (editor: CustomEditor) => {
  const entry = getFirstBlockTextEntry(editor, 'last');

  if (!entry) {
    return;
  }

  const offset = entry.text.length + 1;

  editor.update((tx) => {
    tx.text.insert('!', {
      at: { path: entry.path, offset: entry.text.length },
    });
    tx.selection.set({
      anchor: { path: entry.path, offset },
      focus: { path: entry.path, offset },
    });
  });
};

const selectDefaultBoldRange = (editor: CustomEditor) => {
  const selection = editor.read((state) =>
    state.selection.get()
  ) as Range | null;

  if (
    selection &&
    (selection.anchor.path.join('.') !== selection.focus.path.join('.') ||
      selection.anchor.offset !== selection.focus.offset)
  ) {
    return;
  }

  const entry = getFirstBlockTextEntry(editor, 'first');

  if (!entry) {
    return;
  }

  const length = Math.min(5, entry.text.length);

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: 0 },
      focus: { path: entry.path, offset: length },
    });
  });
};

const toggleBold = (editor: CustomEditor) => {
  selectDefaultBoldRange(editor);
  editor.update((tx) => {
    tx.marks.toggle('bold');
  });
};

const replaceDocument = (peer: ExamplePeer, editor: CustomEditor) => {
  const value = getEditorValue(editor);
  const selection = {
    anchor: { path: [0, 0], offset: peer.replacementText.length },
    focus: { path: [0, 0], offset: peer.replacementText.length },
  } satisfies Range;

  editor.update((tx) => {
    tx.operations.replay([
      {
        children: value,
        index: 0,
        newChildren: [paragraph(peer.replacementText)],
        newSelection: selection,
        path: [],
        selection: null,
        type: 'replace_children',
      },
    ]);
  });
};

const replaceWithEmptyParagraph = (editor: CustomEditor) => {
  const operation: Operation = {
    children: getEditorValue(editor),
    newChildren: [paragraph('')],
    newSelection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    path: [],
    selection: null,
    type: 'replace_fragment',
  };

  editor.update((tx) => {
    tx.operations.replay([operation]);
  });
  editor.api.dom.focus({ retries: 1 });
};

const replaceBlockTextWithEmpty = (
  editor: CustomEditor,
  blockIndex: number
) => {
  const value = getEditorValue(editor);
  const block = value[blockIndex];

  if (!block || !('children' in block)) {
    return;
  }

  const operation: Operation = {
    children: block.children,
    newChildren: [{ text: '' }],
    newSelection: {
      anchor: { path: [blockIndex, 0], offset: 0 },
      focus: { path: [blockIndex, 0], offset: 0 },
    },
    path: [blockIndex],
    selection: null,
    type: 'replace_fragment',
  };

  editor.update((tx) => {
    tx.operations.replay([operation]);
  });
  editor.api.dom.focus({ retries: 1 });
};

const removeBlock = (editor: CustomEditor, blockIndex: number) => {
  const value = getEditorValue(editor);
  const node = value[blockIndex];

  if (!node) {
    return;
  }

  if (value.length === 1) {
    replaceWithEmptyParagraph(editor);
    return;
  }

  editor.update((tx) => {
    tx.operations.replay([
      {
        node,
        path: [blockIndex],
        type: 'remove_node',
      },
    ]);
  });
  editor.api.dom.focus({ retries: 1 });
};

const shouldReplaceWholeDocumentSelection = (
  event: KeyboardEvent<HTMLDivElement>,
  editor: CustomEditor
) => {
  if (event.key !== 'Backspace' && event.key !== 'Delete') {
    return false;
  }

  const text = selectedText(editor);

  return !!text && text === documentText(editor);
};

const selectedParagraphNodeIndex = (
  event: KeyboardEvent<HTMLDivElement>,
  editor: CustomEditor
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

const selectedBlockTextIndex = (editor: CustomEditor) => {
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
  editor: CustomEditor
) => {
  if (!shouldReplaceWholeDocumentSelection(event, editor)) {
    const nodeIndex = selectedParagraphNodeIndex(event, editor);

    if (nodeIndex !== -1) {
      event.preventDefault();
      runPeerCommand(network, peer, editor, () =>
        removeBlock(editor, nodeIndex)
      );

      return true;
    }

    const blockIndex = selectedBlockTextIndex(editor);

    if (blockIndex === -1) {
      return false;
    }

    event.preventDefault();
    runPeerCommand(network, peer, editor, () =>
      replaceBlockTextWithEmpty(editor, blockIndex)
    );

    return true;
  }

  event.preventDefault();
  runPeerCommand(network, peer, editor, replaceWithEmptyParagraph);

  return true;
};

const splitFirstText = (peer: ExamplePeer, editor: CustomEditor) => {
  const value = getEditorValue(editor);
  const [block] = value;

  if (!block) {
    return;
  }

  const entry = findFirstTextEntryInNode(block, [0]);

  if (!entry || entry.text.length < 2) {
    return;
  }

  const offset = Math.max(1, Math.floor(entry.text.length / 2));

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset },
      focus: { path: entry.path, offset },
    });
    tx.break.insert();
  });
  peer.renderEpoch += 1;
};

const wrapFirstBlock = (editor: CustomEditor) => {
  editor.update((tx) => {
    tx.selection.clear();
    tx.nodes.wrap({ children: [], type: 'block-quote' }, { at: [0] });
    tx.selection.clear();
  });
};

const ensureParagraphCount = (editor: CustomEditor, count: number) => {
  const paragraphCount = getParagraphCount(editor);

  if (paragraphCount >= count) {
    return;
  }

  editor.update((tx) => {
    for (let index = paragraphCount; index < count; index++) {
      tx.nodes.insert(paragraph(`block ${index + 1}`), { at: [index] });
    }
  });
};

const removeSecondBlock = (editor: CustomEditor) => {
  if (getParagraphCount(editor) < 2) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.remove({ at: [1] });
  });
};

const mergeSecondBlock = (peer: ExamplePeer, editor: CustomEditor) => {
  if (getParagraphCount(editor) < 2) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.merge({ at: [1] });
  });
  peer.renderEpoch += 1;
};

const moveFirstBlockDown = (editor: CustomEditor) => {
  ensureParagraphCount(editor, 2);

  editor.update((tx) => {
    tx.nodes.move({ at: [0], to: [1] });
  });
};

const setFirstBlockRole = (editor: CustomEditor) => {
  editor.update((tx) => {
    tx.nodes.set({ role: 'title' }, { at: [0] });
  });
};

const unsetFirstBlockRole = (editor: CustomEditor) => {
  const [firstBlock] = getEditorValue(editor);

  if (!firstBlock || !('role' in firstBlock)) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.unset('role', { at: [0] });
  });
};

const firstBlockIsQuote = (editor: CustomEditor) => {
  const [firstBlock] = getEditorValue(editor);

  return (
    firstBlock && 'type' in firstBlock && firstBlock.type === 'block-quote'
  );
};

const unwrapFirstBlock = (editor: CustomEditor) => {
  if (!firstBlockIsQuote(editor)) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.unwrap({ at: [0] });
  });
};

const liftFirstWrappedBlock = (editor: CustomEditor) => {
  if (!firstBlockIsQuote(editor)) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.lift({ at: [0, 0] });
  });
};

const insertFragmentText = (peer: ExamplePeer, editor: CustomEditor) => {
  const entry = getFirstBlockTextEntry(editor, 'last');

  if (!entry) {
    return;
  }

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: entry.text.length },
      focus: { path: entry.path, offset: entry.text.length },
    });
    tx.fragment.insert([{ text: `${peer.name} fragment` }]);
  });
};

const moveFirstBlockAfterSecond = (editor: CustomEditor) => {
  if (getParagraphCount(editor) < 2) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.move({ at: [0], to: [1] });
  });
};

const deleteFirstFragment = (editor: CustomEditor) => {
  const entry = getFirstBlockTextEntry(editor, 'first');

  if (!entry) {
    return;
  }

  const length = Math.min(5, entry.text.length);

  if (length === 0) {
    return;
  }

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: 0 },
      focus: { path: entry.path, offset: length },
    });
    tx.fragment.delete();
  });
};

const deleteBackwardFromFirstBlockEnd = (editor: CustomEditor) => {
  const entry = getFirstBlockTextEntry(editor, 'last');

  if (!entry || entry.text.length === 0) {
    return;
  }

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: entry.path, offset: entry.text.length },
      focus: { path: entry.path, offset: entry.text.length },
    });
    tx.text.deleteBackward({ unit: 'character' });
  });
};

const undoPeer = (
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: CustomEditor
) => {
  const group = peer.undoGroups.pop();

  if (!group) {
    return;
  }

  const previousValue = getEditorValue(editor);
  const previousSelection = readEditorSelection(editor);

  network.runWithoutLocalHistory(() => {
    for (let index = 0; index < group.size; index++) {
      editor.update((tx) => {
        yjsTx(tx).undo();
      });
    }
  });

  peer.redoGroups.push(group);
  syncPeerHistoryDepths(peer);
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
  editor: CustomEditor
) => {
  const group = peer.redoGroups.pop();

  if (!group) {
    return;
  }

  const previousValue = getEditorValue(editor);
  const previousSelection = readEditorSelection(editor);

  network.runWithoutLocalHistory(() => {
    for (let index = 0; index < group.size; index++) {
      editor.update((tx) => {
        yjsTx(tx).redo();
      });
    }
  });

  peer.undoGroups.push(group);
  syncPeerHistoryDepths(peer);
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
  editor: CustomEditor
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

const getKeyboardInputType = (
  event: KeyboardEvent<HTMLDivElement>
): KeyboardInputType | null => {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return null;
  }

  if (event.key === 'Enter') {
    return 'enter';
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    return 'delete';
  }

  return event.key.length === 1 ? 'text' : null;
};

const handleEditableKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  network: ExampleNetwork,
  peer: ExamplePeer,
  editor: CustomEditor
) => {
  const keyboardInputType = getKeyboardInputType(event);

  if (keyboardInputType) {
    peer.pendingLocalChangeKind = 'keyboard';
    peer.pendingKeyboardInputType = keyboardInputType;
  }

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
}: RenderElementProps<CustomElement>) => {
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

const Leaf = ({ attributes, children, leaf }: RenderLeafProps<CustomText>) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return <span {...attributes}>{children}</span>;
};

const CursorStatus = ({ editor }: { editor: CustomEditor }) => {
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

const PeerPanel = ({
  network,
  peer,
  version: _version,
}: {
  network: ExampleNetwork;
  peer: ExamplePeer;
  version: number;
}) => {
  const editor = useSlateEditor({
    extensions: [
      history(),
      createYjsExtension({
        awareness: peer.awareness,
        clientId: peer.id,
        doc: peer.doc,
        rootName: '@platejs/slate',
      }),
    ],
    initialValue: cloneValue(INITIAL_VALUE),
  }) as CustomEditor;

  const canUndo = peer.undoDepth > 0;
  const canRedo = peer.redoDepth > 0;
  const connected = peer.connected;
  const label = `Peer ${peer.id.toUpperCase()}`;

  peer.editor = editor;

  return (
    <Slate
      editor={editor}
      onChange={(_value, change) => {
        if (network.syncing && hasCanonicalSnapshot(editor)) {
          clearPeerHistory(peer);
        }
        if (
          !change.tags.includes('historic') &&
          !change.tags.includes('yjs-example-test-setup')
        ) {
          network.recordLocalChange(peer, change.operations);
        }
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

        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-3 py-2">
          <CommandButton
            onRun={() => selectHello(network, peer, editor)}
            testId={`yjs-peer-${peer.id}-select`}
          >
            Select
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, (editor) =>
                toggleBold(editor)
              )
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
              editor.update((tx) => {
                yjsTx(tx).reconcile();
              });
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
              runPeerCommand(network, peer, editor, () =>
                appendText(peer, editor)
              )
            }
            testId={`yjs-peer-${peer.id}-append`}
          >
            Append
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                replaceDocument(peer, editor)
              )
            }
            testId={`yjs-peer-${peer.id}-replace`}
          >
            Replace
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                removeSecondBlock(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-remove-node`}
          >
            Remove
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                splitFirstText(peer, editor)
              )
            }
            testId={`yjs-peer-${peer.id}-split-node`}
          >
            Split
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                mergeSecondBlock(peer, editor)
              )
            }
            testId={`yjs-peer-${peer.id}-merge-node`}
          >
            Merge
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                moveFirstBlockDown(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-move-down`}
          >
            Down
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                setFirstBlockRole(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-set-node`}
          >
            Set Role
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                unsetFirstBlockRole(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-unset-node`}
          >
            Unset Role
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                wrapFirstBlock(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-wrap-node`}
          >
            Wrap
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                unwrapFirstBlock(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-unwrap`}
          >
            Unwrap
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                liftFirstWrappedBlock(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-lift`}
          >
            Lift
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                insertFragmentText(peer, editor)
              )
            }
            testId={`yjs-peer-${peer.id}-insert-fragment`}
          >
            Fragment
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                deleteFirstFragment(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-delete-fragment`}
          >
            Delete
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                deleteBackwardFromFirstBlockEnd(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-delete-backward`}
          >
            Back
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                insertExclamation(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-insert-text`}
          >
            Insert !
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(network, peer, editor, () =>
                moveFirstBlockAfterSecond(editor)
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
    </Slate>
  );
};

const YjsCollaborationExample = () => {
  const network = useMemo(() => createExampleNetwork(), []);
  const [version, setVersion] = useState(0);

  network.notify = () => {
    setVersion((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950">
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
