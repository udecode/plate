import type { Locator, Page } from '@playwright/test';
import { PLITE_BROWSER_HANDLE_KEY } from './constants';

/** One trusted printable-key timing row captured from the editable root. */
export type PliteTrustedTypingRow = {
  beforeInput?: number;
  beforeInputDataMatched?: boolean;
  domReady?: number;
  domTextInsertionMatched?: boolean;
  input?: number;
  inputDataMatched?: boolean;
  inputOwnership?: string;
  key: string;
  keydown: number;
  modelSelectionMatched?: boolean;
  modelTextInsertionMatched?: boolean;
  nativeTargetRangeMatched?: boolean;
  offset?: number;
  paint?: number;
  path?: number[];
  runtimeTargetMatched?: boolean;
  trustedBeforeInput?: boolean;
  trustedInput?: boolean;
  trustedKey: boolean;
};

/** Trusted typing rows and long tasks captured during one measured burst. */
export type PliteTrustedTypingResult = {
  longTasks: number[];
  longTasksSupported: boolean;
  rows: PliteTrustedTypingRow[];
};

const TRACE_KEY_PREFIX = '__plateTrustedTypingTrace';
let traceSequence = 0;

/** Measure trusted keydown, exact DOM readiness, paint, and long tasks. */
export const measurePliteTrustedTyping = async ({
  delay = 0,
  page,
  root,
  text,
}: {
  delay?: number;
  page: Page;
  root: Locator;
  text: string;
}): Promise<PliteTrustedTypingResult> => {
  const traceKey = `${TRACE_KEY_PREFIX}:${traceSequence++}`;

  await root.evaluate(
    (element, { handleKey, traceKey }) => {
      const rows: Array<
        PliteTrustedTypingRow & {
          expectedText?: string;
          observedDOMText?: string | null;
          paintScheduled?: boolean;
          traceStartFrameId: number;
        }
      > = [];
      const longTasks: number[] = [];
      const handle = (element as unknown as Record<string, unknown>)[
        handleKey
      ] as
        | {
            getSelection(): {
              anchor: { offset: number; path: number[] };
              focus: { offset: number; path: number[] };
              kind: 'text';
            } | null;
            getKernelTrace(): Array<{
              command: { kind?: string; text?: string } | null;
              eventFamily: string;
              frameId: number | null;
              ownership: string;
              selectionBefore: {
                anchor: { offset: number; path: number[] };
                focus: { offset: number; path: number[] };
                kind: 'text';
              } | null;
            }>;
            getValue(): unknown;
          }
        | undefined;
      const pathsEqual = (left: readonly number[], right: readonly number[]) =>
        left.length === right.length &&
        left.every((part, index) => part === right[index]);
      const readModelText = (path: readonly number[]) => {
        let node = handle?.getValue() as
          | { children?: unknown[]; text?: unknown }
          | undefined;

        for (const index of path) {
          node = node?.children?.[index] as
            | { children?: unknown[]; text?: unknown }
            | undefined;
        }

        return typeof node?.text === 'string' ? node.text : null;
      };
      const readDOMText = (path: readonly number[]) => {
        const textHosts = Array.from(
          element.querySelectorAll<HTMLElement>('[data-plite-node="text"]')
        ).filter(
          (candidate) =>
            candidate.getAttribute('data-plite-path') === path.join(',')
        );

        if (textHosts.length === 0) return null;

        return textHosts
          .map((textHost) => textHost.textContent ?? '')
          .join('')
          .replaceAll('\uFEFF', '');
      };
      const getLatestTraceFrameId = () =>
        (handle?.getKernelTrace() ?? []).reduce(
          (latest, entry) => Math.max(latest, entry.frameId ?? -1),
          -1
        );
      const resolveDOMPoint = (container: Node, offset: number) => {
        const anchorElement =
          container.nodeType === Node.ELEMENT_NODE
            ? (container as Element)
            : container.parentElement;
        const textHost = anchorElement?.closest<HTMLElement>(
          '[data-plite-node="text"]'
        );
        const path = textHost
          ?.getAttribute('data-plite-path')
          ?.split(',')
          .map((part) => Number.parseInt(part, 10));

        if (!textHost || !path?.every(Number.isFinite)) return null;
        const range = element.ownerDocument.createRange();

        range.selectNodeContents(textHost);
        range.setEnd(container, offset);

        return {
          offset: range.toString().replaceAll('\uFEFF', '').length,
          path,
        };
      };
      const schedulePaintBoundary = (
        row: (typeof rows)[number]
      ) => {
        if (row.paintScheduled) return;

        row.paintScheduled = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            row.paint = performance.now();
          });
        });
      };
      const markReadyIfExact = (row: (typeof rows)[number]) => {
        if (
          !row.expectedText ||
          row.offset == null ||
          !row.path ||
          row.domReady !== undefined
        ) {
          return;
        }

        row.observedDOMText = readDOMText(row.path);
        const modelText = readModelText(row.path);
        const selection = handle?.getSelection();
        const kernelTrace = handle?.getKernelTrace() ?? [];
        const runtimeEvent = kernelTrace.findLast(
          (entry) =>
            entry.frameId != null &&
            entry.frameId > row.traceStartFrameId &&
            entry.eventFamily === 'beforeinput' &&
            entry.command?.kind === 'insert-text' &&
            entry.command.text === row.key &&
            entry.selectionBefore?.kind === 'text' &&
            pathsEqual(entry.selectionBefore.anchor.path, row.path!) &&
            pathsEqual(entry.selectionBefore.focus.path, row.path!) &&
            entry.selectionBefore.anchor.offset === row.offset &&
            entry.selectionBefore.focus.offset === row.offset
        );
        const nextOffset = row.offset + row.key.length;

        row.inputOwnership = runtimeEvent?.ownership;
        row.runtimeTargetMatched = runtimeEvent != null;
        row.domTextInsertionMatched =
          row.observedDOMText === row.expectedText;
        row.modelTextInsertionMatched =
          modelText === row.expectedText &&
          selection?.kind === 'text' &&
          pathsEqual(selection.anchor.path, row.path) &&
          pathsEqual(selection.focus.path, row.path) &&
          selection.anchor.offset === nextOffset &&
          selection.focus.offset === nextOffset;

        if (
          runtimeEvent &&
          row.domTextInsertionMatched &&
          row.modelTextInsertionMatched
        ) {
          row.domReady = performance.now();
          schedulePaintBoundary(row);
        }
      };
      const onKeyDown = (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;

        if (Array.from(keyboardEvent.key).length !== 1) return;
        const traceStartFrameId = getLatestTraceFrameId();

        const selection = handle?.getSelection();
        const isCollapsedSelection =
          selection?.kind === 'text' &&
          pathsEqual(selection.anchor.path, selection.focus.path) &&
          selection.anchor.offset === selection.focus.offset;
        const path = isCollapsedSelection ? selection.anchor.path : undefined;
        const offset = isCollapsedSelection
          ? selection.anchor.offset
          : undefined;
        const beforeText = path ? readModelText(path) : null;
        const row: (typeof rows)[number] = {
          expectedText:
            beforeText != null && offset != null
              ? beforeText.slice(0, offset) +
                keyboardEvent.key +
                beforeText.slice(offset)
              : undefined,
          key: keyboardEvent.key,
          keydown: performance.now(),
          offset,
          path: path ? [...path] : undefined,
          traceStartFrameId,
          trustedKey: keyboardEvent.isTrusted,
        };

        rows.push(row);
      };
      const findPendingRow = (field: keyof PliteTrustedTypingRow) =>
        rows.findLast((row) => row[field] === undefined);
      const onBeforeInput = (event: Event) => {
        const row = findPendingRow('beforeInput');

        if (!row) return;
        const inputEvent = event as InputEvent;
        row.beforeInput = performance.now();
        row.beforeInputDataMatched =
          inputEvent.inputType === 'insertText' &&
          inputEvent.data === row.key;
        const selection = handle?.getSelection();

        row.modelSelectionMatched =
          row.path != null &&
          row.offset != null &&
          selection?.kind === 'text' &&
          pathsEqual(selection.anchor.path, row.path) &&
          pathsEqual(selection.focus.path, row.path) &&
          selection.anchor.offset === row.offset &&
          selection.focus.offset === row.offset;
        const targetRanges = inputEvent.getTargetRanges?.() ?? [];
        const targetRange = targetRanges.length === 1 ? targetRanges[0] : null;
        const targetStart = targetRange
          ? resolveDOMPoint(targetRange.startContainer, targetRange.startOffset)
          : null;
        const targetEnd = targetRange
          ? resolveDOMPoint(targetRange.endContainer, targetRange.endOffset)
          : null;

        row.nativeTargetRangeMatched =
          row.path != null &&
          row.offset != null &&
          targetStart != null &&
          targetEnd != null &&
          pathsEqual(targetStart.path, row.path) &&
          pathsEqual(targetEnd.path, row.path) &&
          targetStart.offset === row.offset &&
          targetEnd.offset === row.offset;
        row.trustedBeforeInput = event.isTrusted;
        queueMicrotask(() => {
          markReadyIfExact(row);
        });
      };
      const onInput = (event: Event) => {
        const row = findPendingRow('input');

        if (!row) return;
        const inputEvent = event as InputEvent;
        row.input = performance.now();
        row.inputDataMatched =
          inputEvent.inputType === 'insertText' &&
          inputEvent.data === row.key;
        row.trustedInput = event.isTrusted;
      };
      const mutationObserver = new MutationObserver(() => {
        rows.forEach(markReadyIfExact);
      });
      let longTaskObserver: PerformanceObserver | null = null;
      let longTasksSupported = false;

      element.addEventListener('keydown', onKeyDown, true);
      element.addEventListener('beforeinput', onBeforeInput, true);
      element.addEventListener('input', onInput, true);
      mutationObserver.observe(element, {
        characterData: true,
        childList: true,
        subtree: true,
      });
      if (
        typeof PerformanceObserver !== 'undefined' &&
        PerformanceObserver.supportedEntryTypes.includes('longtask')
      ) {
        try {
          longTaskObserver = new PerformanceObserver((list) => {
            longTasks.push(
              ...list.getEntries().map((entry) => entry.duration)
            );
          });
          longTaskObserver.observe({ entryTypes: ['longtask'] });
          longTasksSupported = true;
        } catch {
          longTaskObserver?.disconnect();
          longTaskObserver = null;
        }
      }

      let cleanedUp = false;
      const cleanup = () => {
        if (cleanedUp) return;

        cleanedUp = true;
        element.removeEventListener('keydown', onKeyDown, true);
        element.removeEventListener('beforeinput', onBeforeInput, true);
        element.removeEventListener('input', onInput, true);
        mutationObserver.disconnect();
        if (longTaskObserver) {
          longTasks.push(
            ...longTaskObserver.takeRecords().map((entry) => entry.duration)
          );
        }
        longTaskObserver?.disconnect();
      };
      (globalThis as Record<string, unknown>)[traceKey] = {
        cleanup,
        waitForLatestReady: (expectedRowCount: number, expectedKey: string) =>
          new Promise<void>((resolve, reject) => {
            const startedAt = performance.now();
            const check = () => {
              const row = rows[expectedRowCount - 1];

              if (
                rows.length === expectedRowCount &&
                row?.key === expectedKey
              ) {
                markReadyIfExact(row);
              }
              if (row?.key === expectedKey && row.domReady !== undefined) {
                resolve();
                return;
              }
              if (performance.now() - startedAt >= 1000) {
                const renderProfile = (
                  globalThis as Record<string, unknown>
                ).__PLITE_REACT_RENDER_PROFILER_SNAPSHOT__ as
                  | (() => unknown)
                  | undefined;
                const domTextHosts = Array.from(
                  element.ownerDocument.querySelectorAll<HTMLElement>(
                    '[data-plite-node="text"]'
                  )
                ).map((textHost) => ({
                  editorRootId:
                    textHost
                      .closest('[data-plite-editor]')
                      ?.getAttribute('id') ?? null,
                  insideMeasuredRoot: element.contains(textHost),
                  nodeKey: textHost.getAttribute('data-plite-node-key'),
                  path: textHost.getAttribute('data-plite-path'),
                  text: textHost.textContent?.replaceAll('\uFEFF', '') ?? null,
                }));

                reject(
                  new Error(
                    `Trusted typing row did not become exact: ${JSON.stringify({
                      domTextHosts,
                      kernelTrace: handle?.getKernelTrace().slice(-8) ?? [],
                      renderProfile: renderProfile?.(),
                      row,
                    })}`
                  )
                );
                return;
              }
              requestAnimationFrame(check);
            };

            check();
          }),
        finish: () => {
          cleanup();

          return {
            longTasks,
            longTasksSupported,
            rows: rows.map(
              ({
                expectedText: _expectedText,
                observedDOMText: _observedDOMText,
                paintScheduled: _paintScheduled,
                traceStartFrameId: _traceStartFrameId,
                ...row
              }) => row
            ),
          };
        },
      };
    },
    { handleKey: PLITE_BROWSER_HANDLE_KEY, traceKey }
  );

  try {
    for (const [index, key] of Array.from(text).entries()) {
      await page.keyboard.type(key, { delay });
      await root.evaluate(
        (
          _element,
          {
            expectedKey,
            expectedRowCount,
            traceKey,
          }: {
            expectedKey: string;
            expectedRowCount: number;
            traceKey: string;
          }
        ) => {
          const trace = (globalThis as Record<string, unknown>)[traceKey] as {
            waitForLatestReady(
              expectedRowCount: number,
              expectedKey: string
            ): Promise<void>;
          };

          return trace.waitForLatestReady(expectedRowCount, expectedKey);
        },
        { expectedKey: key, expectedRowCount: index + 1, traceKey }
      );
    }
    await root.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve());
            });
          });
        })
    );

    return await root.evaluate((_element, traceKey) => {
      const trace = (globalThis as Record<string, unknown>)[traceKey] as {
        finish(): PliteTrustedTypingResult;
      };

      return trace.finish();
    }, traceKey);
  } finally {
    await root
      .evaluate((_element, traceKey) => {
        const target = globalThis as Record<string, unknown>;
        const trace = target[traceKey] as
          | { cleanup(): void }
          | undefined;

        trace?.cleanup();
        delete target[traceKey];
      }, traceKey)
      .catch(() => {});
  }
};
