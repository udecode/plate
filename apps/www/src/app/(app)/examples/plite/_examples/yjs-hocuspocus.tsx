import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  createYjsExtension,
  type YjsAwarenessLike,
  type YjsProviderEvent,
  type YjsProviderEventHandler,
  type YjsProviderLike,
  type YjsProviderStatus,
  type YjsTx,
} from '@platejs/yjs';
import {
  useYjsProviderStatus,
  useYjsProviderSynced,
  useYjsRemoteCursors,
} from '@platejs/yjs/react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  type Descendant,
  NodeApi,
  type Operation,
  type Range,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  Plite,
  usePliteEditor,
} from '@platejs/plite-react';
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
  color: string;
  id: PeerId;
  name: string;
  replacementText: string;
};

type KeyboardInputType = 'delete' | 'enter' | 'text';

type PliteHocuspocusProvider = YjsProviderLike & {
  hocuspocus: HocuspocusProvider;
};

type HocuspocusEventBinder = (
  event: YjsProviderEvent,
  handler: YjsProviderEventHandler
) => void;

type TextEntry = {
  path: number[];
  text: string;
};

const DEFAULT_YJS_URL =
  process.env.NEXT_PUBLIC_PLITE_YJS_URL ?? 'ws://localhost:4444/yjs';
const DEFAULT_ROOM =
  process.env.NEXT_PUBLIC_PLITE_YJS_ROOM ?? 'plite-yjs-hocuspocus-demo';
const DEFAULT_TOKEN = process.env.NEXT_PUBLIC_PLITE_YJS_TOKEN;

const INITIAL_VALUE: CustomValue = [
  {
    type: 'paragraph',
    children: [{ text: 'Hello world!' }],
  },
];

const PEERS: PeerDefinition[] = [
  {
    appendText: ' Ada',
    clientId: 101,
    color: '#2563eb',
    id: 'a',
    name: 'Ada',
    replacementText: 'Ada canonical snapshot.',
  },
  {
    appendText: ' Lin',
    clientId: 202,
    color: '#dc2626',
    id: 'b',
    name: 'Lin',
    replacementText: 'Lin canonical snapshot.',
  },
  {
    appendText: ' Ken',
    clientId: 303,
    color: '#16a34a',
    id: 'c',
    name: 'Ken',
    replacementText: 'Ken canonical snapshot.',
  },
  {
    appendText: ' Eve',
    clientId: 404,
    color: '#9333ea',
    id: 'd',
    name: 'Eve',
    replacementText: 'Eve canonical snapshot.',
  },
] as const;

const paragraph = (text: string): CustomElement => ({
  type: 'paragraph',
  children: [{ text }],
});

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const yjsTx = (tx: unknown) => (tx as { yjs: YjsTx }).yjs;

class HocuspocusProviderAdapter implements PliteHocuspocusProvider {
  readonly awareness?: YjsAwarenessLike;
  readonly doc: Y.Doc;
  readonly hocuspocus: HocuspocusProvider;

  status: YjsProviderStatus = 'connecting';

  constructor(options: {
    clientId: number;
    name: string;
    token?: string;
    url: string;
  }) {
    const doc = new Y.Doc();

    doc.clientID = options.clientId;

    this.hocuspocus = new HocuspocusProvider({
      document: doc,
      name: options.name,
      token: options.token,
      url: options.url,
    });
    this.doc = doc;
    this.awareness = this.hocuspocus.awareness as YjsAwarenessLike | undefined;

    this.hocuspocus.on(
      'status',
      ({ status }: { status: YjsProviderStatus }) => {
        this.status = status;
      }
    );
  }

  get synced() {
    return this.hocuspocus.synced;
  }

  connect() {
    return this.hocuspocus.connect();
  }

  destroy() {
    this.hocuspocus.destroy();
  }

  disconnect() {
    return this.hocuspocus.disconnect();
  }

  off(event: YjsProviderEvent, handler: YjsProviderEventHandler) {
    (this.hocuspocus.off as HocuspocusEventBinder)(event, handler);
  }

  on(event: YjsProviderEvent, handler: YjsProviderEventHandler) {
    (this.hocuspocus.on as HocuspocusEventBinder)(event, handler);
  }
}

const createProvider = (
  peer: PeerDefinition,
  roomName: string
): PliteHocuspocusProvider =>
  new HocuspocusProviderAdapter({
    clientId: peer.clientId,
    name: roomName,
    token: DEFAULT_TOKEN,
    url: DEFAULT_YJS_URL,
  });

const readInitialRoomName = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_ROOM;
  }

  return (
    new URLSearchParams(window.location.search).get('room') ?? DEFAULT_ROOM
  );
};

const readInitialPeers = (): readonly PeerDefinition[] => {
  if (typeof window === 'undefined') {
    return PEERS;
  }

  const peerId = new URLSearchParams(window.location.search).get('peer');

  if (!peerId) {
    return PEERS;
  }

  return PEERS.filter((peer) => peer.id === peerId);
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

const readEditorValue = (editor: CustomEditor): CustomValue =>
  editor.read((state) => cloneValue(state.value.get().children)) as CustomValue;

const getFirstBlockTextEntry = (
  editor: CustomEditor,
  position: 'first' | 'last'
) => {
  const [block] = readEditorValue(editor);

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

const syncSelectionAfterHistory = (
  peer: PeerDefinition,
  editor: CustomEditor,
  previousValue: CustomValue,
  previousSelection: Range | null
) => {
  const value = readEditorValue(editor);
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
    return;
  }

  editor.update((tx) => {
    tx.selection.set(selection);
    yjsTx(tx).sendSelection(selection, {
      color: peer.color,
      name: peer.name,
    });
  });
  editor.api.dom.focus({ retries: 1 });
};

const getParagraphCount = (editor: CustomEditor) =>
  editor.read((state) => state.nodes.children().length);

const documentText = (editor: CustomEditor) =>
  readEditorValue(editor)
    .map((node) => NodeApi.string(node))
    .join('\n');

const selectedText = (editor: CustomEditor) =>
  editor.api.dom
    .getWindow()
    .getSelection()
    ?.toString()
    .replaceAll('\uFEFF', '');

const syncSelectionFromDom = (editor: CustomEditor) => {
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

  editor.update((tx) => {
    tx.selection.set(range);
  });
};

const runPeerCommand = (
  peer: PeerDefinition,
  editor: CustomEditor,
  command: (editor: CustomEditor) => void
) => {
  syncSelectionFromDom(editor);
  editor.api.history.withNewBatch(() => {
    command(editor);
  });
  editor.update((tx) => {
    yjsTx(tx).sendCursorData({
      color: peer.color,
      name: peer.name,
    });
  });
};

const setConnected = (editor: CustomEditor, connected: boolean) => {
  editor.update((tx) => {
    if (connected) {
      yjsTx(tx).connect();
    } else {
      yjsTx(tx).disconnect();
    }
  });
};

const selectHello = (peer: PeerDefinition, editor: CustomEditor) => {
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
      color: peer.color,
      name: peer.name,
    });
  });
};

const appendText = (peer: PeerDefinition, editor: CustomEditor) => {
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

const replaceDocument = (peer: PeerDefinition, editor: CustomEditor) => {
  const value = readEditorValue(editor);
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
    children: readEditorValue(editor),
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
  const value = readEditorValue(editor);
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
  const value = readEditorValue(editor);
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

  return readEditorValue(editor).findIndex(
    (node) => NodeApi.string(node) === text
  );
};

const handleDeleteKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  peer: PeerDefinition,
  editor: CustomEditor
) => {
  if (!shouldReplaceWholeDocumentSelection(event, editor)) {
    const nodeIndex = selectedParagraphNodeIndex(event, editor);

    if (nodeIndex !== -1) {
      event.preventDefault();
      runPeerCommand(peer, editor, () => removeBlock(editor, nodeIndex));

      return true;
    }

    const blockIndex = selectedBlockTextIndex(editor);

    if (blockIndex === -1) {
      return false;
    }

    event.preventDefault();
    runPeerCommand(peer, editor, () =>
      replaceBlockTextWithEmpty(editor, blockIndex)
    );

    return true;
  }

  event.preventDefault();
  runPeerCommand(peer, editor, replaceWithEmptyParagraph);

  return true;
};

const splitFirstText = (editor: CustomEditor, bumpRender: () => void) => {
  const value = readEditorValue(editor);
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
  bumpRender();
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

const mergeSecondBlock = (editor: CustomEditor, bumpRender: () => void) => {
  if (getParagraphCount(editor) < 2) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.merge({ at: [1] });
  });
  bumpRender();
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
  const [firstBlock] = readEditorValue(editor);

  if (!firstBlock || !('role' in firstBlock)) {
    return;
  }

  editor.update((tx) => {
    tx.nodes.unset('role', { at: [0] });
  });
};

const firstBlockIsQuote = (editor: CustomEditor) => {
  const [firstBlock] = readEditorValue(editor);

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

const insertFragmentText = (peer: PeerDefinition, editor: CustomEditor) => {
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

const undoPeer = (peer: PeerDefinition, editor: CustomEditor) => {
  const previousValue = readEditorValue(editor);
  const previousSelection = readEditorSelection(editor);

  editor.update((tx) => {
    yjsTx(tx).undo();
  });
  syncSelectionAfterHistory(peer, editor, previousValue, previousSelection);
};

const redoPeer = (peer: PeerDefinition, editor: CustomEditor) => {
  const previousValue = readEditorValue(editor);
  const previousSelection = readEditorSelection(editor);

  editor.update((tx) => {
    yjsTx(tx).redo();
  });
  syncSelectionAfterHistory(peer, editor, previousValue, previousSelection);
};

const handleHistoryKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  peer: PeerDefinition,
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
    redoPeer(peer, editor);
  } else {
    undoPeer(peer, editor);
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
  peer: PeerDefinition,
  editor: CustomEditor
) => {
  getKeyboardInputType(event);

  if (handleDeleteKeyDown(event, peer, editor)) {
    return;
  }

  handleHistoryKeyDown(event, peer, editor);
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

const ProviderBackedPeer = ({
  peer,
  provider,
}: {
  peer: PeerDefinition;
  provider: PliteHocuspocusProvider;
}) => {
  const editor = usePliteEditor({
    extensions: [
      history(),
      createYjsExtension({
        clientId: peer.id,
        provider,
        rootName: '@platejs/plite',
        seedProviderOnSync: peer.id === 'a',
      }),
    ],
    initialValue: cloneValue(INITIAL_VALUE),
  }) as CustomEditor;
  const [renderEpoch, setRenderEpoch] = useState(0);
  const status = useYjsProviderStatus(editor) ?? provider.status;
  const synced = useYjsProviderSynced(editor) ?? provider.synced;
  const connected = status === 'connected';
  const label = `Peer ${peer.id.toUpperCase()}`;
  const bumpRender = () => setRenderEpoch((current) => current + 1);

  useEffect(() => {
    editor.update((tx) => {
      yjsTx(tx).sendCursorData({
        color: peer.color,
        name: peer.name,
      });
    });
  }, [editor, peer.color, peer.name]);

  return (
    <Plite editor={editor}>
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
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                connected
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              )}
            >
              {connected ? 'connected' : status}
            </span>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                synced
                  ? 'bg-sky-50 text-sky-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {synced ? 'synced' : 'syncing'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-3 py-2">
          <CommandButton
            onRun={() => selectHello(peer, editor)}
            testId={`yjs-peer-${peer.id}-select`}
          >
            Select
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, (editor) => toggleBold(editor))
            }
            testId={`yjs-peer-${peer.id}-mark-bold`}
          >
            Bold
          </CommandButton>
          <CommandButton
            onRun={() => setConnected(editor, false)}
            testId={`yjs-peer-${peer.id}-disconnect`}
          >
            Offline
          </CommandButton>
          <CommandButton
            onRun={() => setConnected(editor, true)}
            testId={`yjs-peer-${peer.id}-connect`}
          >
            Online
          </CommandButton>
          <CommandButton
            onRun={() => {
              editor.update((tx) => {
                yjsTx(tx).reconcile();
              });
            }}
            testId={`yjs-peer-${peer.id}-reconcile`}
          >
            Reconcile
          </CommandButton>
          <CommandButton
            onRun={() => undoPeer(peer, editor)}
            testId={`yjs-peer-${peer.id}-undo`}
          >
            Undo
          </CommandButton>
          <CommandButton
            onRun={() => redoPeer(peer, editor)}
            testId={`yjs-peer-${peer.id}-redo`}
          >
            Redo
          </CommandButton>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-3 py-2">
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => appendText(peer, editor))
            }
            testId={`yjs-peer-${peer.id}-append`}
          >
            Append
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => replaceDocument(peer, editor))
            }
            testId={`yjs-peer-${peer.id}-replace`}
          >
            Replace
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => removeSecondBlock(editor))
            }
            testId={`yjs-peer-${peer.id}-remove-node`}
          >
            Remove
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () =>
                splitFirstText(editor, bumpRender)
              )
            }
            testId={`yjs-peer-${peer.id}-split-node`}
          >
            Split
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () =>
                mergeSecondBlock(editor, bumpRender)
              )
            }
            testId={`yjs-peer-${peer.id}-merge-node`}
          >
            Merge
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => moveFirstBlockDown(editor))
            }
            testId={`yjs-peer-${peer.id}-move-down`}
          >
            Down
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => setFirstBlockRole(editor))
            }
            testId={`yjs-peer-${peer.id}-set-node`}
          >
            Set Role
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => unsetFirstBlockRole(editor))
            }
            testId={`yjs-peer-${peer.id}-unset-node`}
          >
            Unset Role
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => wrapFirstBlock(editor))
            }
            testId={`yjs-peer-${peer.id}-wrap-node`}
          >
            Wrap
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => unwrapFirstBlock(editor))
            }
            testId={`yjs-peer-${peer.id}-unwrap`}
          >
            Unwrap
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => liftFirstWrappedBlock(editor))
            }
            testId={`yjs-peer-${peer.id}-lift`}
          >
            Lift
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () =>
                insertFragmentText(peer, editor)
              )
            }
            testId={`yjs-peer-${peer.id}-insert-fragment`}
          >
            Fragment
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => deleteFirstFragment(editor))
            }
            testId={`yjs-peer-${peer.id}-delete-fragment`}
          >
            Delete
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () =>
                deleteBackwardFromFirstBlockEnd(editor)
              )
            }
            testId={`yjs-peer-${peer.id}-delete-backward`}
          >
            Back
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () => insertExclamation(editor))
            }
            testId={`yjs-peer-${peer.id}-insert-text`}
          >
            Insert !
          </CommandButton>
          <CommandButton
            onRun={() =>
              runPeerCommand(peer, editor, () =>
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
            handleHistoryKeyDown(event, peer, editor)
          }
        >
          <Editable
            autoFocus={peer.id === 'a'}
            className="min-h-28 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 outline-none focus:border-slate-400 focus:bg-white"
            key={renderEpoch}
            onKeyDown={(event) => handleEditableKeyDown(event, peer, editor)}
            onSelect={() => {
              editor.update((tx) => {
                yjsTx(tx).sendSelection(undefined, {
                  color: peer.color,
                  name: peer.name,
                });
              });
            }}
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

const ProviderPeer = ({
  peer,
  roomName,
}: {
  peer: PeerDefinition;
  roomName: string;
}) => {
  const [provider] = useState(() => createProvider(peer, roomName));

  useEffect(
    () => () => {
      provider.destroy?.();
    },
    [provider]
  );

  return <ProviderBackedPeer peer={peer} provider={provider} />;
};

const YjsHocuspocusExample = () => {
  const [roomName] = useState(readInitialRoomName);
  const [peers] = useState(readInitialPeers);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-950">
      <div
        className={cn(
          'mx-auto grid gap-4',
          peers.length === 1 ? 'max-w-3xl' : 'max-w-7xl lg:grid-cols-2'
        )}
      >
        {peers.map((peer) => (
          <ProviderPeer key={peer.id} peer={peer} roomName={roomName} />
        ))}
      </div>
    </main>
  );
};

export default YjsHocuspocusExample;
