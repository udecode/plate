import type { Locator } from '@playwright/test';
import { getSlateReactRenderProfilerSnapshot } from './render-profiler';
import type {
  SelectionPoint,
  SelectionSnapshot,
  SlateBrowserEditorHarness,
  SlateBrowserRenderStateSnapshot,
  SlateBrowserSelectedShellSnapshot,
  SlateBrowserSelectionShellsSnapshot,
  SlateBrowserShellSummary,
} from './types';

const takeSelectionShellsSnapshot = async (
  root: Locator,
  selection: SelectionSnapshot | null
): Promise<SlateBrowserSelectionShellsSnapshot | null> => {
  if (!selection) {
    return null;
  }

  return root.evaluate((element, currentSelection) => {
    const summarize = (
      target: Element | null
    ): SlateBrowserShellSummary | null =>
      target
        ? {
            isInline: target.getAttribute('data-slate-inline') === 'true',
            isVoid: target.getAttribute('data-slate-void') === 'true',
            kind: target.getAttribute('data-slate-node'),
            path: target.getAttribute('data-slate-path'),
            runtimeId: target.getAttribute('data-slate-runtime-id'),
            tagName: target.tagName.toLowerCase(),
          }
        : null;
    const findPathNode = (path: number[]) => {
      const key = path.join(',');

      return (
        Array.from(element.querySelectorAll('[data-slate-path]')).find(
          (node) => node.getAttribute('data-slate-path') === key
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
    ): SlateBrowserSelectedShellSnapshot => {
      const domElement = toElement(domNode);
      const domPathNode =
        domElement?.closest('[data-slate-path]') ??
        (domElement?.querySelector('[data-slate-path]') as Element | null) ??
        null;
      const node = findPathNode(point.path) ?? domPathNode;
      const elementShell = node?.closest('[data-slate-node="element"]') ?? null;

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
export const takeSlateBrowserRenderStateSnapshot = async (
  editor: SlateBrowserEditorHarness
): Promise<SlateBrowserRenderStateSnapshot> => {
  const snapshot = await editor.snapshot();

  return {
    ...snapshot,
    renderCounts: await getSlateReactRenderProfilerSnapshot(editor.page),
    selectionShells: await takeSelectionShellsSnapshot(
      editor.root,
      snapshot.selection
    ),
  };
};
