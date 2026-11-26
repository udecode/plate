import { execFileSync, spawnSync } from 'node:child_process';

import { expect } from '@playwright/test';

import {
  type BrowserRuntimeErrorRecorder,
  DEFAULT_RUNTIME_ERROR_PATTERNS,
  isIgnoredRuntimeError,
} from '../playwright/runtime-errors';
import type { DeviceLanguage } from './android';
import { type IosRunner, type RunnerReply, startIosRunner } from './ios';
import type {
  DeviceDriver,
  DeviceQuery,
  DeviceToolbar,
  IosRunState,
} from './lane';
import type {
  connectWebInspector,
  InspectorPage,
  InspectorPageInfo,
} from './webkit';
import type { DeviceWitnessKey } from './witness';

export const isSimulatorUdid = (serial: string) =>
  /^[\dA-F]{8}(-[\dA-F]{4}){3}-[\dA-F]{12}$/.test(serial);

export type IosConnection = {
  close: () => Promise<void>;
  /** Where the page's origin sits in the web view, below Safari's status bar. */
  inset: Point;
  page: InspectorPage;
  platform: 'ios';
  runner: IosRunner;
  state: IosRunState;
};

type WebInspector = Awaited<ReturnType<typeof connectWebInspector>>;

type Point = { x: number; y: number };

type SerialPattern = string | { flags: string; source: string };

type SerialQuery =
  | { button: SerialPattern; within?: SerialQuery }
  | { css: string; within?: SerialQuery }
  | { menuItem: SerialPattern }
  | { testId: string }
  | { text: string }
  | { toolbar: DeviceToolbar };

const NAMED_KEYS: Record<string, { key: DeviceWitnessKey; label: string }> = {
  ' ': { key: ' ', label: 'space' },
  '&': { key: '&', label: 'ampersand' },
  '\b': { key: 'Backspace', label: 'delete' },
  '\n': { key: 'Enter', label: 'Return' },
};

const IOS_LANGUAGES: readonly DeviceLanguage[] = ['en', 'ja', 'ko', 'zh'];

const IOS_DELETE_LABELS: Record<string, DeviceLanguage> = {
  delete: 'en',
  削除: 'ja',
  삭제: 'ko',
  删除: 'zh',
};

export const iosKeyboardLanguage = (
  deleteLabel: string | undefined
): DeviceLanguage | null =>
  deleteLabel && Object.hasOwn(IOS_DELETE_LABELS, deleteLabel)
    ? IOS_DELETE_LABELS[deleteLabel]
    : null;

const describeIosKeyboard = (deleteLabel: string | undefined) => {
  const known = iosKeyboardLanguage(deleteLabel);

  if (known) return known;
  return deleteLabel ? `unknown (${deleteLabel})` : 'unknown (no delete key)';
};

const sleep = (ms: number) =>
  new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });

const checked = (reply: RunnerReply) => {
  if (!reply.ok) {
    throw new Error(
      `The iOS runner refused: ${reply.error ?? 'no reason'}${reply.keys ? `; the keyboard shows ${reply.keys.join(' ')}` : ''}.`
    );
  }
  return reply;
};

const serialPattern = (pattern: RegExp | string): SerialPattern =>
  typeof pattern === 'string'
    ? pattern
    : { flags: pattern.flags, source: pattern.source };

const serialQuery = (query: DeviceQuery): SerialQuery => {
  if ('toolbar' in query || 'testId' in query || 'text' in query) return query;
  if ('menuItem' in query) return { menuItem: serialPattern(query.menuItem) };

  const within = query.within && { within: serialQuery(query.within) };

  if ('button' in query) {
    return { button: serialPattern(query.button), ...within };
  }
  return { css: query.css, ...within };
};

// Runs in the page.
const findElement = async (query: SerialQuery): Promise<Element> => {
  const normalize = (text: string | null) =>
    (text ?? '').replaceAll('\uFEFF', '').replaceAll(/\s+/g, ' ').trim();
  const matchesPattern = (name: string, pattern: SerialPattern) =>
    typeof pattern === 'string'
      ? name.toLowerCase().includes(pattern.toLowerCase())
      : new RegExp(pattern.source, pattern.flags).test(name);
  const accessibleName = (element: Element) =>
    normalize(element.getAttribute('aria-label') ?? element.textContent);
  const openMenu = (element: Element) =>
    !element.hasAttribute('hidden') &&
    element.getAttribute('data-state') !== 'closed' &&
    !element.hasAttribute('data-closed') &&
    element.getClientRects().length > 0;
  const match = (current: SerialQuery, scope: ParentNode): Element | null => {
    if ('toolbar' in current) {
      return scope.querySelector(
        current.toolbar === 'keyboard'
          ? '[data-slot="keyboard-toolbar"]'
          : '[data-slot="fixed-toolbar"]'
      );
    }
    if ('menuItem' in current) {
      const menus = [...scope.querySelectorAll('[role="menu"]')].filter(
        openMenu
      );

      for (const menu of menus) {
        const found = [
          ...menu.querySelectorAll(
            '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"],button,[role="button"]'
          ),
        ].find((element) =>
          matchesPattern(accessibleName(element), current.menuItem)
        );

        if (found) return found;
      }
      return null;
    }

    if ('testId' in current) {
      return scope.querySelector(
        `[data-test-id="${CSS.escape(current.testId)}"]`
      );
    }
    if ('text' in current) {
      const expected = normalize(current.text);
      const exact = (element: Element) =>
        normalize(element.textContent) === expected;

      return (
        [...scope.querySelectorAll('body *')].find(
          (element) => exact(element) && ![...element.children].some(exact)
        ) ?? null
      );
    }

    const inner = current.within ? match(current.within, scope) : scope;

    if (!inner) return null;
    if ('css' in current) return inner.querySelector(current.css);

    return (
      [...inner.querySelectorAll('button,[role="button"]')].find((element) =>
        matchesPattern(accessibleName(element), current.button)
      ) ?? null
    );
  };
  for (const deadline = Date.now() + 30_000; Date.now() < deadline;) {
    const element = match(query, document);

    if (element) return element;
    await new Promise((resolveWait) => {
      setTimeout(resolveWait, 50);
    });
  }
  throw new Error(`No element matches ${JSON.stringify(query)} within 30 s`);
};

// Runs in the page. Safari's client rects already follow the scroll that the
// keyboard makes, where the visual viewport's offset would count it again, so
// an unzoomed page's CSS point is its web view point below the inset.
const assertUnzoomed = () => {
  const scale = window.visualViewport?.scale ?? 1;

  if (scale !== 1) {
    throw new Error(
      `The iPhone lane touches only an unzoomed page; the scale is ${scale}.`
    );
  }
};

const CALIBRATION_LABEL = 'plate-device-calibration';

// Runs in the page.
const placeMarker = (label: string) => {
  let marker = document.getElementById(label);

  if (!marker) {
    marker = document.createElement('div');
    marker.id = label;
    marker.setAttribute('role', 'img');
    marker.setAttribute('aria-label', label);
    marker.style.cssText =
      'position:fixed;left:8px;top:8px;width:24px;height:24px;pointer-events:none';
    document.body.append(marker);
  }

  const rect = marker.getBoundingClientRect();

  return { x: rect.left, y: rect.top };
};

const argument = (value: unknown) => JSON.stringify(value) ?? 'undefined';

// A load would find the old document complete, so the old document carries a
// mark the new one lacks.
const loadedHttpPageHref = `!window.__plateDeviceLeft && document.readyState === 'complete' && /^https?:$/.test(location.protocol) ? location.href : ''`;

const loadPage = async (page: InspectorPage, url: string) => {
  const target = new URL(url).href;
  let landedHref = '';

  await page.evaluate('window.__plateDeviceLeft = true', 5000).catch(() => {});
  await page
    .evaluate(`location.assign(${argument(target)})`, 5000)
    .catch(() => {});
  await expect
    .poll(
      async () => {
        const href = await page
          .evaluate<string>(loadedHttpPageHref, 5000)
          .catch(() => '');

        landedHref = href;
        return Boolean(href);
      },
      { message: `Safari never loaded ${target}.`, timeout: 60_000 }
    )
    .toBe(true);
  return landedHref;
};

// The runner's frame of an element lags while the keyboard scrolls the page,
// so the inset is measured on a page with no editor, and only once the marker
// reads the same on both sides of the frame query.
const measureInset = async (page: InspectorPage, runner: IosRunner) => {
  const measure = () =>
    page.evaluate<Point>(
      `(${placeMarker.toString()})(${argument(CALIBRATION_LABEL)})`
    );

  await page.evaluate(`(${assertUnzoomed.toString()})()`);
  for (let attempt = 0; attempt < 10; attempt++) {
    const before = await measure();
    const frame = checked(
      await runner.send({ action: 'frame', label: CALIBRATION_LABEL })
    );
    const after = await measure();

    if (before.x === after.x && before.y === after.y) {
      await page.evaluate(
        `document.getElementById(${argument(CALIBRATION_LABEL)}).remove()`
      );
      return { x: (frame.x ?? 0) - after.x, y: (frame.y ?? 0) - after.y };
    }
  }
  throw new Error(
    'The visual viewport kept moving while the lane measured the page origin.'
  );
};

// Runs in the page.
const settleViewport = () =>
  new Promise<void>((resolve, reject) => {
    const read = () =>
      [
        window.scrollX,
        window.scrollY,
        window.visualViewport?.offsetTop,
        window.visualViewport?.height,
        window.visualViewport?.scale,
      ].join();
    let last = read();
    let stable = 0;
    let frame = 0;
    const timer = window.setTimeout(() => {
      window.cancelAnimationFrame(frame);
      reject(new Error('The viewport did not settle.'));
    }, 2000);
    const sample = () => {
      const next = read();

      stable = next === last ? stable + 1 : 0;
      last = next;
      if (stable < 3) {
        frame = window.requestAnimationFrame(sample);
        return;
      }
      window.clearTimeout(timer);
      resolve();
    };

    frame = window.requestAnimationFrame(sample);
  });

export const openSafariTab = async (
  inspector: WebInspector,
  udid: string,
  url: string
): Promise<InspectorPageInfo> => {
  // A Safari left from an earlier run can keep XCUITest waiting 60 s for it to
  // go idle before each action, so each run starts a fresh one.
  spawnSync('xcrun', ['simctl', 'terminate', udid, 'com.apple.mobilesafari'], {
    stdio: 'ignore',
  });
  // `simctl openurl` can go unanswered on a fresh boot, so it is sent again
  // every 10 s until Safari lists the page.
  for (const deadline = Date.now() + 60_000; Date.now() < deadline;) {
    execFileSync('xcrun', ['simctl', 'openurl', udid, url]);
    for (const resend = Date.now() + 10_000; Date.now() < resend;) {
      const listed = await inspector.safariPages();
      const page = listed.find((candidate) => candidate.url === url);

      if (page) return page;
      await sleep(500);
    }
  }
  throw new Error(`Safari on ${udid} never listed ${url}.`);
};

export const connectIos = async (
  state: IosRunState,
  inspector: WebInspector,
  { insetURL, runnerLog }: { insetURL: string; runnerLog: string }
): Promise<IosConnection> => {
  let info: InspectorPageInfo | undefined;

  for (const deadline = Date.now() + 10_000; Date.now() < deadline;) {
    const listed = await inspector.safariPages();

    info = listed.find((candidate) => candidate.id === state.pageId);
    if (info) break;
    await sleep(200);
  }

  if (!info) throw new Error(`Safari no longer lists page ${state.pageId}.`);

  const [page, runner] = await Promise.all([
    inspector.open(info),
    startIosRunner({
      log: runnerLog,
      udid: state.serial,
      xctestrun: state.xctestrun,
    }),
  ]);

  try {
    checked(await runner.send({ action: 'activate' }));
    await loadPage(page, insetURL);

    const inset = await measureInset(page, runner);

    return {
      close: async () => {
        await runner.stop();
        page.close();
      },
      inset,
      page,
      platform: 'ios',
      runner,
      state,
    };
  } catch (error) {
    await runner.stop();
    throw error;
  }
};

export const createIosDriver = ({
  inset,
  page: inspector,
  runner,
  state,
}: IosConnection): DeviceDriver => {
  const caseStart = inspector.log.length;
  let { origin } = new URL(state.appURL);

  const send = async (command: Parameters<IosRunner['send']>[0]) =>
    checked(await runner.send(command));

  const webPoint = async (css: Point) => {
    await inspector.evaluate(`(${assertUnzoomed.toString()})()`);
    return { x: inset.x + css.x, y: inset.y + css.y };
  };

  const errors = (): BrowserRuntimeErrorRecorder => {
    let start = inspector.log.length;
    const recorded: string[] = [];

    return {
      assertNone: () => expect(recorded).toEqual([]),
      errors: recorded,
      reset: () => {
        start = inspector.log.length;
        recorded.length = 0;
      },
      // A page error reaches the inspector as a `javascript` console message.
      stop: () => {
        for (const { message, sent } of inspector.log.slice(start)) {
          const logged = message.params?.message as
            | { level?: string; source?: string; text?: string; url?: string }
            | undefined;

          if (sent || message.method !== 'Console.messageAdded') continue;
          if (logged?.level !== 'error') continue;

          const text = logged.text ?? '';
          const kept =
            logged.source === 'javascript'
              ? !isIgnoredRuntimeError(text, logged.url ?? '', origin)
              : logged.source === 'console-api' &&
                DEFAULT_RUNTIME_ERROR_PATTERNS.some((pattern) =>
                  text.includes(pattern)
                );

          if (kept) recorded.push(text);
        }
        start = inspector.log.length;
      },
    };
  };

  return {
    failureAttachments: () => ({
      'inspector-messages.json': inspector.log.slice(caseStart),
    }),
    errors,
    keyboard: ({ gesture }) => {
      const tapKey = (label: string, key: DeviceWitnessKey) =>
        gesture({ key, kind: 'key', label }, async () => {
          const { label: tapped = label } = await send({
            action: 'key',
            label,
          });

          return tapped === label
            ? undefined
            : { key: tapped, kind: 'key', label: tapped };
        });
      // A key on another panel is two switches away at most. Each switch is a
      // step of its own, because the one to the symbols panel sits where Shift
      // does and sends Shift's keydown.
      const press = async (label: string, key: DeviceWitnessKey) => {
        for (let switches = 0; switches < 2; switches++) {
          const { panelSwitch } = await send({ action: 'find', label });

          if (!panelSwitch) break;
          await tapKey(panelSwitch, panelSwitch === 'symbols' ? 'Shift' : null);
        }
        await tapKey(label, key);
      };

      return {
        languages: IOS_LANGUAGES,
        forgetPage: () => {},
        shown: async () => {
          const { shown } = await send({ action: 'keyboard' });

          return shown === true;
        },
        strip: async (candidate) => {
          const { candidates = [] } = await send({ action: 'candidates' });
          const label = candidates.find((word) =>
            typeof candidate === 'string'
              ? word === candidate
              : candidate.test(word)
          );

          if (label === undefined) {
            throw new Error(
              `The suggestion strip shows ${candidates.join(', ') || 'nothing'}, not ${candidate}.`
            );
          }

          await gesture({ kind: 'strip', label }, async () => {
            await send({ action: 'candidate', label });
          });

          return label;
        },
        tap: async (label) => {
          const named = Object.values(NAMED_KEYS).find(
            (entry) => entry.label === label
          );

          await press(label, named?.key ?? (label.length === 1 ? label : null));
        },
        type: async (text) => {
          for (const character of text) {
            const named = NAMED_KEYS[character];

            await press(named?.label ?? character, named?.key ?? character);
          }
        },
        use: async (language) => {
          const seen: string[] = [];

          for (let taps = 0; taps <= IOS_LANGUAGES.length; taps++) {
            const { deleteLabel, shown } = await send({ action: 'keyboard' });

            if (!shown) {
              throw new Error(
                'Show the keyboard before switching its language.'
              );
            }
            if (iosKeyboardLanguage(deleteLabel) === language) return;
            seen.push(describeIosKeyboard(deleteLabel));
            if (taps === IOS_LANGUAGES.length) break;
            await send({ action: 'nextKeyboard' });
          }
          throw new Error(
            `The iPhone keyboard never switched to ${language}; passed ${seen.join(', ')}.`
          );
        },
      };
    },
    page: {
      find: (query) => ({
        evaluate: (pageFunction, arg) =>
          inspector.evaluate(
            `(${findElement.toString()})(${argument(serialQuery(query))}).then((element) => (${pageFunction.toString()})(element, ${argument(arg)}))`
          ),
      }),
      open: async (url) => {
        ({ origin } = new URL(await loadPage(inspector, url)));
      },
    },
    screen: {
      doubleTap: async (css) => {
        await send({ action: 'doubleTap', ...(await webPoint(css)) });
      },
      press: async (css, ms) => {
        await send({ action: 'press', ms, ...(await webPoint(css)) });
      },
      afterLoad: async () => {
        await inspector.evaluate(`(${settleViewport.toString()})()`);
      },
      settle: async () => {
        await send({ action: 'idle' });
      },
      tap: async (css) => {
        await send({ action: 'tap', ...(await webPoint(css)) });
      },
    },
    system: {
      back: async () => {
        throw new Error('The iPhone simulator has no system Back button.');
      },
    },
  };
};
