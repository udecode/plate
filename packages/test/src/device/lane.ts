import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { test as base, expect, type TestType } from '@playwright/test';

import { READY_TIMEOUT_MS } from '../playwright/constants';
import { createEditorGet, snapshotEditor } from '../playwright/editor-reads';
import { createEditorAssertions } from '../playwright/harness-assertions';
import {
  readBrowserNativeEventTraceSeq,
  startBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from '../playwright/native-event-trace';
import type { BrowserRuntimeErrorRecorder } from '../playwright/runtime-errors';
import { hasSelectionHandle } from '../playwright/selection-handle';
import { takeSelectionSnapshotForRoot } from '../playwright/selection-snapshots';
import type {
  BrowserEditorHarness,
  BrowserNativeEventTraceEntry,
  EditorRoot,
  SelectionPoint,
} from '../playwright/types';
import type { DeviceLanguage } from './android';
import {
  type AndroidConnection,
  connectAndroid,
  createAndroidDriver,
} from './android-lane';
import { connectIos, createIosDriver, type IosConnection } from './ios-lane';
import {
  type DeviceWitnessGesture,
  type DeviceWitnessStep,
  type DeviceWitnessViolation,
  judgeDeviceWitness,
} from './witness';

type DeviceRunCommon = {
  appURL: string;
  buildFingerprint: string | null;
  /** The adb serial of an Android device, or the UDID of an iPhone simulator. */
  serial: string;
  wwwURL: string | null;
};

export type AndroidRunState = DeviceRunCommon & {
  chromePid: string;
  endpoint: string;
  gboardVersion: string;
  platform: 'android';
  targetId: string;
};

export type IosRunState = DeviceRunCommon & {
  pageId: number;
  platform: 'ios';
  xctestrun: string;
};

/** What globalSetup records per serial for workers to reattach. */
export type DeviceRunState = AndroidRunState | IosRunState;

export const DEVICE_STATE_PATH = 'test-results/device/state.json';

type Point = { x: number; y: number };

/** An element on the current page, found again on every read. */
export type DeviceQuery =
  | { button: RegExp | string }
  | { css: string; within?: DeviceQuery }
  | { testId: string }
  | { text: string };

export type DevicePage = {
  find: (query: DeviceQuery) => EditorRoot;
  /** Load a URL in the owned tab and wait for its load event. */
  open: (url: string) => Promise<void>;
};

/** Touches at CSS points of the current page's layout viewport. */
export type DeviceScreen = {
  press: (point: Point, ms: number) => Promise<void>;
  afterLoad: () => Promise<void>;
  tap: (point: Point) => Promise<void>;
};

export type DeviceGesture = (
  step: DeviceWitnessGesture,
  /** Makes the gesture; it returns the gesture it made when that differs from `step`. */
  act: () => DeviceWitnessGesture | Promise<DeviceWitnessGesture | void> | void
) => Promise<void>;

export type DeviceKeyboard = DeviceLane['keyboard'] & {
  forgetPage: () => void;
  strip: DeviceLane['tapStrip'];
};

export type DeviceDriver = {
  failureAttachments: () => Record<string, unknown>;
  errors: () => BrowserRuntimeErrorRecorder;
  keyboard: (lane: {
    gesture: DeviceGesture;
    steps: () => readonly DeviceWitnessStep[];
    trace: () => Promise<BrowserNativeEventTraceEntry[]>;
  }) => DeviceKeyboard;
  page: DevicePage;
  screen: DeviceScreen;
};

const EDITOR_ROOT = '[data-editor="true"][contenteditable="true"]';

const TRACED_EVENTS = [
  'keydown',
  'pointerdown',
  'beforeinput',
  'input',
  'compositionstart',
  'compositionupdate',
  'compositionend',
] as const;

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
  childRoot: (key: string) => DeviceEditor;
  selection: Pick<BrowserEditorHarness['selection'], 'get'>;
  touch: {
    press: (point: SelectionPoint, ms?: number) => Promise<void>;
    pressPastEnd: (path: number[], ms?: number) => Promise<void>;
    tap: (point: SelectionPoint) => Promise<void>;
  };
};

export type DeviceLane = {
  copy: (text: string) => Promise<void>;
  keyboard: {
    readonly languages: readonly DeviceLanguage[];
    shown: () => Promise<boolean>;
    tap: (label: string) => Promise<void>;
    type: (text: string) => Promise<void>;
    use: (language: DeviceLanguage) => Promise<void>;
  };
  open: (url: string) => Promise<void>;
  openControl: () => Promise<{
    read: () => Promise<{
      anchorOffset: number | null;
      collapsed: boolean | null;
      focused: boolean;
      focusOffset: number | null;
      text: string;
    }>;
  }>;
  openExample: (example: string) => Promise<DeviceEditor>;
  openWww: (path: string) => Promise<DeviceEditor>;
  knownFailure: <T>(failure: DeviceKnownFailure<T>) => Promise<void>;
  /** Steps on the current page. */
  steps: () => readonly DeviceWitnessStep[];
  tapStrip: (candidate: RegExp | string) => Promise<string>;
  touch: {
    tapButton: (name: RegExp | string) => Promise<void>;
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

export const createDeviceLane = ({
  driver,
  state,
}: {
  driver: DeviceDriver;
  state: DeviceRunState;
}) => {
  const pages: Array<{
    events: BrowserNativeEventTraceEntry[];
    steps: DeviceWitnessStep[];
  }> = [];
  let steps: DeviceWitnessStep[] = [];
  let root: EditorRoot | null = null;

  const lastSeq = async () => (root ? readBrowserNativeEventTraceSeq(root) : 0);

  const trace = async () => {
    if (!root) return [];

    const { entries } = await takeBrowserNativeEventTrace(root);

    return entries;
  };

  // Each gesture owns the sequence range from its first event until input
  // stays quiet, so a slow event cannot slip into the next step's window.
  const gesture: DeviceGesture = async (step, act) => {
    const seqStart = (await lastSeq()) + 1;
    const made = (await act()) ?? step;

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

    steps.push({ ...made, seqEnd: last + 1, seqStart });
  };

  const keyboard = driver.keyboard({ gesture, steps: () => steps, trace });

  // A new page restarts the trace's seq, so each page is judged on its own.
  const leavePage = async () => {
    if (root) pages.push({ events: await trace(), steps });
    steps = [];
    root = null;
    keyboard.forgetPage();
  };

  const startTrace = async (target: EditorRoot) => {
    root = target;
    await startBrowserNativeEventTrace(target, {
      events: TRACED_EVENTS,
      maxEntries: 10_000,
    });
  };

  const pointFor = (
    editorRoot: EditorRoot,
    path: number[],
    target: number | 'past-end'
  ) =>
    editorRoot.evaluate(
      async (element, { path: textPath, target: textTarget }) => {
        const renderedHere = (text: Element) =>
          text.closest('[data-editor="true"]') === element;
        const host = [
          ...element.querySelectorAll(
            `[data-editor-node="text"][data-editor-path="${textPath.join(',')}"]`
          ),
        ].find(renderedHere);

        const block = host?.closest('[data-editor-node="element"]');

        if (!host || !block) return null;

        const measure = () => {
          if (textTarget === 'past-end') {
            const contents = document.createRange();

            contents.selectNodeContents(host);

            const line = [...contents.getClientRects()].at(-1);

            if (!line) return null;

            const { right } = block.getBoundingClientRect();

            if (right - line.right < 16) {
              throw new Error(
                `The text at ${textPath.join(',')} fills its line.`
              );
            }
            return {
              x: (line.right + right) / 2,
              y: line.top + line.height / 2,
            };
          }

          const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
          let remaining = textTarget;
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
        };
        const coveredBy = (point: { x: number; y: number }) => {
          const view = window.visualViewport;
          const top = view?.offsetTop ?? 0;

          if (point.y < top || point.y > top + (view?.height ?? innerHeight)) {
            return 'the edge of the visual viewport';
          }

          const hit = document.elementFromPoint(point.x, point.y);

          if (block.contains(hit)) return null;
          return hit ? hit.outerHTML.slice(0, 120) : 'nothing';
        };
        let point = measure();

        if (point && coveredBy(point)) {
          host.scrollIntoView({ block: 'center' });
          await new Promise((resolveScroll) => {
            setTimeout(resolveScroll, 400);
          });
          point = measure();
        }

        const covered = point && coveredBy(point);

        if (covered) {
          throw new Error(
            `The text at ${textPath.join(',')} is under ${covered}.`
          );
        }
        return point;
      },
      { path, target }
    );

  const contentTouch = (
    label: string,
    css: Point,
    act: (point: Point) => Promise<void>
  ) => gesture({ kind: 'content', label, target: css }, () => act(css));

  // The soft keyboard shrinks and scrolls the visual viewport, so a target in
  // the layout viewport can still sit under the browser toolbar.
  const tapQuery = async (label: string, query: DeviceQuery) => {
    const center = await driver.page.find(query).evaluate(async (element) => {
      const measure = () => {
        const rect = element.getBoundingClientRect();
        const view = window.visualViewport;
        const top = view?.offsetTop ?? 0;
        const height = view?.height ?? innerHeight;
        const left = view?.offsetLeft ?? 0;
        const width = view?.width ?? innerWidth;
        const widestLine =
          Array.from(element.getClientRects()).toSorted(
            (a, b) => b.width - a.width
          )[0] ?? rect;
        const x = widestLine.left + widestLine.width / 2;
        const y = widestLine.top + widestLine.height / 2;

        return {
          reachable:
            rect.top >= top &&
            rect.bottom <= top + height &&
            rect.left >= left &&
            rect.right <= left + width &&
            element.contains(document.elementFromPoint(x, y)),
          x,
          y,
        };
      };

      if (!measure().reachable) {
        element.scrollIntoView({ block: 'center', inline: 'nearest' });
        await new Promise((resolveScroll) => {
          setTimeout(resolveScroll, 400);
        });
      }

      return measure();
    }, undefined);

    if (!center.reachable) throw new Error(`No touch reaches ${label}.`);
    await contentTouch(label, center, driver.screen.tap);
  };

  const editorFor = (query: DeviceQuery, name = ''): DeviceEditor => {
    const editorRoot = driver.page.find(query);
    const get = createEditorGet(editorRoot);
    const touchText = async (
      verb: string,
      path: number[],
      target: number | 'past-end',
      act: (point: Point) => Promise<void>
    ) => {
      const at = `${name}${path.join(',')}`;
      const css = await pointFor(editorRoot, path, target);

      if (!css) throw new Error(`No rendered text at ${at}.`);
      await contentTouch(`${verb} ${at}:${target}`, css, act);
    };

    return {
      assert: {
        ...createEditorAssertions(editorRoot, get),
        placeholderVisible: async (visible = true) => {
          await expect
            .poll(() =>
              editorRoot.evaluate((element) => {
                const placeholder = element.querySelector(
                  '[data-editor-placeholder="true"]'
                );
                const rect = placeholder?.getBoundingClientRect();

                return (
                  !!rect &&
                  rect.width > 0 &&
                  rect.height > 0 &&
                  getComputedStyle(placeholder as Element).visibility !==
                    'hidden'
                );
              }, undefined)
            )
            .toBe(visible);
        },
        text: async (text) => {
          await expect
            .poll(() => get.text())
            .toEqual(
              typeof text === 'string'
                ? expect.stringContaining(text)
                : expect.stringMatching(text)
            );
        },
      },
      childRoot: (key) =>
        editorFor(
          {
            css: `[data-editor="true"][data-editor-root="${key}"]`,
            within: query,
          },
          `${key} `
        ),
      get,
      selection: { get: () => takeSelectionSnapshotForRoot(editorRoot) },
      snapshot: () => snapshotEditor(get),
      touch: {
        press: (point, ms = 600) =>
          touchText('press', point.path, point.offset, (css) =>
            driver.screen.press(css, ms)
          ),
        pressPastEnd: (path, ms = 600) =>
          touchText('press', path, 'past-end', (css) =>
            driver.screen.press(css, ms)
          ),
        tap: (point) =>
          touchText('tap', point.path, point.offset, driver.screen.tap),
      },
    };
  };

  const openEditor = async (url: string) => {
    await leavePage();
    await driver.page.open(url);

    const query = { css: EDITOR_ROOT };
    const editorRoot = driver.page.find(query);

    await expect
      .poll(
        async () =>
          (await editorRoot.evaluate(
            (element) => element.getClientRects().length > 0,
            undefined
          )) && (await hasSelectionHandle(editorRoot)),
        {
          message: 'The editor never showed with its browser handle installed.',
          timeout: READY_TIMEOUT_MS,
        }
      )
      .toBe(true);
    await driver.screen.afterLoad();
    await startTrace(editorRoot);
    return editorFor(query);
  };

  const lane: DeviceLane = {
    copy: async (text) => {
      await driver.page
        .find({ css: 'body' })
        .evaluate((_, value) => navigator.clipboard.writeText(value), text);
    },
    keyboard: {
      languages: keyboard.languages,
      shown: keyboard.shown,
      tap: keyboard.tap,
      type: keyboard.type,
      use: keyboard.use,
    },
    open: async (url) => {
      await leavePage();
      await driver.page.open(url);
      await driver.screen.afterLoad();
      await startTrace(driver.page.find({ css: 'body' }));
    },
    openControl: async () => {
      await lane.open(
        `data:text/html,${encodeURIComponent('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div contenteditable="true" data-test-id="ime-control" style="margin:24px;min-height:30vh;border:1px solid;font:24px sans-serif"><br></div>')}`
      );
      await lane.touch.tapTestId('ime-control');

      return {
        read: () =>
          driver.page.find({ testId: 'ime-control' }).evaluate((element) => {
            const selection = window.getSelection();

            return {
              anchorOffset: selection?.anchorOffset ?? null,
              collapsed: selection?.isCollapsed ?? null,
              focused: document.activeElement === element,
              focusOffset: selection?.focusOffset ?? null,
              text: element.textContent ?? '',
            };
          }, undefined),
      };
    },
    openExample: (example) =>
      openEditor(`${state.appURL}/examples/plite/${example}`),
    openWww: (path) => {
      if (!state.wwwURL) {
        throw new Error('Set PLATE_DEVICE_WWW_PORT to run www cases.');
      }
      return openEditor(`${state.wwwURL}${path}`);
    },
    knownFailure: async ({ desired, issue, name, observed, read }) => {
      const same = (left: unknown, right: unknown) =>
        JSON.stringify(left) === JSON.stringify(right);
      // The keyboard can still be committing when the last tap settles, and
      // the known value can pass through on the way to the desired one, so
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
    tapStrip: keyboard.strip,
    touch: {
      tapButton: (name) => tapQuery(`tap button ${name}`, { button: name }),
      tapTestId: (testId) => tapQuery(`tap ${testId}`, { testId }),
      tapText: (text) => tapQuery(`tap "${text}"`, { text }),
    },
    trace,
    www: state.wwwURL,
    witness: async () => {
      const all = [...pages, { events: await trace(), steps }];

      return {
        pages: all,
        violations: all.flatMap((judged) => judgeDeviceWitness(judged)),
      };
    },
  };

  return lane;
};

const describeRun = (state: DeviceRunState) =>
  state.platform === 'android'
    ? `chrome ${state.chromePid}, target ${state.targetId}, build ${state.buildFingerprint ?? 'none'}`
    : `safari page ${state.pageId} on ${state.serial}, build ${state.buildFingerprint ?? 'none'}`;

// The built-in fixtures are typed never so a case cannot reach them.
type DeviceFixtures = {
  context: never;
  device: DeviceLane;
  page: never;
  request: never;
};
type DeviceWorkerFixtures = {
  browser: never;
  deviceConnection: AndroidConnection | IosConnection;
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
      const driver =
        deviceConnection.platform === 'ios'
          ? createIosDriver(deviceConnection)
          : createAndroidDriver(deviceConnection);
      const lane = createDeviceLane({ driver, state: deviceConnection.state });
      const runtimeErrors = driver.errors();

      try {
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
          description: describeRun(deviceConnection.state),
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
      } finally {
        runtimeErrors.stop();
        await testInfo.attach('browser-runtime-errors.json', {
          body: JSON.stringify(runtimeErrors.errors, null, 2),
          contentType: 'application/json',
        });
        if (testInfo.status !== testInfo.expectedStatus) {
          for (const [name, body] of Object.entries(
            driver.failureAttachments()
          )) {
            await testInfo.attach(name, {
              body: JSON.stringify(body, null, 2),
              contentType: 'application/json',
            });
          }
        }
        runtimeErrors.assertNone();
      }
    },
    deviceConnection: [
      async ({ deviceSerial }, use, workerInfo) => {
        const configDir = dirname(
          workerInfo.config.configFile ?? process.cwd()
        );
        const state = readDeviceRunState(deviceSerial, configDir);
        const connection =
          state.platform === 'ios'
            ? await connectIos(state, {
                runnerLog: resolve(
                  configDir,
                  `test-results/device/ios-runner-${workerInfo.workerIndex}.log`
                ),
              })
            : await connectAndroid(state);

        await use(connection);
        await connection.close();
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
