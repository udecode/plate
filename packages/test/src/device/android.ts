// Local-only Android device access for the device lane
// (docs/plans/2026-10-02-proof-device-lane.md). Input is limited to real
// touches: tap, press and move. Nothing here can type text; guard.ts serves
// the DevTools endpoint that refuses every `Input.*` command.
//
// Node loads this file directly for tooling/device/android.mjs, so it has no
// relative imports and only erasable TypeScript.

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  linkSync,
  mkdirSync,
  readFileSync,
  renameSync,
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

export type DeviceLanguage = 'en' | 'ko';

export type DevicePanel = 'letters' | 'symbols';

export type DeviceKey = {
  bounds: [number, number, number, number];
  x: number;
  y: number;
};

export type DeviceKeyMap = {
  gboardVersion: string;
  language: DeviceLanguage;
  panel: DevicePanel;
  screen: string;
  subtype: string;
  keys: Record<string, DeviceKey>;
};

export type DeviceRestoreState = {
  addedLanguages: DeviceLanguage[];
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
  for (;;) {
    try {
      writeFileSync(
        path,
        `${JSON.stringify({ owner, startedAt: new Date().toISOString() })}\n`,
        { flag: 'wx' }
      );
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }

    let held: { owner: number } | null;

    try {
      held = readJSON<{ owner: number }>(path);
    } catch {
      throw new Error(`Device ${serial} is being locked by another process.`);
    }
    if (held?.owner === owner) return;
    if (held && isAlive(held.owner)) {
      throw new Error(`Device ${serial} is locked by process ${held.owner}.`);
    }
    if (!takeOverStale) {
      throw new Error(
        `Device ${serial} has a stale lock from process ${held?.owner}; run tooling/device/android.mjs restore ${serial}.`
      );
    }
    // Move the file aside, then check it is the stale lock this taker read:
    // a slower taker can move a fresh lock another just created, and puts it
    // back.
    const aside = `${path}.stale-${owner}`;

    try {
      renameSync(path, aside);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      continue;
    }

    let moved: { owner: number } | null = null;

    try {
      moved = readJSON<{ owner: number }>(aside);
    } catch {
      // A lock caught mid-write is a fresh one.
    }
    if (moved?.owner !== held?.owner) {
      try {
        linkSync(aside, path);
      } finally {
        rmSync(aside, { force: true });
      }
      throw new Error(`Device ${serial} is being locked by another process.`);
    }
    rmSync(aside, { force: true });
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

export const readRestoreState = (serial: string) =>
  readJSON<DeviceRestoreState>(restorePath(serial));

const recordRestore = (serial: string, patch: Partial<DeviceRestoreState>) => {
  const current = readRestoreState(serial) ?? {
    addedLanguages: [],
    changedSettings: [],
    createdAt: new Date().toISOString(),
    forwards: [],
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
    addedLanguages: union(current.addedLanguages, patch.addedLanguages),
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

const dumpApp = (serial: string) => {
  shell(serial, 'uiautomator', 'dump', '/sdcard/plate-proof-app.xml');
  return parseNodes(
    adb(serial, ['exec-out', 'cat', '/sdcard/plate-proof-app.xml'])
  );
};

const dumpWindows = (serial: string) => {
  shell(
    serial,
    'uiautomator',
    'dump',
    '--windows',
    '/sdcard/plate-proof-ui.xml'
  );
  return parseNodes(
    adb(serial, ['exec-out', 'cat', '/sdcard/plate-proof-ui.xml'])
  );
};

const clickText = async (serial: string, pattern: RegExp, wait = 1500) => {
  const node = dumpApp(serial).find(
    (candidate) => pattern.test(candidate.text) || pattern.test(candidate.desc)
  );

  if (!node) throw new Error(`Setup could not find ${pattern} on screen.`);
  createDeviceTouch(serial).tap(node.x, node.y);
  await sleep(wait);
};

const openGboardSettings = async (serial: string, section: RegExp) => {
  shell(
    serial,
    'am',
    'start',
    '--activity-clear-task',
    '-a',
    'android.settings.INPUT_METHOD_SETTINGS'
  );
  await sleep(2000);
  await clickText(serial, /^Gboard$/);
  await clickText(serial, section);
};

// The switch beside each title, which a tap flips; tapping a title can open
// that setting's own page instead (Auto-correction does on Gboard 17).
const readSettingToggles = (serial: string) => {
  const nodes = dumpApp(serial);
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

const readGboardSettings = async (serial: string) => {
  await openGboardSettings(serial, /^Corrections & suggestions$/);
  return Object.fromEntries(
    [...readSettingToggles(serial)].map(([name, toggle]) => [
      name,
      toggle.checked,
    ])
  );
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
    const toggle = readSettingToggles(serial).get(name);

    if (!toggle) {
      throw new Error(
        `Gboard setting "${name}" is not on its settings screen.`
      );
    }
    if (toggle.checked !== value) {
      const change = { from: toggle.checked, name };

      beforeTap?.(change);
      createDeviceTouch(serial).tap(toggle.x, toggle.y);
      await sleep(800);
      if (readSettingToggles(serial).get(name)?.checked !== value) {
        throw new Error(`Gboard setting "${name}" did not switch.`);
      }
      changed.push(change);
    }
  }

  return changed;
};

const gboardLanguages = async (serial: string) => {
  await openGboardSettings(serial, /^Languages$/);
  return dumpApp(serial).map((node) => node.text);
};

const addKorean = async (serial: string) => {
  const languages = await gboardLanguages(serial);

  if (languages.includes('한국어, 두벌식')) return false;

  recordRestore(serial, { addedLanguages: ['ko'] });
  await clickText(serial, /^Add keyboard$/, 2500);
  await clickText(serial, /^Search language$/);

  const keyboard = readKeyboard(serial);

  for (const letter of 'korean') {
    const key = keyboard[letter];

    if (!key) {
      throw new Error(`Gboard has no "${letter}" key to search languages.`);
    }
    createDeviceTouch(serial).tap(key.x, key.y);
    await sleep(300);
  }

  await sleep(1500);
  await clickText(serial, /^한국어$/, 2500);
  await clickText(serial, /^Done$/, 2500);
  return true;
};

// The journal records Korean before setup adds it, so an interrupted setup or
// restore can find it already absent.
const removeKorean = async (serial: string) => {
  const languages = await gboardLanguages(serial);

  if (!languages.includes('한국어, 두벌식')) return;
  await clickText(serial, /^EDIT$/);
  await clickText(serial, /^한국어, 두벌식$/, 800);
  await clickText(serial, /^REMOVE$/);
};

export const gboardVersion = (serial: string) =>
  shell(serial, 'dumpsys', 'package', GBOARD_PACKAGE).match(
    /versionName=(\S+)/
  )?.[1] ?? 'unknown';

export const selectedSubtype = (serial: string) =>
  shell(serial, 'settings', 'get', 'secure', 'selected_input_method_subtype');

export const keyboardShown = (serial: string) =>
  /mInputShown=true/.test(shell(serial, 'dumpsys', 'input_method'));

export const screenSize = (serial: string) =>
  shell(serial, 'wm', 'size').match(/(\d+x\d+)\s*$/)?.[1] ?? 'unknown';

/** Screen y of Chrome's page top: the bottom of its toolbar container. */
export const chromeContentTop = (serial: string) => {
  const container = dumpWindows(serial).find(
    (node) => node.id === 'com.android.chrome:id/control_container'
  );

  return container?.bounds[3] ?? 0;
};

/** Read Gboard's clickable keys by label from the current keyboard. */
export const readKeyboard = (serial: string) => {
  const keys: Record<string, DeviceKey> = {};

  for (const node of dumpWindows(serial)) {
    if (node.pkg !== GBOARD_PACKAGE || !node.clickable || !node.desc) continue;

    const label = /^[a-z]$/i.test(node.desc)
      ? node.desc.toLowerCase()
      : node.desc;

    keys[label] ??= { bounds: node.bounds, x: node.x, y: node.y };
  }

  return keys;
};

/** Which calibrated language a keyboard read shows, from one key only it has. */
export const keyboardLanguage = (
  keys: Record<string, DeviceKey>
): DeviceLanguage | null => (keys.q ? 'en' : keys['히읗'] ? 'ko' : null);

/** Tap the navigation bar's input method key until Gboard shows `language`. */
export const switchKeyboardLanguage = async (
  serial: string,
  language: DeviceLanguage
) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    const keys = readKeyboard(serial);

    if (keyboardLanguage(keys) === language) return selectedSubtype(serial);

    const switcher = keys['Switch input method'];

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
  const subtype = selectedSubtype(serial);
  const map = readKeyMaps(serial).find(
    (candidate) =>
      candidate.language === language &&
      candidate.panel === panel &&
      candidate.gboardVersion === version &&
      candidate.screen === screen &&
      candidate.subtype === subtype
  );

  if (map) return map;

  const calibrated = readKeyMaps(serial).filter(
    (candidate) =>
      candidate.language === language &&
      candidate.gboardVersion === version &&
      candidate.screen === screen
  );
  const otherSubtype = calibrated.find(
    (candidate) => candidate.panel === panel && candidate.subtype !== subtype
  );

  if (otherSubtype) {
    throw new Error(
      `Gboard shows subtype ${subtype}, not the ${language} layout calibrated as ${otherSubtype.subtype}; switch with device.keyboard.use('${language}').`
    );
  }
  throw new Error(
    calibrated.length > 0
      ? `Gboard ${language} has no calibrated ${panel} panel.`
      : `No calibrated ${language} key map for Gboard ${version} on ${screen}; run tooling/device/android.mjs calibrate ${serial}.`
  );
};

// Closes the tabs an intent opened at `url` through DevTools' HTTP endpoint,
// since an intent-opened tab has no target id the lane recorded.
const closeTabsAt = async (serial: string, url: string) => {
  const port = adb(serial, [
    'forward',
    'tcp:0',
    'localabstract:chrome_devtools_remote',
  ]).trim();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    const tabs = (await response.json()) as Array<{ id: string; url: string }>;

    for (const tab of tabs.filter((candidate) => candidate.url === url)) {
      await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
    }
  } finally {
    removePorts(serial, [`tcp:${port}`], []);
  }
};

const CALIBRATION_PAGE =
  '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><textarea autofocus style="width:90vw;height:30vh"></textarea>';

/** Record a key map for each lane language. The keyboard must show for a text field. */
export const calibrateKeyboard = async (serial: string, port = 8790) => {
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

    for (const language of ['en', 'ko'] as const) {
      const subtype = await switchKeyboardLanguage(serial, language);
      const letters = readKeyboard(serial);
      const entry = {
        gboardVersion: gboardVersion(serial),
        language,
        screen: screenSize(serial),
        subtype,
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

const setupLockedDevice = async (serial: string) => {
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

  // oxlint-disable-next-line react-doctor/server-sequential-independent-await -- [P0 device-ui] Both steps drive the one Gboard settings screen, so they cannot overlap.
  const addedKorean = await addKorean(serial);

  if (!isEmulator(serial)) {
    shell(serial, 'cmd', 'notification', 'set_dnd', 'priority');
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
    addedKorean,
    changed,
    gboardVersion: gboardVersion(serial),
    settings,
  };
};

export const doctorDevice = (serial: string) => {
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
  if (restore.addedLanguages.includes('ko')) {
    await removeKorean(serial);
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
    shell(serial, 'settings', 'put', 'global', 'zen_mode', restore.zenMode);
  }
  shell(serial, 'input', 'keyevent', 'KEYCODE_HOME');
  if (unclosed.length > 0) {
    writeJSON(restorePath(serial), {
      ...restore,
      addedLanguages: [],
      changedSettings: [],
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
