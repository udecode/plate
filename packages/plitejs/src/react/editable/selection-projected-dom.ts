import {
  type Descendant,
  NodeApi,
  PathApi,
  type Point,
  RangeApi,
  type RootKey,
  TextApi,
} from '../..';
import {
  readAuthoredFragmentView,
  readAuthoredView,
} from '../../core/authored-runtime';
import { isDOMElement, isDOMText } from '../../dom';
import { ELEMENT_TO_NODE } from '../../dom/internal';
import { resolveDOMPointInRoot } from '../../dom/plugin/dom-editor';
import {
  getMountedDOMFragmentEditors,
  readDOMFragmentEditor,
} from '../../dom/plugin/dom-fragment-view';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY, readRootChildren } from '../root-key';
import {
  PliteViewBoundaryGraph,
  type PliteViewBoundaryPoint,
} from '../view-boundary-graph';
import { createPliteViewSelection } from '../view-selection';
import {
  getContentRootOwnerFromTarget,
  isSameOwner as isSameContentRootOwner,
} from './content-root-owner-target';
import {
  type ContentRootOwner,
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
} from './content-root-owners';
import { getEditorRuntime, toInternalRoot } from './runtime-editor-api';

type ProjectedDOMSelectionEndpoint = {
  affinity?: 'backward' | 'forward';
  fragmentId?: string;
  owner?: ContentRootOwner;
  point: Point;
  root: RootKey;
};

export const resolveViewBoundaryDOMPoint = (
  editor: ReactRuntimeEditor<any>,
  boundary: PliteViewBoundaryPoint
) => {
  if (
    (boundary.point.root ?? MAIN_ROOT_KEY) !==
    (editor.read.view.root() ?? MAIN_ROOT_KEY)
  ) {
    return null;
  }
  for (const view of boundary.fragmentId
    ? getMountedDOMFragmentEditors(editor, boundary.fragmentId)
    : [editor]) {
    const point = resolveDOMPointInRoot(
      view,
      boundary.point,
      undefined,
      boundary.affinity
    );
    if (point) return point;
  }
  return null;
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
  const retained = node && readDOMFragmentEditor(node);
  const fragment = retained && readAuthoredFragmentView(retained);
  const editor = retained ?? parent;

  if (
    !editorElement ||
    !editor ||
    !node ||
    !parent ||
    (fragment && getEditorRuntime(fragment.parent) !== getEditorRuntime(parent))
  ) {
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
    !fragment && root === MAIN_ROOT_KEY
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
    ...(fragment ? { fragmentId: fragment.fragment.id } : {}),
    ...(owner ? { owner } : {}),
    point: {
      ...pliteRange.anchor,
      ...(root === MAIN_ROOT_KEY ? {} : { root }),
    },
    root,
  };
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
    domSelection.isCollapsed &&
    !possibleDock &&
    (!domSelection.anchorNode ||
      !readDOMFragmentEditor(domSelection.anchorNode))
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

  const graph = createContentRootViewBoundaryGraph(editor, owners);
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
  return !docked &&
    sameOwner &&
    !selection.segments.parts.some((segment) => segment.fragment)
    ? null
    : selection;
};
