import { useCallback, useContext, useRef } from 'react';
import type {
  Operation,
  Path,
  RuntimeId,
  Node as SlateNode,
} from '@platejs/slate';
import type { DOMEditor } from '@platejs/slate-dom/internal';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  IS_COMPOSING,
  NODE_TO_ELEMENT,
  NODE_TO_RUNTIME_ID,
} from '@platejs/slate-dom/internal';
import { EditorContext } from '../context';
import {
  Editor,
  withOperationRootChildren,
} from '../editable/runtime-editor-api';
import { recordSlateReactRender } from '../render-profiler';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

const EDITOR_TO_PATH_TO_ELEMENT = new WeakMap<
  Editor,
  Map<string, HTMLElement>
>();
const EDITOR_TO_RUNTIME_ID_TO_ELEMENTS = new WeakMap<
  Editor,
  Map<RuntimeId, Set<HTMLElement>>
>();
const EDITOR_TO_SYNCED_TEXT_PATHS = new WeakMap<Editor, Set<string>>();
const ELEMENT_TO_PATH = new WeakMap<HTMLElement, Path>();
const DOM_TEXT_SYNC_MUTATION_TARGETS = new WeakSet<Node>();

const pathKey = (path: readonly number[]) => path.join('.');

const recordDOMTextSyncProfile = (id: string) => {
  recordSlateReactRender({
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

  const next = new Map<string, HTMLElement>();
  EDITOR_TO_PATH_TO_ELEMENT.set(editor, next);
  return next;
};

const getRuntimeIdElementMap = (editor: Editor) => {
  const existing = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(editor);

  if (existing) {
    return existing;
  }

  const next = new Map<RuntimeId, Set<HTMLElement>>();
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.set(editor, next);
  return next;
};

const bindRuntimeIdElement = (
  editor: Editor,
  runtimeId: RuntimeId,
  element: HTMLElement
) => {
  const runtimeElementMap = getRuntimeIdElementMap(editor);
  const elements = runtimeElementMap.get(runtimeId) ?? new Set<HTMLElement>();

  elements.add(element);
  runtimeElementMap.set(runtimeId, elements);

  return () => {
    elements.delete(element);

    if (elements.size === 0) {
      runtimeElementMap.delete(runtimeId);
    }
  };
};

const syncSlateElementPath = ({
  editor,
  element,
  path,
  runtimeId,
}: {
  editor: Editor;
  element: HTMLElement;
  path: Path;
  runtimeId: RuntimeId;
}) => {
  const nextPathKey = pathKey(path);
  const previousPath = ELEMENT_TO_PATH.get(element);

  if (previousPath) {
    const previousPathKey = pathKey(previousPath);

    if (previousPathKey !== nextPathKey) {
      const pathToElement = getPathElementMap(editor);

      if (pathToElement.get(previousPathKey) === element) {
        pathToElement.delete(previousPathKey);
      }
    }
  }

  ELEMENT_TO_PATH.set(element, [...path] as Path);
  element.setAttribute('data-slate-path', path.join(','));
  element.setAttribute('data-slate-runtime-id', runtimeId);
  getPathElementMap(editor).set(nextPathKey, element);
};

export const syncSlateNodePathBindingsToDOM = (
  editor: Editor,
  runtimeIds?: readonly RuntimeId[] | null
) => {
  const runtimeElementMap = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(editor);

  if (!runtimeElementMap) {
    return;
  }

  const entries =
    runtimeIds == null
      ? [...runtimeElementMap.entries()]
      : runtimeIds.flatMap((runtimeId) => {
          const elements = runtimeElementMap.get(runtimeId);

          return elements ? ([[runtimeId, elements]] as const) : [];
        });

  for (const [runtimeId, elements] of entries) {
    const path = Editor.getPathByRuntimeId(editor, runtimeId);

    for (const element of [...elements]) {
      if (!element.isConnected) {
        elements.delete(element);
        continue;
      }

      if (!path) {
        const previousPath = ELEMENT_TO_PATH.get(element);

        if (previousPath) {
          const previousPathKey = pathKey(previousPath);
          const pathToElement = getPathElementMap(editor);

          if (pathToElement.get(previousPathKey) === element) {
            pathToElement.delete(previousPathKey);
          }
        }

        ELEMENT_TO_PATH.delete(element);
        element.removeAttribute('data-slate-path');
        continue;
      }

      syncSlateElementPath({ editor, element, path, runtimeId });
    }

    if (elements.size === 0) {
      runtimeElementMap.delete(runtimeId);
    }
  }
};

export const getSlateNodeElementByPath = (
  editor: Editor,
  path: readonly number[]
) => {
  const element = EDITOR_TO_PATH_TO_ELEMENT.get(editor)?.get(pathKey(path));

  if (!element?.isConnected) {
    return null;
  }

  return element.getAttribute('data-slate-path') === path.join(',')
    ? element
    : null;
};

export const didSyncTextPathToDOM = (editor: Editor, path: readonly number[]) =>
  EDITOR_TO_SYNCED_TEXT_PATHS.get(editor)?.has(pathKey(path)) ?? false;

const markDOMTextSyncMutationTarget = (target: Node) => {
  DOM_TEXT_SYNC_MUTATION_TARGETS.add(target);
  setTimeout(() => {
    DOM_TEXT_SYNC_MUTATION_TARGETS.delete(target);
  });
};

export const isDOMTextSyncMutation = (mutation: MutationRecord) =>
  DOM_TEXT_SYNC_MUTATION_TARGETS.has(mutation.target);

const parseDOMPath = (value: string | null): Path | null => {
  if (!value) {
    return null;
  }

  const path = value.split(',').map((part) => Number.parseInt(part, 10));

  return path.every(Number.isFinite) ? (path as Path) : null;
};

export const getSlateNodePathFromDOMElement = (
  element: Element
): Path | null =>
  element instanceof HTMLElement
    ? (ELEMENT_TO_PATH.get(element) ??
      parseDOMPath(element.getAttribute('data-slate-path')))
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
    element.querySelectorAll<HTMLElement>('[data-slate-leaf="true"]')
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

    const start = parseLeafOffset(leaf, 'data-slate-leaf-start');
    const end = parseLeafOffset(leaf, 'data-slate-leaf-end');

    if (start == null || end == null || end < start) {
      return null;
    }

    ranges.push({ end, leaf, start, string });
  }

  return ranges;
};

const transformRemovedOffset = ({
  offset,
  removeEnd,
  removeStart,
}: {
  offset: number;
  removeEnd: number;
  removeStart: number;
}) => {
  if (offset <= removeStart) {
    return offset;
  }

  if (offset >= removeEnd) {
    return offset - (removeEnd - removeStart);
  }

  return removeStart;
};

const transformProjectedLeafRange = (
  range: DOMTextSyncLeafRange,
  operation: Extract<Operation, { type: 'insert_text' | 'remove_text' }>,
  index: number,
  insertLeafIndex: number
) => {
  if (operation.type === 'insert_text') {
    const insertLength = operation.text.length;

    if (index === insertLeafIndex) {
      return { end: range.end + insertLength, start: range.start };
    }

    if (range.start >= operation.offset) {
      return {
        end: range.end + insertLength,
        start: range.start + insertLength,
      };
    }

    return { end: range.end, start: range.start };
  }

  const removeStart = operation.offset;
  const removeEnd = operation.offset + operation.text.length;
  const start = transformRemovedOffset({
    offset: range.start,
    removeEnd,
    removeStart,
  });
  const end = transformRemovedOffset({
    offset: range.end,
    removeEnd,
    removeStart,
  });

  return {
    end: Math.max(start, end),
    start,
  };
};

const syncProjectedTextOperationToDOM = ({
  element,
  operation,
  strings,
  text,
}: {
  element: HTMLElement;
  operation: Extract<Operation, { type: 'insert_text' | 'remove_text' }>;
  strings: NodeListOf<Element>;
  text: string;
}) => {
  const ranges = getProjectedDOMTextSyncLeafRanges(element, strings);

  if (!ranges) {
    recordDOMTextSyncProfile('skip-projected-shape');
    return false;
  }

  const insertLeafIndex =
    operation.type === 'insert_text'
      ? Math.max(
          0,
          ranges.findIndex(
            (range) =>
              operation.offset >= range.start && operation.offset <= range.end
          )
        )
      : -1;

  ranges.forEach((range, index) => {
    const nextRange = transformProjectedLeafRange(
      range,
      operation,
      index,
      insertLeafIndex
    );
    const nextText = text.slice(nextRange.start, nextRange.end);

    range.leaf.setAttribute('data-slate-leaf-start', String(nextRange.start));
    range.leaf.setAttribute('data-slate-leaf-end', String(nextRange.end));
    if (range.string.textContent !== nextText) {
      markDOMTextSyncMutationTarget(range.string);
      range.string.textContent = nextText;
    }
  });

  recordDOMTextSyncProfile('success-projected');
  return true;
};

export const syncTextOperationsToDOM = (
  editor: Editor,
  operations: readonly Operation[]
) => {
  const synced = new Set<string>();
  const pathToElement = EDITOR_TO_PATH_TO_ELEMENT.get(editor);
  const textOperationCount = operations.filter(
    (operation) =>
      operation.type === 'insert_text' || operation.type === 'remove_text'
  ).length;
  const result = () => ({
    syncedTextOperationCount: operations.filter(
      (operation) =>
        (operation.type === 'insert_text' ||
          operation.type === 'remove_text') &&
        operation.path &&
        synced.has(pathKey(operation.path))
    ).length,
    textOperationCount,
  });

  if (textOperationCount > 0) {
    recordDOMTextSyncProfile('attempt');
  }

  if (IS_COMPOSING.get(editor)) {
    recordDOMTextSyncProfile('skip-composition');
    EDITOR_TO_SYNCED_TEXT_PATHS.set(editor, synced);
    return result();
  }

  if (!pathToElement) {
    recordDOMTextSyncProfile('skip-no-path-map');
    EDITOR_TO_SYNCED_TEXT_PATHS.set(editor, synced);
    return result();
  }

  for (const operation of operations) {
    if (operation.type !== 'insert_text' && operation.type !== 'remove_text') {
      continue;
    }

    const path = operation.path;

    if (!path) {
      recordDOMTextSyncProfile('skip-no-path');
      continue;
    }

    const element = pathToElement.get(pathKey(path));
    if (!element?.isConnected) {
      recordDOMTextSyncProfile('skip-no-element');
      continue;
    }

    const canUseDOMTextSync =
      element.getAttribute('data-slate-dom-sync') === 'true';
    const strings = element?.querySelectorAll('[data-slate-string="true"]');

    const text = withOperationRootChildren(editor, operation, () => {
      if (!Editor.hasPath(editor, path)) {
        return;
      }

      const [node] = editor.read((state) => state.nodes.get(path));

      return 'text' in node && typeof node.text === 'string' ? node.text : null;
    });

    if (text === undefined) {
      recordDOMTextSyncProfile('skip-missing-path');
      continue;
    }

    if (text === null) {
      recordDOMTextSyncProfile('skip-non-text');
      continue;
    }

    if (!canUseDOMTextSync || !element || strings?.length !== 1) {
      if (element.textContent?.replace(/\uFEFF/g, '') === text) {
        synced.add(pathKey(path));
        recordDOMTextSyncProfile('already-synced-dom-text');
      } else if (
        element.getAttribute('data-slate-projected-dom-sync') === 'true' &&
        syncProjectedTextOperationToDOM({
          element,
          operation,
          strings,
          text,
        })
      ) {
        synced.add(pathKey(path));
      } else {
        recordDOMTextSyncProfile('skip-disabled');
      }
      continue;
    }

    const stringElement = strings[0]!;

    if (text.length === 0) {
      markDOMTextSyncMutationTarget(stringElement);
      stringElement.textContent = '';
      recordDOMTextSyncProfile('skip-empty-text');
      continue;
    }

    const textNode = Array.from(stringElement.childNodes).find(
      (child) => child.nodeType === Node.TEXT_NODE
    );

    if (textNode) {
      if (textNode.nodeValue === text) {
        synced.add(pathKey(path));
        recordDOMTextSyncProfile('already-synced');
        continue;
      }
      markDOMTextSyncMutationTarget(textNode);
      textNode.nodeValue = text;
    } else {
      if (stringElement.textContent === text) {
        synced.add(pathKey(path));
        recordDOMTextSyncProfile('already-synced');
        continue;
      }
      markDOMTextSyncMutationTarget(stringElement);
      stringElement.textContent = text;
    }

    synced.add(pathKey(path));
    recordDOMTextSyncProfile('success');
  }

  EDITOR_TO_SYNCED_TEXT_PATHS.set(editor, synced);
  return result();
};

const bindSlateNodeElement = ({
  editor,
  node,
  providedPathKey,
  providedSlateNode,
  runtimeId,
}: {
  editor: Editor;
  node: Node;
  providedPathKey: string | null;
  providedSlateNode: SlateNode | null;
  runtimeId: RuntimeId;
}) => {
  const path =
    providedPathKey == null
      ? Editor.getPathByRuntimeId(editor, runtimeId)
      : parsePathKey(providedPathKey);

  if (!path || !(node instanceof HTMLElement)) {
    return null;
  }

  const slateNode = (providedSlateNode ??
    editor.read((state) => state.nodes.get(path))[0]) as SlateNode;
  const key = (
    (editor as DOMEditor).api as { dom: DOMEditor['dom'] }
  ).dom.findKey(slateNode);
  const keyToElement = EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap();

  if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
    EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
  }

  keyToElement.set(key, node);
  NODE_TO_ELEMENT.set(slateNode, node);
  NODE_TO_RUNTIME_ID.set(slateNode, runtimeId);
  ELEMENT_TO_NODE.set(node, slateNode);
  syncSlateElementPath({ editor, element: node, path, runtimeId });
  const cleanupRuntimeIdElement = bindRuntimeIdElement(editor, runtimeId, node);

  return () => {
    cleanupRuntimeIdElement();

    if (keyToElement.get(key) === node) {
      keyToElement.delete(key);
    }

    if (NODE_TO_ELEMENT.get(slateNode) === node) {
      NODE_TO_ELEMENT.delete(slateNode);

      if (NODE_TO_RUNTIME_ID.get(slateNode) === runtimeId) {
        NODE_TO_RUNTIME_ID.delete(slateNode);
      }
    }

    if (ELEMENT_TO_NODE.get(node) === slateNode) {
      ELEMENT_TO_NODE.delete(node);
    }

    const currentPath = ELEMENT_TO_PATH.get(node);
    if (currentPath) {
      const currentPathKey = pathKey(currentPath);
      const pathElementMap = getPathElementMap(editor);

      if (pathElementMap.get(currentPathKey) === node) {
        pathElementMap.delete(currentPathKey);
      }

      ELEMENT_TO_PATH.delete(node);
    }

    if (node.getAttribute('data-slate-runtime-id') === runtimeId) {
      node.removeAttribute('data-slate-path');
      node.removeAttribute('data-slate-runtime-id');
    }
  };
};

/**
 * Return a callback ref that binds a DOM node to a Slate node runtime.
 *
 * Use this from custom renderers or DOM-coverage shells that must keep
 * DOM-to-Slate translation accurate for a known runtime, node, or path.
 */
export const useSlateNodeRef = (
  runtimeId: RuntimeId | null,
  options: {
    path?: Path | null;
    slateNode?: SlateNode | null;
  } = {}
) => {
  const editor = useContext(EditorContext);
  const nodeRef = useRef<Node | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const providedPathKey = options.path == null ? null : pathKey(options.path);
  const providedSlateNode = options.slateNode ?? null;

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

      if (!editor || !runtimeId) {
        return;
      }

      cleanupRef.current = bindSlateNodeElement({
        editor,
        node: nextNode,
        providedPathKey,
        providedSlateNode,
        runtimeId,
      });
    },
    [cleanupBinding, editor, providedPathKey, providedSlateNode, runtimeId]
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
