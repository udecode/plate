import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '@platejs/test/playwright';
import {
  type Browser,
  chromium,
  expect,
  type Page,
  test,
} from '@playwright/test';

import {
  findWindow,
  imeStatus,
  PINYIN_SIMPLIFIED,
  postKeys,
  selectInputSource,
} from '../../../../tooling/ime/macos-ime.mjs';
import { type NativeImeState, readNativeImeState } from './native-ime-state';

type CaretBand = { bottom: number; top: number; x: number };

declare global {
  interface Window {
    __nativeImeProbe?: boolean[];
  }
}

// globalSetup writes the state; `--list` skips it, so read it per run.
let state: NativeImeState;
let browser: Browser;
let page: Page;

test.beforeAll(async () => {
  state = readNativeImeState();
  browser = await chromium.connectOverCDP(state.endpoint, { noDefaults: true });
  page = await browser.contexts()[0].newPage();
});

test.afterAll(async () => {
  await page?.close().catch(() => {});
  await browser?.close().catch(() => {});
});

const activateChrome = () => {
  execFileSync('osascript', [
    '-e',
    `tell application "System Events" to set frontmost of (first process whose unix id is ${state.chromePid}) to true`,
  ]);
};

const assertChromeFrontmost = () => {
  const { frontmostPID } = imeStatus();

  if (frontmostPID !== state.chromePid) {
    throw new Error(
      `Native IME setup failure: focus moved to pid ${frontmostPID}; this run is invalid.`
    );
  }
};

const traceEntries = async (root: ReturnType<Page['locator']>) => {
  const trace = await takeBrowserNativeEventTrace(root);
  return trace.entries;
};

const postKeyAndWait = async (
  root: ReturnType<Page['locator']>,
  key: string,
  log: Array<{ key: string; keyCode: number | null; seq: number }>
) => {
  assertChromeFrontmost();
  const entries = await traceEntries(root);
  const lastSeq = entries.at(-1)?.seq ?? 0;
  const findKeydown = async () => {
    const latest = await traceEntries(root);
    return latest.find(
      (entry) =>
        entry.seq > lastSeq && entry.type === 'keydown' && entry.isTrusted
    );
  };

  postKeys(state.chromePid, key, { owner: state.lockOwner });
  await expect
    .poll(findKeydown, { message: `trusted keydown for ${key}` })
    .toBeTruthy();

  const keydown = (await findKeydown())!;
  log.push({ key, keyCode: keydown.keyCode, seq: keydown.seq });
};

const caretBandAt = (
  root: ReturnType<Page['locator']>,
  path: number[],
  offset: number
) =>
  root.evaluate(
    (element, { path: innerPath, offset: innerOffset }) => {
      const host = element.querySelector(
        `[data-editor-path="${innerPath.join(',')}"]`
      );
      if (!host) throw new Error(`No text host at ${innerPath.join(',')}`);

      const walker = host.ownerDocument.createTreeWalker(
        host,
        NodeFilter.SHOW_TEXT
      );
      let remaining = innerOffset;
      let node = walker.nextNode() as Text | null;

      while (node && remaining > node.length) {
        remaining -= node.length;
        node = walker.nextNode() as Text | null;
      }
      if (!node) throw new Error('No text at the caret point');

      const range = node.ownerDocument.createRange();
      range.setStart(node, remaining);
      range.collapse(true);
      const rect = range.getClientRects()[0] ?? range.getBoundingClientRect();

      return { bottom: rect.bottom, top: rect.top, x: rect.left };
    },
    { offset, path }
  );

const captureWindow = async (nonce: string, label: string) => {
  const window = findWindow(nonce);
  if (!window.found) {
    throw new Error(`Native IME setup failure: no window titled ${nonce}`);
  }

  const path = test.info().outputPath(`${label}.png`);
  execFileSync('screencapture', ['-x', '-o', `-l${window.windowNumber}`, path]);
  return path;
};

const decode = (pngPath: string) =>
  page.evaluate(async (base64) => {
    const bytes = Uint8Array.from(atob(base64), (value) => value.charCodeAt(0));
    const bitmap = await createImageBitmap(
      new Blob([bytes], { type: 'image/png' })
    );
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    return {
      data: Array.from(
        context.getImageData(0, 0, bitmap.width, bitmap.height).data
      ),
      dpr: window.devicePixelRatio,
      height: bitmap.height,
      innerHeight: window.innerHeight,
      width: bitmap.width,
    };
  }, readFileSync(pngPath).toString('base64'));

/**
 * Counts dark vertical runs covering most of a line band near `x`. A painted caret is one such run; text glyphs
 * rarely span the full band, and the controls below check this on the same capture path before composition starts.
 */
const caretRunsNear = (
  image: Awaited<ReturnType<typeof decode>>,
  band: CaretBand
) => {
  const top = image.height - image.innerHeight * image.dpr;
  const y0 = Math.round(top + (band.top + 2) * image.dpr);
  const y1 = Math.round(top + (band.bottom - 2) * image.dpr);
  const xs: number[] = [];

  for (
    let x = Math.round((band.x - 3) * image.dpr);
    x <= Math.round((band.x + 3) * image.dpr);
    x += 1
  ) {
    let dark = 0;
    for (let y = y0; y <= y1; y += 1) {
      const index = (y * image.width + x) * 4;
      const luma =
        (image.data[index] + image.data[index + 1] + image.data[index + 2]) / 3;
      if (luma < 110) dark += 1;
    }
    if (dark >= (y1 - y0 + 1) * 0.85) xs.push(x);
  }

  return xs.length === 0
    ? 0
    : 1 + xs.filter((x, i) => i > 0 && x - xs[i - 1] > 1).length;
};

const setStabilizer = (on: boolean) =>
  page.evaluate(
    ({ id, enabled }) => {
      document.getElementById(id)?.remove();
      if (!enabled) return;
      const style = document.createElement('style');
      style.id = id;
      style.textContent = '[data-editor="true"] { caret-animation: manual; }';
      document.head.append(style);
    },
    { enabled: on, id: 'native-ime-caret-stabilizer' }
  );

const overlayBar = (band: CaretBand | null) =>
  page.evaluate((target) => {
    document.getElementById('native-ime-control-bar')?.remove();
    if (!target) return;
    const bar = document.createElement('div');
    bar.id = 'native-ime-control-bar';
    Object.assign(bar.style, {
      background: 'black',
      height: `${target.bottom - target.top}px`,
      left: `${target.x}px`,
      pointerEvents: 'none',
      position: 'fixed',
      top: `${target.top}px`,
      width: '1px',
      zIndex: '2147483647',
    });
    document.body.append(bar);
  }, band);

const probeCompositionGate = async () => {
  await page.evaluate(() => {
    const probe = document.createElement('textarea');
    probe.id = 'native-ime-probe';
    Object.assign(probe.style, { left: '0', position: 'fixed', top: '0' });
    document.body.append(probe);
    window.__nativeImeProbe = [];
    probe.addEventListener('compositionstart', (event) => {
      window.__nativeImeProbe?.push(event.isTrusted);
    });
    probe.focus();
  });
  assertChromeFrontmost();
  postKeys(state.chromePid, 'a', { owner: state.lockOwner });
  const started = await expect
    .poll(
      () =>
        page.evaluate(() => window.__nativeImeProbe?.includes(true) ?? false),
      {
        timeout: 3000,
      }
    )
    .toBe(true)
    .then(
      () => true,
      () => false
    );
  postKeys(state.chromePid, '\u001B', { owner: state.lockOwner });
  await page.evaluate(() =>
    document.getElementById('native-ime-probe')?.remove()
  );

  if (!started) {
    throw new Error(
      'Native IME setup failure: Pinyin did not start a trusted composition on the probe key.'
    );
  }
};

for (const anchor of [
  { offset: 27, path: [1, 0] },
  { offset: 2, path: [1, 2] },
] as const) {
  test(`keeps one caret at the Pinyin preedit end at ${anchor.path.join(',')}`, async ({
    baseURL,
  }, info) => {
    const errors = recordBrowserRuntimeErrors(page);
    const nonce = `plate-native-ime-${Date.now()}`;

    try {
      await info.attach('serving.json', {
        body: JSON.stringify({
          ...state.serving,
          browser: state.browser,
          chromeArgs: state.chromeArgs,
        }),
        contentType: 'application/json',
      });

      await page.goto(`${baseURL}/`, { waitUntil: 'commit' });
      const root = page
        .locator('[data-home-preview] [data-editor="true"]')
        .first();
      const editor = createBrowserEditorHarness(
        page,
        'homepage:native-ime',
        root
      );
      await editor.ready({
        editor: 'visible',
        text: 'Welcome to the Plate Playground!',
      });
      await page.evaluate((title) => {
        document.title = title;
      }, nonce);

      selectInputSource(PINYIN_SIMPLIFIED, state.lockOwner);
      activateChrome();
      await page.waitForTimeout(150);
      await probeCompositionGate();

      const { path, offset } = anchor;
      const host = root.locator(`[data-editor-path="${path.join(',')}"]`);
      const before = (await host.textContent())!;

      await editor.selection.collapse({ offset, path: [...path] });
      await editor.focus();
      await setStabilizer(true);

      const oldPoint = await caretBandAt(root, [...path], offset);
      const elsewhere = await caretBandAt(
        root,
        [...path],
        Math.max(0, offset - 6)
      );
      const positive = caretRunsNear(
        await decode(await captureWindow(nonce, 'control-positive')),
        oldPoint
      );
      await overlayBar(elsewhere);
      const duplicateImage = await decode(
        await captureWindow(nonce, 'control-duplicate')
      );
      const duplicate =
        caretRunsNear(duplicateImage, oldPoint) +
        caretRunsNear(duplicateImage, elsewhere);
      await overlayBar(null);
      const negative = caretRunsNear(
        await decode(await captureWindow(nonce, 'control-negative')),
        elsewhere
      );
      const controls = { duplicate, negative, positive };

      expect(
        controls,
        'the capture path tells one, zero and two carets apart'
      ).toEqual({
        duplicate: 2,
        negative: 0,
        positive: 1,
      });

      await startBrowserNativeEventTrace(root, {
        events: [
          'keydown',
          'beforeinput',
          'input',
          'compositionstart',
          'compositionupdate',
          'compositionend',
        ],
        maxEntries: 500,
      });
      const original = await root.evaluateHandle((element) => {
        const node = element.ownerDocument.getSelection()?.focusNode;
        if (!(node instanceof Text)) {
          throw new Error('Missing native text caret');
        }
        return node;
      });
      const keys: Array<{ key: string; keyCode: number | null; seq: number }> =
        [];

      for (const key of 'ceshi') {
        await postKeyAndWait(root, key, keys);
        const latest = await traceEntries(root);
        const preedit = latest.findLast(
          (entry) => entry.type === 'compositionupdate'
        )?.data;

        expect(preedit, 'Pinyin produced a trusted preedit').toBeTruthy();
        await expect
          .poll(() =>
            root.evaluate(
              (element, node) => ({
                connected: node.isConnected,
                focused: element.ownerDocument.activeElement === element,
                sameNode:
                  element.ownerDocument.getSelection()?.focusNode === node,
              }),
              original
            )
          )
          .toEqual({ connected: true, focused: true, sameNode: true });
        await expect(host).toContainText(
          `${before.slice(0, offset)}${preedit}`
        );
        await editor.assert.selection({
          anchor: { offset, path: [...path] },
          focus: { offset, path: [...path] },
        });
      }

      const finalTrace = await traceEntries(root);
      const preedit = finalTrace.findLast(
        (entry) => entry.type === 'compositionupdate'
      )!.data!;
      const preeditEnd = await caretBandAt(
        root,
        [...path],
        offset + preedit.length
      );
      const stable = await decode(await captureWindow(nonce, 'preedit-stable'));

      expect({
        atOldPoint: caretRunsNear(stable, oldPoint),
        atPreeditEnd: caretRunsNear(stable, preeditEnd),
      }).toEqual({ atOldPoint: 0, atPreeditEnd: 1 });

      await setStabilizer(false);
      const burst = [];
      for (let frame = 0; frame < 6; frame += 1) {
        const image = await decode(
          await captureWindow(nonce, `preedit-burst-${frame}`)
        );
        burst.push({
          atOldPoint: caretRunsNear(image, oldPoint),
          atPreeditEnd: caretRunsNear(image, preeditEnd),
        });
        await page.waitForTimeout(80);
      }
      expect(burst.some((frame) => frame.atPreeditEnd === 1)).toBe(true);
      expect(burst.every((frame) => frame.atOldPoint === 0)).toBe(true);

      await postKeyAndWait(root, ' ', keys);
      const committed = `${before.slice(0, offset)}测试${before.slice(offset)}`;
      await expect(host).toHaveText(committed);
      await postKeyAndWait(root, '2', keys);
      await expect(host).toHaveText(
        `${before.slice(0, offset)}测试2${before.slice(offset)}`
      );
      await editor.assert.collapsedModelDOMSelection({
        offset: offset + 3,
        path: [...path],
        text: `${before.slice(0, offset)}测试2${before.slice(offset)}`,
      });

      assertChromeFrontmost();
      await info.attach('native-ime-trace.json', {
        body: JSON.stringify({
          keys,
          trace: await takeBrowserNativeEventTrace(root),
        }),
        contentType: 'application/json',
      });
      errors.assertNone();
    } finally {
      errors.stop();
    }
  });
}
