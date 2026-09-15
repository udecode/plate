import type { Locator } from '@playwright/test';

import { getReactRenderProfilerSnapshot } from './render-profiler';
import type {
  SelectionPoint,
  SelectionSnapshot,
  BrowserEditorHarness,
  BrowserRenderStateSnapshot,
  BrowserSelectedShellSnapshot,
  BrowserSelectionShellsSnapshot,
  BrowserShellSummary,
} from './types';

const takeSelectionShellsSnapshot = async (
  root: Locator,
  selection: SelectionSnapshot | null
): Promise<BrowserSelectionShellsSnapshot | null> => {
  if (!selection) {
    return null;
  }

  return root.evaluate((element, currentSelection) => {
    const summarize = (target: Element | null): BrowserShellSummary | null =>
      target
        ? {
            isInline: target.getAttribute('data-editor-inline') === 'true',
            isVoid: target.getAttribute('data-editor-void') === 'true',
            kind: target.getAttribute('data-editor-node'),
            path: target.getAttribute('data-editor-path'),
            nodeKey: target.getAttribute('data-editor-node-key'),
            tagName: target.tagName.toLowerCase(),
          }
        : null;
    const findPathNode = (path: number[]) => {
      const key = path.join(',');

      return (
        Array.from(element.querySelectorAll('[data-editor-path]')).find(
          (node) => node.getAttribute('data-editor-path') === key
        ) ?? null
      );
    };
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const domSelection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();
    const toElement = (node: Node | null) =>
      node instanceof Element ? node : node?.parentElement;
    const summarizePoint = (
      point: SelectionPoint,
      name: 'anchor' | 'focus',
      domNode: Node | null
    ): BrowserSelectedShellSnapshot => {
      const domElement = toElement(domNode);
      const domPathNode =
        domElement?.closest('[data-editor-path]') ??
        (domElement?.querySelector('[data-editor-path]') as Element | null) ??
        null;
      const node = findPathNode(point.path) ?? domPathNode;
      const elementShell =
        node?.closest('[data-editor-node="element"]') ?? null;

      return {
        element: summarize(elementShell),
        node: summarize(node),
        offset: point.offset,
        path: point.path,
        point: name,
      };
    };
    const anchor = summarizePoint(
      currentSelection.anchor,
      'anchor',
      domSelection?.anchorNode ?? null
    );
    const focus = summarizePoint(
      currentSelection.focus,
      'focus',
      domSelection?.focusNode ?? null
    );
    const nodeKeys = Array.from(
      new Set(
        [
          anchor.node?.nodeKey,
          anchor.element?.nodeKey,
          focus.node?.nodeKey,
          focus.element?.nodeKey,
        ].filter((nodeKey): nodeKey is string => Boolean(nodeKey))
      )
    );

    return {
      anchor,
      focus,
      nodeKeys,
    };
  }, selection);
};

/** Capture editor render state, selected shells, and selection shells. */
export const takeBrowserRenderStateSnapshot = async (
  editor: BrowserEditorHarness
): Promise<BrowserRenderStateSnapshot> => {
  const snapshot = await editor.snapshot();

  return {
    ...snapshot,
    renderCounts: await getReactRenderProfilerSnapshot(editor.page),
    selectionShells: await takeSelectionShellsSnapshot(
      editor.root,
      snapshot.selection
    ),
  };
};
