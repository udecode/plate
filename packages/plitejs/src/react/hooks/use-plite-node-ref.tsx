import { useCallback, useContext, useRef, useSyncExternalStore } from 'react';

import type {
  Descendant,
  EditorCommitChanged,
  NodeKey,
  Path,
  Value,
} from '../..';
import { NodeApi } from '../..';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  getOrCreateDOMNodeKey,
  findDOMRootRuntime,
  findEditorDOMRootRuntime,
  IS_COMPOSING,
  markDOMSyncMutationTarget,
  NODE_TO_ELEMENT,
  NODE_TO_RUNTIME_ID,
} from '../../dom/internal';
import {
  bindDOMFragmentElement,
  bindLazyDOMFragmentElement,
} from '../../dom/plugin/dom-fragment-view';
import {
  EDITOR_TO_RUNTIME_ID_TO_KEY,
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS,
  ELEMENT_TO_EDITOR,
} from '../../dom/utils/weak-maps';
import { AuthoredFragmentRootsContext } from '../authored-fragment-context';
import { EditorContext } from '../context';
import {
  type Editor,
  getNodeKey as editorGetNodeKey,
  getPathByNodeKey as editorGetPathByNodeKey,
  hasPath as editorHasPath,
  getEditorRuntime,
  getNodeKeyDOMValue,
} from '../editable/runtime-editor-api';
import { recordPliteReactRender } from '../render-profiler';
import { EditableDOMRuntimeContext } from './use-claim-editable-dom-commit';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

const EDITOR_TO_PATH_TO_ELEMENT = new WeakMap<
  Editor,
  Map<string, Set<HTMLElement>>
>();
const EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS = new WeakMap<
  object,
  Map<NodeKey, Set<HTMLElement>>
>();
const EDITOR_TO_SYNCED_TEXT_PATHS = new WeakMap<object, Set<string>>();
const EDITOR_TO_TEXT_RENDER_REVISIONS = new WeakMap<
  object,
  Map<NodeKey, number>
>();
const ELEMENT_TO_PATH = new WeakMap<HTMLElement, Path>();
const subscribeToHydration = () => () => {};

const pathKey = (path: readonly number[]) => path.join('.');

const getMountedFlowElements = (
  map: Map<NodeKey, Set<HTMLElement>> | undefined,
  nodeKey: NodeKey
) => {
  const elements = map?.get(nodeKey);
  if (!elements) return [];
  for (const element of elements) {
    if (!element.isConnected) elements.delete(element);
  }
  if (elements.size === 0) map?.delete(nodeKey);
  return [...elements];
};

const recordDOMTextSyncProfile = (id: string) => {
  recordPliteReactRender({
    id,
    kind: 'dom-text-sync',
  });
};

const parsePathKey = (key: string): Path =>
  key === '' ? [] : key.split('.').map((part) => Number.parseInt(part, 10));

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
  const owner = getEditorRuntime(editor);
  const existing = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(owner);

  if (existing) {
    return existing;
  }

  const next = new Map<NodeKey, Set<HTMLElement>>();
  EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.set(owner, next);
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
  const attributePath = path.join(',');
  if (element.getAttribute('data-editor-path') !== attributePath) {
    markDOMSyncMutationTarget(element, 'attributes', 'data-editor-path');
    element.setAttribute('data-editor-path', attributePath);
  }
  if (element.getAttribute('data-editor-node-key') !== nodeKey) {
    markDOMSyncMutationTarget(element, 'attributes', 'data-editor-node-key');
    element.setAttribute('data-editor-node-key', nodeKey);
  }
  bindPathElement(editor, path, element);
};

export const syncPliteNodePathBindingsToDOM = <V extends Value>(
  editor: Editor<V>,
  changed?: EditorCommitChanged
) => {
  const runtimeElementMap = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(
    getEditorRuntime(editor)
  );

  if (!runtimeElementMap) {
    return;
  }

  for (const [nodeKey, allElements] of runtimeElementMap) {
    const elements = [...allElements].filter((element) => {
      if (ELEMENT_TO_EDITOR.get(element) !== editor) return false;
      if (!element.isConnected) {
        allElements.delete(element);
        return false;
      }
      return true;
    });
    if (allElements.size === 0) runtimeElementMap.delete(nodeKey);
    if (
      elements.length === 0 ||
      (changed &&
        !changed.hasNodeKey(nodeKey, 'path') &&
        !changed.hasNodeKey(nodeKey, 'presence'))
    ) {
      continue;
    }
    const path = editorGetPathByNodeKey(editor, nodeKey);

    for (const element of elements) {
      if (!path) {
        const previousPath = ELEMENT_TO_PATH.get(element);

        if (previousPath) {
          unbindPathElement(editor, previousPath, element);
        }

        ELEMENT_TO_PATH.delete(element);
        markDOMSyncMutationTarget(element, 'attributes', 'data-editor-path');
        element.removeAttribute('data-editor-path');
        continue;
      }

      syncPliteElementPath({ editor, element, path, nodeKey });
    }
  }
};

export const getPliteNodeElementByPath = (
  editor: Editor,
  path: readonly number[],
  root = findEditorDOMRootRuntime(editor)?.rootRef.current ?? null
) => {
  const nodeKey = editorGetNodeKey(editor, path);
  const flowElements = nodeKey
    ? getMountedFlowElements(
        EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS.get(getEditorRuntime(editor)),
        nodeKey
      )
    : [];
  const flowElement = root
    ? flowElements.find(
        (element) => element.closest('[data-editor="true"]') === root
      )
    : flowElements.length === 1
      ? flowElements[0]
      : null;
  if (flowElement) return flowElement;

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
      element.getAttribute('data-editor-path') === path.join(',')
    ) {
      if (root && element.closest('[data-editor="true"]') !== root) {
        continue;
      }
      if (!root && result && result !== element) return null;
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
  EDITOR_TO_SYNCED_TEXT_PATHS.get(getEditorRuntime(editor))?.has(
    pathKey(path)
  ) ?? false;

export const getDOMTextRenderRevision = (
  editor: Editor,
  nodeKeys: readonly NodeKey[]
) => {
  const revisions = EDITOR_TO_TEXT_RENDER_REVISIONS.get(
    getEditorRuntime(editor)
  );

  return nodeKeys.reduce(
    (revision, nodeKey) => revision + (revisions?.get(nodeKey) ?? 0),
    0
  );
};

const bumpDOMTextRenderRevision = (editor: Editor, nodeKey: NodeKey) => {
  const owner = getEditorRuntime(editor);
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

  return path.every(Number.isFinite) ? path : null;
};

export const getPliteNodePathFromDOMElement = (
  element: Element
): Path | null =>
  element instanceof HTMLElement
    ? (ELEMENT_TO_PATH.get(element) ??
      parseDOMPath(element.getAttribute('data-editor-path')))
    : null;

const syncChangedTextToElement = ({
  element,
  nextText,
}: {
  element: HTMLElement;
  nextText: string;
}) => {
  const canUseDOMTextSync =
    element.getAttribute('data-editor-dom-sync') === 'true';
  const strings = element.querySelectorAll('[data-editor-string="true"]');
  const isRetainedTextFlow =
    element.getAttribute('data-editor-text-flow-host') === 'true';

  if (canUseDOMTextSync && isRetainedTextFlow) {
    if (nextText.length === 0) {
      recordDOMTextSyncProfile('skip-empty-retained-flow');
      return false;
    }
    recordDOMTextSyncProfile('retained-flow-owner');
    return true;
  }

  if (
    canUseDOMTextSync &&
    strings.length === 1 &&
    element.textContent?.replace(/\uFEFF/g, '') === nextText
  ) {
    claimCanonicalStringDOM(strings[0]);
    recordDOMTextSyncProfile('already-synced-custom-shell');
    return true;
  }

  if (!canUseDOMTextSync || strings.length !== 1) {
    recordDOMTextSyncProfile('skip-disabled');
    return false;
  }

  const stringElement = strings[0];

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
      (element.getAttribute('data-editor-node-key') === nodeKey ||
        element.getAttribute('data-editor-text-flow-host') === 'true')
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
  if (!editorHasPath(editor, path)) return undefined;

  const entry = editor.read((state) => state.nodes.get(path));

  if (!entry) return null;

  const [node] = entry;

  return 'text' in node && typeof node.text === 'string' ? node.text : null;
};

export const syncChangedTextToDOM = <V extends Value>(
  editor: Editor<V>,
  changedTextNodeKeys: readonly NodeKey[]
) => {
  const owner = getEditorRuntime(editor);
  const synced = new Set<string>();
  const invalidatedNodeKeys = new Set<NodeKey>();
  let requiresGlobalRender = false;
  const runtimeElementMap = EDITOR_TO_RUNTIME_ID_TO_ELEMENTS.get(owner);
  const flowElementMap = EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS.get(owner);
  const result = () => ({
    changedTextCount: changedTextNodeKeys.length,
    invalidatedNodeKeys: [...invalidatedNodeKeys],
    requiresGlobalRender,
    syncedTextCount: synced.size,
  });
  const publishSyncedPaths = () => {
    EDITOR_TO_SYNCED_TEXT_PATHS.set(owner, synced);
  };

  if (changedTextNodeKeys.length > 0) {
    recordDOMTextSyncProfile('attempt');
  }

  if (!runtimeElementMap && !flowElementMap) {
    recordDOMTextSyncProfile('skip-no-runtime-map');
    publishSyncedPaths();
    return result();
  }

  for (const nodeKey of changedTextNodeKeys) {
    const path = editorGetPathByNodeKey(editor, nodeKey);

    if (!path) {
      recordDOMTextSyncProfile('skip-no-path');
      continue;
    }

    const key = pathKey(path);
    const elements = [
      ...new Set([
        ...getMountedFlowElements(flowElementMap, nodeKey),
        ...(runtimeElementMap
          ? getMappedTextElements(runtimeElementMap, nodeKey)
          : []),
      ]),
    ];

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

    let didSyncEveryElement = true;
    let requiresRemount = false;
    for (const element of elements) {
      const runtime = findDOMRootRuntime(element);
      if (runtime ? runtime.isComposing() : IS_COMPOSING.get(editor)) {
        recordDOMTextSyncProfile('skip-composition');
        requiresGlobalRender = true;
        requiresRemount = true;
        didSyncEveryElement = false;
        continue;
      }
      const canUseDOMTextSync =
        element.getAttribute('data-editor-dom-sync') === 'true';
      if (
        !syncChangedTextToElement({
          element,
          nextText: text,
        })
      ) {
        didSyncEveryElement = false;
        requiresRemount ||= canUseDOMTextSync;
      }
    }

    if (didSyncEveryElement) {
      synced.add(key);
    } else {
      if (requiresRemount) {
        bumpDOMTextRenderRevision(editor, nodeKey);
      }
      invalidatedNodeKeys.add(nodeKey);
    }
  }

  publishSyncedPaths();
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

  if (!path || node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }
  const element = node as HTMLElement;

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

  keyToElement.set(key, element);
  NODE_TO_ELEMENT.set(pliteNode, element);
  NODE_TO_RUNTIME_ID.set(pliteNode, nodeKey);
  ELEMENT_TO_NODE.set(element, pliteNode);
  ELEMENT_TO_EDITOR.set(element, editor);
  syncPliteElementPath({ editor, element, path, nodeKey });
  const cleanupNodeKeyElement = bindNodeKeyElement(editor, nodeKey, element);

  return () => {
    cleanupNodeKeyElement();

    if (keyToElement.get(key) === element) {
      keyToElement.delete(key);
    }

    if (NODE_TO_ELEMENT.get(pliteNode) === element) {
      NODE_TO_ELEMENT.delete(pliteNode);

      if (NODE_TO_RUNTIME_ID.get(pliteNode) === nodeKey) {
        NODE_TO_RUNTIME_ID.delete(pliteNode);
      }
    }

    if (ELEMENT_TO_NODE.get(element) === pliteNode) {
      ELEMENT_TO_NODE.delete(element);
    }
    if (ELEMENT_TO_EDITOR.get(element) === editor) {
      ELEMENT_TO_EDITOR.delete(element);
    }

    const currentPath = ELEMENT_TO_PATH.get(element);
    if (currentPath) {
      unbindPathElement(editor, currentPath, element);

      ELEMENT_TO_PATH.delete(element);
    }

    if (element.getAttribute('data-editor-node-key') === nodeKey) {
      markDOMSyncMutationTarget(element, 'attributes', 'data-editor-path');
      element.removeAttribute('data-editor-path');
      markDOMSyncMutationTarget(element, 'attributes', 'data-editor-node-key');
      element.removeAttribute('data-editor-node-key');
    }
  };
};

export const createPliteNodeFlowRootBinding = ({
  editor,
  node,
}: {
  editor: Editor;
  node: HTMLElement;
}) => {
  const keyToElement = EDITOR_TO_KEY_TO_ELEMENT.get(editor) ?? new WeakMap();
  if (!EDITOR_TO_KEY_TO_ELEMENT.has(editor)) {
    EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
  }
  const owner = getEditorRuntime(editor);
  const flowElements =
    EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS.get(owner) ??
    new Map<NodeKey, Set<HTMLElement>>();

  if (!EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS.has(owner)) {
    EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS.set(owner, flowElements);
  }

  const bind = (nodeKey: NodeKey, pliteNode: Descendant) => {
    const key = getOrCreateDOMNodeKey(editor, nodeKey, pliteNode);
    keyToElement.set(key, node);
    const elements = flowElements.get(nodeKey) ?? new Set<HTMLElement>();
    elements.add(node);
    flowElements.set(nodeKey, elements);
    NODE_TO_ELEMENT.set(pliteNode, node);
    NODE_TO_RUNTIME_ID.set(pliteNode, nodeKey);
  };

  return {
    bind,
    bindAll(
      entries: ReadonlyArray<
        Readonly<{
          node: Descendant;
          nodeKey: NodeKey;
        }>
      >
    ) {
      for (const { node: pliteNode, nodeKey } of entries) {
        bind(nodeKey, pliteNode);
      }
    },
    node,
    release(nodeKey: NodeKey, pliteNode: Descendant) {
      const key = EDITOR_TO_RUNTIME_ID_TO_KEY.get(editor)?.get(nodeKey);
      if (key && keyToElement.get(key) === node) {
        keyToElement.delete(key);
      }
      const elements = flowElements.get(nodeKey);
      elements?.delete(node);
      if (elements?.size === 0) flowElements.delete(nodeKey);
      if (NODE_TO_ELEMENT.get(pliteNode) === node) {
        NODE_TO_ELEMENT.delete(pliteNode);
        if (NODE_TO_RUNTIME_ID.get(pliteNode) === nodeKey) {
          NODE_TO_RUNTIME_ID.delete(pliteNode);
        }
      }
    },
  };
};

export const isPliteNodeFlowRootBound = (
  editor: Editor,
  nodeKey: NodeKey,
  root?: HTMLElement | null
) =>
  getMountedFlowElements(
    EDITOR_TO_FLOW_RUNTIME_ID_TO_ELEMENTS.get(getEditorRuntime(editor)),
    nodeKey
  ).some(
    (element) =>
      root === undefined ||
      (!!root && element.closest('[data-editor="true"]') === root)
  );

/**
 * Return a callback ref that binds a DOM node to a Plite node runtime.
 *
 * Use this from custom renderers or DOM-coverage shells that must keep
 * DOM-to-Plite translation accurate for a known runtime, node, or path.
 */
const usePliteNodeRefBinding = (
  editor: Editor | null,
  nodeKey: NodeKey | null,
  options: {
    fragmentParent?: Editor;
    fragmentRoot?: boolean;
    path?: Path | null;
    pliteNode?: Descendant | null;
    readOnlyFragmentRoot?: boolean;
  } = {}
) => {
  const editableRuntime = useContext(EditableDOMRuntimeContext);
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

      const detachFragment =
        options.fragmentRoot && nextNode instanceof HTMLElement
          ? bindDOMFragmentElement(editor, nextNode, {
              parent: options.fragmentParent,
              readOnly: options.readOnlyFragmentRoot,
            })
          : undefined;
      const detachNode = bindPliteNodeElement({
        editor,
        node: nextNode,
        providedPathKey,
        providedPliteNode,
        nodeKey,
      });
      cleanupRef.current = () => {
        detachNode?.();
        detachFragment?.();
      };
      if (detachNode) {
        editableRuntime?.requestSelectionExportAfterDOMCommit();
      }
    },
    [
      cleanupBinding,
      editableRuntime,
      editor,
      options.fragmentParent,
      options.fragmentRoot,
      options.readOnlyFragmentRoot,
      providedPathKey,
      providedPliteNode,
      nodeKey,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    bindNode(nodeRef.current);

    return cleanupBinding;
  }, [bindNode, cleanupBinding]);

  useIsomorphicLayoutEffect(() => {
    const element = nodeRef.current;

    if (!editor || !nodeKey || !(element instanceof HTMLElement)) {
      return;
    }
    editableRuntime?.externalText.assertNativeProjection(nodeKey);
    const livePath = editorGetPathByNodeKey(editor, nodeKey);

    if (
      livePath &&
      element.getAttribute('data-editor-path') !== livePath.join(',')
    ) {
      syncPliteElementPath({ editor, element, path: livePath, nodeKey });
    }
  });

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

export const usePliteFragmentNodeRef = (
  editor: Editor,
  parent: Editor,
  nodeKey: NodeKey | null,
  options: {
    path?: Path | null;
    pliteNode?: Descendant | null;
    readOnly?: boolean;
  } = {}
) =>
  usePliteNodeRefBinding(editor, nodeKey, {
    fragmentParent: parent,
    fragmentRoot: true,
    path: options.path,
    pliteNode: options.pliteNode,
    readOnlyFragmentRoot: options.readOnly ?? true,
  });

export const usePliteLazyFragmentNodeRef = (
  parent: Editor,
  fragment: { authorId: string; changeId: string; id: string; kind: string },
  materialize: () => {
    editor: Editor;
    nodeKey: NodeKey;
    path: Path;
    pliteNode: Descendant;
    release: () => void;
  },
  { readOnly = true }: { readOnly?: boolean } = {}
) => {
  const editableRuntime = useContext(EditableDOMRuntimeContext);
  const nodeRef = useRef<Node | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const cleanupBinding = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);
  const bindNode = useCallback(
    (nextNode: Node | null) => {
      cleanupBinding();
      if (!(nextNode instanceof HTMLElement)) return;

      cleanupRef.current = bindLazyDOMFragmentElement(nextNode, {
        authorId: fragment.authorId,
        changeId: fragment.changeId,
        fragmentId: fragment.id,
        fragmentKind: fragment.kind,
        parent,
        readOnly,
        materialize: () => {
          const mounted = materialize();
          const detachFragment = bindDOMFragmentElement(
            mounted.editor,
            nextNode,
            { parent, readOnly }
          );
          const detachNode = bindPliteNodeElement({
            editor: mounted.editor,
            node: nextNode,
            nodeKey: mounted.nodeKey,
            providedPathKey: pathKey(mounted.path),
            providedPliteNode: mounted.pliteNode,
          });

          if (detachNode) {
            editableRuntime?.requestSelectionExportAfterDOMCommit();
          }

          return {
            editor: mounted.editor,
            dispose: () => {
              detachNode?.();
              detachFragment();
              mounted.release();
            },
          };
        },
      });
    },
    [
      cleanupBinding,
      editableRuntime,
      fragment.authorId,
      fragment.id,
      fragment.kind,
      fragment.changeId,
      materialize,
      parent,
      readOnly,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    bindNode(nodeRef.current);

    return cleanupBinding;
  }, [bindNode, cleanupBinding]);

  return useCallback(
    (nextNode: Node | null) => {
      if (nodeRef.current === nextNode) return;
      nodeRef.current = nextNode;
      bindNode(nextNode);
    },
    [bindNode]
  );
};

export const usePliteNodeRef = (
  nodeKey: NodeKey | null,
  options: {
    path?: Path | null;
    pliteNode?: Descendant | null;
  } = {}
) => {
  const editor = useContext(EditorContext);
  const fragment = useContext(AuthoredFragmentRootsContext);

  return usePliteNodeRefBinding(editor, nodeKey, {
    fragmentParent: fragment?.parent,
    fragmentRoot: nodeKey !== null && (fragment?.roots.has(nodeKey) ?? false),
    path: options.path,
    pliteNode: options.pliteNode,
    readOnlyFragmentRoot:
      nodeKey !== null && (fragment?.roots.get(nodeKey) ?? false),
  });
};

/**
 * Publish hydration-safe local tokens only until React mounts.
 *
 * @internal
 */
export const usePliteNodeKeyHydrated = () =>
  useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

export const usePliteNodeKeyDOMValue = (nodeKey: NodeKey | null) => {
  const isMounted = usePliteNodeKeyHydrated();

  if (!nodeKey) return undefined;

  return isMounted ? nodeKey : getNodeKeyDOMValue(nodeKey);
};
