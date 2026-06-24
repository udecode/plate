import {
  type Descendant,
  NodeApi,
  PathApi,
  type Point,
  RangeApi,
  type RootKey,
  TextApi,
} from '@platejs/plite';
import { isDOMElement, isDOMText } from '@platejs/plite-dom';
import { ELEMENT_TO_NODE } from '@platejs/plite-dom/internal';

import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import { createPliteViewSelection } from '../view-selection';

import {
  type ContentRootOwner,
  createContentRootProjectionGraph,
  findContentRootOwners,
} from './content-root-navigation';
import {
  getContentRootOwnerFromTarget,
  isSameOwner as isSameContentRootOwner,
} from './content-root-owner-target';

type ProjectedDOMSelectionEndpoint = {
  owner?: ContentRootOwner;
  point: Point;
  root: RootKey;
};

const getDOMElementForNode = (node: globalThis.Node | null) =>
  isDOMElement(node) ? node : isDOMText(node) ? node.parentElement : null;

const getDOMEditorElementForNode = (
  node: globalThis.Node | null
): HTMLElement | null => {
  const element = getDOMElementForNode(node);
  const editorElement = element?.closest('[data-plite-editor="true"]');

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
  const orderedEntries =
    edge === 'start'
      ? Array.from(nodes.entries())
      : Array.from(nodes.entries()).reverse();

  for (const [index, node] of orderedEntries) {
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
    const children = state.value.root(
      root === MAIN_ROOT_KEY ? undefined : root
    );
    const point = getDescendantEdgePoint(children, { edge });

    return point ? { ...point, root } : null;
  });

const resolveProjectedDOMSelectionEndpoint = ({
  node,
  offset,
  owners,
}: {
  node: globalThis.Node | null;
  offset: number;
  owners: readonly ContentRootOwner[];
}): ProjectedDOMSelectionEndpoint | null => {
  const editorElement = getDOMEditorElementForNode(node);
  const editor = editorElement
    ? getEditorFromDOMEditorElement(editorElement)
    : null;

  if (!editorElement || !editor || !node) {
    return null;
  }

  const range = editorElement.ownerDocument.createRange();

  try {
    range.setStart(node, offset);
    range.collapse(true);
  } catch {
    return null;
  }

  const pliteRange = editor.api.dom.resolvePliteRange(range, {
    exactMatch: false,
  });

  if (!pliteRange || !RangeApi.isCollapsed(pliteRange)) {
    return null;
  }

  const root = editor.read((state) => state.view.root());

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
    const point = getRootEdgePoint(editor, shellOwner.childRoot, {
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

  return {
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
  editor: ReactRuntimeEditor;
  editorElement: HTMLElement;
}) => {
  if (domSelection.isCollapsed) {
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

  if (
    anchor.root === focus.root &&
    isSameContentRootOwner(anchor.owner, focus.owner)
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
    (anchor.root !== MAIN_ROOT_KEY &&
      !isKnownContentRootOwner(anchorOwner, owners)) ||
    (focus.root !== MAIN_ROOT_KEY &&
      !isKnownContentRootOwner(focusOwner, owners))
  ) {
    return null;
  }

  return createPliteViewSelection(
    createContentRootProjectionGraph(editor, owners),
    {
      anchor: {
        ...(anchorOwner ? { owner: anchorOwner } : {}),
        point: anchor.point,
      },
      focus: {
        ...(focusOwner ? { owner: focusOwner } : {}),
        point: focus.point,
      },
    }
  );
};
