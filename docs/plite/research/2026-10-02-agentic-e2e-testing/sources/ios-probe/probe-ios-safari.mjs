// iOS Safari probe for the device-lane plan's Phase 3: one real soft-keyboard
// tap through Appium XCUITest and one model read through executeAsync.
// Needs a booted simulator, `appium` on port 4723 with the XCUITest driver from
// ~/.appium, and the Plite export served on http://localhost:3412.
// Usage: node probe-ios-safari.mjs <simulator-udid>

import { writeFileSync } from 'node:fs';

const [udid] = process.argv.slice(2);
const appium = 'http://127.0.0.1:4723';
const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const call = async (method, path, body) => {
  const response = await fetch(`${appium}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
    method,
  });
  const json = await response.json();

  if (!response.ok) {
    throw new Error(`${method} ${path}: ${JSON.stringify(json.value).slice(0, 300)}`);
  }
  return json.value;
};

const RECORDER = `
  window.__iosEvents = [];
  let seq = 0;
  for (const type of ['pointerdown', 'keydown', 'beforeinput', 'input', 'compositionstart', 'compositionupdate', 'compositionend']) {
    document.addEventListener(type, (event) => {
      window.__iosEvents.push({ seq: ++seq, type, isTrusted: event.isTrusted, key: event.key ?? null, keyCode: event.keyCode ?? null, inputType: event.inputType ?? null, data: event.data ?? null });
    }, { capture: true });
  }
`;

const startedAt = Date.now();
const session = await call('POST', '/session', {
  capabilities: {
    alwaysMatch: {
      'appium:automationName': 'XCUITest',
      'appium:newCommandTimeout': 300,
      'appium:udid': udid,
      'appium:wdaLaunchTimeout': 600_000,
      browserName: 'Safari',
      platformName: 'iOS',
    },
  },
});
const id = session.sessionId;
const log = { sessionMs: Date.now() - startedAt, steps: [] };

try {
  await call('POST', `/session/${id}/url`, {
    url: 'http://localhost:3412/examples/plite/plaintext',
  });
  await sleep(4000);

  const contexts = await call('GET', `/session/${id}/contexts`);
  const web = contexts.find((context) => context.startsWith('WEBVIEW'));

  log.contexts = contexts;
  await call('POST', `/session/${id}/context`, { name: web });
  await call('POST', `/session/${id}/execute/sync`, { args: [], script: RECORDER });

  // Find the end of the first block in CSS pixels, then tap it natively.
  const point = await call('POST', `/session/${id}/execute/sync`, {
    args: [],
    script: `
      const text = document.querySelector('[data-editor-string]').firstChild;
      const range = document.createRange();
      range.setStart(text, text.data.length - 1);
      range.setEnd(text, text.data.length);
      const rect = range.getBoundingClientRect();
      return { x: rect.right - 1, y: rect.top + rect.height / 2, chrome: window.screen.height - window.innerHeight };
    `,
  });

  log.point = point;
  await call('POST', `/session/${id}/context`, { name: 'NATIVE_APP' });

  const webview = await call('POST', `/session/${id}/element`, {
    using: 'class name',
    value: 'XCUIElementTypeWebView',
  });
  const rect = await call(
    'GET',
    `/session/${id}/element/${webview.ELEMENT ?? Object.values(webview)[0]}/rect`
  );

  log.webviewRect = rect;
  await call('POST', `/session/${id}/actions`, {
    actions: [
      {
        actions: [
          { duration: 0, type: 'pointerMove', x: Math.round(rect.x + point.x), y: Math.round(rect.y + point.y) },
          { button: 0, type: 'pointerDown' },
          { duration: 80, type: 'pause' },
          { button: 0, type: 'pointerUp' },
        ],
        id: 'finger',
        parameters: { pointerType: 'touch' },
        type: 'pointer',
      },
    ],
  });
  await sleep(1500);

  const key = await call('POST', `/session/${id}/element`, {
    using: '-ios predicate string',
    value: "type == 'XCUIElementTypeKey' AND (name == 'h' OR name == 'H')",
  });

  await call('POST', `/session/${id}/element/${key.ELEMENT ?? Object.values(key)[0]}/click`, {});
  await sleep(1200);
  await call('POST', `/session/${id}/context`, { name: web });

  const read = await call('POST', `/session/${id}/execute/async`, {
    args: [],
    script: `
      const done = arguments[arguments.length - 1];
      const root = document.querySelector('[data-editor="true"]');
      const handle = root.__pliteBrowserHandle;
      done({ events: window.__iosEvents, modelText: handle ? handle.getText() : null, selection: handle ? handle.getSelection() : null, userAgent: navigator.userAgent });
    `,
  });

  log.read = read;
} finally {
  await call('DELETE', `/session/${id}`).catch(() => {});
  writeFileSync(
    new URL('./probe-ios-safari.result.json', import.meta.url),
    `${JSON.stringify(log, null, 2)}\n`
  );
}

process.stdout.write(`${JSON.stringify(log, null, 2)}\n`);
