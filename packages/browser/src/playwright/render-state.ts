import type { Locator } from '@playwright/test';
import { getPliteReactRenderProfilerSnapshot } from './render-profiler';
import type {
  SelectionPoint,
  SelectionSnapshot,
  PliteBrowserEditorHarness,
  PliteBrowserRenderStateSnapshot,
  PliteBrowserSelectedShellSnapshot,
  PliteBrowserSelectionShellsSnapshot,
  PliteBrowserShellSummary,
} from './types';

const takeSelectionShellsSnapshot = async (
  root: Locator,
  selection: SelectionSnapshot | null
): Promise<PliteBrowserSelectionShellsSnapshot | null> => {
  if (!selection) {
    return null;
  }

  return root.evaluate((element, currentSelection) => {
    const summarize = (
      target: Element | null
    ): PliteBrowserShellSummary | null =>
      target
        ? {
            isInline: target.getAttribute('data-plite-inline') === 'true',
            isVoid: target.getAttribute('data-plite-void') === 'true',
            kind: target.getAttribute('data-plite-node'),
            path: target.getAttribute('data-plite-path'),
            runtimeId: target.getAttribute('data-plite-runtime-id'),
            tagName: target.tagName.toLowerCase(),
          }
        : null;
    const findPathNode = (path: number[]) => {
      const key = path.join(',');

      return (
        Array.from(element.querySelectorAll('[data-plite-path]')).find(
          (node) => node.getAttribute('data-plite-path') === key
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
    ): PliteBrowserSelectedShellSnapshot => {
      const domElement = toElement(domNode);
      const domPathNode =
        domElement?.closest('[data-plite-path]') ??
        (domElement?.querySelector('[data-plite-path]') as Element | null) ??
        null;
      const node = findPathNode(point.path) ?? domPathNode;
      const elementShell = node?.closest('[data-plite-node="element"]') ?? null;

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
    const runtimeIds = Array.from(
      new Set(
        [
          anchor.node?.runtimeId,
          anchor.element?.runtimeId,
          focus.node?.runtimeId,
          focus.element?.runtimeId,
        ].filter((runtimeId): runtimeId is string => Boolean(runtimeId))
      )
    );

    return {
      anchor,
      focus,
      runtimeIds,
    };
  }, selection);
};

/** Capture editor render state, selected shells, and selection shells. */
export const takePliteBrowserRenderStateSnapshot = async (
  editor: PliteBrowserEditorHarness
): Promise<PliteBrowserRenderStateSnapshot> => {
  const snapshot = await editor.snapshot();

  return {
    ...snapshot,
    renderCounts: await getPliteReactRenderProfilerSnapshot(editor.page),
    selectionShells: await takeSelectionShellsSnapshot(
      editor.root,
      snapshot.selection
    ),
  };
};
