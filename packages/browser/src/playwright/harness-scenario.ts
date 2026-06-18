import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';
import { SLATE_BROWSER_HANDLE_KEY } from './constants';
import { dropHtml } from './dom-text';
import { clickTextOffset, mutateTextDOM } from './dom-text-actions';
import {
  getSlateReactRenderProfilerSnapshot,
  resetSlateReactRenderProfiler,
  type SlateReactRenderKind,
} from './render-profiler';
import { recordSlateBrowserRuntimeErrors } from './runtime-errors';
import {
  createScenarioReductionCandidates,
  createScenarioReplay,
  normalizeScenarioMetadata,
  summarizeScenarioReductionCandidate,
} from './scenario-replay';
import { dragTextSelection } from './selection-actions';
import { assertSlateBrowserSelectionContract } from './selection-contract';
import { hasExpandedSelection } from './selection-handle';
import { assertDOMCaretExpectation } from './selection-snapshots';
import type { SurfaceTarget } from './surface';
import type {
  SlateBrowserEditorHarness,
  SlateBrowserTraceEntry,
} from './types';

const assertNumberBudget = (
  actual: number,
  expected: { exact?: number; max?: number; min?: number } | number,
  label: string
) => {
  if (typeof expected === 'number') {
    expect(actual, label).toBe(expected);
    return;
  }

  if (expected.exact !== undefined) {
    expect(actual, label).toBe(expected.exact);
  }
  if (expected.min !== undefined) {
    expect(actual, label).toBeGreaterThanOrEqual(expected.min);
  }
  if (expected.max !== undefined) {
    expect(actual, label).toBeLessThanOrEqual(expected.max);
  }
};

export const createEditorHarnessScenario = ({
  getHarness,
  page,
  root,
  surface,
}: {
  getHarness: () => SlateBrowserEditorHarness;
  page: Page;
  root: Locator;
  surface: SurfaceTarget;
}): SlateBrowserEditorHarness['scenario'] => ({
  run: async (scenarioName, steps, options = {}) => {
    const trace: SlateBrowserTraceEntry[] = [];
    const capturedRuntimeIds = new Map<string, string>();
    const runtimeErrors =
      options.runtimeErrors === false
        ? null
        : recordSlateBrowserRuntimeErrors(page, options.runtimeErrors);

    try {
      for (const [stepIndex, step] of steps.entries()) {
        switch (step.kind) {
          case 'applyOperations':
            await root.evaluate(
              (
                element: HTMLElement,
                {
                  key,
                  operations,
                  tag,
                }: {
                  key: string;
                  operations: readonly Record<string, unknown>[];
                  tag?: string | string[];
                }
              ) => {
                const handle = (element as Record<string, any>)[key];

                if (!handle?.applyOperations) {
                  throw new Error(
                    'This editor surface does not expose applyOperations'
                  );
                }

                handle.applyOperations(operations, { tag });
              },
              {
                key: SLATE_BROWSER_HANDLE_KEY,
                operations: step.operations,
                tag: step.tag,
              }
            );
            break;
          case 'activateShell': {
            const shell = page.getByRole('button', {
              name: step.buttonName,
            });

            await shell.focus();
            await expect(shell).toBeFocused();
            await shell.press('Enter');
            await expect(shell).toHaveCount(0);
            await expect
              .poll(() =>
                root.evaluate(
                  (element: HTMLElement, { key }: { key: string }) => {
                    const handle = (element as Record<string, any>)[key];

                    return handle?.getSelection ? handle.getSelection() : null;
                  },
                  { key: SLATE_BROWSER_HANDLE_KEY }
                )
              )
              .toEqual(step.expectedSelection);
            break;
          }
          case 'assertLocatorCount': {
            const locator = page.locator(step.selector);

            if (step.count !== undefined) {
              await expect(locator).toHaveCount(step.count);
              break;
            }

            await expect
              .poll(async () => {
                const count = await locator.count();

                if (step.min !== undefined && count < step.min) {
                  return false;
                }
                if (step.max !== undefined && count > step.max) {
                  return false;
                }

                return true;
              })
              .toBe(true);
            break;
          }
          case 'assertLocatorCss': {
            const locator = page.locator(step.selector).nth(step.index ?? 0);

            if (step.value !== undefined) {
              await expect(locator).toHaveCSS(step.property, step.value);
            }
            if (step.notValue !== undefined) {
              await expect(locator).not.toHaveCSS(step.property, step.notValue);
            }
            break;
          }
          case 'assertLocatorVerticalGap': {
            const gap = await page
              .locator(step.beforeSelector)
              .first()
              .evaluate(
                (
                  before: Element,
                  {
                    afterSelector,
                  }: {
                    afterSelector: string;
                  }
                ) => {
                  const after = before.ownerDocument
                    .querySelector(afterSelector)
                    ?.getBoundingClientRect();

                  if (!after) {
                    throw new Error(`Missing after element: ${afterSelector}`);
                  }

                  return after.top - before.getBoundingClientRect().bottom;
                },
                { afterSelector: step.afterSelector }
              );

            assertNumberBudget(
              gap,
              { max: step.max, min: step.min },
              'locator vertical gap'
            );
            break;
          }
          case 'assertLocatorVerticalOffset': {
            const offset = await page
              .locator(step.selector)
              .first()
              .evaluate(
                (
                  element: Element,
                  {
                    innerSelector,
                  }: {
                    innerSelector: string;
                  }
                ) => {
                  const inner = element
                    .querySelector(innerSelector)
                    ?.getBoundingClientRect();

                  if (!inner) {
                    throw new Error(`Missing inner element: ${innerSelector}`);
                  }

                  return inner.top - element.getBoundingClientRect().top;
                },
                { innerSelector: step.innerSelector }
              );

            assertNumberBudget(
              offset,
              { max: step.max, min: step.min },
              'locator vertical offset'
            );
            break;
          }
          case 'assertModelSelectionExpanded':
            await expect
              .poll(async () =>
                hasExpandedSelection(await getHarness().selection.get())
              )
              .toBe(true);
            break;
          case 'assertCapturedRuntimeIdPath': {
            const runtimeId = capturedRuntimeIds.get(step.name);

            if (!runtimeId) {
              throw new Error(`No captured runtime id named "${step.name}"`);
            }

            await expect
              .poll(() =>
                root.evaluate(
                  (
                    element: HTMLElement,
                    { key, runtimeId }: { key: string; runtimeId: string }
                  ) => {
                    const handle = (element as Record<string, any>)[key];

                    if (!handle?.getPathByRuntimeId) {
                      throw new Error(
                        'This editor surface does not expose getPathByRuntimeId'
                      );
                    }

                    return handle.getPathByRuntimeId(runtimeId);
                  },
                  { key: SLATE_BROWSER_HANDLE_KEY, runtimeId }
                )
              )
              .toEqual(step.path);
            break;
          }
          case 'assertRenderBudget': {
            const snapshot = await getSlateReactRenderProfilerSnapshot(page);
            const budgetLabel = (label: string) =>
              `${label} ${JSON.stringify({
                byKey: snapshot.byKey,
                byKind: snapshot.byKind,
                events: snapshot.events,
              })}`;

            if (step.budget.total !== undefined) {
              assertNumberBudget(
                snapshot.total,
                step.budget.total,
                budgetLabel('render total')
              );
            }

            for (const [kind, expected] of Object.entries(
              step.budget.byKind ?? {}
            ) as [
              SlateReactRenderKind,
              { exact?: number; max?: number; min?: number } | number,
            ][]) {
              assertNumberBudget(
                snapshot.byKind[kind] ?? 0,
                expected,
                budgetLabel(`render kind ${kind}`)
              );
            }
            break;
          }
          case 'assertWindowSelectionText': {
            const text = await page.evaluate(
              () => window.getSelection()?.toString() ?? ''
            );

            if (step.notEmpty) {
              expect(text).not.toBe('');
            }
            if (step.text !== undefined) {
              expect(text).toBe(step.text);
            }
            if (step.contains !== undefined) {
              expect(text).toContain(step.contains);
            }
            break;
          }
          case 'assertDOMCaret':
            await assertDOMCaretExpectation(root, step);
            break;
          case 'assertBlockTexts':
            {
              const actualBlockTexts = (
                await getHarness().get.blockTexts()
              ).slice(step.startIndex ?? 0);

              expect(
                actualBlockTexts,
                JSON.stringify({
                  actualBlockTexts,
                  domSelection: await getHarness().get.domSelection(),
                  expectedBlockTexts: step.texts,
                  inputState: await root.evaluate(
                    (element: HTMLElement, { key }: { key: string }) => {
                      const handle = (element as Record<string, any>)[key];

                      return handle?.getInputState?.() ?? null;
                    },
                    { key: SLATE_BROWSER_HANDLE_KEY }
                  ),
                  kernelTrace: await getHarness().get.kernelTrace(),
                  selection: await getHarness().selection.get(),
                })
              ).toEqual(step.texts);
            }
            break;
          case 'assertRenderedDOMShape':
            await getHarness().assert.renderedDOMShape(step.shape);
            break;
          case 'assertDOMSelection':
            await getHarness().assert.domSelection(step.selection);
            break;
          case 'assertFocusOwner':
            await getHarness().assert.focusOwner(step.focusOwner);
            break;
          case 'assertKernelTrace':
            await getHarness().assert.kernelTrace(step.trace);
            break;
          case 'assertLastCommit':
            await expect.poll(() => getHarness().get.lastCommit()).toBeTruthy();
            break;
          case 'assertLastCommitTags': {
            await expect
              .poll(async () => {
                const lastCommit = (await getHarness().get.lastCommit()) as {
                  tags?: readonly string[];
                } | null;

                return lastCommit?.tags;
              })
              .toEqual(step.tags);
            break;
          }
          case 'assertLastCommitCommand': {
            await expect
              .poll(async () => {
                const lastCommit = (await getHarness().get.lastCommit()) as {
                  command?: { origin?: string; type?: string } | null;
                } | null;

                return lastCommit?.command;
              })
              .toEqual(step.command);
            break;
          }
          case 'assertModelText':
            await expect
              .poll(() => getHarness().get.modelText())
              .toContain(step.text);
            break;
          case 'assertLocatorText': {
            const locator = page.locator(step.selector).first();
            const getText = async () =>
              ((await locator.textContent()) ?? '').replace(/\uFEFF/g, '');

            if (step.text !== undefined) {
              await expect.poll(getText).toBe(step.text);
            }
            if (step.contains !== undefined) {
              await expect.poll(getText).toContain(step.contains);
            }
            break;
          }
          case 'assertSelection':
            await getHarness().assert.selection(step.selection);
            break;
          case 'assertSelectionContract':
            await assertSlateBrowserSelectionContract(
              getHarness(),
              step.expectation
            );
            break;
          case 'assertSelectionLocation':
            await expect
              .poll(() => getHarness().selection.location())
              .toMatchObject(step.location);
            break;
          case 'assertSelectedText':
            await expect
              .poll(() => getHarness().get.selectedText())
              .toBe(step.text);
            break;
          case 'assertText':
            await getHarness().assert.text(step.text);
            break;
          case 'clickTestId':
            await page.getByTestId(step.testId).click();
            break;
          case 'clickSelector':
            await page.locator(step.selector).first().click();
            break;
          case 'captureRuntimeId': {
            const runtimeId = await root.evaluate(
              (
                element: HTMLElement,
                { key, path }: { key: string; path: number[] }
              ) => {
                const handle = (element as Record<string, any>)[key];

                if (!handle?.getRuntimeId) {
                  throw new Error(
                    'This editor surface does not expose getRuntimeId'
                  );
                }

                return handle.getRuntimeId(path);
              },
              { key: SLATE_BROWSER_HANDLE_KEY, path: step.path }
            );

            if (!runtimeId) {
              throw new Error(
                `Could not capture runtime id for ${step.path.join('.')}`
              );
            }

            capturedRuntimeIds.set(step.name, runtimeId);
            break;
          }
          case 'composeText':
            await getHarness().ime.compose({
              committedText: step.committedText,
              steps: step.steps,
              text: step.text,
              transport: step.transport,
            });
            break;
          case 'custom':
            await step.run(getHarness());
            break;
          case 'deleteBackward':
            await getHarness().deleteBackward();
            break;
          case 'deleteForward':
            await getHarness().deleteForward();
            break;
          case 'dragTextSelection':
            await dragTextSelection(page, step);
            break;
          case 'clickTextOffset':
            await clickTextOffset(root, step.path, step.offset);
            break;
          case 'doubleClickTextOffset':
            if (step.selectedText === undefined) {
              await clickTextOffset(root, step.path, step.offset, {
                clickCount: 2,
              });
            } else {
              const retryDelayMs = 650;
              let lastError: unknown = null;

              for (let attempt = 0; attempt < 3; attempt++) {
                await clickTextOffset(root, step.path, step.offset, {
                  clickCount: 2,
                });

                try {
                  await expect
                    .poll(() => getHarness().get.selectedText(), {
                      timeout: 1500,
                    })
                    .toBe(step.selectedText);
                  lastError = null;
                  break;
                } catch (error) {
                  lastError = error;

                  // Firefox can fold rapid repeated double-click attempts
                  // into one multi-click gesture. Wait past that window
                  // before retrying the proof gesture.
                  if (attempt < 2) {
                    await root.page().waitForTimeout(retryDelayMs);
                  }
                }
              }

              if (lastError) {
                const displayedSelection =
                  await getHarness().selection.displayed();
                const windowSelectionText = await page.evaluate(
                  () => window.getSelection()?.toString() ?? ''
                );
                const selectedText = await getHarness().get.selectedText();
                const selection = await getHarness().selection.get();
                const domSelection = await getHarness().get.domSelection();

                throw new Error(
                  `Double-click text selection did not settle on ${JSON.stringify(
                    step.selectedText
                  )}.\nSelected text: ${JSON.stringify(
                    selectedText
                  )}\nWindow selection text: ${JSON.stringify(
                    windowSelectionText
                  )}\nSelection: ${JSON.stringify(
                    selection
                  )}\nDOM selection: ${JSON.stringify(
                    domSelection
                  )}\nDisplayed selection: ${JSON.stringify(
                    displayedSelection
                  )}\n${lastError instanceof Error ? lastError.message : String(lastError)}`
                );
              }
            }
            break;
          case 'dropHtml':
            await dropHtml(surface, root, step.html, step.text);
            break;
          case 'fillControl': {
            const control = page.locator(step.selector).first();

            await control.fill(step.value);
            await expect(control).toHaveValue(step.value);
            break;
          }
          case 'focus':
            await getHarness().focus();
            break;
          case 'insertText':
            await getHarness().insertText(step.text);
            break;
          case 'mutateTextDOM':
            await mutateTextDOM(root, step);
            break;
          case 'pasteHtml':
            await getHarness().clipboard.pasteHtml(step.html, step.text);
            break;
          case 'pasteText':
            await getHarness().clipboard.pasteText(step.text);
            break;
          case 'press':
            await getHarness().press(step.key);
            break;
          case 'rootClick':
            await getHarness().click();
            break;
          case 'rootMouseDown':
            await root.dispatchEvent('mousedown');
            break;
          case 'resetRenderProfiler':
            await resetSlateReactRenderProfiler(page);
            break;
          case 'select':
            await getHarness().selection.select(step.selection);
            break;
          case 'selectDOM':
            await getHarness().selection.selectDOM(step.selection);
            break;
          case 'selectAll':
            await getHarness().selection.selectAll();
            break;
          case 'settle':
            await page.waitForTimeout(0);
            await page.evaluate(
              () =>
                new Promise<void>((resolve) => {
                  requestAnimationFrame(() => resolve());
                })
            );
            await page.waitForTimeout(step.timeoutMs ?? 25);
            break;
          case 'snapshot':
            break;
          case 'typeThenUndo': {
            await getHarness().type(step.text);
            await assertDOMCaretExpectation(root, step.caretAfterType);
            await expect
              .poll(() => getHarness().get.modelText())
              .toContain(step.expectedModelTextAfterType);

            const hotkey = await page.evaluate(() =>
              navigator.userAgent.includes('Mac OS X') ? 'Meta+Z' : 'Control+Z'
            );

            await getHarness().press(hotkey);
            await assertDOMCaretExpectation(root, step.caretAfterUndo);
            await expect
              .poll(() => getHarness().get.modelText())
              .toContain(step.expectedModelTextAfterUndo);
            break;
          }
          case 'type':
            await getHarness().type(step.text);
            break;
          case 'undo': {
            if (step.expectedModelTextBefore) {
              await expect
                .poll(() => getHarness().get.modelText())
                .toContain(step.expectedModelTextBefore);
            }

            const hotkey = await page.evaluate(() =>
              navigator.userAgent.includes('Mac OS X') ? 'Meta+Z' : 'Control+Z'
            );

            await getHarness().press(hotkey);
            break;
          }
        }

        runtimeErrors?.assertNone();
        trace.push(
          await getHarness().trace.snapshot(step.label ?? step.kind, stepIndex)
        );
      }

      const result = {
        metadata: normalizeScenarioMetadata(options.metadata),
        name: scenarioName,
        replay: createScenarioReplay(steps),
        reductionCandidates: createScenarioReductionCandidates(steps).map(
          summarizeScenarioReductionCandidate
        ),
        trace,
      };

      if (options.tracePath) {
        mkdirSync(dirname(options.tracePath), { recursive: true });
        writeFileSync(options.tracePath, JSON.stringify(result, null, 2));
      }

      return result;
    } finally {
      runtimeErrors?.stop();
    }
  },
});
