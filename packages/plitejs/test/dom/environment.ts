import { expect, test } from 'bun:test';

import { JSDOM } from 'jsdom';

import {
  type DOMRootFactOverrides,
  resolveDOMRootFacts,
} from '../../src/dom/utils/environment';

const environmentUrl = new URL(
  '../../src/dom/utils/environment.ts',
  import.meta.url
).href;

const createRealm = ({
  beforeInput = false,
  language = 'en-US',
  maxTouchPoints = 0,
  platform = '',
  userAgent = '',
}: {
  beforeInput?: boolean;
  language?: string;
  maxTouchPoints?: number;
  platform?: string;
  userAgent?: string;
}) => {
  const dom = new JSDOM('<!doctype html><body><div id="host"></div></body>');
  const { window } = dom;

  for (const [key, value] of Object.entries({
    language,
    maxTouchPoints,
    platform,
    userAgent,
  })) {
    Object.defineProperty(window.navigator, key, {
      configurable: true,
      value,
    });
  }
  Object.defineProperty(window, 'InputEvent', {
    configurable: true,
    value: beforeInput
      ? class InputEvent {
          getTargetRanges() {
            return [];
          }
        }
      : class InputEvent {},
  });

  return dom;
};

test('imports without a DOM or navigator during SSR', async () => {
  const child = Bun.spawn({
    cmd: [
      process.execPath,
      '--eval',
      `
delete globalThis.document
delete globalThis.navigator
delete globalThis.window
const env = await import(${JSON.stringify(environmentUrl)})
console.log(JSON.stringify({
  canUseDOM: env.CAN_USE_DOM,
  hasPublicProfile: 'resolveDOMRootFacts' in (await import(${JSON.stringify(
    new URL('../../src/dom/index.ts', import.meta.url).href
  )})),
}))
      `,
    ],
    stderr: 'pipe',
    stdout: 'pipe',
  });
  const [exitCode, stderr, stdout] = await Promise.all([
    child.exited,
    child.stderr.text(),
    child.stdout.text(),
  ]);

  expect(stderr).toBe('');
  expect(exitCode).toBe(0);
  expect(JSON.parse(stdout)).toEqual({
    canUseDOM: false,
    hasPublicProfile: false,
  });
});

test('resolves and freezes one cached fact set per realm', () => {
  const dom = createRealm({
    beforeInput: true,
    language: 'ko-KR',
    platform: 'MacIntel',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
  });
  const first = resolveDOMRootFacts(dom.window.document);
  const second = resolveDOMRootFacts(dom.window.document);

  expect(second).toBe(first);
  expect(first).toMatchObject({
    beforeInput: true,
    engine: 'webkit',
    language: 'ko-KR',
    platform: 'apple',
  });
  expect(first.quirks.has('shadow-selection-needs-composed-range')).toBe(true);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.quirks)).toBe(true);
  expect(() => (first.quirks as Set<string>).add('mutable')).toThrow(
    'DOM root facts are immutable.'
  );
});

test('keeps iframe-style realms isolated and shadow roots realm-local', () => {
  const appleRealm = createRealm({
    language: 'fr-BE',
    platform: 'MacIntel',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
  });
  const androidRealm = createRealm({
    beforeInput: true,
    language: 'en-US',
    platform: 'Linux armv8l',
    userAgent:
      'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',
  });
  const shadow = appleRealm.window.document
    .getElementById('host')!
    .attachShadow({ mode: 'open' });
  const apple = resolveDOMRootFacts(appleRealm.window.document);
  const shadowFacts = resolveDOMRootFacts(shadow);
  const android = resolveDOMRootFacts(androidRealm.window.document);

  expect(shadowFacts).toBe(apple);
  expect(android).not.toBe(apple);
  expect(apple).toMatchObject({
    engine: 'webkit',
    language: 'fr-BE',
    platform: 'apple',
  });
  expect(android).toMatchObject({
    beforeInput: true,
    engine: 'blink',
    language: 'en-US',
    platform: 'android',
  });
  expect(android.quirks.has('android-beforeinput-delete-is-uncancelable')).toBe(
    true
  );
});

test('applies frozen private overrides without poisoning the realm cache', () => {
  const dom = createRealm({
    language: 'en-US',
    platform: 'Win32',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
  });
  const baseline = resolveDOMRootFacts(dom.window.document);
  const overrides: DOMRootFactOverrides = {
    beforeInput: true,
    engine: 'gecko',
    language: 'ja-JP',
    platform: 'apple',
    quirks: new Set(['compositionend-precedes-final-input']),
  };
  const overridden = resolveDOMRootFacts(dom.window.document, overrides);

  expect(overridden).not.toBe(baseline);
  expect(overridden).toMatchObject({
    beforeInput: true,
    engine: 'gecko',
    language: 'ja-JP',
    platform: 'apple',
  });
  expect(overridden.quirks.has('compositionend-precedes-final-input')).toBe(
    true
  );
  expect(resolveDOMRootFacts(dom.window.document)).toBe(baseline);
});
