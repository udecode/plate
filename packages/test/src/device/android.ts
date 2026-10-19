// Local-only Android device access for the device lane
// (docs/plans/2026-10-02-proof-device-lane.md). Input is limited to real
// touches: tap, press and move. Nothing here can type text; guard.ts serves
// the DevTools endpoint that refuses every `Input.*` command.
//
// Node loads this file directly for tooling/device/android.mjs, so it has no
// relative imports and only erasable TypeScript.

import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const GBOARD_PACKAGE = 'com.google.android.inputmethod.latin';
const GBOARD_IME = `${GBOARD_PACKAGE}/com.android.inputmethod.latin.LatinIME`;

// Gboard settings the lane expects, by their settings-screen title.
const GBOARD_EXPECTED_SETTINGS: Record<string, boolean> = {
  'Auto-capitalization': true,
  'Auto-correction': true,
  'Suggestion strip': true,
  'Word suggestions': true,
};

export type DeviceLanguage = 'en' | 'ja' | 'ko' | 'zh';

const GBOARD_LAYOUTS = {
  en: { languageTag: 'en-US', variant: 'qwerty', row: 'English (US), QWERTY' },
  ja: {
    languageTag: 'ja-JP',
    variant: 'japanese_qwerty',
    row: '日本語, QWERTY',
  },
  ko: {
    languageTag: 'ko-KR',
    variant: 'korean_two_bulsik',
    row: '한국어, 두벌식',
  },
  zh: { languageTag: 'zh-CN', variant: 'qwerty', row: '简体中文, 拼音' },
};

export type DeviceKeyboardIdentity = {
  chineseInlineComposing: boolean | null;
  languageTag: string;
  subtypeHashCode: string;
  variant: string;
};

export const requestedLanguages = (): DeviceLanguage[] => {
  const values = process.env.PLATE_DEVICE_LANGUAGES?.split(',') ?? ['en', 'ko'];
  const languages: DeviceLanguage[] = [];

  for (const value of values) {
    if (value !== 'en' && value !== 'ko' && value !== 'ja' && value !== 'zh') {
      throw new Error(
        `Unsupported device language "${value}"; use en, ko, ja or zh.`
      );
    }
    if (languages.includes(value)) {
      throw new Error(`Device language "${value}" is requested twice.`);
    }
    languages.push(value);
  }
  return languages;
};

export type DevicePanel = 'letters' | 'symbols';

export type DeviceKey = {
  bounds: [number, number, number, number];
  x: number;
  y: number;
};

export type DeviceKeyMap = {
  controls: { backspace: string; enter: string; space: string };
  gboardVersion: string;
  language: DeviceLanguage;
  languageTag: string;
  letterLabels: string[];
  panel: DevicePanel;
  screen: string;
  subtype: string;
  variant: string;
  keys: Record<string, DeviceKey>;
};

export type DeviceRestoreState = {
  languageLayoutsBefore: Array<{ language: DeviceLanguage; layouts: string[] }>;
  changedSettings: Array<{ name: string; from: boolean }>;
  createdAt: string;
  forwards: string[];
  ownedTargets: string[];
  reverses: string[];
  selectedSubtype: string;
  /** Set when setup finished; calibrate and run ports also create this file. */
  setupCompletedAt: string | null;
  zenMode: string | null;
};

const stateRoot =
  process.platform === 'darwin'
    ? join(homedir(), 'Library/Caches/plate-proof/android')
    : join(homedir(), '.cache/plate-proof/android');

const deviceStateDir = (serial: string) =>
  join(stateRoot, serial.replaceAll(/[^\w.-]/g, '_'));

const restorePath = (serial: string) =>
  join(deviceStateDir(serial), 'restore.json');
const lockPath = (serial: string) => join(deviceStateDir(serial), 'lock.json');
const keyMapPath = (serial: string) =>
  join(deviceStateDir(serial), 'keymap.json');

const readJSON = <T>(path: string): T | null =>
  existsSync(path) ? (JSON.parse(readFileSync(path, 'utf-8')) as T) : null;

const writeJSON = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isAlive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const adb = (serial: string, args: string[]) =>
  execFileSync('adb', ['-s', serial, ...args], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  });

const shell = (serial: string, ...args: string[]) =>
  adb(serial, ['shell', ...args]).trim();

export const listSerials = () =>
  execFileSync('adb', ['devices'], { encoding: 'utf-8' })
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([serial, state]) => serial && state === 'device')
    .map(([serial]) => serial);

const isEmulator = (serial: string) =>
  serial.startsWith('emulator-') ||
  shell(serial, 'getprop', 'ro.kernel.qemu') === '1';

// Creates `path` only if it does not exist; false means someone holds it.
const createExclusive = (path: string, owner: number) => {
  try {
    writeFileSync(
      path,
      `${JSON.stringify({ owner, startedAt: new Date().toISOString() })}\n`,
      { flag: 'wx' }
    );
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  }
};

const readLockOwner = (serial: string, path: string) => {
  try {
    return readJSON<{ owner: number }>(path)?.owner ?? null;
  } catch {
    throw new Error(`Device ${serial} is being locked by another process.`);
  }
};

/**
 * Take the serial's lock with an exclusive create. Only `restore` passes
 * `takeOverStale`, because a dead owner can leave settings and ports behind.
 */
export const acquireSerialLock = (
  serial: string,
  { owner = process.pid, takeOverStale = false } = {}
) => {
  const path = lockPath(serial);

  mkdirSync(dirname(path), { recursive: true });
  if (createExclusive(path, owner)) return;

  const held = readLockOwner(serial, path);

  if (held === owner) return;
  if (held !== null && isAlive(held)) {
    throw new Error(`Device ${serial} is locked by process ${held}.`);
  }
  if (!takeOverStale) {
    throw new Error(
      `Device ${serial} has a stale lock from process ${held}; run tooling/device/android.mjs restore ${serial}.`
    );
  }

  // Takers hold this marker through the check and the replace, so one taker
  // never removes a lock another taker just created.
  const marker = `${path}.takeover`;

  if (!createExclusive(marker, owner)) {
    throw new Error(
      `Another process is recovering ${serial}; if none is, delete ${marker}.`
    );
  }
  try {
    const current = readLockOwner(serial, path);

    if (current === owner) return;
    if (current !== null && isAlive(current)) {
      throw new Error(`Device ${serial} is locked by process ${current}.`);
    }
    rmSync(path, { force: true });
    if (!createExclusive(path, owner)) {
      throw new Error(`Device ${serial} was locked by another process.`);
    }
  } finally {
    rmSync(marker, { force: true });
  }
};

export const releaseSerialLock = (serial: string, owner = process.pid) => {
  const held = readJSON<{ owner: number }>(lockPath(serial));

  if (held && held.owner !== owner) {
    throw new Error(
      `Device ${serial} is locked by process ${held.owner}, not ${owner}.`
    );
  }
  rmSync(lockPath(serial), { force: true });
};

// Restore file. Originals are recorded once; later records only add owned
// resources, so an interrupted run never overwrites what setup found.

export const readRestoreState = (serial: string) => {
  const saved = readJSON<
    DeviceRestoreState & { koreanLayoutsBefore?: string[] | null }
  >(restorePath(serial));

  if (!saved) return null;
  const { koreanLayoutsBefore, ...current } = saved;

  return {
    ...current,
    languageLayoutsBefore:
      current.languageLayoutsBefore ??
      (koreanLayoutsBefore
        ? [{ language: 'ko' as const, layouts: koreanLayoutsBefore }]
        : []),
  };
};

const recordRestore = (serial: string, patch: Partial<DeviceRestoreState>) => {
  const current: DeviceRestoreState = readRestoreState(serial) ?? {
    changedSettings: [],
    createdAt: new Date().toISOString(),
    forwards: [],
    languageLayoutsBefore: [],
    ownedTargets: [],
    reverses: [],
    selectedSubtype: shell(
      serial,
      'settings',
      'get',
      'secure',
      'selected_input_method_subtype'
    ),
    setupCompletedAt: null,
    zenMode: isEmulator(serial)
      ? null
      : shell(serial, 'settings', 'get', 'global', 'zen_mode'),
  };
  const union = <T>(left: T[], right: T[] = []) => [
    ...new Set([...left, ...right]),
  ];

  writeJSON(restorePath(serial), {
    ...current,
    languageLayoutsBefore: [
      ...current.languageLayoutsBefore,
      ...(patch.languageLayoutsBefore ?? []).filter(
        (entry) =>
          !current.languageLayoutsBefore.some(
            (known) => known.language === entry.language
          )
      ),
    ],
    changedSettings: [
      ...current.changedSettings,
      ...(patch.changedSettings ?? []).filter(
        (change) =>
          !current.changedSettings.some((known) => known.name === change.name)
      ),
    ],
    forwards: union(current.forwards, patch.forwards),
    ownedTargets: union(current.ownedTargets, patch.ownedTargets),
    reverses: union(current.reverses, patch.reverses),
    setupCompletedAt: patch.setupCompletedAt ?? current.setupCompletedAt,
  } satisfies DeviceRestoreState);
};

/** The only input the lane can send: real touches through the device's input service. */
export const createDeviceTouch = (serial: string) => ({
  move: (from: [number, number], to: [number, number], ms = 300) => {
    shell(
      serial,
      'input',
      'swipe',
      ...[...from, ...to].map((value) => String(Math.round(value))),
      String(ms)
    );
  },
  press: (x: number, y: number, ms = 600) => {
    const point = [x, y].map((value) => String(Math.round(value)));

    shell(serial, 'input', 'swipe', ...point, ...point, String(ms));
  },
  tap: (x: number, y: number) => {
    shell(serial, 'input', 'tap', String(Math.round(x)), String(Math.round(y)));
  },
});

/** Forward a free host port to Chrome's DevTools socket and return it. */
export const forwardDevTools = (serial: string) => {
  const port = Number(
    adb(serial, [
      'forward',
      'tcp:0',
      'localabstract:chrome_devtools_remote',
    ]).trim()
  );

  recordRestore(serial, { forwards: [`tcp:${port}`] });
  return port;
};

// --no-rebind refuses a device port that another reverse already holds.
export const reversePort = (serial: string, port: number) => {
  adb(serial, ['reverse', '--no-rebind', `tcp:${port}`, `tcp:${port}`]);
  recordRestore(serial, { reverses: [`tcp:${port}`] });
};

export const recordOwnedTarget = (serial: string, targetId: string) => {
  recordRestore(serial, { ownedTargets: [targetId] });
};

// pidof exits 1 when Chrome is not running.
export const chromePid = (serial: string) => {
  try {
    return shell(serial, 'pidof', 'com.android.chrome');
  } catch {
    return '';
  }
};

// A port another step already removed is not an error.
const removePorts = (
  serial: string,
  forwards: string[],
  reverses: string[]
) => {
  for (const forward of forwards) {
    try {
      adb(serial, ['forward', '--remove', forward]);
    } catch {
      // adb already dropped it with the device connection.
    }
  }
  for (const reverse of reverses) {
    try {
      adb(serial, ['reverse', '--remove', reverse]);
    } catch {
      // adb already dropped it with the device connection.
    }
  }
};

/** Remove one run's forwards, reverses and targets while setup's state stays recorded. */
export const releaseRunResources = (
  serial: string,
  owned: { forwards: string[]; reverses: string[]; targets: string[] }
) => {
  removePorts(serial, owned.forwards, owned.reverses);

  const current = readRestoreState(serial);

  if (!current) return;
  writeJSON(restorePath(serial), {
    ...current,
    forwards: current.forwards.filter(
      (value) => !owned.forwards.includes(value)
    ),
    ownedTargets: current.ownedTargets.filter(
      (value) => !owned.targets.includes(value)
    ),
    reverses: current.reverses.filter(
      (value) => !owned.reverses.includes(value)
    ),
  } satisfies DeviceRestoreState);
};

export const openUrl = (serial: string, url: string) => {
  shell(
    serial,
    'am',
    'start',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    url,
    'com.android.chrome'
  );
};

// UI automation for setup only

type UiNode = {
  checked: boolean;
  checkable: boolean;
  clickable: boolean;
  desc: string;
  id: string;
  pkg: string;
  text: string;
  bounds: [number, number, number, number];
  x: number;
  y: number;
};

const parseNodes = (xml: string): UiNode[] =>
  [...xml.matchAll(/<node [^>]*>/g)].map(([tag]) => {
    const attr = (name: string) =>
      tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';
    const [x1, y1, x2, y2] = (attr('bounds')
      .match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/)
      ?.slice(1)
      .map(Number) ?? [0, 0, 0, 0]) as [number, number, number, number];

    return {
      bounds: [x1, y1, x2, y2],
      checkable: attr('checkable') === 'true',
      checked: attr('checked') === 'true',
      clickable: attr('clickable') === 'true',
      desc: attr('content-desc'),
      id: attr('resource-id'),
      pkg: attr('package'),
      text: attr('text').replaceAll('&amp;', '&'),
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };
  });

const dumpUi = (serial: string, windows: boolean) => {
  const path = windows
    ? '/sdcard/plate-proof-ui.xml'
    : '/sdcard/plate-proof-app.xml';
  const helper = process.env.PLATE_DEVICE_UI_DUMP_JAR;

  shell(serial, 'rm', '-f', path);
  if (helper) {
    if (!/^\/data\/local\/tmp\/[\w./-]+\.jar$/.test(helper)) {
      throw new Error('PLATE_DEVICE_UI_DUMP_JAR must name a device-local JAR.');
    }
    shell(
      serial,
      'env',
      `CLASSPATH=${helper}`,
      'app_process',
      '/system/bin',
      'WindowDump',
      path
    );
  } else {
    shell(
      serial,
      'uiautomator',
      'dump',
      ...(windows ? ['--windows'] : []),
      path
    );
  }

  const xml = adb(serial, ['exec-out', 'cat', path]);

  if (!xml.startsWith('<?xml') || !xml.includes('<node ')) {
    throw new Error('The device returned no readable UI hierarchy.');
  }
  return parseNodes(xml);
};

const dumpApp = (serial: string) => dumpUi(serial, false);
const dumpWindows = (serial: string) => dumpUi(serial, true);

const clickText = async (serial: string, pattern: RegExp, wait = 1500) => {
  const node = dumpApp(serial).find(
    (candidate) => pattern.test(candidate.text) || pattern.test(candidate.desc)
  );

  if (!node) throw new Error(`Setup could not find ${pattern} on screen.`);
  createDeviceTouch(serial).tap(node.x, node.y);
  await sleep(wait);
};

const openGboardSettings = async (serial: string, section: RegExp) => {
  const activity = shell(serial, 'dumpsys', 'input_method')
    .split('\n')
    .find((line) => line.includes(`mId=${GBOARD_IME} `))
    ?.match(/mSettingsActivityName=(\S+)/)?.[1];

  if (!activity || activity === 'null') {
    throw new Error('Gboard declares no settings activity.');
  }
  shell(
    serial,
    'am',
    'start',
    '-f',
    '0x10008000',
    '-n',
    `${GBOARD_PACKAGE}/${activity}`
  );
  await sleep(2000);
  await clickText(serial, section);
};

// The switch beside each title, which a tap flips; tapping a title can open
// that setting's own page instead (Auto-correction does on Gboard 17).
const readSettingToggles = (nodes: UiNode[]) => {
  const titles = new Map<string, UiNode>();
  const switches = new Map<string, UiNode>();

  for (const node of nodes) {
    if (node.text in GBOARD_EXPECTED_SETTINGS && !titles.has(node.text)) {
      titles.set(node.text, node);
    }
  }
  for (const [name, title] of titles) {
    const toggle = nodes.find(
      (node) =>
        node.checkable &&
        node.y > title.bounds[1] - 40 &&
        node.y < title.bounds[3] + 140
    );

    if (toggle) switches.set(name, toggle);
  }

  return switches;
};

const findSettingToggle = async (serial: string, name: string) => {
  const [width, height] = screenSize(serial).split('x').map(Number);
  let nodes = dumpApp(serial);

  for (const direction of [1, -1]) {
    let previous = '';

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const toggle = readSettingToggles(nodes).get(name);

      if (toggle && toggle.bounds[1] < toggle.bounds[3]) return toggle;

      const position = JSON.stringify(
        nodes.map(({ bounds, desc, text }) => ({ bounds, desc, text }))
      );

      if (position === previous) break;
      previous = position;
      createDeviceTouch(serial).move(
        [width / 2, height * (direction === 1 ? 0.4 : 0.85)],
        [width / 2, height * (direction === 1 ? 0.85 : 0.4)]
      );
      await sleep(600);
      nodes = dumpApp(serial);
    }
  }
  throw new Error(`Gboard setting "${name}" is not on its settings screen.`);
};

const readGboardSettings = async (serial: string) => {
  await openGboardSettings(serial, /^Corrections & suggestions$/);

  const settings: Record<string, boolean> = {};

  for (const name of Object.keys(GBOARD_EXPECTED_SETTINGS)) {
    const toggle = await findSettingToggle(serial, name);

    settings[name] = toggle.checked;
  }
  return settings;
};

/**
 * Tap each setting whose toggle differs from `wanted`; returns what changed.
 * `beforeTap` runs before each tap, so setup can journal the original first.
 */
const flipSettings = async (
  serial: string,
  wanted: Record<string, boolean>,
  beforeTap?: (change: { from: boolean; name: string }) => void
) => {
  await openGboardSettings(serial, /^Corrections & suggestions$/);

  const changed: Array<{ name: string; from: boolean }> = [];

  for (const [name, value] of Object.entries(wanted)) {
    // A toggle can reflow the screen, so each tap reads fresh positions.
    const toggle = await findSettingToggle(serial, name);
    if (toggle.checked !== value) {
      const change = { from: toggle.checked, name };

      beforeTap?.(change);
      createDeviceTouch(serial).tap(toggle.x, toggle.y);
      await sleep(800);
      const updated = await findSettingToggle(serial, name);

      if (updated.checked !== value) {
        throw new Error(`Gboard setting "${name}" did not switch.`);
      }
      changed.push(change);
    }
  }

  return changed;
};

// Each language row carries "<language>, <layout>" as its description; its
// visible text splits the two across nodes.
const languageLayouts = async (serial: string, language: DeviceLanguage) => {
  await openGboardSettings(serial, /^Languages$/);
  const prefix = GBOARD_LAYOUTS[language].row.split(', ')[0];

  return dumpApp(serial)
    .map((node) => node.desc)
    .filter((desc) => desc.startsWith(`${prefix}, `));
};

const addLanguage = async (serial: string, language: DeviceLanguage) => {
  const before = await languageLayouts(serial, language);

  if (before.includes(GBOARD_LAYOUTS[language].row)) return false;

  recordRestore(serial, {
    languageLayoutsBefore: [{ language, layouts: before }],
  });
  await clickText(serial, /^Add keyboard$/, 2500);
  await clickText(serial, /^Search language$/);
  await switchKeyboardLanguage(serial, 'en');

  const keyboard = readKeyboard(serial);
  const names = {
    en: { query: 'english', title: /^English \(US\)$/ },
    ja: { query: 'japanese', title: /^日本語$/ },
    ko: { query: 'korean', title: /^한국어$/ },
    zh: { query: 'chinese', title: /^简体中文$/ },
  };

  for (const letter of names[language].query) {
    const key = keyboard[letter];

    if (!key) {
      throw new Error(`Gboard has no "${letter}" key to search languages.`);
    }
    createDeviceTouch(serial).tap(key.x, key.y);
    await sleep(300);
  }

  await sleep(1500);
  await clickText(serial, names[language].title, 2500);
  if (language === 'ja') {
    if (before.length === 0) await clickText(serial, /^12 キー$/);
    await clickText(serial, /^QWERTY$/);
  }
  await clickText(serial, /^Done$/, 2500);
  const after = await languageLayouts(serial, language);

  if (
    !after.includes(GBOARD_LAYOUTS[language].row) ||
    before.some((row) => !after.includes(row))
  ) {
    throw new Error(
      `Gboard did not add ${GBOARD_LAYOUTS[language].row} while preserving its original layouts.`
    );
  }
  return true;
};

// The journal records the layouts before setup adds a language, so an interrupted
// setup or restore finds nothing, or only some layouts, left to remove.
const removeAddedLanguage = async (
  serial: string,
  language: DeviceLanguage,
  before: string[]
) => {
  const layouts = await languageLayouts(serial, language);
  const added = layouts.filter((desc) => !before.includes(desc));

  if (added.length === 0) return;
  await clickText(serial, /^Edit$/i);
  for (const node of dumpApp(serial).filter((row) =>
    added.includes(row.desc)
  )) {
    createDeviceTouch(serial).tap(node.x, node.y);
    await sleep(800);
  }
  await clickText(serial, /^Remove$/i);
};

export const gboardVersion = (serial: string) =>
  shell(serial, 'dumpsys', 'package', GBOARD_PACKAGE).match(
    /versionName=(\S+)/
  )?.[1] ?? 'unknown';

export const selectedSubtype = (serial: string) =>
  shell(serial, 'settings', 'get', 'secure', 'selected_input_method_subtype');

export const keyboardShown = (serial: string) =>
  shell(serial, 'dumpsys', 'input_method').includes('mInputShown=true');

export const screenSize = (serial: string) =>
  shell(serial, 'wm', 'size').match(/(\d+x\d+)\s*$/)?.[1] ?? 'unknown';

/** Screen y of Chrome's page top: the bottom of its toolbar container. */
export const chromeContentTop = (serial: string) => {
  const container = dumpWindows(serial).find(
    (node) => node.id === 'com.android.chrome:id/control_container'
  );

  return container?.bounds[3] ?? 0;
};

export const chromeContentBounds = (serial: string) => {
  const nodes = dumpWindows(serial);
  const content = nodes.find(
    (node) => node.id === 'com.android.chrome:id/compositor_view_holder'
  );
  const toolbar = nodes.find(
    (node) => node.id === 'com.android.chrome:id/control_container'
  );

  if (!content) throw new Error('Chrome has no native content rectangle.');

  return {
    bottom: Math.min(
      content.bounds[3],
      ...nodes
        .filter(
          (node) =>
            node.pkg === GBOARD_PACKAGE &&
            node.clickable &&
            node.desc &&
            node.bounds[2] > node.bounds[0] &&
            node.bounds[3] > node.bounds[1]
        )
        .map((node) => node.bounds[1])
    ),
    left: content.bounds[0],
    right: content.bounds[2],
    top: toolbar?.bounds[3] ?? content.bounds[1],
  };
};

/** Read Gboard's clickable keys by label from the current keyboard. */
export const readKeyboard = (serial: string) => {
  const keys: Record<string, DeviceKey> = {};

  for (const node of dumpWindows(serial)) {
    if (
      node.pkg !== GBOARD_PACKAGE ||
      !node.clickable ||
      !node.desc ||
      node.bounds[2] <= node.bounds[0] ||
      node.bounds[3] <= node.bounds[1]
    ) {
      continue;
    }

    const label = /^[a-z]$/i.test(node.desc)
      ? node.desc.toLowerCase()
      : node.desc;

    if (!keys[label] || /:id\/(?:[A-D]\d{2}|key_pos_\w+)$/.test(node.id)) {
      keys[label] = { bounds: node.bounds, x: node.x, y: node.y };
    }
  }

  return keys;
};

/** Gboard's current entry, independent of Android's selected-subtype setting. */
export const keyboardIdentity = (serial: string): DeviceKeyboardIdentity => {
  const current = shell(serial, 'dumpsys', 'input_method').match(
    /\[CurrentInputMethodEntryNotification[^\]]*\]([\s\S]*?)\[\/CurrentInputMethodEntryNotification/
  )?.[1];
  const languageTag = current?.match(/^\s+languageTag = (\S+)$/m)?.[1];
  const variant = current?.match(/^\s+variant = (\S+)$/m)?.[1];
  const subtypeHashCode = current?.match(
    /^\s+subtypeHashCode = (-?\d+)$/m
  )?.[1];
  const inline = current?.match(
    /(?:^|_)enable_chinese_inline_composing_cn=(true|false)(?:_|$)/m
  )?.[1];

  if (!languageTag || !variant || !subtypeHashCode) {
    throw new Error(
      'Gboard did not report a current language, layout and subtype identity.'
    );
  }
  return {
    chineseInlineComposing: inline ? inline === 'true' : null,
    languageTag,
    subtypeHashCode,
    variant,
  };
};

const languageFor = (
  identity: DeviceKeyboardIdentity
): DeviceLanguage | null => {
  for (const language of ['en', 'ko', 'ja', 'zh'] as const) {
    const expected = GBOARD_LAYOUTS[language];

    if (
      identity.languageTag === expected.languageTag &&
      identity.variant === expected.variant
    ) {
      return language;
    }
  }
  return null;
};

/** Tap the navigation bar's input method key until Gboard shows `language`. */
export const switchKeyboardLanguage = async (
  serial: string,
  language: DeviceLanguage
) => {
  const visited = new Set<string>();

  for (;;) {
    const keys = readKeyboard(serial);
    const identity = keyboardIdentity(serial);
    const layout = `${identity.languageTag}/${identity.variant}`;

    if (languageFor(identity) === language) return identity;
    if (visited.has(layout)) break;
    visited.add(layout);

    const switcher =
      keys['Switch input method'] ??
      keys['Next language'] ??
      keys['다음 언어'] ??
      keys['次の言語'] ??
      keys['下一种语言'];

    if (!switcher) throw new Error('Gboard shows no language key.');
    createDeviceTouch(serial).tap(switcher.x, switcher.y);
    await sleep(1200);
  }

  throw new Error(`Gboard did not switch to ${language}.`);
};

const readKeyMaps = (serial: string) =>
  readJSON<DeviceKeyMap[]>(keyMapPath(serial)) ?? [];

/** Look up the calibrated map for the keyboard Gboard shows now; fails on a miss. */
export const currentKeyMap = (
  serial: string,
  language: DeviceLanguage,
  panel: DevicePanel = 'letters'
) => {
  const version = gboardVersion(serial);
  const screen = screenSize(serial);
  const identity = keyboardIdentity(serial);
  const map = readKeyMaps(serial).find(
    (candidate) =>
      candidate.language === language &&
      candidate.panel === panel &&
      candidate.gboardVersion === version &&
      candidate.screen === screen &&
      candidate.languageTag === identity.languageTag &&
      candidate.variant === identity.variant &&
      candidate.subtype === identity.subtypeHashCode &&
      candidate.letterLabels?.length > 0
  );

  if (map) return map;

  const calibrated = readKeyMaps(serial).filter(
    (candidate) =>
      candidate.language === language &&
      candidate.gboardVersion === version &&
      candidate.screen === screen
  );
  if (languageFor(identity) !== language) {
    throw new Error(
      `Gboard shows ${identity.languageTag}/${identity.variant}, not ${language}; switch with device.keyboard.use('${language}').`
    );
  }
  throw new Error(
    calibrated.length > 0
      ? `Gboard ${language} has no current calibrated ${panel} panel; run tooling/device/android.mjs calibrate ${serial}.`
      : `No calibrated ${language} key map for Gboard ${version} on ${screen}; run tooling/device/android.mjs calibrate ${serial}.`
  );
};

// Closes the tabs an intent opened at `url` through DevTools' HTTP endpoint,
// since an intent-opened tab has no target id the lane recorded. A failure
// only warns, so the caller's cleanup and its original error still run.
const closeTabsAt = async (serial: string, url: string) => {
  let port: string | null = null;

  try {
    port = adb(serial, [
      'forward',
      'tcp:0',
      'localabstract:chrome_devtools_remote',
    ]).trim();

    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    const tabs = (await response.json()) as Array<{ id: string; url: string }>;

    for (const tab of tabs.filter((candidate) => candidate.url === url)) {
      await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
    }
  } catch (error) {
    process.stderr.write(
      `Could not close the tab at ${url}: ${error instanceof Error ? error.message : String(error)}\n`
    );
  } finally {
    if (port) removePorts(serial, [`tcp:${port}`], []);
  }
};

const CALIBRATION_PAGE =
  '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><textarea autofocus style="width:90vw;height:30vh"></textarea>';

/** Record a key map for each lane language. The keyboard must show for a text field. */
export const calibrateKeyboard = async (serial: string, port = 8790) => {
  const languages = requestedLanguages();

  acquireSerialLock(serial);

  const calibrationURL = `http://localhost:${port}/?calibrate=${Date.now()}`;

  const server = createServer((_request, response) => {
    response.setHeader('content-type', 'text/html');
    response.end(CALIBRATION_PAGE);
  });

  let reversed = false;

  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
    reversePort(serial, port);
    reversed = true;
    openUrl(serial, calibrationURL);
    await sleep(2500);

    const width = Number(screenSize(serial).split('x')[0]);

    // The calibration textarea fills the top of the page. On a cold boot
    // Chrome can take the first tap before Gboard answers it.
    for (let tap = 0; tap < 2 && !keyboardShown(serial); tap += 1) {
      createDeviceTouch(serial).tap(width / 2, chromeContentTop(serial) + 80);
      await sleep(1500);
    }

    if (!keyboardShown(serial)) {
      throw new Error('The keyboard did not open on the calibration page.');
    }

    // Gboard announces a newly added language in a banner over the keys.
    const banner = dumpWindows(serial).find(
      (node) => node.pkg === GBOARD_PACKAGE && node.text === 'OK'
    );

    if (banner) {
      createDeviceTouch(serial).tap(banner.x, banner.y);
      await sleep(800);
    }

    const maps: DeviceKeyMap[] = [];

    for (const language of languages) {
      const identity = await switchKeyboardLanguage(serial, language);
      const letters = readKeyboard(serial);
      const mainLetters =
        language === 'ko'
          ? '비읍 지읒 디귿 기역 시옷 요 여 야 애 에 미음 니은 이응 리을 히읗 오 어 아 이 키읔 티읕 치읓 피읖 유 우 으'.split(
              ' '
            )
          : [...'abcdefghijklmnopqrstuvwxyz'];
      const letterLabels = mainLetters.filter((label) => letters[label]);
      const nodes = dumpWindows(serial);
      const control = (id: string) => {
        const label = nodes.find(
          (node) =>
            node.pkg === GBOARD_PACKAGE &&
            node.id === `${GBOARD_PACKAGE}:id/${id}`
        )?.desc;

        if (!label || !letters[label]) {
          throw new Error(`Gboard ${language} has no ${id} control.`);
        }
        return label;
      };

      if (letterLabels.length < 20) {
        throw new Error(`Gboard ${language} did not show its letter keys.`);
      }
      const entry = {
        controls: {
          backspace: control('key_pos_del'),
          enter: control('key_pos_ime_action'),
          space: control('key_pos_space'),
        },
        gboardVersion: gboardVersion(serial),
        language,
        screen: screenSize(serial),
        languageTag: identity.languageTag,
        letterLabels,
        subtype: identity.subtypeHashCode,
        variant: identity.variant,
      };

      maps.push({ ...entry, keys: letters, panel: 'letters' });

      if (language === 'en') {
        const toSymbols = letters['Symbol keyboard'];

        if (!toSymbols) throw new Error('Gboard shows no symbol key.');
        createDeviceTouch(serial).tap(toSymbols.x, toSymbols.y);
        await sleep(1200);

        const symbols = readKeyboard(serial);
        const toLetters = symbols['Letter keyboard'];

        if (!symbols['@'] || !toLetters) {
          throw new Error('Gboard did not open its symbol panel.');
        }
        maps.push({ ...entry, keys: symbols, panel: 'symbols' });
        createDeviceTouch(serial).tap(toLetters.x, toLetters.y);
        await sleep(1200);
      }
    }

    await switchKeyboardLanguage(serial, 'en');
    writeJSON(keyMapPath(serial), maps);
    return maps;
  } finally {
    if (reversed) await closeTabsAt(serial, calibrationURL);
    server.closeAllConnections();
    server.close();
    releaseRunResources(serial, {
      forwards: [],
      reverses: reversed ? [`tcp:${port}`] : [],
      targets: [],
    });
    releaseSerialLock(serial);
  }
};

// Commands for tooling/device/android.mjs

export const setupDevice = async (serial: string) => {
  acquireSerialLock(serial);

  try {
    return await setupLockedDevice(serial);
  } finally {
    releaseSerialLock(serial);
  }
};

const setZenMode = async (serial: string, mode: string) => {
  if (shell(serial, 'settings', 'get', 'global', 'zen_mode') === mode) return;

  const modes: Record<string, string> = {
    '0': 'all',
    '1': 'priority',
    '2': 'none',
    '3': 'alarms',
  };

  // Android 9 prints this help without set_dnd and exits 255.
  const help = spawnSync(
    'adb',
    ['-s', serial, 'shell', 'cmd', 'notification', 'help'],
    {
      encoding: 'utf-8',
    }
  ).stdout;

  if (modes[mode] && help?.includes('set_dnd')) {
    shell(serial, 'cmd', 'notification', 'set_dnd', modes[mode]);
  } else if (mode === '0' || mode === '1') {
    shell(serial, 'am', 'start', '-a', 'android.settings.ZEN_MODE_SETTINGS');
    await sleep(1500);
    await clickText(serial, mode === '0' ? /^Regular$/ : /^DND$/);
  } else {
    throw new Error(`The device cannot set Do Not Disturb mode ${mode}.`);
  }
  if (shell(serial, 'settings', 'get', 'global', 'zen_mode') !== mode) {
    throw new Error(`The device did not enter Do Not Disturb mode ${mode}.`);
  }
};

const setupLockedDevice = async (serial: string) => {
  const languages = requestedLanguages();
  recordRestore(serial, {});

  const ime = shell(
    serial,
    'settings',
    'get',
    'secure',
    'default_input_method'
  );

  if (ime !== GBOARD_IME) {
    throw new Error(`The default input method is ${ime}, not Gboard.`);
  }

  const changed = await flipSettings(
    serial,
    GBOARD_EXPECTED_SETTINGS,
    (change) => recordRestore(serial, { changedSettings: [change] })
  );

  const addedLanguages: DeviceLanguage[] = [];

  for (const language of languages) {
    if (await addLanguage(serial, language)) addedLanguages.push(language);
  }

  if (!isEmulator(serial)) {
    await setZenMode(serial, '1');
  }

  const settings = await readGboardSettings(serial);
  const mismatched = Object.entries(GBOARD_EXPECTED_SETTINGS).filter(
    ([name, expected]) => settings[name] !== expected
  );

  if (mismatched.length > 0) {
    throw new Error(
      `Gboard settings did not read back: ${mismatched.map(([name]) => name).join(', ')}.`
    );
  }

  shell(serial, 'input', 'keyevent', 'KEYCODE_HOME');
  recordRestore(serial, { setupCompletedAt: new Date().toISOString() });
  return {
    addedLanguages,
    changed,
    gboardVersion: gboardVersion(serial),
    settings,
  };
};

export const doctorDevice = (serial: string) => {
  const languages = requestedLanguages();
  const problems: string[] = [];
  const restore = readRestoreState(serial);
  const lock = readJSON<{ owner: number }>(lockPath(serial));
  const version = gboardVersion(serial);
  const maps = readKeyMaps(serial);

  if (lock && !isAlive(lock.owner)) {
    problems.push(
      `stale lock from process ${lock.owner}; run restore before another run`
    );
  }
  if (!restore?.setupCompletedAt) {
    problems.push('setup has not finished on this device; run setup');
  }
  if (
    shell(serial, 'settings', 'get', 'secure', 'default_input_method') !==
    GBOARD_IME
  ) {
    problems.push('the default input method is not Gboard');
  }
  if (maps.length === 0) {
    problems.push('no calibrated key map; run calibrate');
  } else if (maps.some((map) => map.gboardVersion !== version)) {
    problems.push(
      `Gboard is ${version}, but the key map was calibrated on ${maps[0]?.gboardVersion}; run calibrate`
    );
  } else if (maps.some((map) => map.screen !== screenSize(serial))) {
    problems.push(
      'the screen size differs from the calibrated one; run calibrate'
    );
  }
  for (const language of languages) {
    const expected = GBOARD_LAYOUTS[language];

    if (
      !maps.some(
        (map) =>
          map.language === language &&
          map.panel === 'letters' &&
          map.languageTag === expected.languageTag &&
          map.variant === expected.variant &&
          map.letterLabels?.length >= 20
      )
    ) {
      problems.push(
        `no current calibrated ${language} letter map; run calibrate`
      );
    }
  }

  return {
    gboardVersion: version,
    lockOwner: lock?.owner ?? null,
    ok: problems.length === 0,
    problems,
    restorePending: restore,
    serial,
  };
};

/**
 * Undo setup and owned resources recorded in the restore file, then delete it.
 * A target `closeTarget` cannot close stays recorded, and the call throws.
 */
export const restoreDevice = async (
  serial: string,
  closeTarget?: (targetId: string) => Promise<void>
) => {
  acquireSerialLock(serial, { takeOverStale: true });

  const restore = readRestoreState(serial);

  if (!restore) {
    releaseSerialLock(serial);
    return { restored: false };
  }

  const unclosed: string[] = [];

  for (const targetId of restore.ownedTargets) {
    try {
      await closeTarget?.(targetId);
    } catch {
      unclosed.push(targetId);
    }
  }
  removePorts(serial, restore.forwards, restore.reverses);
  if (restore.changedSettings.length > 0) {
    await flipSettings(
      serial,
      Object.fromEntries(
        restore.changedSettings.map(({ from, name }) => [name, from])
      )
    );
  }
  for (const entry of restore.languageLayoutsBefore) {
    await removeAddedLanguage(serial, entry.language, entry.layouts);
  }

  shell(
    serial,
    'settings',
    'put',
    'secure',
    'selected_input_method_subtype',
    restore.selectedSubtype
  );
  if (restore.zenMode !== null) {
    await setZenMode(serial, restore.zenMode);
  }
  shell(serial, 'input', 'keyevent', 'KEYCODE_HOME');
  if (unclosed.length > 0) {
    writeJSON(restorePath(serial), {
      ...restore,
      changedSettings: [],
      languageLayoutsBefore: [],
      forwards: [],
      ownedTargets: unclosed,
      reverses: [],
      setupCompletedAt: null,
    } satisfies DeviceRestoreState);
    releaseSerialLock(serial);
    throw new Error(
      `Restored ${serial} except Chrome targets ${unclosed.join(', ')}; close them, or rerun restore with --force-stop-chrome.`
    );
  }
  rmSync(restorePath(serial), { force: true });
  releaseSerialLock(serial);
  return { restored: true, state: restore };
};
