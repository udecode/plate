import { existsSync, writeFileSync } from 'node:fs';
import os from 'node:os';

import {
  BROWSER_HANDLE_KEY,
  openExample,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

import type { PliteBrowserHandle } from '../../../../packages/plitejs/src/react/editable/browser-handle';

test('measures Android-path plaintext composition draft and commit cost', async ({
  browser,
}, info) => {
  test.skip(
    process.env.PLITE_IME_COST !== '1',
    'Run the scoped IME cost probe explicitly.'
  );
  test.skip(info.project.name !== 'chromium', 'Chromium composition protocol');
  const output = process.env.PLITE_IME_COST_OUTPUT;
  if (!output) throw new Error('PLITE_IME_COST_OUTPUT is required');
  if (existsSync(output)) throw new Error('IME cost output already exists');
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    userAgent:
      'Mozilla/5.0 (Linux; Android 9; MI 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    viewport: { height: 720, width: 1280 },
  });
  const page = await context.newPage();
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  const client = await context.newCDPSession(page);
  const rows = [];
  const planted = process.env.PLITE_IME_COST_PLANTED === '1';
  const invalid = process.env.PLITE_IME_COST_INVALID === '1';
  const warmups = Number(process.env.PLITE_IME_COST_WARMUPS ?? 2);
  const samples = Number(process.env.PLITE_IME_COST_SAMPLES ?? 10);
  if (
    !Number.isInteger(warmups) ||
    warmups < 0 ||
    !Number.isInteger(samples) ||
    samples < 1
  ) {
    throw new Error(
      'IME cost samples must be positive and warmups non-negative integers'
    );
  }
  const drafts = ['ㅎ', '하', '한'];
  const savePartial = (evidence: unknown) => {
    writeFileSync(
      output,
      `${JSON.stringify(
        {
          recordedAt: new Date().toISOString(),
          status: 'partial',
          rows,
          evidence,
          errors: runtimeErrors.errors,
        },
        null,
        2
      )}\n`
    );
  };
  try {
    await client.send('Performance.enable');
    const servedBuild = await context.request.get('/.editor-proof-build.json');
    expect(servedBuild.ok()).toBe(true);
    expect(await servedBuild.json()).toMatchObject({
      fingerprint: process.env.PLITE_BROWSER_TARGET_FINGERPRINT,
    });
    const editor = await openExample(page, 'plite/plaintext', {
      ready: { editor: 'visible' },
    });
    const readDOMText = () =>
      editor.root.evaluate((element) => {
        const clone = element.cloneNode(true);
        if (!(clone instanceof HTMLElement)) {
          throw new Error('Missing plaintext clone');
        }
        for (const placeholder of clone.querySelectorAll(
          '[data-editor-placeholder], [contenteditable="false"]'
        )) {
          placeholder.remove();
        }
        return clone.textContent?.replaceAll('\uFEFF', '') ?? '';
      });
    await editor.ime.enableKeyEvents();
    const events = await page.evaluateHandle((slow) => {
      const entries: Array<{
        type: string;
        inputType: string | null;
        data: string | null;
        trusted: boolean;
        plantedMs: number;
        at: number;
      }> = [];
      const delay = (milliseconds: number) => {
        const until = performance.now() + milliseconds;
        while (performance.now() < until) Math.sqrt(performance.now());
      };
      for (const type of [
        'beforeinput',
        'compositionstart',
        'compositionend',
      ]) {
        window.addEventListener(
          type,
          (event) => {
            const at = performance.now();
            const inputType =
              event instanceof InputEvent ? event.inputType : null;
            const plantedMs = !slow
              ? 0
              : inputType === 'insertCompositionText'
                ? 8
                : type === 'compositionend'
                  ? 20
                  : 0;
            if (plantedMs) delay(plantedMs);
            entries.push({
              type,
              inputType,
              data:
                event instanceof InputEvent || event instanceof CompositionEvent
                  ? event.data
                  : null,
              trusted: event.isTrusted,
              plantedMs,
              at,
            });
          },
          true
        );
      }
      return entries;
    }, planted);
    const readMetrics = async () => {
      const { metrics } = await client.send('Performance.getMetrics');
      const value = (name: string) => {
        const metric = metrics.find((entry) => entry.name === name);
        if (!metric) throw new Error(`Missing CDP metric ${name}`);
        return metric.value;
      };
      return {
        cpuMs: value('TaskDuration') * 1000,
        scriptMs: value('ScriptDuration') * 1000,
        layoutMs: value('LayoutDuration') * 1000,
        styleMs: value('RecalcStyleDuration') * 1000,
        layouts: value('LayoutCount'),
        styles: value('RecalcStyleCount'),
      };
    };
    const settleFrame = () =>
      page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          })
      );
    for (const fixture of [
      { id: 'empty', text: '' },
      {
        id: 'line-end',
        text: 'This is editable plain text, just like a <textarea>!',
      },
    ]) {
      for (let sample = -warmups; sample < samples; sample++) {
        await editor.scenario.run('seed one plaintext paragraph', [
          {
            kind: 'applyValueChange',
            value: {
              children: [
                { type: 'paragraph', children: [{ text: fixture.text }] },
              ],
            },
          },
        ]);
        await editor.selection.collapse({
          path: [0, 0],
          offset: fixture.text.length,
        });
        await editor.focus();
        await settleFrame();
        const initial = await editor.root.evaluate((element, key) => {
          const handle = (
            element as HTMLElement & Record<string, PliteBrowserHandle>
          )[key];
          return {
            blocks: element.querySelectorAll('[data-editor-node="element"]')
              .length,
            domSync: element
              .querySelector('[data-editor-node="text"]')
              ?.getAttribute('data-editor-dom-sync'),
            domSyncReason: element
              .querySelector('[data-editor-node="text"]')
              ?.getAttribute('data-editor-dom-sync-reason'),
            lastCommit: handle.getLastCommit(),
            model: handle.getText(),
            modelLength: handle.getText().length,
            userAgent: navigator.userAgent,
          };
        }, BROWSER_HANDLE_KEY);
        savePartial({ fixture, initial });
        expect(initial).toMatchObject({
          blocks: 1,
          domSync: fixture.id === 'empty' ? null : 'true',
          domSyncReason: fixture.id === 'empty' ? 'empty-text' : null,
          model: fixture.text,
          modelLength: fixture.text.length,
        });
        expect(initial.userAgent).toContain('Android');
        for (const text of drafts) {
          const eventIndex = await events.evaluate((entries) => entries.length);
          const before = await readMetrics();
          const start = performance.now();
          await client.send('Input.imeSetComposition', {
            selectionEnd: text.length,
            selectionStart: text.length,
            text,
          });
          await settleFrame();
          const elapsedMs = performance.now() - start;
          const after = await readMetrics();
          const observed = await events.evaluate(
            (entries, index) => entries.slice(index),
            eventIndex
          );
          rows.push({
            cohort: `${fixture.id}-draft`,
            sample,
            text,
            elapsedMs,
            cpuMs: after.cpuMs - before.cpuMs,
            scriptMs: after.scriptMs - before.scriptMs,
            layoutMs: after.layoutMs - before.layoutMs,
            styleMs: after.styleMs - before.styleMs,
            layouts: after.layouts - before.layouts,
            styles: after.styles - before.styles,
          });
          savePartial({ fixture, observed });
          expect(
            observed.filter((event) => event.type === 'beforeinput')
          ).toMatchObject([
            {
              type: 'beforeinput',
              inputType: 'insertCompositionText',
              data: text,
              trusted: true,
              plantedMs: planted ? 8 : 0,
            },
          ]);
          expect(await editor.get.modelText()).toBe(fixture.text);
          expect(await editor.get.lastCommit()).toEqual(initial.lastCommit);
          expect(await readDOMText()).toBe(fixture.text + text);
          expect(
            await editor.root.evaluate((element) => {
              const selection = element.ownerDocument.getSelection();
              return {
                focus: element.ownerDocument.activeElement === element,
                offset: selection?.focusOffset,
                text: selection?.focusNode?.textContent,
              };
            })
          ).toEqual({
            focus: true,
            offset: fixture.text.length + text.length,
            text: fixture.text + text,
          });
        }
        const commitEventIndex = await events.evaluate(
          (entries) => entries.length
        );
        const before = await readMetrics();
        const start = performance.now();
        await client.send('Input.insertText', { text: invalid ? 'X' : '한' });
        await page.waitForTimeout(40);
        await settleFrame();
        const elapsedMs = performance.now() - start;
        const after = await readMetrics();
        const commitEvents = await events.evaluate(
          (entries, index) => entries.slice(index),
          commitEventIndex
        );
        rows.push({
          cohort: `${fixture.id}-commit`,
          sample,
          text: invalid ? 'X' : '한',
          elapsedMs,
          cpuMs: after.cpuMs - before.cpuMs,
          scriptMs: after.scriptMs - before.scriptMs,
          layoutMs: after.layoutMs - before.layoutMs,
          styleMs: after.styleMs - before.styleMs,
          layouts: after.layouts - before.layouts,
          styles: after.styles - before.styles,
        });
        savePartial({
          fixture,
          commitEvents,
          model: await editor.get.modelText(),
          dom: await readDOMText(),
        });
        expect(await editor.get.modelText()).toBe(`${fixture.text}한`);
        expect(
          commitEvents.filter((event) => event.type === 'compositionend')
        ).toMatchObject([
          {
            type: 'compositionend',
            data: invalid ? 'X' : '한',
            plantedMs: planted ? 20 : 0,
          },
        ]);
        await editor.assert.collapsedModelDOMSelection({
          path: [0, 0],
          offset: fixture.text.length + 1,
          text: `${fixture.text}한`,
        });
        expect(await readDOMText()).toBe(`${fixture.text}한`);
        await page.keyboard.type('!');
        await expect
          .poll(() => editor.get.modelText())
          .toBe(`${fixture.text}한!`);
        expect(await readDOMText()).toBe(`${fixture.text}한!`);
      }
    }
    runtimeErrors.assertNone();
    const results = [...new Set(rows.map((row) => row.cohort))].map(
      (cohort) => {
        const selected = rows.filter(
          (row) => row.cohort === cohort && row.sample >= 0
        );
        const sorted = selected.map((row) => row.cpuMs).sort((a, b) => a - b);
        return {
          cohort,
          meanCpuMs:
            selected.reduce((sum, row) => sum + row.cpuMs, 0) / selected.length,
          p50CpuMs: sorted[Math.ceil(sorted.length * 0.5) - 1],
          p95CpuMs: sorted[Math.ceil(sorted.length * 0.95) - 1],
          count: selected.length,
        };
      }
    );
    const receipt = {
      recordedAt: new Date().toISOString(),
      status: 'complete',
      route: '/examples/plite/plaintext',
      claim:
        'Desktop Chromium Android-path CPU cost proxy. CDP beforeinput is trusted; its compositionend is untrusted. Not handset or soft-keyboard latency.',
      browser: browser.version(),
      baseURL: process.env.PLAYWRIGHT_BASE_URL,
      targetFingerprint: process.env.PLITE_BROWSER_TARGET_FINGERPRINT,
      environment: {
        cores: os.cpus().length,
        load: os.loadavg(),
        node: process.version,
        platform: os.platform(),
      },
      warmups,
      samples,
      commitSettleMs: 40,
      planted,
      rows,
      results,
      events: await events.jsonValue(),
      errors: runtimeErrors.errors,
    };
    writeFileSync(output, `${JSON.stringify(receipt, null, 2)}\n`);
    await info.attach('ime-cost', {
      body: JSON.stringify(receipt),
      contentType: 'application/json',
    });
  } finally {
    await client.detach();
    runtimeErrors.stop();
    await context.close();
  }
});
