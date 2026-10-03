import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  type Browser,
  chromium,
  type Locator,
  type Page,
  test as base,
  type TestType,
} from '@playwright/test';

import { createBrowserEditorHarness } from '../playwright';
import {
  readBrowserNativeEventTraceSeq,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../playwright/native-event-trace';
import type {
  BrowserEditorHarness,
  BrowserNativeEventTraceEntry,
  SelectionPoint,
} from '../playwright/types';
import {
  chromeContentTop,
  createDeviceTouch,
  currentKeyMap,
  type DeviceKeyMap,
  type DeviceLanguage,
  type DevicePanel,
  keyboardLanguage,
  keyboardShown,
  readKeyboard,
  switchKeyboardLanguage,
} from './android';
import {
  type DeviceWitnessGesture,
  type DeviceWitnessKey,
  type DeviceWitnessStep,
  type DeviceWitnessViolation,
  judgeDeviceWitness,
} from './witness';

/** What globalSetup records per serial for workers to reattach. */
export type DeviceRunState = {
  appURL: string;
  buildFingerprint: string | null;
  chromePid: string;
  endpoint: string;
  gboardVersion: string;
  serial: string;
  targetId: string;
  wwwURL: string | null;
};

export const DEVICE_STATE_PATH = 'test-results/device/state.json';

const KOREAN_KEYS: Record<string, string> = {
  ' ': '스페이스',
  '\b': '삭제',
  '\n': '입력',
  ㄱ: '기역',
  ㄴ: '니은',
  ㄷ: '디귿',
  ㄹ: '리을',
  ㅁ: '미음',
  ㅂ: '비읍',
  ㅅ: '시옷',
  ㅇ: '이응',
  ㅈ: '지읒',
  ㅊ: '치읓',
  ㅋ: '키읔',
  ㅌ: '티읕',
  ㅍ: '피읖',
  ㅎ: '히읗',
  ㅏ: '아',
  ㅐ: '애',
  ㅑ: '야',
  ㅓ: '어',
  ㅔ: '에',
  ㅕ: '여',
  ㅗ: '오',
  ㅛ: '요',
  ㅜ: '우',
  ㅠ: '유',
  ㅡ: '으',
  ㅣ: '이',
};

const ENGLISH_KEYS: Record<string, string> = {
  ' ': 'Space',
  '\b': 'Delete',
  '\n': 'Enter',
};

// Gboard reports Enter and Backspace by name and every other key as Unidentified.
const keyProduced = (
  named: Record<string, string>,
  label: string
): DeviceWitnessKey => {
  if (label === named['\b']) return 'Backspace';
  return label === named['\n'] ? 'Enter' : 'Unidentified';
};

const SYMBOL_KEYS: Record<string, string> = {
  '!': 'Exclamation',
  '&': '&amp;',
  "'": 'Apostrophe',
  '(': 'Left parenthesis',
  ')': 'Right parenthesis',
  '+': 'Plus',
  '-': 'Dash',
  '/': 'slash',
  ':': 'Colon',
  ';': 'Semicolon',
  '?': 'Question mark',
  _: 'underline',
};

const TRACED_EVENTS = [
  'keydown',
  'pointerdown',
  'beforeinput',
  'input',
  'compositionstart',
  'compositionupdate',
  'compositionend',
] as const;

const STRIP_CHROME =
  /^(Open features menu|Use voice typing|Settings|Clipboard|Theme settings)$|emoji$/;

const sleep = (ms: number) =>
  new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });

const readDeviceRunState = (
  serial: string,
  configDir: string
): DeviceRunState => {
  const path = resolve(configDir, DEVICE_STATE_PATH);
  const states = existsSync(path)
    ? (JSON.parse(readFileSync(path, 'utf-8')) as Record<
        string,
        DeviceRunState
      >)
    : {};
  const state = states[serial];

  if (!state) {
    throw new Error(
      `No device run state for ${serial}; run cases through apps/plite/playwright.device.config.ts.`
    );
  }

  return state;
};

/** Find the page for an owned DevTools target, waiting up to `attempts` polls. */
export const findOwnedPage = async (
  browser: Browser,
  targetId: string,
  attempts = 1
) => {
  for (let attempt = 0; attempt < attempts; attempt++) {
    for (const page of browser
      .contexts()
      .flatMap((context) => context.pages())) {
      const session = await page.context().newCDPSession(page);
      const { targetInfo } = (await session.send('Target.getTargetInfo')) as {
        targetInfo: { targetId: string };
      };

      await session.detach();
      if (targetInfo.targetId === targetId) return page;
    }
    await sleep(200);
  }

  throw new Error(`The owned DevTools target ${targetId} is gone.`);
};

declare global {
  interface Window {
    __deviceCalibration?: { x: number; y: number } | null;
  }
}

/**
 * A product bug the lane reproduces. The case passes only while `read`
 * returns `observed`; the desired value means the bug is fixed and any other
 * value is a different failure, and both fail the case.
 */
export type DeviceKnownFailure<T> = {
  desired: T;
  /** The local issue draft that describes the bug. */
  issue: string;
  name: string;
  observed: T;
  read: () => Promise<T>;
};

export type DeviceEditor = Pick<
  BrowserEditorHarness,
  'assert' | 'get' | 'snapshot'
> & {
  selection: Pick<BrowserEditorHarness['selection'], 'get'>;
  touch: {
    press: (point: SelectionPoint, ms?: number) => Promise<void>;
    tap: (point: SelectionPoint) => Promise<void>;
  };
};

export type DeviceLane = {
  keyboard: {
    shown: () => boolean;
    tap: (label: string) => Promise<void>;
    type: (text: string) => Promise<void>;
    use: (language: DeviceLanguage) => Promise<void>;
  };
  open: (url: string) => Promise<void>;
  openExample: (example: string) => Promise<DeviceEditor>;
  openWww: (path: string) => Promise<DeviceEditor>;
  knownFailure: <T>(failure: DeviceKnownFailure<T>) => Promise<void>;
  /** Steps on the current page. */
  steps: () => readonly DeviceWitnessStep[];
  tapStrip: (candidate: RegExp | string) => Promise<string>;
  touch: {
    tapTestId: (testId: string) => Promise<void>;
    tapText: (text: string) => Promise<void>;
  };
  /** The current page's trace. */
  trace: () => Promise<BrowserNativeEventTraceEntry[]>;
  /** The www server the run reverses to the phone, or null without one. */
  www: string | null;
  /** Every page this case opened, each judged against its own steps. */
  witness: () => Promise<{
    pages: Array<{
      events: BrowserNativeEventTraceEntry[];
      steps: DeviceWitnessStep[];
    }>;
    violations: DeviceWitnessViolation[];
  }>;
};

/** Lane-internal: build the device API over one owned connection. */
export const createDeviceLane = ({
  page,
  state,
}: {
  page: Page;
  state: DeviceRunState;
}) => {
  const touch = createDeviceTouch(state.serial);
  const pages: Array<{
    events: BrowserNativeEventTraceEntry[];
    steps: DeviceWitnessStep[];
  }> = [];
  let steps: DeviceWitnessStep[] = [];
  let root: Locator | null = null;
  let offset: { x: number; y: number } | null = null;
  let language: DeviceLanguage = 'en';

  const lastSeq = async () => (root ? readBrowserNativeEventTraceSeq(root) : 0);

  // A new page restarts the trace's seq, so each page is judged on its own.
  const leavePage = async () => {
    if (root) {
      const { entries } = await takeBrowserNativeEventTrace(root);

      pages.push({ events: entries, steps });
    }
    steps = [];
    root = null;
    offset = null;
  };

  const startTrace = async (target: Locator) => {
    root = target;
    await startBrowserNativeEventTrace(target, {
      events: TRACED_EVENTS,
      maxEntries: 10_000,
    });
  };

  // Each gesture owns the sequence range from its first event until input
  // stays quiet, so a slow event cannot slip into the next step's window.
  const gesture = async (step: DeviceWitnessGesture, act: () => void) => {
    const seqStart = (await lastSeq()) + 1;

    act();

    let last = seqStart - 1;
    let quietSince = Date.now();
    const deadline = Date.now() + 4000;

    while (Date.now() < deadline) {
      await sleep(100);

      const seq = await lastSeq();

      if (seq !== last) {
        last = seq;
        quietSince = Date.now();
      } else if (Date.now() - quietSince >= 400) {
        break;
      }
    }

    steps.push({ ...step, seqEnd: last + 1, seqStart });
  };

  const viewport = () =>
    page.evaluate(() => ({
      dpr: devicePixelRatio,
      offsetLeft: visualViewport?.offsetLeft ?? 0,
      offsetTop: visualViewport?.offsetTop ?? 0,
      scale: visualViewport?.scale ?? 1,
    }));

  const toScreen = async (css: { x: number; y: number }) => {
    if (!offset) throw new Error('Open a page before touching its content.');

    const view = await viewport();

    return {
      x: offset.x + (css.x - view.offsetLeft) * view.dpr * view.scale,
      y: offset.y + (css.y - view.offsetTop) * view.dpr * view.scale,
    };
  };

  // One touch on the page's top-left corner, read back through pointerdown,
  // gives the screen offset of CSS pixel 0,0 with the toolbar as it is now.
  const calibrateContent = async () => {
    const view = await viewport();
    const guess = {
      x: 6 * view.dpr,
      y: chromeContentTop(state.serial) + 6 * view.dpr,
    };
    await page.evaluate(() => {
      window.__deviceCalibration = null;
      window.addEventListener(
        'pointerdown',
        (event) => {
          window.__deviceCalibration = { x: event.clientX, y: event.clientY };
        },
        { capture: true, once: true }
      );
    });
    touch.tap(guess.x, guess.y);
    await sleep(600);

    const seen = await page.evaluate(() => window.__deviceCalibration ?? null);

    if (!seen) throw new Error('The calibration touch never reached the page.');
    offset = {
      x: guess.x - seen.x * view.dpr * view.scale,
      y: guess.y - seen.y * view.dpr * view.scale,
    };
  };

  const pointFor = (point: SelectionPoint) =>
    page.evaluate(
      ({ offset: modelOffset, path }) => {
        const host = document.querySelector(
          `[data-editor-node="text"][data-editor-path="${path.join(',')}"]`
        );

        if (!host) return null;

        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        let remaining = modelOffset;
        let node = walker.nextNode() as Text | null;

        while (node && remaining > node.data.length) {
          remaining -= node.data.length;
          node = walker.nextNode() as Text | null;
        }

        if (!node || node.data.length === 0) {
          const rect = host.getBoundingClientRect();
          return { x: rect.left + 2, y: rect.top + rect.height / 2 };
        }

        const range = document.createRange();

        if (remaining === 0) {
          range.setStart(node, 0);
          range.setEnd(node, 1);
          const rect = range.getBoundingClientRect();
          return { x: rect.left + 1, y: rect.top + rect.height / 2 };
        }

        range.setStart(node, remaining - 1);
        range.setEnd(node, remaining);
        const rect = range.getBoundingClientRect();
        return { x: rect.right - 1, y: rect.top + rect.height / 2 };
      },
      { offset: point.offset, path: [...point.path] }
    );

  const contentTouch = async (
    label: string,
    css: { x: number; y: number },
    act: (screen: { x: number; y: number }) => void
  ) => {
    const screen = await toScreen(css);

    await gesture({ kind: 'content', label, target: css }, () => act(screen));
  };

  // The soft keyboard shrinks and scrolls the visual viewport, so a target in
  // the layout viewport can still sit under the browser toolbar.
  const tapLocator = async (label: string, locator: Locator) => {
    const center = await locator.evaluate(async (element) => {
      const measure = () => {
        const rect = element.getBoundingClientRect();
        const view = window.visualViewport;
        const top = view?.offsetTop ?? 0;
        const height = view?.height ?? innerHeight;

        return {
          visible: rect.top >= top && rect.bottom <= top + height,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      };

      if (!measure().visible) {
        element.scrollIntoView({ block: 'center', inline: 'nearest' });
        await new Promise((resolveScroll) => {
          setTimeout(resolveScroll, 400);
        });
      }

      return measure();
    });

    if (!center.visible) throw new Error(`Nothing visible to ${label}.`);
    await contentTouch(label, center, (screen) =>
      touch.tap(screen.x, screen.y)
    );
  };

  const keyMap = (): DeviceKeyMap => currentKeyMap(state.serial, language);

  const confirmKeyboard = () => {
    if (!keyboardShown(state.serial)) {
      throw new Error(
        'The soft keyboard is not shown; touch the editor first.'
      );
    }

    const map = keyMap();

    if (keyboardLanguage(readKeyboard(state.serial)) !== language) {
      throw new Error(
        `Gboard does not show the ${language} letter panel; switch with device.keyboard.use('${language}').`
      );
    }

    return map;
  };

  const switchPanel = async (target: DevicePanel) => {
    const from = currentKeyMap(
      state.serial,
      language,
      target === 'symbols' ? 'letters' : 'symbols'
    );

    await tapKey(
      from,
      target === 'symbols' ? 'Symbol keyboard' : 'Letter keyboard',
      null
    );

    const visible = readKeyboard(state.serial);
    const shown =
      target === 'symbols'
        ? Boolean(visible['@'])
        : keyboardLanguage(visible) === language;

    if (!shown) {
      throw new Error(`Gboard did not show its ${target} panel.`);
    }

    return target;
  };

  const tapKey = async (
    map: DeviceKeyMap,
    label: string,
    produces: DeviceWitnessKey
  ) => {
    const key = map.keys[label];

    if (!key) {
      throw new Error(`The ${language} key map has no "${label}" key.`);
    }

    await gesture({ key: produces, kind: 'key', label }, () =>
      touch.tap(key.x, key.y)
    );
  };

  const editorFor = (harness: BrowserEditorHarness): DeviceEditor => ({
    assert: harness.assert,
    get: harness.get,
    selection: { get: harness.selection.get },
    snapshot: harness.snapshot,
    touch: {
      press: async (point, ms = 600) => {
        const css = await pointFor(point);

        if (!css) {
          throw new Error(`No rendered text at ${point.path.join(',')}.`);
        }
        await contentTouch(
          `press ${point.path.join(',')}:${point.offset}`,
          css,
          (screen) => touch.press(screen.x, screen.y, ms)
        );
      },
      tap: async (point) => {
        const css = await pointFor(point);

        if (!css) {
          throw new Error(`No rendered text at ${point.path.join(',')}.`);
        }
        await contentTouch(
          `tap ${point.path.join(',')}:${point.offset}`,
          css,
          (screen) => touch.tap(screen.x, screen.y)
        );
      },
    },
  });

  const openEditor = async (url: string, title: string) => {
    await leavePage();
    await page.goto(url, { waitUntil: 'load' });
    // Touches land on whichever tab Chrome shows, so the owned tab goes first.
    await page.bringToFront();

    const editorRoot = page
      .locator('[data-editor="true"][contenteditable="true"]')
      .first();
    const harness = createBrowserEditorHarness(page, title, editorRoot);

    await harness.ready({ editor: 'visible' });
    await calibrateContent();
    await startTrace(editorRoot);
    return editorFor(harness);
  };

  const lane: DeviceLane = {
    keyboard: {
      shown: () => keyboardShown(state.serial),
      tap: async (label) => {
        const named = language === 'en' ? ENGLISH_KEYS : KOREAN_KEYS;

        await tapKey(confirmKeyboard(), label, keyProduced(named, label));
      },
      type: async (text) => {
        const letters = confirmKeyboard();
        const named = language === 'en' ? ENGLISH_KEYS : KOREAN_KEYS;
        let panel: DevicePanel = 'letters';

        for (const character of text) {
          const label = named[character] ?? character;

          if (letters.keys[label]) {
            if (panel === 'symbols') panel = await switchPanel('letters');
            await tapKey(letters, label, keyProduced(named, label));
            continue;
          }

          const symbols = currentKeyMap(state.serial, language, 'symbols');
          const symbol = SYMBOL_KEYS[character] ?? character;

          if (!symbols.keys[symbol]) {
            throw new Error(
              `Gboard ${language} has no key for "${character}".`
            );
          }
          if (panel === 'letters') panel = await switchPanel('symbols');
          await tapKey(symbols, symbol, 'Unidentified');
          panel = readKeyboard(state.serial)['@'] ? 'symbols' : 'letters';
        }

        if (panel === 'symbols') await switchPanel('letters');
      },
      use: async (next) => {
        if (!keyboardShown(state.serial)) {
          throw new Error('Show the keyboard before switching its language.');
        }

        const subtype = await switchKeyboardLanguage(state.serial, next);

        language = next;
        if (keyMap().subtype !== subtype) {
          throw new Error(`Gboard selected subtype ${subtype} for ${next}.`);
        }
      },
    },
    open: async (url) => {
      await leavePage();
      await page.goto(url, { waitUntil: 'load' });
      // Touches land on whichever tab Chrome shows, so the owned tab goes first.
      await page.bringToFront();
      await calibrateContent();
      await startTrace(page.locator('body'));
    },
    openExample: (example) =>
      openEditor(`${state.appURL}/examples/plite/${example}`, example),
    openWww: (path) => {
      if (!state.wwwURL) {
        throw new Error('Set PLATE_DEVICE_WWW_URL to run www cases.');
      }
      return openEditor(`${state.wwwURL}${path}`, path);
    },
    knownFailure: async ({ desired, issue, name, observed, read }) => {
      const same = (left: unknown, right: unknown) =>
        JSON.stringify(left) === JSON.stringify(right);
      // Gboard can still be committing when the last tap settles, and the
      // known value can pass through on the way to the desired one, so
      // classify only a value that held for 500 ms.
      let value = await read();
      let stableSince = Date.now();
      let settled = false;

      for (const deadline = Date.now() + 3000; Date.now() < deadline;) {
        await sleep(100);

        const next = await read();

        if (!same(next, value)) {
          value = next;
          stableSince = Date.now();
          settled = false;
        } else if (Date.now() - stableSince >= 500) {
          settled = true;
          if (same(value, desired) || same(value, observed)) break;
        }
      }

      if (!settled) {
        throw new Error(
          `"${name}" never held one value for 500 ms; last read ${JSON.stringify(value)}.`
        );
      }
      if (same(value, desired)) {
        throw new Error(
          `The known failure "${name}" no longer reproduces; close ${issue} and assert the desired behavior.`
        );
      }
      if (!same(value, observed)) {
        throw new Error(
          `"${name}" read ${JSON.stringify(value)}, neither the desired ${JSON.stringify(desired)} nor the known failure ${JSON.stringify(observed)}.`
        );
      }
      const description = `${name} (${issue}): read ${JSON.stringify(value)}, desired ${JSON.stringify(desired)}`;

      // The list reporter prints test output but not annotations.
      process.stdout.write(`known product failure: ${description}\n`);
      base.info().annotations.push({
        description,
        type: 'known-product-failure',
      });
    },
    steps: () => steps,
    tapStrip: async (candidate) => {
      const nodes = readKeyboard(state.serial);
      const letterTops = Object.entries(nodes)
        .filter(([label]) => label.length === 1)
        .map(([, key]) => key.bounds[1]);

      // Korean keys carry spoken names, so only the English letters mark the row.
      if (letterTops.length === 0) {
        throw new Error('Strip taps need the English letter keyboard.');
      }

      const letterTop = Math.min(...letterTops);
      const strip = Object.entries(nodes).filter(
        ([label, key]) =>
          key.bounds[3] <= letterTop && !STRIP_CHROME.test(label)
      );
      const match = strip.find(([label]) =>
        typeof candidate === 'string'
          ? label === candidate
          : candidate.test(label)
      );

      if (!match) {
        throw new Error(
          `The suggestion strip shows ${strip.map(([label]) => label).join(', ') || 'nothing'}, not ${candidate}.`
        );
      }

      const [label, key] = match;

      await gesture({ kind: 'strip', label }, () => touch.tap(key.x, key.y));
      return label;
    },
    touch: {
      tapTestId: (testId) =>
        tapLocator(`tap ${testId}`, page.getByTestId(testId)),
      tapText: (text) =>
        tapLocator(
          `tap "${text}"`,
          page.getByText(text, { exact: true }).first()
        ),
    },
    trace: async () => {
      if (!root) return [];

      const { entries } = await takeBrowserNativeEventTrace(root);

      return entries;
    },
    www: state.wwwURL,
    witness: async () => {
      const all = [...pages, { events: await lane.trace(), steps }];

      return {
        pages: all,
        violations: all.flatMap((judged) => judgeDeviceWitness(judged)),
      };
    },
  };

  return lane;
};

// The built-in fixtures are typed never so a case cannot reach them.
type DeviceFixtures = {
  context: never;
  device: DeviceLane;
  page: never;
  request: never;
};
type DeviceWorkerFixtures = {
  browser: never;
  deviceConnection: { browser: Browser; page: Page; state: DeviceRunState };
  deviceSerial: string;
};

/* oxlint-disable no-empty-pattern, react-hooks/rules-of-hooks -- [P0 framework-conflict] Playwright reads a fixture's dependencies from its destructured first parameter, so a fixture with none spells `{}`, and `use` is Playwright's fixture callback, not a React hook. */
const refusal =
  (name: string) =>
  ({}): never => {
    throw new Error(
      `Device cases cannot use ${name}; drive the phone through the device fixture.`
    );
  };

/** The lane with its raw connection, for lane-owned proofs such as the bypass test. */
export const deviceLaneTest = base.extend<DeviceFixtures, DeviceWorkerFixtures>(
  {
    browser: [refusal('browser'), { scope: 'worker' }],
    context: refusal('context'),
    device: async ({ deviceConnection }, use, testInfo) => {
      const lane = createDeviceLane(deviceConnection);

      await use(lane);

      const witness = await lane.witness();
      const { violations } = witness;
      const witnessPath = testInfo.outputPath('device-witness.json');

      writeFileSync(witnessPath, JSON.stringify(witness, null, 2));
      await testInfo.attach('device-witness.json', {
        contentType: 'application/json',
        path: witnessPath,
      });
      testInfo.annotations.push({
        description: `chrome ${deviceConnection.state.chromePid}, target ${deviceConnection.state.targetId}, build ${deviceConnection.state.buildFingerprint ?? 'none'}`,
        type: 'device-run',
      });

      if (violations.length > 0) {
        throw new Error(
          `The device witness rejected this trace:\n${violations
            .map(
              (violation) =>
                `- ${violation.rule} at ${violation.step ?? 'no step'}: ${violation.detail}`
            )
            .join('\n')}`
        );
      }
    },
    deviceConnection: [
      async ({ deviceSerial }, use, workerInfo) => {
        const state = readDeviceRunState(
          deviceSerial,
          dirname(workerInfo.config.configFile ?? process.cwd())
        );
        const browser = await chromium.connectOverCDP(state.endpoint, {
          noDefaults: true,
        });
        const page = await findOwnedPage(browser, state.targetId);

        await use({ browser, page, state });
        await browser.close();
      },
      { scope: 'worker' },
    ],
    deviceSerial: ['', { option: true, scope: 'worker' }],
    page: refusal('page'),
    request: refusal('request'),
  }
);
/* oxlint-enable no-empty-pattern, react-hooks/rules-of-hooks */

type LaneArgs<T> =
  T extends TestType<infer Test, infer Worker>
    ? { test: Test; worker: Worker }
    : never;

/**
 * Device cases: real touches through `device`, with no raw page or connection.
 * Playwright's own fixtures need `playwright` at runtime, so only its type is
 * refused here; lint bans the imports a case could use instead.
 */
export const test = deviceLaneTest as unknown as TestType<
  LaneArgs<typeof deviceLaneTest>['test'],
  Omit<
    LaneArgs<typeof deviceLaneTest>['worker'],
    'deviceConnection' | 'playwright'
  > & { playwright: never }
>;

export { expect } from '@playwright/test';
