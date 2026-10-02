// Records real device traces for the device witness unit test, including
// bypass replays the guarded lane would refuse. It talks to Chrome over an
// unguarded probe connection, so never run it during a proof run.
// Usage: node tooling/device/record-witness-fixtures.mjs [serial]

import { execFileSync, spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

import {
  acquireSerialLock,
  chromeContentTop,
  createDeviceTouch,
  currentKeyMap,
  forwardDevTools,
  listSerials,
  recordOwnedTarget,
  releaseRunResources,
  releaseSerialLock,
  reversePort,
  switchKeyboardLanguage,
} from '../../packages/test/src/device/android.ts';
import {
  readBrowserNativeEventTraceSeq,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../../packages/test/src/playwright/native-event-trace.ts';

const repo = join(dirname(fileURLToPath(import.meta.url)), '../..');
const output = join(
  repo,
  'packages/test/test/node/fixtures/device-witness-traces.json'
);
const serial = process.argv[2] ?? listSerials()[0];
const appPort = 3411;
const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const TRACED_EVENTS = [
  'keydown',
  'pointerdown',
  'beforeinput',
  'input',
  'compositionstart',
  'compositionupdate',
  'compositionend',
];

acquireSerialLock(serial);

const server = spawn(process.execPath, ['apps/plite/scripts/serve.mjs'], {
  cwd: repo,
  env: { ...process.env, PORT: String(appPort) },
  stdio: 'ignore',
});
const owned = { forwards: [], reverses: [], targets: [] };
let browser;

try {
  await sleep(1500);
  const devtoolsPort = forwardDevTools(serial);

  owned.forwards.push(`tcp:${devtoolsPort}`);
  reversePort(serial, appPort);
  owned.reverses.push(`tcp:${appPort}`);
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${devtoolsPort}`, {
    noDefaults: true,
  });

  const browserSession = await browser.newBrowserCDPSession();
  const { targetId } = await browserSession.send('Target.createTarget', {
    url: `http://localhost:${appPort}/examples/plite/plaintext?record=${Date.now()}`,
  });

  owned.targets.push(targetId);
  recordOwnedTarget(serial, targetId);

  let page;

  for (let attempt = 0; attempt < 50 && !page; attempt++) {
    for (const candidate of browser
      .contexts()
      .flatMap((context) => context.pages())) {
      const session = await candidate.context().newCDPSession(candidate);
      const { targetInfo } = await session.send('Target.getTargetInfo');

      await session.detach();
      if (targetInfo.targetId === targetId) page = candidate;
    }
    await sleep(200);
  }

  if (!page) throw new Error(`The recording tab ${targetId} never appeared.`);
  await page.waitForSelector('[data-editor="true"][contenteditable="true"]');

  const root = page
    .locator('[data-editor="true"][contenteditable="true"]')
    .first();

  const touch = createDeviceTouch(serial);
  const cdp = await page.context().newCDPSession(page);
  const dpr = await page.evaluate(() => devicePixelRatio);
  const top = chromeContentTop(serial);

  // Calibrate CSS to screen from one blank-corner touch.
  await page.evaluate(() => {
    window.__calibration = null;
    window.addEventListener(
      'pointerdown',
      (event) => {
        window.__calibration = { x: event.clientX, y: event.clientY };
      },
      { capture: true, once: true }
    );
  });
  touch.tap(6 * dpr, top + 6 * dpr);
  await sleep(600);

  const seen = await page.evaluate(() => window.__calibration);
  const offset = { x: 6 * dpr - seen.x * dpr, y: top + 6 * dpr - seen.y * dpr };
  const toScreen = (point) => ({
    x: offset.x + point.x * dpr,
    y: offset.y + point.y * dpr,
  });
  const lastChar = await page.evaluate(() => {
    const text = document.querySelector('[data-editor-string]')?.firstChild;
    const range = document.createRange();

    range.setStart(text, text.data.length - 1);
    range.setEnd(text, text.data.length);
    const rect = range.getBoundingClientRect();
    return { x: rect.right - 1, y: rect.top + rect.height / 2 };
  });

  await startBrowserNativeEventTrace(root, {
    events: TRACED_EVENTS,
    maxEntries: 10_000,
  });

  const lastSeq = () => readBrowserNativeEventTraceSeq(root);
  const settle = async () => {
    let last = await lastSeq();
    let quietSince = Date.now();

    while (Date.now() - quietSince < 500) {
      await sleep(100);

      const seq = await lastSeq();

      if (seq !== last) {
        last = seq;
        quietSince = Date.now();
      }
    }
    return last;
  };
  const fixtures = [];
  const scenario = async (name, expected, run) => {
    await settle();

    const from = await lastSeq();
    const steps = [];
    // Every key these scenarios tap reports itself as Unidentified.
    const step = async (kind, label, act, target) => {
      const seqStart = (await lastSeq()) + 1;

      await act();
      steps.push({
        kind,
        label,
        seqEnd: (await settle()) + 1,
        seqStart,
        ...(kind === 'key' ? { key: 'Unidentified' } : {}),
        ...(target ? { target } : {}),
      });
    };

    await run(step);
    await settle();

    const { entries } = await takeBrowserNativeEventTrace(root);

    fixtures.push({
      events: entries.filter((entry) => entry.seq > from),
      expected,
      name,
      steps,
    });
  };

  const screen = toScreen(lastChar);

  touch.tap(screen.x, screen.y);
  await sleep(1500);
  await switchKeyboardLanguage(serial, 'en');

  const { keys } = currentKeyMap(serial, 'en');
  const realKey = (label) => () => touch.tap(keys[label].x, keys[label].y);
  const adbShell =
    (...args) =>
    () =>
      execFileSync('adb', ['-s', serial, 'shell', ...args]);
  const cdpSend = (method, params) => () => cdp.send(method, params);
  const insideTap = (bypass) => async () => {
    realKey('h')();
    await bypass();
  };
  const bypasses = {
    'adb-input-keyevent': adbShell('input', 'keyevent', 'KEYCODE_A'),
    // Enter is a soft-keyboard key name, so only the step's own key rejects it.
    'adb-input-enter': adbShell('input', 'keyevent', 'KEYCODE_ENTER'),
    'cdp-dispatch-key-a': async () => {
      await cdp.send('Input.dispatchKeyEvent', {
        code: 'KeyA',
        key: 'a',
        text: 'a',
        type: 'keyDown',
        windowsVirtualKeyCode: 65,
      });
      await cdp.send('Input.dispatchKeyEvent', {
        code: 'KeyA',
        key: 'a',
        type: 'keyUp',
        windowsVirtualKeyCode: 65,
      });
    },
    'adb-input-text': adbShell('input', 'text', 'x'),
    'cdp-dispatch-unidentified': async () => {
      await cdp.send('Input.dispatchKeyEvent', {
        key: 'Unidentified',
        text: 'z',
        type: 'keyDown',
        unmodifiedText: 'z',
        windowsVirtualKeyCode: 229,
      });
      await cdp.send('Input.dispatchKeyEvent', {
        key: 'Unidentified',
        type: 'keyUp',
        windowsVirtualKeyCode: 229,
      });
    },
    'cdp-ime-set-composition': cdpSend('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: 'z',
    }),
    'cdp-insert-text': cdpSend('Input.insertText', { text: 'z' }),
    // Chrome fires a trusted input event for execCommand, with no beforeinput.
    'script-exec-command': () =>
      page.evaluate(() => {
        document.querySelector('[data-editor="true"]').focus();
        document.execCommand('insertText', false, 'z');
      }),
    'script-beforeinput': () =>
      page.evaluate(() => {
        document.querySelector('[data-editor="true"]').dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            data: 'z',
            inputType: 'insertText',
          })
        );
      }),
  };

  await scenario('real-typing', 'accept', async (step) => {
    for (const label of ['h', 'i', 'Space']) {
      await step('key', label, realKey(label));
    }
  });
  await scenario('content-tap-miss', 'reject', async (step) => {
    const aimed = { x: lastChar.x - 40, y: lastChar.y };

    await step(
      'content',
      'tap off target',
      () => touch.tap(screen.x, screen.y),
      aimed
    );
  });

  for (const [name, bypass] of Object.entries(bypasses)) {
    await scenario(`${name}-outside`, 'reject', async () => {
      await bypass();
    });
    // An Unidentified CDP key looks exactly like a real key tap. adb input
    // arrives either that way or with its real key name; what decides it is
    // unknown.
    const verdicts = {
      'adb-input-keyevent': 'ime-state',
      'adb-input-text': 'ime-state',
      'cdp-dispatch-unidentified': 'equivalent',
    };

    await scenario(
      `${name}-inside`,
      verdicts[name] ?? 'reject',
      async (step) => {
        await step('key', 'h', insideTap(bypass));
      }
    );
    await cdp
      .send('Input.imeSetComposition', {
        selectionEnd: 0,
        selectionStart: 0,
        text: '',
      })
      .catch(() => {});
  }

  writeFileSync(output, `${JSON.stringify(fixtures, null, 2)}\n`);
  process.stdout.write(
    `${fixtures.map((fixture) => `${fixture.name}: ${fixture.events.length} events`).join('\n')}\n`
  );
} finally {
  if (browser && owned.targets[0]) {
    const session = await browser.newBrowserCDPSession().catch(() => null);

    await session
      ?.send('Target.closeTarget', { targetId: owned.targets[0] })
      .catch(() => {});
  }
  await browser?.close().catch(() => {});
  server.kill();
  releaseRunResources(serial, owned);
  releaseSerialLock(serial);
}
