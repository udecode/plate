import {
  type Descendant,
  NodeApi,
  PathApi,
  type Point,
  RangeApi,
  type RootKey,
  TextApi,
} from '../..';
import { readAuthoredView } from '../../core/authored-runtime';
import {
  isDOMElement,
  isDOMNode,
  isDOMText,
  normalizeDOMPoint,
} from '../../dom';
import { createDOMGeometryKernel, ELEMENT_TO_NODE } from '../../dom/internal';
import {
  resolveDOMLeafPoint,
  resolveDOMPointInRoot,
} from '../../dom/plugin/dom-editor';
import {
  getMountedDOMFragmentElements,
  readDOMFragmentTarget,
  readDOMFragmentParent,
} from '../../dom/plugin/dom-fragment-view';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY, readRootChildren } from '../root-key';
import {
  PliteViewBoundaryGraph,
  type PliteViewBoundaryGraphModel,
  type PliteViewBoundaryPoint,
} from '../view-boundary-graph';
import type { PliteViewBoundaryGraphNode } from '../view-boundary-graph-core';
import {
  createPliteViewSelection,
  isPliteViewSelectionCollapsed,
  type PliteViewSelection,
} from '../view-selection';
import {
  getContentRootOwnerFromTarget,
  isSameOwner as isSameContentRootOwner,
} from './content-root-owner-target';
import {
  type ContentRootOwner,
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
  readCaretBlock,
} from './content-root-owners';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';
import { toInternalRoot } from './runtime-editor-api';

type ProjectedDOMSelectionEndpoint = {
  affinity?: 'backward' | 'forward';
  fragmentId?: string;
  owner?: ContentRootOwner;
  point: Point;
  root: RootKey;
};

export const resolveViewBoundaryDOMPoint = (
  editor: ReactRuntimeEditor<any>,
  boundary: PliteViewBoundaryPoint,
  editorElement?: HTMLElement
) => {
  if (
    (boundary.point.root ?? MAIN_ROOT_KEY) !==
    (editor.read.view.root() ?? MAIN_ROOT_KEY)
  ) {
    return null;
  }
  if (!boundary.fragmentId) {
    return resolveDOMPointInRoot(
      editor,
      boundary.point,
      editorElement,
      boundary.affinity
    );
  }
  for (const element of getMountedDOMFragmentElements(
    editor,
    boundary.fragmentId
  )) {
    if (editorElement && !editorElement.contains(element)) continue;
    const hosts = element.matches('[data-editor-node="text"]')
      ? [element]
      : Array.from(
          element.querySelectorAll<HTMLElement>('[data-editor-node="text"]')
        );
    for (const host of hosts) {
      const path = getPliteNodePathFromDOMElement(host);
      if (!path || !PathApi.equals(path, boundary.point.path)) continue;
      const point = resolveDOMLeafPoint(
        host,
        boundary.point.offset,
        boundary.affinity
      );
      if (point) return point;
    }
  }
  return null;
};

/**
 * Struck text takes no native input, so the DOM caret for a caret inside it
 * waits just before the struck element, in the live text it docks to.
 */
export const resolveRetainedDockDOMPoint = (
  editor: ReactRuntimeEditor<any>,
  point: PliteViewBoundaryPoint
): [Node, number] | null => {
  const domPoint = resolveViewBoundaryDOMPoint(editor, point);
  if (!domPoint) return null;
  const element = isDOMElement(domPoint[0])
    ? domPoint[0]
    : domPoint[0].parentElement;
  const retained = element?.closest('[data-editor-retained]');
  const parent = retained?.parentNode;
  if (!retained || !parent) return domPoint;
  return [parent, Array.prototype.indexOf.call(parent.childNodes, retained)];
};

export const canUseNativeViewSelection = (
  editor: ReactRuntimeEditor<any>,
  selection: PliteViewSelection
) => {
  const parent = (readDOMFragmentParent(editor) ??
    editor) as ReactRuntimeEditor<any>;
  const runtime = getMountedEditableDOMRuntime(parent);
  const root = parent.read.view.root() ?? MAIN_ROOT_KEY;

  return (
    !!runtime &&
    !runtime.viewportRuntime &&
    !(
      isPliteViewSelectionCollapsed(selection) && selection.anchor.fragmentId
    ) &&
    selection.segments.parts.every(
      (part) =>
        part.root === root &&
        !part.owner &&
        part.nodes.every((node) => !!node.text)
    )
  );
};

export const resolveNativeViewSelectionDOMRange = (
  editor: ReactRuntimeEditor<any>,
  selection: PliteViewSelection,
  editorElement: HTMLElement
) => {
  if (!canUseNativeViewSelection(editor, selection)) return null;

  const anchor = resolveViewBoundaryDOMPoint(
    editor,
    selection.anchor,
    editorElement
  );
  const focus = resolveViewBoundaryDOMPoint(
    editor,
    selection.focus,
    editorElement
  );
  if (!anchor || !focus) return null;
  if (
    ![anchor[0], focus[0]].every(
      (node) =>
        editorElement.contains(node) &&
        getDOMEditorElementForNode(node) === editorElement
    )
  ) {
    return null;
  }

  const range = editorElement.ownerDocument.createRange();
  const [start, end] = selection.segments.backward
    ? [focus, anchor]
    : [anchor, focus];
  range.setStart(start[0], start[1]);
  range.setEnd(end[0], end[1]);
  return range;
};

const getDOMElementForNode = (node: globalThis.Node | null) =>
  isDOMElement(node) ? node : isDOMText(node) ? node.parentElement : null;

const getDOMEditorElementForNode = (
  node: globalThis.Node | null
): HTMLElement | null => {
  const element = getDOMElementForNode(node);
  const editorElement = element?.closest('[data-editor="true"]');

  return editorElement instanceof HTMLElement ? editorElement : null;
};

const getEditorFromDOMEditorElement = (
  editorElement: HTMLElement
): ReactRuntimeEditor | null => {
  const editor = ELEMENT_TO_NODE.get(editorElement);

  return editor &&
    typeof editor === 'object' &&
    'read' in editor &&
    'update' in editor
    ? (editor as ReactRuntimeEditor)
    : null;
};

const isKnownContentRootOwner = (
  owner: ContentRootOwner | null | undefined,
  owners: readonly ContentRootOwner[]
): owner is ContentRootOwner =>
  !!owner &&
  owners.some((candidate) => isSameContentRootOwner(owner, candidate));

const getDescendantEdgePoint = (
  nodes: readonly Descendant[],
  {
    edge,
    path = [],
  }: {
    edge: 'end' | 'start';
    path?: number[];
  }
): Point | null => {
  for (
    let index = edge === 'start' ? 0 : nodes.length - 1;
    index >= 0 && index < nodes.length;
    index += edge === 'start' ? 1 : -1
  ) {
    const node = nodes[index];
    const currentPath = path.concat(index);

    if (TextApi.isText(node)) {
      return {
        offset: edge === 'start' ? 0 : node.text.length,
        path: currentPath,
      };
    }

    if (NodeApi.isElement(node)) {
      const point = getDescendantEdgePoint(node.children, {
        edge,
        path: currentPath,
      });

      if (point) {
        return point;
      }
    }
  }

  return null;
};

const getRootEdgePoint = (
  editor: ReactRuntimeEditor,
  root: RootKey,
  { edge }: { edge: 'end' | 'start' }
): Point | null =>
  editor.read((state) => {
    const children = readRootChildren(state, root);
    const point = getDescendantEdgePoint(children, { edge });

    return point ? { ...point, root } : null;
  });

export const resolveProjectedDOMSelectionEndpoint = ({
  node,
  offset,
  owners,
}: {
  node: globalThis.Node | null;
  offset: number;
  owners: readonly ContentRootOwner[];
}): ProjectedDOMSelectionEndpoint | null => {
  const editorElement = getDOMEditorElementForNode(node);
  const parent = editorElement
    ? getEditorFromDOMEditorElement(editorElement)
    : null;
  const normalized = node ? normalizeDOMPoint([node, offset]) : null;
  const retainedTarget = normalized && readDOMFragmentTarget(normalized[0]);
  if (retainedTarget && normalized && node && editorElement && parent) {
    const element = getDOMElementForNode(normalized[0]);
    const host = element?.closest('[data-editor-node="text"]');
    const leaf = element?.closest('[data-editor-leaf]');
    const string = element?.closest(
      '[data-editor-string], [data-editor-zero-width]'
    );
    const path = host && getPliteNodePathFromDOMElement(host);
    if (path && leaf && string && retainedTarget.parent === parent) {
      const range = editorElement.ownerDocument.createRange();
      range.setStart(string, 0);
      range.setEnd(normalized[0], normalized[1]);
      const start = Number(leaf.getAttribute('data-editor-leaf-start') ?? 0);
      const local = string.hasAttribute('data-editor-zero-width')
        ? 0
        : range.toString().length;
      const { root } = retainedTarget;
      return {
        affinity:
          start + local === Number(leaf.getAttribute('data-editor-leaf-end'))
            ? ('backward' as const)
            : ('forward' as const),
        fragmentId: retainedTarget.target.id,
        point: {
          path,
          offset: start + local,
          ...(root === MAIN_ROOT_KEY ? {} : { root }),
        },
        root,
        owner:
          getContentRootOwnerFromTarget({ childRoot: root, target: node }) ??
          undefined,
      };
    }
  }
  if (retainedTarget) return null;
  const editor = parent;

  if (!editorElement || !editor || !node || !parent) {
    return null;
  }

  const range = editorElement.ownerDocument.createRange();

  try {
    range.setStart(node, offset);
    range.collapse(true);
  } catch {
    return null;
  }

  const pliteRange = editor.api.dom.resolveRange(range, {
    exactMatch: false,
  });

  if (!pliteRange || !RangeApi.isCollapsed(pliteRange)) {
    return null;
  }

  const root = toInternalRoot(editor.read((state) => state.view.root()));

  const owner = getContentRootOwnerFromTarget({
    childRoot: root,
    target: node,
  });
  const shellOwner =
    root === MAIN_ROOT_KEY
      ? owners.find(
          (candidate) =>
            candidate.ownerRoot === root &&
            (PathApi.equals(candidate.ownerPath, pliteRange.anchor.path) ||
              PathApi.isAncestor(candidate.ownerPath, pliteRange.anchor.path))
        )
      : null;

  if (shellOwner) {
    const point = getRootEdgePoint(parent, shellOwner.childRoot, {
      edge: pliteRange.anchor.offset === 0 ? 'start' : 'end',
    });

    if (point) {
      return {
        owner: shellOwner,
        point,
        root: shellOwner.childRoot,
      };
    }
  }

  const leaf = getDOMElementForNode(node)?.closest('[data-editor-leaf]');
  const start = leaf?.getAttribute('data-editor-leaf-start');
  const end = leaf?.getAttribute('data-editor-leaf-end');
  const affinity =
    end !== null &&
    end !== undefined &&
    Number(end) === pliteRange.anchor.offset &&
    (start !== end ||
      leaf?.nextElementSibling?.hasAttribute('data-editor-retained'))
      ? ('backward' as const)
      : ('forward' as const);
  return {
    affinity,
    ...(owner ? { owner } : {}),
    point: {
      ...pliteRange.anchor,
      ...(root === MAIN_ROOT_KEY ? {} : { root }),
    },
    root,
  };
};

export const caretTouchesRetained = (
  graph: PliteViewBoundaryGraphModel,
  point: Point
) => {
  const before = PliteViewBoundaryGraph.resolvePointNode(graph, {
    affinity: 'backward',
    point,
  });
  const after = PliteViewBoundaryGraph.resolvePointNode(graph, {
    affinity: 'forward',
    point,
  });
  return (
    (!!before?.text &&
      point.offset === before.text.end &&
      !!PliteViewBoundaryGraph.nextNode(graph, before)?.fragment) ||
    (!!after?.text &&
      point.offset === after.text.start &&
      !!PliteViewBoundaryGraph.previousNode(graph, after)?.fragment)
  );
};

/**
 * The live edge of the retained (struck) run at `point`: the nearer one, or
 * the one `side` names.
 */
export const retainedCaretEdge = (
  graph: PliteViewBoundaryGraphModel,
  point: PliteViewBoundaryPoint,
  side?: 'after' | 'before'
): PliteViewBoundaryPoint | null => {
  const node = PliteViewBoundaryGraph.resolvePointNode(graph, point);
  if (!node?.fragment) return null;
  const local = point.point.offset - (node.text?.start ?? 0);
  const length = (node.text?.end ?? 0) - (node.text?.start ?? 0);
  const live = (direction: 'next' | 'previous') => {
    let current: PliteViewBoundaryGraphNode | null = node;
    while (current?.fragment) {
      current =
        direction === 'next'
          ? PliteViewBoundaryGraph.nextNode(graph, current)
          : PliteViewBoundaryGraph.previousNode(graph, current);
    }
    return current;
  };
  const edge = (at: 'after' | 'before') => {
    const target = live(at === 'after' ? 'next' : 'previous');
    if (!target) return null;
    return {
      affinity: at === 'after' ? ('forward' as const) : ('backward' as const),
      ...(target.owner ? { owner: target.owner } : {}),
      point: {
        path: target.path,
        offset:
          at === 'after' ? (target.text?.start ?? 0) : (target.text?.end ?? 0),
        ...(target.root === MAIN_ROOT_KEY ? {} : { root: target.root }),
      },
    };
  };
  if (side) return edge(side);
  return local * 2 >= length
    ? (edge('after') ?? edge('before'))
    : (edge('before') ?? edge('after'));
};

/**
 * A caret at the outer end of a retained run sits where live text continues,
 * so it resolves to that live edge; only interior points stay in the run.
 */
export const retainedCaretBoundary = (
  graph: PliteViewBoundaryGraphModel,
  point: PliteViewBoundaryPoint
) => {
  const node = PliteViewBoundaryGraph.resolvePointNode(graph, point);
  if (!node?.fragment || !node.text) return null;
  if (
    point.point.offset === node.text.start &&
    !PliteViewBoundaryGraph.previousNode(graph, node)?.fragment
  ) {
    return retainedCaretEdge(graph, point, 'before');
  }
  if (
    point.point.offset === node.text.end &&
    !PliteViewBoundaryGraph.nextNode(graph, node)?.fragment
  ) {
    return retainedCaretEdge(graph, point, 'after');
  }
  return null;
};

export const resolveRetainedDropPoint = ({
  editor,
  root,
  target,
  x,
  y,
}: {
  editor: ReactRuntimeEditor;
  root: HTMLElement;
  target: EventTarget | null;
  x: number;
  y: number;
}): Point | null => {
  if (!isDOMNode(target) || !readDOMFragmentTarget(target)) return null;
  const element = isDOMElement(target) ? target : target.parentElement;
  const retained = element?.closest<HTMLElement>('[data-editor-retained]');
  if (!retained) return null;
  const domPoint = createDOMGeometryKernel({
    root,
    target: retained,
  }).pointAtCoordinates({ x, y });
  const owners = findContentRootOwners(editor);
  const endpoint = domPoint
    ? resolveProjectedDOMSelectionEndpoint({
        node: domPoint.point[0],
        offset: domPoint.point[1],
        owners,
      })
    : null;
  if (!endpoint?.fragmentId) return null;
  return (
    retainedCaretEdge(createContentRootViewBoundaryGraph(editor, owners), {
      affinity: endpoint.affinity,
      fragmentId: endpoint.fragmentId,
      point: endpoint.point,
    })?.point ?? null
  );
};

export const resolveProjectedDOMSelection = ({
  domSelection,
  editor,
  editorElement,
}: {
  domSelection: globalThis.Selection;
  editor: ReactRuntimeEditor<any>;
  editorElement: HTMLElement;
}) => {
  const leaf = getDOMElementForNode(domSelection.anchorNode)?.closest(
    '[data-editor-leaf]'
  );
  const possibleDock =
    !!leaf &&
    (leaf.previousElementSibling?.hasAttribute('data-editor-retained') ||
      leaf.nextElementSibling?.hasAttribute('data-editor-retained')) &&
    (domSelection.anchorOffset === 0 ||
      domSelection.anchorOffset ===
        domSelection.anchorNode?.textContent?.length);
  if (
    readAuthoredView(editor)?.projection !== 'markup' &&
    domSelection.isCollapsed &&
    !possibleDock &&
    (!domSelection.anchorNode ||
      !readDOMFragmentTarget(domSelection.anchorNode))
  ) {
    return null;
  }

  const anchorEditorElement = getDOMEditorElementForNode(
    domSelection.anchorNode
  );
  const focusEditorElement = getDOMEditorElementForNode(domSelection.focusNode);

  if (
    !anchorEditorElement ||
    !focusEditorElement ||
    !editorElement.contains(anchorEditorElement) ||
    !editorElement.contains(focusEditorElement)
  ) {
    return null;
  }

  const owners = findContentRootOwners(editor);
  const anchor = resolveProjectedDOMSelectionEndpoint({
    node: domSelection.anchorNode,
    offset: domSelection.anchorOffset,
    owners,
  });
  const focus = resolveProjectedDOMSelectionEndpoint({
    node: domSelection.focusNode,
    offset: domSelection.focusOffset,
    owners,
  });

  if (!anchor || !focus) {
    return null;
  }
  const sameOwner =
    anchor.root === focus.root &&
    isSameContentRootOwner(anchor.owner, focus.owner);
  if (
    sameOwner &&
    !anchor.fragmentId &&
    !focus.fragmentId &&
    readAuthoredView(editor)?.projection !== 'markup'
  ) {
    return null;
  }

  const anchorOwner = anchor.owner
    ? owners.find((owner) => isSameContentRootOwner(owner, anchor.owner))
    : null;
  const focusOwner = focus.owner
    ? owners.find((owner) => isSameContentRootOwner(owner, focus.owner))
    : null;

  if (
    (anchor.root !== (editor.read.view.root() ?? MAIN_ROOT_KEY) &&
      !isKnownContentRootOwner(anchorOwner, owners)) ||
    (focus.root !== (editor.read.view.root() ?? MAIN_ROOT_KEY) &&
      !isKnownContentRootOwner(focusOwner, owners))
  ) {
    return null;
  }

  // A collapsed caret resolves against its own block: an inline struck run
  // always has its block's live text on both sides.
  const block =
    domSelection.isCollapsed && !anchor.owner && domSelection.anchorNode
      ? readCaretBlock(editor, owners, {
          fragment: anchor.fragmentId
            ? readDOMFragmentTarget(domSelection.anchorNode)?.target
            : null,
          point: anchor.point,
        })
      : null;
  const graph = createContentRootViewBoundaryGraph(
    editor,
    owners,
    block ?? undefined
  );
  if (domSelection.isCollapsed && anchor.fragmentId) {
    const edge = retainedCaretBoundary(graph, {
      affinity: anchor.affinity,
      fragmentId: anchor.fragmentId,
      ...(anchorOwner ? { owner: anchorOwner } : {}),
      point: anchor.point,
    });
    if (edge) {
      return createPliteViewSelection(graph, { anchor: edge, focus: edge });
    }
  }
  const selection = createPliteViewSelection(graph, {
    anchor: {
      affinity: anchor.affinity,
      ...(anchor.fragmentId ? { fragmentId: anchor.fragmentId } : {}),
      ...(anchorOwner ? { owner: anchorOwner } : {}),
      point: anchor.point,
    },
    focus: {
      affinity: focus.affinity,
      ...(focus.fragmentId ? { fragmentId: focus.fragmentId } : {}),
      ...(focusOwner ? { owner: focusOwner } : {}),
      point: focus.point,
    },
  });
  const docked =
    domSelection.isCollapsed &&
    PliteViewBoundaryGraph.resolvePointNode(graph, selection.focus)?.key !==
      PliteViewBoundaryGraph.resolvePointNode(graph, {
        ...selection.focus,
        affinity:
          selection.focus.affinity === 'forward' ? 'backward' : 'forward',
      })?.key;
  return readAuthoredView(editor)?.projection !== 'markup' &&
    !docked &&
    sameOwner &&
    !selection.segments.parts.some((segment) => segment.fragment)
    ? null
    : selection;
};
