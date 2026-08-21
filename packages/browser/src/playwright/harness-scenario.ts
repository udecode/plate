import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { expect, type Locator, type Page } from '@playwright/test';

import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import { dropHtml } from './dom-text';
import { clickTextOffset, mutateTextDOM } from './dom-text-actions';
import {
  getPliteReactRenderProfilerSnapshot,
  resetPliteReactRenderProfiler,
  type PliteReactRenderKind,
} from './render-profiler';
import { recordPliteBrowserRuntimeErrors } from './runtime-errors';
import {
  createScenarioReductionCandidates,
  createScenarioReplay,
  normalizeScenarioMetadata,
  summarizeScenarioReductionCandidate,
} from './scenario-replay';
import { dragTextSelection } from './selection-actions';
import { assertPliteBrowserSelectionContract } from './selection-contract';
import { hasExpandedSelection } from './selection-handle';
import { assertDOMCaretExpectation } from './selection-snapshots';
import type { SurfaceTarget } from './surface';
import type {
  PliteBrowserEditorHarness,
  PliteBrowserNumberBudget,
  PliteBrowserTraceEntry,
} from './types';

const assertNumberBudget = (
  actual: number,
  expected: PliteBrowserNumberBudget,
  label: string
) => {
  if (typeof expected === 'number') {
    expect(actual, label).toBe(expected);
    return;
  }

  if (
    expected.exact === undefined &&
    expected.min === undefined &&
    expected.max === undefined
  ) {
    throw new TypeError(`${label} budget must contain an expectation.`);
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
  getHarness: () => PliteBrowserEditorHarness;
  page: Page;
  root: Locator;
  surface: SurfaceTarget;
}): PliteBrowserEditorHarness['scenario'] => ({
  runImperative: async (scenarioName, run) => {
    if (scenarioName.length === 0) {
      throw new Error('Imperative browser scenario name cannot be empty.');
    }

    const steps: PliteBrowserTraceEntry[] = [];

    await run(
      Object.freeze({
        step: async (label, action) => {
          if (label.length === 0) {
            throw new Error(
              'Imperative browser scenario step label cannot be empty.'
            );
          }

          await action();
          steps.push(await getHarness().trace.snapshot(label, steps.length));
        },
      })
    );

    return Object.freeze({
      kind: 'imperative-scenario',
      name: scenarioName,
      reducible: false,
      releaseGateCapable: false,
      replayable: false,
      steps: Object.freeze(steps),
    });
  },
  run: async (scenarioName, steps, options = {}) => {
    const replay = createScenarioReplay(steps);
    const reductionCandidates = createScenarioReductionCandidates(steps).map(
      summarizeScenarioReductionCandidate
    );
    const trace: PliteBrowserTraceEntry[] = [];
    const capturedNodeKeys = new Map<string, string>();
    const runtimeErrors =
      options.runtimeErrors === false
        ? null
        : recordPliteBrowserRuntimeErrors(page, options.runtimeErrors);
    const undoWithScenarioTransport = async () => {
      if (options.metadata?.platform === 'mobile') {
        await getHarness().undo();
        return;
      }

      const hotkey = await page.evaluate(() =>
        /Mac|iPad|iPhone|iPod/.test(navigator.platform) ||
        navigator.userAgent.includes('Mac OS X')
          ? 'Meta+Z'
          : 'Control+Z'
      );

      await getHarness().press(hotkey);
    };

    try {
      for (const [stepIndex, step] of steps.entries()) {
        switch (step.kind) {
          case 'applyChange':
            await root.evaluate(
              (
                element: HTMLElement,
                {
                  change,
                  key,
                  tag,
                }: {
                  change: Record<string, unknown>;
                  key: string;
                  tag?: string | string[];
                }
              ) => {
                const handle = (element as Record<string, any>)[key];

                if (!handle?.applyChange) {
                  throw new Error(
                    'This editor surface does not expose applyChange'
                  );
                }

                handle.applyChange(
                  change,
                  tag === undefined ? undefined : { tags: tag }
                );
              },
              {
                change: step.change,
                key: PLITE_BROWSER_HANDLE_KEY,
                tag: step.tag,
              }
            );
            break;
          case 'applyValueChange':
            await root.evaluate(
              (
                element: HTMLElement,
                {
                  key,
                  tag,
                  value,
                }: {
                  key: string;
                  tag?: string | string[];
                  value: Record<string, unknown>;
                }
              ) => {
                const handle = (element as Record<string, any>)[key];

                if (!handle?.applyValueChange) {
                  throw new Error(
                    'This editor surface does not expose applyValueChange'
                  );
                }

                handle.applyValueChange(
                  value,
                  tag === undefined ? undefined : { tags: tag }
                );
              },
              {
                key: PLITE_BROWSER_HANDLE_KEY,
                tag: step.tag,
                value: step.value,
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
                  { key: PLITE_BROWSER_HANDLE_KEY }
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

            if (step.max !== undefined) {
              assertNumberBudget(
                gap,
                step.min === undefined
                  ? { max: step.max }
                  : { max: step.max, min: step.min },
                'locator vertical gap'
              );
            } else if (step.min !== undefined) {
              assertNumberBudget(
                gap,
                { min: step.min },
                'locator vertical gap'
              );
            } else {
              throw new TypeError(
                'locator vertical gap must contain an expectation.'
              );
            }
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

            if (step.max !== undefined) {
              assertNumberBudget(
                offset,
                step.min === undefined
                  ? { max: step.max }
                  : { max: step.max, min: step.min },
                'locator vertical offset'
              );
            } else if (step.min !== undefined) {
              assertNumberBudget(
                offset,
                { min: step.min },
                'locator vertical offset'
              );
            } else {
              throw new TypeError(
                'locator vertical offset must contain an expectation.'
              );
            }
            break;
          }
          case 'assertModelSelectionExpanded':
            await expect
              .poll(async () =>
                hasExpandedSelection(await getHarness().selection.get())
              )
              .toBe(true);
            break;
          case 'assertCapturedNodeKeyPath': {
            const nodeKey = capturedNodeKeys.get(step.name);

            if (!nodeKey) {
              throw new Error(`No captured node key named "${step.name}"`);
            }

            await expect
              .poll(() =>
                root.evaluate(
                  (
                    element: HTMLElement,
                    { key, nodeKey }: { key: string; nodeKey: string }
                  ) => {
                    const handle = (element as Record<string, any>)[key];

                    if (!handle?.getPathByNodeKey) {
                      throw new Error(
                        'This editor surface does not expose getPathByNodeKey'
                      );
                    }

                    return handle.getPathByNodeKey(nodeKey);
                  },
                  { key: PLITE_BROWSER_HANDLE_KEY, nodeKey }
                )
              )
              .toEqual(step.path);
            break;
          }
          case 'assertRenderBudget': {
            const snapshot = await getPliteReactRenderProfilerSnapshot(page);
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
            ) as [PliteReactRenderKind, PliteBrowserNumberBudget][]) {
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
                    { key: PLITE_BROWSER_HANDLE_KEY }
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
          case 'assertLastCommitIncludesTags': {
            await expect
              .poll(async () => {
                const lastCommit = (await getHarness().get.lastCommit()) as {
                  tags?: readonly string[];
                } | null;

                return step.tags.every((tag) =>
                  lastCommit?.tags?.includes(tag)
                );
              })
              .toBe(true);
            break;
          }
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
            await assertPliteBrowserSelectionContract(
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
          case 'captureNodeKey': {
            const nodeKey = await root.evaluate(
              (
                element: HTMLElement,
                { key, path }: { key: string; path: number[] }
              ) => {
                const handle = (element as Record<string, any>)[key];

                if (!handle?.getNodeKey) {
                  throw new Error(
                    'This editor surface does not expose getNodeKey'
                  );
                }

                return handle.getNodeKey(path);
              },
              { key: PLITE_BROWSER_HANDLE_KEY, path: step.path }
            );

            if (!nodeKey) {
              throw new Error(
                `Could not capture node key for ${step.path.join('.')}`
              );
            }

            capturedNodeKeys.set(step.name, nodeKey);
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
            await resetPliteReactRenderProfiler(page);
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

            await undoWithScenarioTransport();
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

            await undoWithScenarioTransport();
            break;
          }
          default: {
            const unsupportedStep = step as { kind?: unknown };

            throw new TypeError(
              `Unsupported browser scenario step: ${JSON.stringify(
                unsupportedStep.kind
              )}`
            );
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
        replay,
        reductionCandidates,
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
