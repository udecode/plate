import type { Locator, Page } from '@playwright/test';

import { BROWSER_HANDLE_KEY } from './constants';

/** One trusted printable-key timing row captured from the editable root. */
export type TrustedTypingRow = {
  beforeInput?: number;
  beforeInputDataMatched?: boolean;
  domReady?: number;
  domSelectionInsertionMatched?: boolean;
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
  root?: string;
  runtimeTargetMatched?: boolean;
  trustedBeforeInput?: boolean;
  trustedInput?: boolean;
  trustedKey: boolean;
};

/** Trusted typing rows and long tasks captured during one measured burst. */
export type TrustedTypingResult = {
  longTasks: number[];
  longTasksSupported: boolean;
  rows: TrustedTypingRow[];
};

const TRACE_KEY_PREFIX = '__plateTrustedTypingTrace';
let traceSequence = 0;

/** Measure trusted keydown, exact DOM readiness, paint, and long tasks. */
export const measureTrustedTyping = async ({
  delay = 0,
  page,
  root,
  text,
}: {
  delay?: number;
  page: Page;
  root: Locator;
  text: string;
}): Promise<TrustedTypingResult> => {
  const traceKey = `${TRACE_KEY_PREFIX}:${(traceSequence += 1) - 1}`;

  await root.evaluate(
    (element, { handleKey, traceKey: innerTraceKey }) => {
      const rows: Array<
        TrustedTypingRow & {
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
              anchor: { offset: number; path: number[]; root?: string };
              focus: { offset: number; path: number[]; root?: string };
            } | null;
            getKernelTrace(): Array<{
              command: { kind?: string; text?: string } | null;
              eventFamily: string;
              frameId: number | null;
              ownership: string;
              selectionBefore: {
                anchor: { offset: number; path: number[]; root?: string };
                focus: { offset: number; path: number[]; root?: string };
                kind: 'text';
              } | null;
            }>;
            getNodeKey(path: readonly number[]): string | null;
            getText(path?: readonly number[]): string;
          }
        | undefined;
      const pathsEqual = (left: readonly number[], right: readonly number[]) =>
        left.length === right.length &&
        left.every((part, index) => part === right[index]);
      const readModelText = (path: readonly number[]) =>
        handle?.getText(path) ?? null;
      const readDOMText = (path: readonly number[]) => {
        const nodeKey = handle?.getNodeKey(path);
        if (!nodeKey) return null;
        const textHosts = Array.from(
          element.querySelectorAll<HTMLElement>(
            `[data-editor-node="text"][data-editor-node-key="${CSS.escape(nodeKey)}"]`
          )
        ).filter(
          (candidate) =>
            candidate.getAttribute('data-editor-path') === path.join(',') &&
            !candidate.hasAttribute('data-editor-retained')
        );

        if (textHosts.length === 0) return null;

        return textHosts
          .flatMap((textHost) => {
            const leaves = Array.from(
              textHost.querySelectorAll<HTMLElement>('[data-editor-leaf]')
            ).filter(
              (leaf) => leaf.closest('[data-editor-node="text"]') === textHost
            );
            return (leaves.length ? leaves : [textHost]).map((leaf) => {
              const walker = element.ownerDocument.createTreeWalker(
                leaf,
                NodeFilter.SHOW_TEXT
              );
              let visibleText = '';
              let current: Node | null;
              while ((current = walker.nextNode())) {
                if (
                  current.parentElement?.closest(
                    '[data-editor-node="text"]'
                  ) === textHost
                ) {
                  visibleText += current.textContent ?? '';
                }
              }
              return {
                start: Number(leaf.getAttribute('data-editor-leaf-start') ?? 0),
                text: visibleText,
              };
            });
          })
          .sort((left, right) => left.start - right.start)
          .map((leaf) => leaf.text)
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
          '[data-editor-node="text"]'
        );
        const leaf = anchorElement?.closest<HTMLElement>('[data-editor-leaf]');
        const path = textHost
          ?.getAttribute('data-editor-path')
          ?.split(',')
          .map((part) => Number.parseInt(part, 10));

        if (
          !textHost ||
          !element.contains(textHost) ||
          textHost.hasAttribute('data-editor-retained') ||
          !path?.every(Number.isFinite)
        ) {
          return null;
        }
        const range = element.ownerDocument.createRange();

        range.selectNodeContents(leaf ?? textHost);
        range.setEnd(container, offset);

        return {
          offset:
            Number(leaf?.getAttribute('data-editor-leaf-start') ?? 0) +
            range.toString().replaceAll('\uFEFF', '').length,
          path,
        };
      };
      const insertionIsExact = (row: (typeof rows)[number]) => {
        if (!row.expectedText || row.offset == null || !row.path) {
          return false;
        }

        const rowPath = row.path;

        row.observedDOMText = readDOMText(rowPath);
        const modelText = readModelText(rowPath);
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
            entry.selectionBefore.anchor.root === row.root &&
            entry.selectionBefore.focus.root === row.root &&
            pathsEqual(entry.selectionBefore.anchor.path, rowPath) &&
            pathsEqual(entry.selectionBefore.focus.path, rowPath) &&
            entry.selectionBefore.anchor.offset === row.offset &&
            entry.selectionBefore.focus.offset === row.offset
        );
        const nextOffset = row.offset + row.key.length;
        const selectionRoot = element.getRootNode() as Document | ShadowRoot;
        const native =
          'getSelection' in selectionRoot
            ? selectionRoot.getSelection()
            : element.ownerDocument.getSelection();
        const anchor = native?.anchorNode
          ? resolveDOMPoint(native.anchorNode, native.anchorOffset)
          : null;
        const focus = native?.focusNode
          ? resolveDOMPoint(native.focusNode, native.focusOffset)
          : null;
        row.domSelectionInsertionMatched = Boolean(
          native?.isCollapsed &&
          anchor &&
          focus &&
          pathsEqual(anchor.path, rowPath) &&
          pathsEqual(focus.path, rowPath) &&
          anchor.offset === nextOffset &&
          focus.offset === nextOffset &&
          selectionRoot.activeElement === element
        );

        row.inputOwnership = runtimeEvent?.ownership;
        row.runtimeTargetMatched = runtimeEvent != null;
        row.domTextInsertionMatched = row.observedDOMText === row.expectedText;
        row.modelTextInsertionMatched =
          modelText === row.expectedText &&
          selection != null &&
          selection.anchor.root === row.root &&
          selection.focus.root === row.root &&
          pathsEqual(selection.anchor.path, rowPath) &&
          pathsEqual(selection.focus.path, rowPath) &&
          selection.anchor.offset === nextOffset &&
          selection.focus.offset === nextOffset;

        return Boolean(
          runtimeEvent &&
          row.domTextInsertionMatched &&
          row.modelTextInsertionMatched &&
          row.domSelectionInsertionMatched
        );
      };
      const markReadyIfExact = (row: (typeof rows)[number]) => {
        if (row.paintScheduled || row.paint !== undefined) return;
        if (insertionIsExact(row)) {
          row.domReady = performance.now();
          row.paintScheduled = true;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              row.paintScheduled = false;
              if (insertionIsExact(row)) row.paint = performance.now();
              else row.domReady = undefined;
            });
          });
        }
      };
      const onKeyDown = (event: Event) => {
        const keydown = performance.now();
        const keyboardEvent = event as KeyboardEvent;

        if (Array.from(keyboardEvent.key).length !== 1) return;
        const traceStartFrameId = getLatestTraceFrameId();

        const selection = handle?.getSelection();
        const isCollapsedSelection =
          selection != null &&
          selection.anchor.root === selection.focus.root &&
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
          keydown,
          offset,
          path: path ? [...path] : undefined,
          root: selection?.anchor.root,
          traceStartFrameId,
          trustedKey: keyboardEvent.isTrusted,
        };

        rows.push(row);
      };
      const findPendingRow = (field: keyof TrustedTypingRow) =>
        rows.findLast((row) => row[field] === undefined);
      const onBeforeInput = (event: Event) => {
        const row = findPendingRow('beforeInput');

        if (!row) return;
        const inputEvent = event as InputEvent;
        row.beforeInput = performance.now();
        row.beforeInputDataMatched =
          inputEvent.inputType === 'insertText' && inputEvent.data === row.key;
        const selection = handle?.getSelection();

        row.modelSelectionMatched =
          row.path != null &&
          row.offset != null &&
          selection != null &&
          selection.anchor.root === row.root &&
          selection.focus.root === row.root &&
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
          inputEvent.inputType === 'insertText' && inputEvent.data === row.key;
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
            longTasks.push(...list.getEntries().map((entry) => entry.duration));
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
      (globalThis as Record<string, unknown>)[innerTraceKey] = {
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
              if (row?.key === expectedKey && row.paint !== undefined) {
                resolve();
                return;
              }
              if (performance.now() - startedAt >= 1000) {
                const renderProfile = (globalThis as Record<string, unknown>)
                  .__EDITOR_REACT_RENDER_PROFILER_SNAPSHOT__ as
                  | (() => unknown)
                  | undefined;
                const domTextHosts = Array.from(
                  element.ownerDocument.querySelectorAll<HTMLElement>(
                    '[data-editor-node="text"]'
                  )
                ).map((textHost) => ({
                  editorRootId:
                    textHost.closest('[data-editor]')?.getAttribute('id') ??
                    null,
                  insideMeasuredRoot: element.contains(textHost),
                  nodeKey: textHost.getAttribute('data-editor-node-key'),
                  path: textHost.getAttribute('data-editor-path'),
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
    { handleKey: BROWSER_HANDLE_KEY, traceKey }
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
            traceKey: innerTraceKey2,
          }: {
            expectedKey: string;
            expectedRowCount: number;
            traceKey: string;
          }
        ) => {
          const trace = (globalThis as Record<string, unknown>)[
            innerTraceKey2
          ] as {
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

    return await root.evaluate((_element, innerTraceKey3) => {
      const trace = (globalThis as Record<string, unknown>)[innerTraceKey3] as {
        finish(): TrustedTypingResult;
      };

      return trace.finish();
    }, traceKey);
  } finally {
    await root
      .evaluate((_element, innerTraceKey4) => {
        const target = globalThis as Record<string, unknown>;
        const trace = target[innerTraceKey4] as { cleanup(): void } | undefined;

        trace?.cleanup();
        delete target[innerTraceKey4];
      }, traceKey)
      .catch(() => {});
  }
};
