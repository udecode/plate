import type { NodeKey, Path } from '../..';
import { getEditorRuntime } from '../../core/editor-runtime';
import {
  type AnyEditor,
  getNodeKey as editorGetNodeKey,
  getPathByNodeKey as editorGetPathByNodeKey,
} from '../../interfaces/editor';
import { NodeApi } from '../../interfaces/node';
import { PathApi } from '../../interfaces/path';
import { EDITOR_TO_RUNTIME_ID_TO_ELEMENTS } from '../utils/weak-maps';
import { getPliteTextHostStrings } from './dom-geometry';
import { parsePliteDOMPath } from './dom-node-path';
import { findDOMRootRuntime } from './dom-root-runtime';
import { readDOMTextFlowHost, readDOMTextFlowKey } from './dom-text-flow-index';

type PageText = { id: string; text: string | null };

export const TEXT_HOST = '[data-editor-node="text"]';

export const isFlowHost = (host: Element) =>
  host.getAttribute('data-editor-text-flow-host') === 'true';

const closestWith = (node: Element, name: string, value: string) => {
  for (
    let element: Element | null = node;
    element;
    element = element.parentElement
  ) {
    if (element.getAttribute(name) === value) return element as HTMLElement;
  }
  return null;
};

export const getTextRoot = (node: Element) =>
  closestWith(node, 'data-editor', 'true');

export const getTextHost = (node: Element) =>
  closestWith(node, 'data-editor-node', 'text');

export const textKeyId = (nodeKey: string) => `key:${nodeKey}`;

export const getTextHostId = (host: Element) => {
  const nodeKey = host.getAttribute('data-editor-node-key');
  const path = host.getAttribute('data-editor-path');

  if (nodeKey) return textKeyId(nodeKey);
  return path === null ? null : `path:${path}`;
};

const isBlank = (node: globalThis.Node) =>
  (node.nodeValue ?? '').replaceAll('\uFEFF', '') === '';

const DISPLAY_ONLY = '[contenteditable="false"], [data-editor-placeholder]';

const drawsUnownedText = (host: Element, strings: ReadonlySet<Element>) => {
  const walker = host.ownerDocument.createTreeWalker(
    host,
    NodeFilter.SHOW_TEXT
  );

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;

    if (parent && strings.has(parent)) continue;
    const island = parent?.closest(DISPLAY_ONLY);

    if (island && host.contains(island)) continue;
    if (!isBlank(node)) return true;
  }
  return false;
};

const readPlainHostText = (host: Element) => {
  const strings = getPliteTextHostStrings(host);
  let text = '';

  if (drawsUnownedText(host, new Set(strings))) return null;
  for (const string of strings) {
    if (string.hasAttribute('data-editor-zero-width')) {
      if ((string.textContent ?? '').replaceAll('\uFEFF', '') !== '') {
        return null;
      }
      continue;
    }
    const [node, extra] = string.childNodes;

    if (!node || extra || node.nodeType !== Node.TEXT_NODE) return null;
    const value = node.nodeValue ?? '';
    const length = string.getAttribute('data-editor-length');

    text +=
      length !== null &&
      value.endsWith('\n') &&
      value.length === Number(length) + 1
        ? value.slice(0, -1)
        : value;
  }

  return text;
};

export const isEditableTextIn = (root: HTMLElement, node: globalThis.Node) => {
  const parent = node.parentElement;

  if (isBlank(node) || !parent || getTextRoot(parent) !== root) return false;
  const island = parent.closest(DISPLAY_ONLY);

  return !island || island === root || !root.contains(island);
};

export const createTextWalker = (root: HTMLElement) =>
  root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);

export const drawsTextBetween = (
  walker: TreeWalker,
  previous: Element,
  host: Element
) => {
  const root = walker.root as HTMLElement;
  let last: globalThis.Node = previous;

  while (last.lastChild) last = last.lastChild;
  walker.currentNode = last;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (
      host.contains(node) ||
      host.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return false;
    }
    if (isEditableTextIn(root, node)) return true;
  }
  return false;
};

const byPageOrder = (left: Element, right: Element) =>
  left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;

export const getKeyElementMap = (editor: AnyEditor) =>
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(getEditorRuntime(editor));

export const getMappedKeyElements = (editor: AnyEditor, nodeKey: NodeKey) =>
  getKeyElementMap(editor)?.get(nodeKey);

export const getMappedKeyHosts = (
  editor: AnyEditor,
  root: HTMLElement,
  nodeKey: NodeKey
) =>
  [...(getMappedKeyElements(editor, nodeKey) ?? [])]
    .filter(
      (element) =>
        element.isConnected &&
        getTextRoot(element) === root &&
        (isFlowHost(element) ||
          element.getAttribute('data-editor-node-key') === nodeKey)
    )
    .sort(byPageOrder);

export const getKeyHosts = (
  editor: AnyEditor,
  root: HTMLElement,
  nodeKey: NodeKey,
  host: HTMLElement
) => {
  const hosts = getMappedKeyHosts(editor, root, nodeKey);

  return hosts.includes(host) ? hosts : [host];
};

const drawsNestedHost = (host: HTMLElement) => {
  const nested = host.querySelectorAll(TEXT_HOST);

  if (nested.length === 0) return false;
  const root = getTextRoot(host);

  for (const element of nested) {
    if (getTextRoot(element) === root) return true;
  }
  return false;
};

export const readHostTexts = (host: HTMLElement): PageText[] | null => {
  if (!isFlowHost(host)) {
    if (drawsNestedHost(host)) return null;
    const id = getTextHostId(host);

    return id ? [{ id, text: readPlainHostText(host) }] : [];
  }

  return (
    readDOMTextFlowHost(host)?.map(({ nodeKey, text }) => ({
      id: textKeyId(nodeKey),
      text,
    })) ?? null
  );
};

export const isDOMTextCurrent = (
  editor: AnyEditor,
  host: HTMLElement,
  nodeKey: NodeKey,
  text: string
) => {
  const root = getTextRoot(host);

  if (!root) return false;
  const id = getTextHostId(host) ?? textKeyId(nodeKey);
  let pageText = '';
  let found = false;

  for (const keyHost of getKeyHosts(editor, root, nodeKey, host)) {
    if (isFlowHost(keyHost)) {
      const flowText = readDOMTextFlowKey(keyHost, nodeKey);

      if (flowText === null) return false;
      if (flowText === undefined) continue;
      found = true;
      pageText += flowText;
      continue;
    }
    const texts = readHostTexts(keyHost);

    if (!texts) return false;
    for (const entry of texts) {
      if (entry.id !== id && entry.id !== textKeyId(nodeKey)) continue;
      if (entry.text === null) return false;
      found = true;
      pageText += entry.text;
    }
  }

  return found && pageText === text;
};

export const createTextRootWalker = (root: HTMLElement) =>
  root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, (node) =>
    node !== root && (node as Element).getAttribute('data-editor') === 'true'
      ? NodeFilter.FILTER_REJECT
      : NodeFilter.FILTER_ACCEPT
  );

export const getHiddenOnPurpose = (root: HTMLElement) => {
  const coverage = findDOMRootRuntime(root)?.domCoverage;

  return coverage
    ? (path: Path) => !!coverage.getBoundaryForPoint({ offset: 0, path })
    : () => true;
};

const readPageTexts = (
  root: HTMLElement,
  first: HTMLElement,
  last: HTMLElement
) => {
  if (first.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_PRECEDING) {
    return null;
  }
  const entries: PageText[] = [];
  const walker = createTextRootWalker(root);
  const textWalker = createTextWalker(root);
  let previousHost: HTMLElement | null = null;

  walker.currentNode = first;
  for (
    let node: globalThis.Node | null = first;
    node;
    node = walker.nextNode()
  ) {
    const host = node as HTMLElement;

    if (host.getAttribute('data-editor-node') === 'text') {
      const texts = readHostTexts(host);

      if (
        !texts ||
        (previousHost && drawsTextBetween(textWalker, previousHost, host))
      ) {
        return null;
      }
      previousHost = host;
      for (const entry of texts) {
        const previous = entries.at(-1);

        if (previous?.id === entry.id) {
          previous.text =
            previous.text === null || entry.text === null
              ? null
              : previous.text + entry.text;
        } else {
          entries.push({ ...entry });
        }
      }
    }
    if (node === last) return entries;
  }

  return null;
};

export const getIdPath = (editor: AnyEditor, id: string): Path | null =>
  id.startsWith('key:')
    ? editorGetPathByNodeKey(editor, id.slice(4) as NodeKey)
    : parsePliteDOMPath(id.slice(5));

export const isDOMRangeCurrent = (
  editor: AnyEditor,
  root: HTMLElement,
  [startHost, startKey]: readonly [HTMLElement, NodeKey],
  [endHost, endKey]: readonly [HTMLElement, NodeKey]
) => {
  const first = getKeyHosts(editor, root, startKey, startHost)[0];
  const last = getKeyHosts(editor, root, endKey, endHost).at(-1) ?? endHost;
  const pageTexts = readPageTexts(root, first, last);
  const lastText = pageTexts?.at(-1);

  if (!pageTexts || !lastText) return false;
  const from = getIdPath(editor, pageTexts[0].id);
  const to = getIdPath(editor, lastText.id);

  if (!from || !to || PathApi.isAfter(from, to)) return false;
  const hidesOnPurpose = getHiddenOnPurpose(root);
  let next = 0;

  for (const [node, path] of NodeApi.texts(editor, { from, to })) {
    const nodeKey = editorGetNodeKey(editor, path);
    const pageText = pageTexts[next];

    if (
      pageText &&
      (pageText.id === `path:${path.join(',')}` ||
        (nodeKey !== null && pageText.id === textKeyId(nodeKey)))
    ) {
      if (pageText.text !== node.text) return false;
      next += 1;
    } else if (!hidesOnPurpose(path)) {
      return false;
    }
  }

  return next === pageTexts.length;
};
