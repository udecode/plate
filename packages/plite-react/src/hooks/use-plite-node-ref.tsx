import { useCallback, useContext, useRef, useSyncExternalStore } from 'react';
import type {
  Descendant,
  Editor as PliteEditor,
  Path,
  NodeKey,
} from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  getOrCreateDOMNodeKey,
  IS_COMPOSING,
  markDOMSyncMutationTarget,
  NODE_TO_ELEMENT,
  NODE_TO_RUNTIME_ID,
} from '@platejs/plite-dom/internal';
import { EditorContext } from '../context';
import {
  type Editor,
  getEditorRuntimeOwner,
  getNodeKeyDOMValue,
  getPathByNodeKey as editorGetPathByNodeKey,
  hasPath as editorHasPath,
} from '../editable/runtime-editor-api';
import { recordPliteReactRender } from '../render-profiler';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

const EDITOR_TO_PATH_TO_ELEMENT = new WeakMap<
  Editor,
  Map<string, Set<HTMLElement>>
>();
const EDITOR_TO_RUNTIME_ID_TO_ELEMENTS = new WeakMap<
  Editor,
  Map<NodeKey, Set<HTMLElement>>
>();
const EDITOR_TO_SYNCED_TEXT_PATHS = new WeakMap<Editor, Set<string>>();
const EDITOR_TO_SYNCED_TEXT_VALUES = new WeakMap<
  Editor,
  Map<NodeKey, string>
>();
const EDITOR_TO_TEXT_RENDER_REVISIONS = new WeakMap<
  Editor,
  Map<NodeKey, number>
>();
const ELEMENT_TO_PATH = new WeakMap<HTMLElement, Path>();
const subscribeToHydration = () => () => {};

const pathKey = (path: readonly number[]) => path.join('.');

const recordDOMTextSyncProfile = (id: string) => {
  recordPliteReactRender({
    id,
    kind: 'dom-text-sync',
  });
};

const parsePathKey = (key: string): Path =>
  (key === ''
    ? []
    : key.split('.').map((part) => Number.parseInt(part, 10))) as Path;

const getPathElementMap = (editor: Editor) => {
  const existing = EDITOR_TO_PATH_TO_ELEMENT.get(editor);

  if (existing) {
    return existing;
  }

  const next = new Map<string, Set<HTMLElement>>();
  EDITOR_TO_PATH_TO_ELEMENT.set(editor, next);
  return next;
};

const bindPathElement = (
  editor: Editor,
  path: readonly number[],
  element: HTMLElement
) => {
  const pathElementMap = getPathElementMap(editor);
  const key = pathKey(path);
  const elements = pathElementMap.get(key) ?? new Set<HTMLElement>();

  elements.add(element);
  pathElementMap.set(key, elements);
};

const unbindPathElement = (
  editor: Editor,
  path: readonly number[],
  element: HTMLElement
) => {
  const pathElementMap = getPathElementMap(editor);
  const key = pathKey(path);
  const elements = pathElementMap.get(key);

  elements?.delete(element);

  if (elements?.size === 0) {
    pathElementMap.delete(key);
  }
};

const getNodeKeyElementMap = (editor: Editor) => {
  const existing = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(editor);

  if (existing) {
    return existing;
  }

  const next = new Map<NodeKey, Set<HTMLElement>>();
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.set(editor, next);
  return next;
};

const bindNodeKeyElement = (
  editor: Editor,
  nodeKey: NodeKey,
  element: HTMLElement
) => {
  const runtimeElementMap = getNodeKeyElementMap(editor);
  const elements = runtimeElementMap.get(nodeKey) ?? new Set<HTMLElement>();

  elements.add(element);
  runtimeElementMap.set(nodeKey, elements);

  return () => {
    elements.delete(element);

    if (elements.size === 0) {
      runtimeElementMap.delete(nodeKey);
    }
  };
};

const syncPliteElementPath = ({
  editor,
  element,
  path,
  nodeKey,
}: {
  editor: Editor;
  element: HTMLElement;
  path: Path;
  nodeKey: NodeKey;
}) => {
  const nextPathKey = pathKey(path);
  const previousPath = ELEMENT_TO_PATH.get(element);

  if (previousPath) {
    const previousPathKey = pathKey(previousPath);

    if (previousPathKey !== nextPathKey) {
      unbindPathElement(editor, previousPath, element);
    }
  }

  ELEMENT_TO_PATH.set(element, [...path] as Path);
  markDOMSyncMutationTarget(element, 'attributes', 'data-plite-path');
  element.setAttribute('data-plite-path', path.join(','));
  markDOMSyncMutationTarget(element, 'attributes', 'data-plite-node-key');
  element.setAttribute('data-plite-node-key', nodeKey);
  bindPathElement(editor, path, element);
};

export const syncPliteNodePathBindingsToDOM = (
  editor: PliteEditor<any, any>,
  nodeKeys?: readonly NodeKey[] | null
) => {
  const runtimeElementMap = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(editor);

  if (!runtimeElementMap) {
    return;
  }

  const entries =
    nodeKeys == null
      ? [...runtimeElementMap.entries()]
      : nodeKeys.flatMap((nodeKey) => {
          const elements = runtimeElementMap.get(nodeKey);

          return elements ? ([[nodeKey, elements]] as const) : [];
        });

  for (const [nodeKey, elements] of entries) {
    const path = editorGetPathByNodeKey(editor, nodeKey);

    for (const element of [...elements]) {
      if (!element.isConnected) {
        elements.delete(element);
        continue;
      }

      if (!path) {
        const previousPath = ELEMENT_TO_PATH.get(element);

        if (previousPath) {
          unbindPathElement(editor, previousPath, element);
        }

        ELEMENT_TO_PATH.delete(element);
        markDOMSyncMutationTarget(element, 'attributes', 'data-plite-path');
        element.removeAttribute('data-plite-path');
        continue;
      }

      syncPliteElementPath({ editor, element, path, nodeKey });
    }

    if (elements.size === 0) {
      runtimeElementMap.delete(nodeKey);
    }
  }
};

export const getPliteNodeElementByPath = (
  editor: Editor,
  path: readonly number[]
) => {
  const key = pathKey(path);
  const pathElementMap = EDITOR_TO_PATH_TO_ELEMENT.get(editor);
  const elements = pathElementMap?.get(key);

  if (!elements) {
    return null;
  }

  let result: HTMLElement | null = null;

  for (const element of elements) {
    if (
      element.isConnected &&
      element.getAttribute('data-plite-path') === path.join(',')
    ) {
      result = element;
    } else {
      elements.delete(element);
    }
  }

  if (elements.size === 0) {
    pathElementMap?.delete(key);
  }

  return result;
};

export const didSyncTextPathToDOM = (editor: Editor, path: readonly number[]) =>
  EDITOR_TO_SYNCED_TEXT_PATHS.get(editor)?.has(pathKey(path)) ?? false;

export const getDOMTextRenderRevision = (
  editor: Editor,
  nodeKeys: readonly NodeKey[]
) => {
  const revisions = EDITOR_TO_TEXT_RENDER_REVISIONS.get(
    getEditorRuntimeOwner(editor)
  );

  return nodeKeys.reduce(
    (revision, nodeKey) => revision + (revisions?.get(nodeKey) ?? 0),
    0
  );
};

const bumpDOMTextRenderRevision = (editor: Editor, nodeKey: NodeKey) => {
  const owner = getEditorRuntimeOwner(editor);
  const revisions =
    EDITOR_TO_TEXT_RENDER_REVISIONS.get(owner) ?? new Map<NodeKey, number>();

  revisions.set(nodeKey, (revisions.get(nodeKey) ?? 0) + 1);
  EDITOR_TO_TEXT_RENDER_REVISIONS.set(owner, revisions);
};

const parseDOMPath = (value: string | null): Path | null => {
  if (!value) {
    return null;
  }

  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  return path.every(Number.isFinite) ? (path as Path) : null;
};

export const getPliteNodePathFromDOMElement = (
  element: Element
): Path | null =>
  element instanceof HTMLElement
    ? (ELEMENT_TO_PATH.get(element) ??
      parseDOMPath(element.getAttribute('data-plite-path')))
    : null;

type DOMTextSyncLeafRange = {
  end: number;
  leaf: HTMLElement;
  start: number;
  string: HTMLElement;
};

const parseLeafOffset = (leaf: HTMLElement, name: string) => {
  const value = leaf.getAttribute(name);

  if (value == null) {
    return null;
  }

  const offset = Number.parseInt(value, 10);

  return Number.isFinite(offset) ? offset : null;
};

const getProjectedDOMTextSyncLeafRanges = (
  element: HTMLElement,
  strings: NodeListOf<Element>
) => {
  const leaves = Array.from(
    element.querySelectorAll<HTMLElement>('[data-plite-leaf="true"]')
  );

  if (leaves.length === 0 || leaves.length !== strings.length) {
    return null;
  }

  const ranges: DOMTextSyncLeafRange[] = [];

  for (let index = 0; index < leaves.length; index += 1) {
    const leaf = leaves[index]!;
    const string = strings[index];

    if (!(string instanceof HTMLElement)) {
      return null;
    }

    const start = parseLeafOffset(leaf, 'data-plite-leaf-start');
    const end = parseLeafOffset(leaf, 'data-plite-leaf-end');

    if (start == null || end == null || end < start) {
      return null;
    }

    ranges.push({ end, leaf, start, string });
  }

  return ranges;
};

const syncChangedProjectedTextToDOM = ({
  element,
  nextText,
  previousText,
}: {
  element: HTMLElement;
  nextText: string;
  previousText: string;
}) => {
  const strings = element.querySelectorAll('[data-plite-string="true"]');

  if (strings.length <= 1) {
    return null;
  }

  const ranges = getProjectedDOMTextSyncLeafRanges(element, strings);

  if (!ranges) {
    recordDOMTextSyncProfile('skip-projected-shape');
    return false;
  }

  let prefix = 0;
  const prefixLimit = Math.min(previousText.length, nextText.length);

  while (prefix < prefixLimit && previousText[prefix] === nextText[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  const suffixLimit = Math.min(previousText.length, nextText.length) - prefix;

  while (
    suffix < suffixLimit &&
    previousText.at(-1 - suffix) === nextText.at(-1 - suffix)
  ) {
    suffix += 1;
  }

  const removeEnd = previousText.length - suffix;
  const removedLength = removeEnd - prefix;
  const insertedLength = nextText.length - prefix - suffix;
  const removedRanges = ranges.map((range) => {
    const mapOffset = (offset: number) => {
      if (offset <= prefix) return offset;
      if (offset >= removeEnd) return offset - removedLength;

      return prefix;
    };
    const start = mapOffset(range.start);

    return {
      end: Math.max(start, mapOffset(range.end)),
      start,
    };
  });
  const insertLeafIndex = Math.max(
    0,
    removedRanges.findIndex(
      (range) => prefix >= range.start && prefix <= range.end
    )
  );

  ranges.forEach((range, index) => {
    const removedRange = removedRanges[index]!;
    const start =
      index !== insertLeafIndex && removedRange.start >= prefix
        ? removedRange.start + insertedLength
        : removedRange.start;
    const end =
      index === insertLeafIndex
        ? removedRange.end + insertedLength
        : index !== insertLeafIndex && removedRange.start >= prefix
          ? removedRange.end + insertedLength
          : removedRange.end;
    const leafText = nextText.slice(start, end);

    markDOMSyncMutationTarget(
      range.leaf,
      'attributes',
      'data-plite-leaf-start'
    );
    range.leaf.setAttribute('data-plite-leaf-start', String(start));
    markDOMSyncMutationTarget(range.leaf, 'attributes', 'data-plite-leaf-end');
    range.leaf.setAttribute('data-plite-leaf-end', String(end));
    if (range.string.textContent !== leafText) {
      markDOMSyncMutationTarget(range.string, 'childList');
      range.string.textContent = leafText;
    } else {
      claimCanonicalStringDOM(range.string);
    }
  });

  recordDOMTextSyncProfile('success-projected');
  return true;
};

const syncChangedTextToElement = ({
  element,
  nextText,
  previousText,
}: {
  element: HTMLElement;
  nextText: string;
  previousText: string;
}) => {
  const canUseDOMTextSync =
    element.getAttribute('data-plite-dom-sync') === 'true';
  const strings = element.querySelectorAll('[data-plite-string="true"]');

  if (!canUseDOMTextSync || strings.length !== 1) {
    if (
      element.getAttribute('data-plite-projected-dom-sync') === 'true' &&
      syncChangedProjectedTextToDOM({ element, nextText, previousText })
    ) {
      return true;
    }

    if (element.textContent?.replace(/\uFEFF/g, '') === nextText) {
      strings.forEach(claimCanonicalStringDOM);
      recordDOMTextSyncProfile('already-synced-dom-text');
      return true;
    }

    recordDOMTextSyncProfile('skip-disabled');
    return false;
  }

  const stringElement = strings[0]!;

  if (nextText.length === 0) {
    markDOMSyncMutationTarget(stringElement, 'childList');
    stringElement.textContent = '';
    recordDOMTextSyncProfile('skip-empty-text');
    return false;
  }

  const textNode = Array.from(stringElement.childNodes).find(
    (child) => child.nodeType === Node.TEXT_NODE
  );

  if (textNode) {
    if (textNode.nodeValue === nextText) {
      markDOMSyncMutationTarget(textNode, 'characterData');
      recordDOMTextSyncProfile('already-synced');
      return true;
    }
    markDOMSyncMutationTarget(textNode, 'characterData');
    textNode.nodeValue = nextText;
  } else {
    if (stringElement.textContent === nextText) {
      markDOMSyncMutationTarget(stringElement, 'childList');
      recordDOMTextSyncProfile('already-synced');
      return true;
    }
    markDOMSyncMutationTarget(stringElement, 'childList');
    stringElement.textContent = nextText;
  }

  recordDOMTextSyncProfile('success');
  return true;
};

const getMappedTextElements = (
  runtimeElementMap: Map<NodeKey, Set<HTMLElement>>,
  nodeKey: NodeKey
) => {
  const mappedElements = runtimeElementMap.get(nodeKey);

  if (!mappedElements) return [];

  const elements: HTMLElement[] = [];

  for (const element of mappedElements) {
    if (
      element.isConnected &&
      element.getAttribute('data-plite-node-key') === nodeKey
    ) {
      elements.push(element);
    } else {
      mappedElements.delete(element);
    }
  }

  if (mappedElements.size === 0) runtimeElementMap.delete(nodeKey);

  return elements;
};

const claimCanonicalStringDOM = (stringElement: Element) => {
  markDOMSyncMutationTarget(stringElement, 'childList');

  for (const child of stringElement.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      markDOMSyncMutationTarget(child, 'characterData');
    }
  }
};

const readTextAtPath = (editor: Editor, path: Path) => {
  if (!editorHasPath(editor, path)) return;

  const entry = editor.read((state) => state.nodes.get(path));

  if (!entry) return null;

  const [node] = entry;

  return 'text' in node && typeof node.text === 'string' ? node.text : null;
};

export const syncChangedTextToDOM = (
  editor: PliteEditor<any, any>,
  changedTextNodeKeys: readonly NodeKey[]
) => {
  const synced = new Set<string>();
  const runtimeElementMap = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(editor);
  const syncedValues =
    EDITOR_TO_SYNCED_TEXT_VALUES.get(editor) ?? new Map<NodeKey, string>();
  const result = () => ({
    changedTextCount: changedTextNodeKeys.length,
    syncedTextCount: synced.size,
  });

  if (changedTextNodeKeys.length > 0) {
    recordDOMTextSyncProfile('attempt');
  }

  if (IS_COMPOSING.get(editor)) {
    recordDOMTextSyncProfile('skip-composition');
    EDITOR_TO_SYNCED_TEXT_PATHS.set(editor, synced);
    return result();
  }

  if (!runtimeElementMap) {
    recordDOMTextSyncProfile('skip-no-runtime-map');
    EDITOR_TO_SYNCED_TEXT_PATHS.set(editor, synced);
    return result();
  }

  for (const nodeKey of changedTextNodeKeys) {
    const path = editorGetPathByNodeKey(editor, nodeKey);

    if (!path) {
      recordDOMTextSyncProfile('skip-no-path');
      continue;
    }

    const key = pathKey(path);
    const elements = getMappedTextElements(runtimeElementMap, nodeKey);

    if (elements.length === 0) {
      recordDOMTextSyncProfile('skip-no-element');
      continue;
    }

    const text = readTextAtPath(editor, path);

    if (text === undefined) {
      recordDOMTextSyncProfile('skip-missing-path');
      continue;
    }

    if (text === null) {
      recordDOMTextSyncProfile('skip-non-text');
      continue;
    }

    const previousText =
      syncedValues.get(nodeKey) ??
      elements[0]!.textContent?.replace(/\uFEFF/g, '');

    if (previousText == null) {
      recordDOMTextSyncProfile('skip-no-previous-text');
      continue;
    }

    const didSyncEveryElement = elements.every((element) =>
      syncChangedTextToElement({
        element,
        nextText: text,
        previousText,
      })
    );

    syncedValues.set(nodeKey, text);

    if (didSyncEveryElement) {
      synced.add(key);
    } else {
      bumpDOMTextRenderRevision(editor, nodeKey);
    }
  }

  EDITOR_TO_SYNCED_TEXT_VALUES.set(editor, syncedValues);
  EDITOR_TO_SYNCED_TEXT_PATHS.set(editor, synced);
  return result();
};

const bindPliteNodeElement = ({
  editor,
  node,
  providedPathKey,
  providedPliteNode,
  nodeKey,
}: {
  editor: Editor;
  node: Node;
  providedPathKey: string | null;
  providedPliteNode: Descendant | null;
  nodeKey: NodeKey;
}) => {
  const path =
    providedPathKey == null
      ? editorGetPathByNodeKey(editor, nodeKey)
      : parsePathKey(providedPathKey);

  if (!path || !(node instanceof HTMLElement)) {
    return null;
  }

  const livePliteNode = editor.read((state) => {
    const candidate = state.nodes.get(path)?.[0];

    return candidate && NodeApi.isDescendant(candidate) ? candidate : undefined;
  });
  const pliteNode =
    providedPliteNode === livePliteNode ? providedPliteNode : livePliteNode;

  if (!pliteNode) {
    return null;
  }
  const key = getOrCreateDOMNodeKey(editor, nodeKey, pliteNode);
  const keyToElement = EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap();

  if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
    EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
  }

  keyToElement.set(key, node);
  NODE_TO_ELEMENT.set(pliteNode, node);
  NODE_TO_RUNTIME_ID.set(pliteNode, nodeKey);
  ELEMENT_TO_NODE.set(node, pliteNode);
  if ('text' in pliteNode && typeof pliteNode.text === 'string') {
    const syncedValues =
      EDITOR_TO_SYNCED_TEXT_VALUES.get(editor) ?? new Map<NodeKey, string>();

    syncedValues.set(nodeKey, pliteNode.text);
    EDITOR_TO_SYNCED_TEXT_VALUES.set(editor, syncedValues);
  }
  syncPliteElementPath({ editor, element: node, path, nodeKey });
  const cleanupNodeKeyElement = bindNodeKeyElement(editor, nodeKey, node);

  return () => {
    cleanupNodeKeyElement();

    if (keyToElement.get(key) === node) {
      keyToElement.delete(key);
    }

    if (NODE_TO_ELEMENT.get(pliteNode) === node) {
      NODE_TO_ELEMENT.delete(pliteNode);

      if (NODE_TO_RUNTIME_ID.get(pliteNode) === nodeKey) {
        NODE_TO_RUNTIME_ID.delete(pliteNode);
      }
    }

    if (ELEMENT_TO_NODE.get(node) === pliteNode) {
      ELEMENT_TO_NODE.delete(node);
    }

    const currentPath = ELEMENT_TO_PATH.get(node);
    if (currentPath) {
      unbindPathElement(editor, currentPath, node);

      ELEMENT_TO_PATH.delete(node);
    }

    if (node.getAttribute('data-plite-node-key') === nodeKey) {
      markDOMSyncMutationTarget(node, 'attributes', 'data-plite-path');
      node.removeAttribute('data-plite-path');
      markDOMSyncMutationTarget(node, 'attributes', 'data-plite-node-key');
      node.removeAttribute('data-plite-node-key');
    }

    if (!getNodeKeyElementMap(editor).has(nodeKey)) {
      EDITOR_TO_SYNCED_TEXT_VALUES.get(editor)?.delete(nodeKey);
    }
  };
};

/**
 * Return a callback ref that binds a DOM node to a Plite node runtime.
 *
 * Use this from custom renderers or DOM-coverage shells that must keep
 * DOM-to-Plite translation accurate for a known runtime, node, or path.
 */
export const usePliteNodeRef = (
  nodeKey: NodeKey | null,
  options: {
    path?: Path | null;
    pliteNode?: Descendant | null;
  } = {}
) => {
  const editor = useContext(EditorContext);
  const nodeRef = useRef<Node | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const providedPathKey = options.path == null ? null : pathKey(options.path);
  const providedPliteNode = options.pliteNode ?? null;

  const cleanupBinding = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  const bindNode = useCallback(
    (nextNode: Node | null) => {
      cleanupBinding();

      if (!nextNode) {
        return;
      }

      if (!editor || !nodeKey) {
        return;
      }

      cleanupRef.current = bindPliteNodeElement({
        editor,
        node: nextNode,
        providedPathKey,
        providedPliteNode,
        nodeKey,
      });
    },
    [cleanupBinding, editor, providedPathKey, providedPliteNode, nodeKey]
  );

  useIsomorphicLayoutEffect(() => {
    bindNode(nodeRef.current);

    return cleanupBinding;
  }, [bindNode, cleanupBinding]);

  return useCallback(
    (nextNode: Node | null) => {
      if (nodeRef.current === nextNode) {
        return;
      }

      nodeRef.current = nextNode;
      bindNode(nextNode);
    },
    [bindNode]
  );
};

/** @internal Publish hydration-safe local tokens only until React mounts. */
export const usePliteNodeKeyDOMValue = (nodeKey: NodeKey | null) => {
  const isMounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  if (!nodeKey) return;

  return isMounted ? nodeKey : getNodeKeyDOMValue(nodeKey);
};
