import type { Locator, Page } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type {
  SelectionPoint,
  SelectionSnapshot,
  PliteBrowserDoubleClickDragTextRangeOptions,
  PliteBrowserDragTextRangeOptions,
  PliteBrowserScenarioStep,
} from './types';

export const setSelection = async (
  root: Locator,
  selection: SelectionSnapshot
) => {
  await root.evaluate((element: HTMLElement, expected) => {
    const textNodes = Array.from(
      element.querySelectorAll('[data-plite-node="text"]')
    ).filter((node) => node.closest('[data-plite-editor="true"]') === element);

    const comparePoint = (
      left: SelectionPoint,
      right: SelectionPoint
    ): number => {
      const count = Math.max(left.path.length, right.path.length);

      for (let index = 0; index < count; index += 1) {
        const leftSegment = left.path[index] ?? -1;
        const rightSegment = right.path[index] ?? -1;

        if (leftSegment !== rightSegment) {
          return leftSegment - rightSegment;
        }
      }

      return left.offset - right.offset;
    };

    const getTextLeaf = (owner: Element) => {
      const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
      return walker.nextNode();
    };

    const resolvePoint = (point: SelectionPoint) => {
      if (point.path.length === 0) {
        throw new Error('Cannot resolve an empty Plite path');
      }

      const owner = textNodes[point.path[0]];

      if (!owner) {
        throw new Error(`Cannot resolve Plite path ${point.path.join('.')}`);
      }

      const zeroWidthOwner = owner.querySelector('[data-plite-zero-width]');

      if (zeroWidthOwner && point.offset === 0) {
        const textLeaf = getTextLeaf(owner);

        if (textLeaf && (textLeaf.textContent?.length ?? 0) <= 1) {
          return { node: textLeaf, offset: 1 };
        }
      }

      let remaining = point.offset;
      const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      let lastTextNode: Node | null = null;

      while (current) {
        lastTextNode = current;
        const length = current.textContent?.length ?? 0;

        if (remaining <= length) {
          return { node: current, offset: remaining };
        }

        remaining -= length;
        current = walker.nextNode();
      }

      if (lastTextNode) {
        return {
          node: lastTextNode,
          offset: lastTextNode.textContent?.length ?? 0,
        };
      }

      return { node: owner, offset: owner.childNodes.length };
    };

    const anchor = resolvePoint(expected.anchor);
    const focus = resolvePoint(expected.focus);
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    if (!selection) {
      throw new Error('Cannot access window selection');
    }

    const isBackward = comparePoint(expected.anchor, expected.focus) > 0;
    const isCollapsed = comparePoint(expected.anchor, expected.focus) === 0;

    selection.removeAllRanges();

    if (isCollapsed) {
      selection.collapse(anchor.node, anchor.offset);
      return;
    }

    if (isBackward && typeof selection.extend === 'function') {
      const range = element.ownerDocument.createRange();
      range.setStart(focus.node, focus.offset);
      range.setEnd(focus.node, focus.offset);
      selection.addRange(range);
      selection.extend(anchor.node, anchor.offset);
      return;
    }

    const range = element.ownerDocument.createRange();
    range.setStart(anchor.node, anchor.offset);
    range.setEnd(focus.node, focus.offset);
    selection.addRange(range);
  }, selection);
};

export const setDOMSelection = async (
  root: Locator,
  selection: SelectionSnapshot
) =>
  root.evaluate(
    (element: HTMLElement, payload) => {
      const { key, selection: nextSelection } = payload;
      const handle = (element as Record<string, any>)[key];

      if (handle?.setNativeDOMSelection?.(nextSelection)) {
        return true;
      }

      const selectionPointToDOMPoint = (point: SelectionPoint) => {
        const textElements = Array.from(
          element.querySelectorAll('[data-plite-node="text"]')
        ).filter(
          (node) => node.closest('[data-plite-editor="true"]') === element
        );
        const textElement = textElements.find(
          (node) =>
            node.getAttribute('data-plite-path') === point.path.join(',')
        );

        if (!textElement) {
          return null;
        }

        const stringElements = Array.from(
          textElement?.querySelectorAll(
            '[data-plite-string], [data-plite-zero-width]'
          ) ?? []
        );
        let start = 0;
        let lastTextNode: Node | null = null;
        let lastTextLength = 0;

        for (const stringElement of stringElements) {
          const textNode =
            Array.from(stringElement.childNodes).find(
              (node) => node.nodeType === Node.TEXT_NODE
            ) ?? null;

          if (!textNode) {
            continue;
          }

          const length = textNode.textContent?.length ?? 0;
          const attr = stringElement.getAttribute('data-plite-length');
          const trueLength = attr == null ? length : Number.parseInt(attr, 10);
          const end = start + trueLength;

          lastTextNode = textNode;
          lastTextLength = length;

          if (
            stringElement.hasAttribute('data-plite-zero-width') &&
            point.offset === start &&
            length <= 1
          ) {
            return {
              node: textNode,
              offset: length,
            };
          }

          if (point.offset <= end) {
            return {
              node: textNode,
              offset: Math.min(length, Math.max(0, point.offset - start)),
            };
          }

          start = end;
        }

        if (lastTextNode) {
          return {
            node: lastTextNode,
            offset: lastTextLength,
          };
        }

        return {
          node: textElement,
          offset: textElement.childNodes.length,
        };
      };

      const anchor = selectionPointToDOMPoint(nextSelection.anchor);
      const focus = selectionPointToDOMPoint(nextSelection.focus);

      if (!anchor || !focus) {
        return false;
      }

      const range = element.ownerDocument.createRange();

      range.setStart(anchor.node, anchor.offset);
      range.setEnd(focus.node, focus.offset);

      const rootNode = element.getRootNode() as Document | ShadowRoot;
      const domSelection =
        'getSelection' in rootNode
          ? rootNode.getSelection()
          : element.ownerDocument.getSelection();

      if (!domSelection) {
        return false;
      }

      element.focus();
      domSelection.removeAllRanges();
      domSelection.addRange(range);
      element.ownerDocument.dispatchEvent(
        new Event('selectionchange', { bubbles: true })
      );

      if (rootNode instanceof ShadowRoot) {
        rootNode.dispatchEvent(new Event('selectionchange', { bubbles: true }));
      }

      return domSelection.rangeCount > 0;
    },
    { key: PLITE_BROWSER_HANDLE_KEY, selection }
  );

export const dragTextSelection = async (
  page: Page,
  step: Extract<PliteBrowserScenarioStep, { kind: 'dragTextSelection' }>
) => {
  const locator = page.locator(step.selector).nth(step.index ?? 0);

  await locator.scrollIntoViewIfNeeded();

  const box = await locator.boundingBox();

  if (!box) {
    throw new Error(
      `Expected selectable text to have a bounding box: ${step.selector}`
    );
  }

  const startXOffset = step.startXOffset ?? 5;
  const endXOffset = step.endXOffset ?? Math.min(box.width - 5, 260);
  const yOffset = step.yOffset ?? box.height / 2;
  const y = box.y + yOffset;

  await page.mouse.move(box.x + startXOffset, y);
  await page.mouse.down();
  await page.mouse.move(box.x + Math.min(box.width - 5, endXOffset), y, {
    steps: step.steps ?? 12,
  });
  await page.mouse.up();
};

export const dragTextRange = async (
  root: Locator,
  {
    direction = 'forward',
    endAffinity = 'inside',
    endOffset,
    endText,
    endTextNodeIndex,
    settleMs = 0,
    startOffset,
    steps = 16,
    text,
    textNodeIndex = 0,
  }: PliteBrowserDragTextRangeOptions
) => {
  await root
    .getByText(text, { exact: true })
    .nth(textNodeIndex)
    .scrollIntoViewIfNeeded();

  if (endText && endText !== text) {
    await root
      .getByText(endText, { exact: true })
      .nth(endTextNodeIndex ?? textNodeIndex)
      .scrollIntoViewIfNeeded();
  }

  const points = await root.evaluate(
    (
      element,
      {
        endAffinity,
        endOffset,
        endText,
        endTextNodeIndex,
        startOffset,
        text,
        textNodeIndex,
      }: Omit<PliteBrowserDragTextRangeOptions, 'settleMs' | 'steps'> & {
        endAffinity: NonNullable<
          PliteBrowserDragTextRangeOptions['endAffinity']
        >;
        textNodeIndex: number;
      }
    ) => {
      const ownerDocument = element.ownerDocument;
      const walker = ownerDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      );
      const matches: Node[] = [];

      while (walker.nextNode()) {
        matches.push(walker.currentNode);
      }

      const findTextNode = (targetText: string, targetIndex: number) => {
        const targetMatches = matches.filter(
          (node) => node.textContent === targetText
        );
        const target = targetMatches[targetIndex];

        if (!target) {
          throw new Error(`Text node not found for drag range: ${targetText}`);
        }

        return target;
      };
      const startNode = findTextNode(text, textNodeIndex);
      const resolvedEndText = endText ?? text;
      const resolvedEndTextNodeIndex = endTextNodeIndex ?? textNodeIndex;
      const endNode = findTextNode(resolvedEndText, resolvedEndTextNodeIndex);

      if (startNode === endNode && startOffset > endOffset) {
        throw new Error('dragTextRange expects startOffset <= endOffset');
      }
      const scrollNodeIntoView = (node: Node) => {
        const element =
          node.nodeType === Node.TEXT_NODE
            ? node.parentElement
            : node instanceof Element
              ? node
              : null;

        element?.scrollIntoView({ block: 'center', inline: 'nearest' });
      };

      scrollNodeIntoView(startNode);
      scrollNodeIntoView(endNode);

      const pointAt = (
        node: Node,
        offset: number,
        affinity: 'end' | 'start'
      ) => {
        const textLength = node.textContent?.length ?? 0;

        if (textLength === 0) {
          throw new Error('Text range has no selectable rect');
        }

        const range = ownerDocument.createRange();
        const charIndex =
          affinity === 'end'
            ? Math.max(0, Math.min(offset - 1, textLength - 1))
            : Math.max(0, Math.min(offset, textLength - 1));

        range.setStart(node, charIndex);
        range.setEnd(node, Math.min(textLength, charIndex + 1));

        const measureRect = () =>
          range.getClientRects()[0] ?? range.getBoundingClientRect();
        let rect = measureRect();

        const view = ownerDocument.defaultView;

        if (view) {
          const viewportMargin = 24;
          const deltaY =
            rect.top < viewportMargin
              ? rect.top - view.innerHeight / 2
              : rect.bottom > view.innerHeight - viewportMargin
                ? rect.bottom - view.innerHeight / 2
                : 0;
          const deltaX =
            rect.left < viewportMargin
              ? rect.left - view.innerWidth / 2
              : rect.right > view.innerWidth - viewportMargin
                ? rect.right - view.innerWidth / 2
                : 0;

          if (deltaX || deltaY) {
            view.scrollBy(deltaX, deltaY);
            rect = measureRect();
          }
        }

        if (!rect || rect.width <= 0 || rect.height <= 0) {
          throw new Error('Text range has no selectable rect');
        }

        if (affinity === 'start') {
          return {
            x: rect.left + 1,
            y: rect.top + rect.height / 2,
          };
        }

        const shouldEndAfterText =
          endAffinity === 'after' && offset >= textLength;

        return {
          x: shouldEndAfterText
            ? rect.right + 2
            : Math.max(rect.left + 1, rect.right - 1),
          y: rect.top + rect.height / 2,
        };
      };
      const start = pointAt(startNode, startOffset, 'start');
      const end = pointAt(endNode, endOffset, 'end');

      return {
        endX: end.x,
        endY: end.y,
        startX: start.x,
        startY: start.y,
      };
    },
    {
      endAffinity,
      endOffset,
      endText,
      endTextNodeIndex,
      startOffset,
      text,
      textNodeIndex,
    }
  );
  const page = root.page();

  const startPoint =
    direction === 'backward'
      ? { x: points.endX, y: points.endY }
      : { x: points.startX, y: points.startY };
  const endPoint =
    direction === 'backward'
      ? { x: points.startX, y: points.startY }
      : { x: points.endX, y: points.endY };

  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y, { steps });
  if (settleMs > 0) {
    await page.waitForTimeout(settleMs);
  }
  await page.mouse.up();
};

export const doubleClickDragTextRange = async (
  root: Locator,
  {
    doubleClickOffset,
    endOffset,
    gestureDelayMs = 35,
    steps = 16,
    text,
    textNodeIndex = 0,
  }: PliteBrowserDoubleClickDragTextRangeOptions
) => {
  const points = await root.evaluate(
    (
      element,
      {
        doubleClickOffset,
        endOffset,
        text,
        textNodeIndex,
      }: Required<
        Pick<
          PliteBrowserDoubleClickDragTextRangeOptions,
          'doubleClickOffset' | 'endOffset' | 'text' | 'textNodeIndex'
        >
      >
    ) => {
      const ownerDocument = element.ownerDocument;
      const walker = ownerDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      );
      const matches: Node[] = [];

      while (walker.nextNode()) {
        if (walker.currentNode.textContent === text) {
          matches.push(walker.currentNode);
        }
      }

      const textNode = matches[textNodeIndex];

      if (!textNode) {
        throw new Error(`Text node not found for double-click drag: ${text}`);
      }

      const textLength = textNode.textContent?.length ?? 0;

      if (textLength === 0) {
        throw new Error('Cannot double-click drag an empty text node');
      }

      const clampOffset = (offset: number) =>
        Math.max(0, Math.min(offset, textLength));
      const pointAt = (
        offset: number,
        affinity: 'anchor' | 'end' | 'start'
      ) => {
        const safeOffset = clampOffset(offset);
        const probeStart =
          affinity === 'end'
            ? Math.max(0, Math.min(safeOffset - 1, textLength - 1))
            : Math.max(0, Math.min(safeOffset, textLength - 1));
        const probeEnd = Math.min(textLength, probeStart + 1);
        const range = ownerDocument.createRange();

        range.setStart(textNode, probeStart);
        range.setEnd(textNode, probeEnd);

        const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();

        if (!rect || rect.width <= 0 || rect.height <= 0) {
          throw new Error(
            `Text offset has no selectable rect: ${text} @ ${offset}`
          );
        }

        const x =
          affinity === 'anchor'
            ? rect.left + rect.width / 2
            : affinity === 'end'
              ? Math.max(rect.left + 1, rect.right - 1)
              : rect.left + 1;

        return {
          x,
          y: rect.top + rect.height / 2,
        };
      };
      const forward = endOffset >= doubleClickOffset;

      textNode.parentElement?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
      });

      return {
        end: pointAt(endOffset, forward ? 'end' : 'start'),
        start: pointAt(doubleClickOffset, 'anchor'),
      };
    },
    { doubleClickOffset, endOffset, text, textNodeIndex }
  );
  const page = root.page();

  await page.mouse.move(points.start.x, points.start.y);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(gestureDelayMs);
  await page.mouse.down({ clickCount: 2 });
  await page.waitForTimeout(gestureDelayMs);
  await page.mouse.move(points.end.x, points.end.y, { steps });
  await page.mouse.up({ clickCount: 2 });
};
