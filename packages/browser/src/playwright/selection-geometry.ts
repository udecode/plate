import type { Locator } from '@playwright/test';

import type { FocusOwnerSnapshot, SelectionRectSnapshot } from './types';

export const getSelectionRect = async (
  root: Locator
): Promise<SelectionRectSnapshot | null> =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    if (
      !element.contains(selection.anchorNode) ||
      !element.contains(selection.focusNode)
    ) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const clientRect = Array.from(range.getClientRects()).find(
      (candidate) => candidate.width > 0 || candidate.height > 0
    );
    const usableRect =
      clientRect ??
      (rect.width > 0 || rect.height > 0 ? rect : null) ??
      (() => {
        if (!range.collapsed) {
          return null;
        }

        const start =
          range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as Element)
            : range.startContainer.parentElement;

        if (!start) {
          return null;
        }

        const nearestSlateRectOwner = start.closest(
          [
            '[data-slate-string]',
            '[data-slate-zero-width]',
            '[data-slate-leaf]',
            '[data-slate-node="text"]',
            '[data-slate-node="element"]',
          ].join(',')
        );

        let current: Element | null = nearestSlateRectOwner;

        while (current && element.contains(current)) {
          const fallbackRect = current.getBoundingClientRect();

          if (fallbackRect.width > 0 || fallbackRect.height > 0) {
            return fallbackRect;
          }

          current = current.parentElement;
        }

        return null;
      })();

    if (!usableRect) {
      return null;
    }

    return {
      height: usableRect.height,
      width: usableRect.width,
      x: usableRect.x,
      y: usableRect.y,
    };
  });

export const getFocusOwnerSnapshot = async (
  root: Locator
): Promise<FocusOwnerSnapshot> =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const activeElement =
      'activeElement' in rootNode
        ? rootNode.activeElement
        : element.ownerDocument.activeElement;

    if (!activeElement) {
      return {
        isContentEditable: false,
        kind: 'none',
        role: null,
        tagName: null,
        testId: null,
      };
    }

    const htmlActive =
      activeElement instanceof HTMLElement ? activeElement : null;
    const isContentEditable = htmlActive?.isContentEditable ?? false;
    const base = {
      isContentEditable,
      role: htmlActive?.getAttribute('role') ?? null,
      tagName: activeElement.tagName?.toLowerCase() ?? null,
      testId: htmlActive?.getAttribute('data-testid') ?? null,
    };

    if (activeElement === element) {
      return {
        ...base,
        kind: 'editor' as const,
      };
    }

    if (!element.contains(activeElement)) {
      return {
        ...base,
        kind: 'outside' as const,
      };
    }

    return {
      ...base,
      kind: isContentEditable
        ? ('contenteditable' as const)
        : ('internal-control' as const),
    };
  });
