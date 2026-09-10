import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

// Explicit diagnostic lane. Ordinary browser regression never runs benchmarks.
const sizes = (process.env.AI_STREAM_BYTES ?? '1024,10240,102400,1048576')
  .split(',')
  .map(Number);
const chunks = (process.env.AI_STREAM_CHUNKS ?? '1,16,128')
  .split(',')
  .map(Number);
const shapes = (
  process.env.AI_STREAM_SHAPES ??
  'paragraphs,single,code,math,table,mdx,reference'
).split(',');
const backgrounds = (process.env.AI_STREAM_BACKGROUNDS ?? '0')
  .split(',')
  .map(Number);
const modes = (process.env.AI_STREAM_MODES ?? 'insert,edit,dialog').split(',');

test.describe('AI operation browser timing', () => {
  test.skip(process.env.AI_STREAM_PERF !== '1', 'Explicit performance lane');
  test.setTimeout(240_000);
  for (const background of backgrounds) {
    for (const bytes of sizes) {
      for (const chunk of chunks) {
        for (const shape of shapes) {
          for (const mode of modes) {
            test(`${bytes} bytes / ${chunk} chunk / ${shape} / ${mode} / background ${background}`, async ({
              page,
            }) => {
              await page.goto(
                process.env.AI_STREAM_PROFILE === '1'
                  ? '/ai-streaming?profile=1'
                  : '/ai-streaming'
              );
              await page
                .getByRole('spinbutton', {
                  name: 'Background bytes',
                  exact: true,
                })
                .fill(String(background));
              await page
                .getByRole('spinbutton', { name: 'Bytes', exact: true })
                .fill(String(bytes));
              await page
                .getByRole('spinbutton', { name: 'Chunk', exact: true })
                .fill(String(chunk));
              await page
                .getByRole('combobox', { name: 'Shape', exact: true })
                .selectOption(shape);
              await page
                .getByRole('combobox', { name: 'Flow', exact: true })
                .selectOption(mode);
              await page
                .getByRole('button', { name: 'Measure', exact: true })
                .click();
              await expect(
                page.locator('[data-ai-proof-report]')
              ).toContainText('"redoEqual"', { timeout: 210_000 });
              const result = JSON.parse(
                await page.locator('[data-ai-proof-report]').innerText()
              );
              const output = path.resolve(
                '../../docs/plans/artifacts/ai-streaming/browser-timing'
              );
              await mkdir(output, { recursive: true });
              await writeFile(
                path.join(
                  output,
                  `${bytes}-${chunk}-${shape}-${mode}-bg${background}.json`
                ),
                `${JSON.stringify(
                  {
                    build: process.env.AI_STREAM_BUILD ?? 'unrecorded',
                    scope:
                      'Production copied EditorKit; cold + three warmups + ten independent identical tail, final, Accept, Undo, Redo trials.',
                    previewBudget: 16,
                    actionBudget: 100,
                    ...result,
                  },
                  null,
                  2
                )}\n`
              );
              expect(result.unchanged).toBe(true);
              expect(result.previewCommits).toBe(0);
              expect(result.accepted).toBe(true);
              expect(result.acceptBatches).toBe(1);
              expect(result.undoEqual).toBe(true);
              expect(result.redoEqual).toBe(true);
            });
          }
        }
      }
    }
  }
});
