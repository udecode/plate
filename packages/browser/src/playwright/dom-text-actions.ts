import { expect, type Locator } from '@playwright/test';

import { READY_TIMEOUT_MS, SLATE_BROWSER_HANDLE_KEY } from './constants';
import { getBlockTexts, includesPasteText } from './dom-text';
import {
  scrollTextPathIntoViewAndCheckMaterialized,
  waitForTextPathMaterialized,
} from './materialization';
import { setDOMSelection, setSelection } from './selection-actions';
import { waitForHandleSelection } from './selection-bookmarks';
import {
  hasExpandedSelection,
  setSelectionWithHandle,
  waitForSelectionRange,
} from './selection-handle';
import { waitForSelectionSync } from './selection-snapshots';
import type {
  SelectionPoint,
  SelectionSnapshot,
  SlateBrowserDOMPathOptions,
  SlateBrowserKernelTraceEntry,
  SlateBrowserScenarioStep,
  SlateBrowserTextPathRangeClickOptions,
} from './types';

const selectionsEqual = (
  left: SelectionSnapshot | null,
  right: SelectionSnapshot | null
) =>
  left === right ||
  (!!left &&
    !!right &&
    left.anchor.offset === right.anchor.offset &&
    left.focus.offset === right.focus.offset &&
    left.anchor.path.join(',') === right.anchor.path.join(',') &&
    left.focus.path.join(',') === right.focus.path.join(','));

export const didPasteApplyText = async ({
  afterText,
  afterSelection,
  afterTrace,
  beforeSelectedText,
  beforeSelection,
  beforeTraceLength,
  beforeText,
  root,
  text,
}: {
  afterText: string;
  afterSelection: SelectionSnapshot | null;
  afterTrace: readonly SlateBrowserKernelTraceEntry[];
  beforeSelectedText: string;
  beforeSelection: SelectionSnapshot | null;
  beforeTraceLength: number;
  beforeText: string;
  root: Locator;
  text: string;
}) => {
  if (
    afterTrace
      .slice(beforeTraceLength)
      .some(
        (entry) =>
          entry.eventFamily === 'paste' && entry.command?.kind === 'insert-data'
      )
  ) {
    return true;
  }

  if (afterText !== beforeText) {
    if (includesPasteText(afterText, text)) {
      return true;
    }

    return includesPasteText((await getBlockTexts(root)).join('\n'), text);
  }

  return (
    hasExpandedSelection(beforeSelection) &&
    !selectionsEqual(beforeSelection, afterSelection) &&
    beforeSelectedText !== '' &&
    includesPasteText(beforeSelectedText, text)
  );
};

export const mutateTextDOM = async (
  root: Locator,
  step: Extract<SlateBrowserScenarioStep, { kind: 'mutateTextDOM' }>
) => {
  await root.evaluate(
    (
      element: HTMLElement,
      payload: {
        data: string | null;
        inputType: string;
        path: number[];
        selectionOffset: number;
        text: string;
      }
    ) => {
      const textElement = element.querySelector(
        `[data-slate-node="text"][data-slate-path="${payload.path.join(',')}"]`
      );
      const textHost =
        textElement?.querySelector(
          '[data-slate-string], [data-slate-zero-width]'
        ) ?? textElement;

      if (!textHost) {
        throw new Error(`Missing DOM text host for ${payload.path.join('.')}`);
      }

      const walker = document.createTreeWalker(textHost, NodeFilter.SHOW_TEXT);
      const textNode = walker.nextNode();

      if (!(textNode instanceof Text)) {
        throw new Error(`Missing DOM text node for ${payload.path.join('.')}`);
      }

      if (payload.selectionOffset > payload.text.length) {
        throw new Error(
          `DOM text mutation selection offset ${payload.selectionOffset} exceeds text length ${payload.text.length}`
        );
      }

      textNode.nodeValue = payload.text;
      element.focus({ preventScroll: true });

      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(textNode, payload.selectionOffset);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);

      let event: Event;

      try {
        event = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: payload.data,
          inputType: payload.inputType,
        });
      } catch {
        event = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperties(event, {
          data: { value: payload.data },
          inputType: { value: payload.inputType },
        });
      }

      element.dispatchEvent(event);
    },
    {
      data: step.data ?? null,
      inputType: step.inputType ?? 'insertText',
      path: step.path,
      selectionOffset: step.selectionOffset ?? step.text.length,
      text: step.text,
    }
  );

  await waitForPendingNativeTextInputRepair(root);
};

export const clickTextOffset = async (
  root: Locator,
  path: number[],
  offset: number,
  options: {
    clickCount?: number;
    waitForSelectionSync?: boolean;
  } = {}
) => {
  const point = await root.evaluate(
    (
      element: HTMLElement,
      target: {
        offset: number;
        path: number[];
      }
    ) => {
      const textElements = Array.from(
        element.querySelectorAll('[data-slate-node="text"]')
      );
      const textElement =
        element.querySelector(
          `[data-slate-node="text"][data-slate-path="${target.path.join(',')}"]`
        ) ?? textElements[target.path.at(-1) ?? 0];
      const stringElement = textElement?.querySelector(
        '[data-slate-string], [data-slate-zero-width]'
      );
      const strings = Array.from(
        textElement?.querySelectorAll(
          '[data-slate-string], [data-slate-zero-width]'
        ) ?? []
      );
      (stringElement ?? textElement)?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
      });

      let currentOffset = 0;
      let targetNode: Node | null = null;
      let targetOffset = 0;

      for (const string of strings) {
        const textNode = Array.from(string.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE
        );
        const lengthAttribute = string.getAttribute('data-slate-length');
        const length =
          lengthAttribute == null
            ? (textNode?.textContent?.length ?? string.textContent?.length ?? 0)
            : Number.parseInt(lengthAttribute, 10);
        const safeLength = Number.isFinite(length) ? length : 0;
        const nextOffset = currentOffset + safeLength;

        if (target.offset <= nextOffset) {
          targetNode = textNode ?? string;
          targetOffset = string.hasAttribute('data-slate-zero-width')
            ? 1
            : Math.max(0, Math.min(target.offset - currentOffset, safeLength));
          break;
        }

        currentOffset = nextOffset;
      }

      if (!targetNode) {
        const lastString = strings.at(-1);
        const lastTextNode = Array.from(lastString?.childNodes ?? []).find(
          (node) => node.nodeType === Node.TEXT_NODE
        );

        targetNode = lastTextNode ?? lastString ?? null;
        targetOffset = targetNode?.textContent?.length ?? 0;
      }

      if (!targetNode) {
        throw new Error(`Missing DOM target for ${target.path.join('.')}`);
      }

      const range = element.ownerDocument.createRange();
      range.setStart(targetNode, targetOffset);
      range.collapse(true);

      const caretRect = range.getBoundingClientRect();
      const caretClientRect = Array.from(range.getClientRects())[0];
      let probeRect: DOMRect | null = null;

      if (targetNode.nodeType === Node.TEXT_NODE) {
        const textLength = targetNode.textContent?.length ?? 0;
        const probeRange = element.ownerDocument.createRange();
        const probeStart =
          targetOffset >= textLength
            ? Math.max(0, textLength - 1)
            : Math.max(0, targetOffset);
        const probeEnd = Math.min(textLength, probeStart + 1);

        if (probeEnd > probeStart) {
          probeRange.setStart(targetNode, probeStart);
          probeRange.setEnd(targetNode, probeEnd);
          probeRect = probeRange.getBoundingClientRect();
        }
      }

      const fallbackRect = (
        stringElement ?? textElement
      )?.getBoundingClientRect();
      const rect =
        caretClientRect ??
        (caretRect.height > 0 || caretRect.width > 0 ? caretRect : null) ??
        probeRect ??
        fallbackRect;

      if (!rect) {
        throw new Error(
          `Cannot resolve click rect for ${target.path.join('.')}`
        );
      }

      const x =
        probeRect && targetNode.nodeType === Node.TEXT_NODE
          ? targetOffset >= (targetNode.textContent?.length ?? 0)
            ? probeRect.right -
              Math.min(Math.max(probeRect.width * 0.25, 1), probeRect.width / 2)
            : probeRect.left
          : rect.left + Math.min(Math.max(rect.width / 2, 1), 4);

      return {
        x,
        y: rect.top + rect.height / 2,
      };
    },
    { offset, path }
  );

  const clickCount = options.clickCount;

  const readClickPointState = () =>
    root.evaluate(
      (
        element: HTMLElement,
        point: {
          x: number;
          y: number;
        }
      ) => {
        const describeElement = (node: Element | null) => {
          if (!node) {
            return null;
          }

          return {
            ariaLabel: node.getAttribute('aria-label'),
            path: node.getAttribute('data-slate-path'),
            role: node.getAttribute('role'),
            slateNode: node.getAttribute('data-slate-node'),
            tagName: node.tagName,
            text: node.textContent?.slice(0, 80) ?? '',
          };
        };
        const resolveSlatePoint = (node: Node | null, offset: number) => {
          const owner =
            node?.nodeType === 1
              ? (node as Element).closest('[data-slate-node="text"]')
              : node?.parentElement?.closest('[data-slate-node="text"]');
          const path = owner
            ?.getAttribute('data-slate-path')
            ?.split(',')
            .map((part) => Number.parseInt(part, 10));

          return {
            offset,
            ownerText: owner?.textContent?.slice(0, 80) ?? null,
            path: path?.every(Number.isInteger) ? path : null,
          };
        };
        const documentWithCaret = element.ownerDocument as Document & {
          caretPositionFromPoint?: (
            x: number,
            y: number
          ) => { offset: number; offsetNode: Node } | null;
          caretRangeFromPoint?: (x: number, y: number) => Range | null;
        };
        const caretPosition = documentWithCaret.caretPositionFromPoint?.(
          point.x,
          point.y
        );
        const caretRange =
          caretPosition == null
            ? documentWithCaret.caretRangeFromPoint?.(point.x, point.y)
            : null;
        const caretNode =
          caretPosition?.offsetNode ?? caretRange?.startContainer ?? null;
        const caretOffset =
          caretPosition?.offset ?? caretRange?.startOffset ?? null;
        const hit = element.ownerDocument.elementFromPoint(point.x, point.y);

        return {
          caret:
            caretNode && caretOffset != null
              ? resolveSlatePoint(caretNode, caretOffset)
              : null,
          hit: describeElement(hit),
          point,
        };
      },
      point
    );

  if (clickCount === 2) {
    await root.page().mouse.dblclick(point.x, point.y);
  } else {
    await root.page().mouse.click(point.x, point.y, {
      clickCount,
    });
  }
  if (options.waitForSelectionSync ?? true) {
    const isSingleClick = (clickCount ?? 1) === 1;
    await waitForSelectionSync(
      root,
      isSingleClick
        ? {
            anchor: { offset, path },
            focus: { offset, path },
          }
        : undefined
    ).catch(async (error: unknown) => {
      const clickPointState = await readClickPointState().catch(
        (stateError: unknown) => ({
          error:
            stateError instanceof Error
              ? stateError.message
              : String(stateError),
        })
      );

      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\nClick point state:\n${JSON.stringify(clickPointState, null, 2)}`
      );
    });
  }
};

export const collapseDOMAtTextPath = async (
  root: Locator,
  point: SelectionPoint,
  options: SlateBrowserDOMPathOptions = {}
) => {
  const selection = { anchor: point, focus: point };

  if (
    !(await scrollTextPathIntoViewAndCheckMaterialized(
      root,
      point.path,
      options
    )) &&
    !(await setSelectionWithHandle(root, selection))
  ) {
    await setSelection(root, selection);
  }

  await waitForTextPathMaterialized(root, point.path, options);

  if (!(await setSelectionWithHandle(root, selection))) {
    await setSelection(root, selection);
  }

  await root.evaluate((element: HTMLElement) => {
    element.focus({ preventScroll: true });
  });

  if (!(await setDOMSelection(root, selection))) {
    throw new Error(`Missing DOM text node for ${point.path.join('.')}`);
  }

  await root.evaluate(
    (element: HTMLElement, { key }: { key: string }) => {
      const rootNode = element.getRootNode() as Document | ShadowRoot;

      element.ownerDocument.dispatchEvent(
        new Event('selectionchange', { bubbles: true })
      );

      if (rootNode instanceof ShadowRoot) {
        rootNode.dispatchEvent(new Event('selectionchange', { bubbles: true }));
      }

      const handle = (element as Record<string, any>)[key];

      handle?.importDOMSelection?.();
    },
    { key: SLATE_BROWSER_HANDLE_KEY }
  );
  await waitForHandleSelection(root, selection);
  await waitForSelectionRange(root);
};

export const clickTextPathRange = async (
  root: Locator,
  {
    align,
    endOffset,
    path,
    startOffset,
    timeoutMs,
    xAffinity = 'start',
  }: SlateBrowserTextPathRangeClickOptions
) => {
  if (startOffset >= endOffset) {
    throw new Error('clickTextPathRange expects startOffset < endOffset');
  }

  await waitForTextPathMaterialized(root, path, { align, timeoutMs });

  const point = await root.evaluate(
    (
      element: HTMLElement,
      {
        endOffset,
        path,
        startOffset,
        xAffinity,
      }: {
        endOffset: number;
        path: number[];
        startOffset: number;
        xAffinity: NonNullable<
          SlateBrowserTextPathRangeClickOptions['xAffinity']
        >;
      }
    ) => {
      const textElement = Array.from(
        element.querySelectorAll('[data-slate-node="text"]')
      ).find(
        (node) =>
          node.closest('[data-slate-editor="true"]') === element &&
          node.getAttribute('data-slate-path') === path.join(',')
      );

      if (!textElement) {
        throw new Error(`Missing DOM text node for ${path.join('.')}`);
      }

      const resolveOffset = (offset: number) => {
        const stringElements = Array.from(
          textElement.querySelectorAll(
            '[data-slate-string], [data-slate-zero-width]'
          )
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
          const attr = stringElement.getAttribute('data-slate-length');
          const trueLength = attr == null ? length : Number.parseInt(attr, 10);
          const end = start + trueLength;

          lastTextNode = textNode;
          lastTextLength = length;

          if (
            stringElement.hasAttribute('data-slate-zero-width') &&
            offset === start &&
            length <= 1
          ) {
            return {
              node: textNode,
              offset: length,
            };
          }

          if (offset <= end) {
            return {
              node: textNode,
              offset: Math.min(length, Math.max(0, offset - start)),
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

      const range = element.ownerDocument.createRange();
      const start = resolveOffset(startOffset);
      const end = resolveOffset(endOffset);

      range.setStart(start.node, start.offset);
      range.setEnd(end.node, end.offset);

      const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();

      if (!rect || rect.width <= 0 || rect.height <= 0) {
        throw new Error(
          `Text range has no selectable rect: ${path.join('.')} ${startOffset}-${endOffset}`
        );
      }

      return {
        x:
          xAffinity === 'center'
            ? rect.left + rect.width / 2
            : xAffinity === 'end'
              ? Math.max(rect.left + 1, rect.right - 1)
              : rect.left,
        y: rect.top + rect.height / 2,
      };
    },
    { endOffset, path, startOffset, xAffinity }
  );

  await root.page().mouse.click(point.x, point.y);
};

export const waitForPendingNativeTextInputRepair = async (
  root: Locator,
  { timeoutMs = READY_TIMEOUT_MS }: { timeoutMs?: number } = {}
) => {
  let actual: {
    clearSettled: boolean | null;
    domRaw: {
      anchorNodeText: string | null;
      anchorOffset: number;
      focusNodeText: string | null;
      focusOffset: number;
    } | null;
    domResolved: SelectionSnapshot | null;
    inputState: unknown;
    kernelTrace: unknown[];
    repairTrace: unknown[];
    model: SelectionSnapshot | null;
    pendingPath: string | null;
  } | null = null;

  try {
    await expect
      .poll(
        async () => {
          actual = await root.evaluate(
            (element: HTMLElement, { key }: { key: string }) => {
              const handle = (element as Record<string, any>)[key];
              const clearSettled =
                handle?.clearSettledPendingNativeTextInputRepair?.() ?? null;
              const state = handle?.getInputState?.() as
                | { pendingNativeTextInputRepairPathKey?: string | null }
                | null
                | undefined;
              const kernelTrace = handle?.getKernelTrace?.() ?? [];
              const root = element.getRootNode() as Document | ShadowRoot;
              const selection =
                'getSelection' in root ? root.getSelection() : null;

              return {
                clearSettled,
                domRaw:
                  selection && selection.rangeCount > 0
                    ? {
                        anchorNodeText:
                          selection.anchorNode?.textContent?.replace(
                            /\uFEFF/g,
                            ''
                          ) ?? null,
                        anchorOffset: selection.anchorOffset,
                        focusNodeText:
                          selection.focusNode?.textContent?.replace(
                            /\uFEFF/g,
                            ''
                          ) ?? null,
                        focusOffset: selection.focusOffset,
                      }
                    : null,
                domResolved: handle?.getDOMSelection?.() ?? null,
                inputState: state ?? null,
                kernelTrace: kernelTrace.slice(-8),
                model: handle?.getSelection?.() ?? null,
                pendingPath: state?.pendingNativeTextInputRepairPathKey ?? null,
                repairTrace: kernelTrace
                  .filter(
                    (entry: { eventFamily?: unknown }) =>
                      entry?.eventFamily === 'repair'
                  )
                  .slice(-8),
              };
            },
            { key: SLATE_BROWSER_HANDLE_KEY }
          );

          return actual.pendingPath;
        },
        { timeout: timeoutMs }
      )
      .toBe(null);
  } catch {
    throw new Error(
      `Expected pending native text input repair to settle but received ${JSON.stringify(
        actual
      )}`
    );
  }
};
