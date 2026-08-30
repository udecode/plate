import type { Locator } from '@playwright/test';

export const hasDOMSelectionInRoot = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    if (!selection?.anchorNode || !selection.focusNode) {
      return false;
    }

    return (
      element.contains(selection.anchorNode) &&
      element.contains(selection.focusNode)
    );
  });

export const supportsRootScopedSelection = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;

    return (
      !(rootNode instanceof ShadowRoot) ||
      typeof (rootNode as { getSelection?: unknown }).getSelection ===
        'function'
    );
  });

export const hasUsableKeyboardFocus = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const activeElement =
      'activeElement' in rootNode
        ? rootNode.activeElement
        : element.ownerDocument.activeElement;

    if (activeElement === element) {
      return true;
    }

    if (!activeElement || !element.contains(activeElement)) {
      return false;
    }

    return (
      activeElement instanceof HTMLElement && activeElement.isContentEditable
    );
  });
