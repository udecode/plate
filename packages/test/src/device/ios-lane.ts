import { execFileSync } from 'node:child_process';

import { expect } from '@playwright/test';

import {
  type BrowserRuntimeErrorRecorder,
  DEFAULT_RUNTIME_ERROR_PATTERNS,
  isIgnoredRuntimeError,
} from '../playwright/runtime-errors';
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
  '\b': { key: 'Backspace', label: 'delete' },
  '\n': { key: 'Enter', label: 'Return' },
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
    (text ?? '').replaceAll(/\s+/g, ' ').trim();
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
      const exact = (element: Element) =>
        normalize(element.textContent) === current.text;

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

// A same-URL load would find the old document complete, so the old document
// carries a mark the new one lacks.
const loadPage = async (page: InspectorPage, url: string) => {
  const target = new URL(url).href;

  await page
    .evaluate(
      `(window.__plateDeviceLeft = true, location.assign(${argument(target)}))`,
      5000
    )
    .catch(() => {});
  await expect
    .poll(
      () =>
        page
          .evaluate<boolean>(
            `!window.__plateDeviceLeft && document.readyState === 'complete' && location.href === ${argument(target)}`,
            5000
          )
          .catch(() => false),
      { message: `Safari never loaded ${target}.`, timeout: 60_000 }
    )
    .toBe(true);
  return target;
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

export const openSafariTab = async (
  inspector: WebInspector,
  udid: string,
  url: string
): Promise<InspectorPageInfo> => {
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
  const listed = await inspector.safariPages();
  const info = listed.find((candidate) => candidate.id === state.pageId);

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
      const press = (label: string, key: DeviceWitnessKey) =>
        gesture({ key, kind: 'key', label }, async () => {
          const { label: tapped = label } = await send({
            action: 'key',
            label,
          });

          return tapped === label
            ? undefined
            : { key: tapped, kind: 'key', label: tapped };
        });

      return {
        languages: ['en'],
        forgetPage: () => {},
        shown: async () => {
          const { shown } = await send({ action: 'keyboard' });

          return shown === true;
        },
        strip: () => {
          throw new Error('The iPhone lane cannot tap the suggestion bar yet.');
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

            if (named) {
              await press(named.label, named.key);
            } else if (/^\p{L}$/u.test(character)) {
              await press(character, character);
            } else {
              throw new Error(
                `The iPhone lane types letters, space, Backspace and Enter; "${character}" needs another keyboard panel.`
              );
            }
          }
        },
        use: async (language) => {
          if (language !== 'en') {
            throw new Error(
              `The iPhone simulator has only the English keyboard, not ${language}.`
            );
          }
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
      press: async (css, ms) => {
        await send({ action: 'press', ms, ...(await webPoint(css)) });
      },
      afterLoad: async () => {},
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
