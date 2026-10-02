// CLI over packages/test/src/device/android.ts for the local Android device
// lane. Node 22 strips the module's types, so no build step runs first.
// Usage: node tooling/device/android.mjs <setup|calibrate|doctor|restore> [serial] [--force-stop-chrome]

import { execFileSync } from 'node:child_process';

import { chromium } from '@playwright/test';

import {
  calibrateKeyboard,
  chromePid,
  doctorDevice,
  listSerials,
  restoreDevice,
  setupDevice,
} from '../../packages/test/src/device/android.ts';

// An interrupted run leaves its tab open; close it through a short-lived
// DevTools forward that this command owns. Force-stopping Chrome closes every
// tab on the device, so it runs only when asked.
const closeOwnedTargets = (serial, { forceStop }) => {
  let browser;
  let stopped = false;
  const port = execFileSync(
    'adb',
    ['-s', serial, 'forward', 'tcp:0', 'localabstract:chrome_devtools_remote'],
    { encoding: 'utf-8' }
  ).trim();

  return {
    close: async (targetId) => {
      // With Chrome stopped, no tab it owned can still be open.
      if (stopped || !chromePid(serial)) return;
      try {
        // Android freezes a backgrounded Chrome, and its DevTools socket with it.
        if (!browser) {
          execFileSync('adb', [
            '-s',
            serial,
            'shell',
            'am',
            'start',
            '-n',
            'com.android.chrome/com.google.android.apps.chrome.Main',
          ]);
        }
        browser ??= await chromium.connectOverCDP(`http://127.0.0.1:${port}`, {
          noDefaults: true,
          timeout: 5000,
        });
        const session = await browser.newBrowserCDPSession();

        const { targetInfos } = await session.send('Target.getTargets');

        // A tab that is already gone counts as closed.
        if (targetInfos.some((target) => target.targetId === targetId)) {
          await session.send('Target.closeTarget', { targetId });
        }
      } catch (error) {
        if (!forceStop) throw error;
        execFileSync('adb', [
          '-s',
          serial,
          'shell',
          'am',
          'force-stop',
          'com.android.chrome',
        ]);
        stopped = true;
      }
    },
    done: async () => {
      await browser?.close().catch(() => {});
      execFileSync('adb', ['-s', serial, 'forward', '--remove', `tcp:${port}`]);
    },
  };
};

const args = process.argv.slice(2);
const forceStop = args.includes('--force-stop-chrome');
const [command, serialArgument] = args.filter((arg) => !arg.startsWith('--'));
const commands = {
  calibrate: async (serial) => {
    const maps = await calibrateKeyboard(serial);

    return maps.map(
      ({ gboardVersion, keys, language, panel, screen, subtype }) => ({
        gboardVersion,
        keys: Object.keys(keys).length,
        language,
        panel,
        screen,
        subtype,
      })
    );
  },
  doctor: async (serial) => doctorDevice(serial),
  restore: async (serial) => {
    const targets = closeOwnedTargets(serial, { forceStop });

    try {
      return await restoreDevice(serial, targets.close);
    } finally {
      await targets.done();
    }
  },
  setup: async (serial) => setupDevice(serial),
};

if (!commands[command]) {
  process.stderr.write(
    'usage: node tooling/device/android.mjs <setup|calibrate|doctor|restore> [serial] [--force-stop-chrome]\n'
  );
  process.exit(64);
}

const serials = listSerials();
const serial = serialArgument ?? (serials.length === 1 ? serials[0] : null);

if (!serial) {
  process.stderr.write(
    `Pass a serial; adb lists ${serials.length ? serials.join(', ') : 'no device'}.\n`
  );
  process.exit(64);
}

const result = await commands[command](serial);

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (command === 'doctor' && !result.ok) process.exit(1);
