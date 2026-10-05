import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  type Browser,
  chromium,
  type FullConfig,
  type Page,
} from '@playwright/test';

import {
  acquireSerialLock,
  chromePid,
  doctorDevice,
  forwardDevTools,
  gboardVersion,
  recordOwnedTarget,
  releaseRunResources,
  releaseSerialLock,
  reversePort,
} from '../../../../packages/test/src/device/android';
import {
  type GuardedEndpoint,
  startGuardedEndpoint,
} from '../../../../packages/test/src/device/guard';
import {
  DEVICE_STATE_PATH,
  type DeviceRunState,
  findOwnedPage,
} from '../../../../packages/test/src/device/lane';
import { servingFingerprint } from '../../../../tooling/scripts/serving-fingerprint.mjs';
import { deviceAppPort as appPort } from './port';

const wwwPort = process.env.PLATE_DEVICE_WWW_PORT
  ? Number(process.env.PLATE_DEVICE_WWW_PORT)
  : null;

type OwnedRun = {
  browser: Browser | null;
  forwards: string[];
  guard: GuardedEndpoint | null;
  reverses: string[];
  serial: string;
  targetId: string | null;
};

// The www server can belong to another checkout; record which one answers.
const serverIdentity = (port: number) => {
  const pid = execFileSync(
    'lsof',
    ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'],
    { encoding: 'utf-8' }
  )
    .trim()
    .split('\n')[0];
  const cwd = execFileSync('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn'], {
    encoding: 'utf-8',
  })
    .split('\n')
    .find((line) => line.startsWith('n'))
    ?.slice(1);

  if (!cwd) throw new Error(`Cannot read the working directory of ${pid}.`);

  return { cwd, pid, ...servingFingerprint(cwd) };
};

const closeRun = async (run: OwnedRun, resultsDir: string) => {
  let closed = false;

  if (run.browser && run.targetId) {
    const session = await run.browser.newBrowserCDPSession().catch(() => null);

    closed = Boolean(
      await session
        ?.send('Target.closeTarget', { targetId: run.targetId })
        .then(() => true)
        .catch(() => false)
    );
  }
  await run.browser?.close().catch(() => {});
  if (run.guard) {
    await run.guard.close();
    writeFileSync(
      resolve(resultsDir, `guard-${run.serial}.json`),
      `${JSON.stringify(run.guard.refused, null, 2)}\n`
    );
  }
  // A target that did not close stays in the restore file for `restore`.
  releaseRunResources(run.serial, {
    forwards: run.forwards,
    reverses: run.reverses,
    targets: run.targetId && closed ? [run.targetId] : [],
  });
  releaseSerialLock(run.serial);
};

const prepareSerial = async (
  serial: string,
  run: OwnedRun,
  localFingerprint: string
): Promise<DeviceRunState> => {
  const appURL = `http://localhost:${appPort}`;

  const devtoolsPort = forwardDevTools(serial);

  // A port joins the run only once acquired, so cleanup never removes a
  // mapping another session holds.
  run.forwards.push(`tcp:${devtoolsPort}`);
  reversePort(serial, appPort);
  run.reverses.push(`tcp:${appPort}`);
  if (wwwPort) {
    reversePort(serial, wwwPort);
    run.reverses.push(`tcp:${wwwPort}`);
  }

  run.guard = await startGuardedEndpoint({ upstreamPort: devtoolsPort });
  run.browser = await chromium.connectOverCDP(run.guard.endpoint, {
    noDefaults: true,
  });

  const session = await run.browser.newBrowserCDPSession();
  // Chrome caches this file; a fresh query shows what the server holds now.
  const { targetId } = await session.send('Target.createTarget', {
    url: `${appURL}/.editor-proof-build.json?run=${Date.now()}`,
  });

  run.targetId = targetId;
  recordOwnedTarget(serial, targetId);
  await session.detach();

  const page: Page = await findOwnedPage(run.browser, targetId, 50);

  await page.waitForLoadState('load');

  const served = JSON.parse(
    await page.evaluate(() => document.body.innerText)
  ) as { fingerprint: string };

  if (served.fingerprint !== localFingerprint) {
    throw new Error(
      `The phone sees build ${served.fingerprint}, but out/ holds ${localFingerprint}.`
    );
  }

  return {
    appURL,
    buildFingerprint: served.fingerprint,
    chromePid: chromePid(serial),
    endpoint: run.guard.endpoint,
    gboardVersion: gboardVersion(serial),
    serial,
    targetId,
    wwwURL: wwwPort ? `http://localhost:${wwwPort}` : null,
  };
};

export default async function globalSetup(config: FullConfig) {
  if (process.env.CI) {
    throw new Error('The device lane is local only; refusing to run in CI.');
  }

  // globalSetup runs in the invoking directory; the app lives beside the config.
  const fromApp = (path: string) =>
    resolve(dirname(config.configFile ?? process.cwd()), path);
  const resultsDir = fromApp('test-results/device');

  const serials = config.projects.map(
    (project) => (project.use as { deviceSerial: string }).deviceSerial
  );

  if (serials.length === 0) throw new Error('adb lists no device.');

  const localFingerprint = (
    JSON.parse(
      readFileSync(fromApp('out/.editor-proof-build.json'), 'utf-8')
    ) as {
      fingerprint: string;
    }
  ).fingerprint;
  const runs: OwnedRun[] = [];
  const states: Record<string, DeviceRunState> = {};

  mkdirSync(resultsDir, { recursive: true });
  const teardown = async () => {
    for (const run of runs.splice(0)) await closeRun(run, resultsDir);
  };
  let www: ReturnType<typeof serverIdentity> | null = null;

  try {
    www = wwwPort ? serverIdentity(wwwPort) : null;

    // Other sessions edit this tree, so the two fingerprints can differ by
    // the time both are read; the checkout root is the identity.
    if (www && www.root !== servingFingerprint(fromApp('.')).root) {
      throw new Error(
        `The www server on port ${wwwPort} serves ${www.cwd}, not this checkout.`
      );
    }

    for (const serial of serials) {
      const doctor = doctorDevice(serial);

      if (!doctor.ok) {
        throw new Error(
          `Device ${serial} is not ready: ${doctor.problems.join('; ')}.`
        );
      }

      acquireSerialLock(serial);

      const run: OwnedRun = {
        browser: null,
        forwards: [],
        guard: null,
        reverses: [],
        serial,
        targetId: null,
      };

      runs.push(run);
      states[serial] = await prepareSerial(serial, run, localFingerprint);
    }
  } catch (error) {
    await teardown();
    throw error;
  }

  writeFileSync(
    fromApp(DEVICE_STATE_PATH),
    `${JSON.stringify(states, null, 2)}\n`
  );
  writeFileSync(
    fromApp('test-results/device/run.json'),
    `${JSON.stringify(
      {
        startedAt: new Date().toISOString(),
        states,
        www,
      },
      null,
      2
    )}\n`
  );

  return teardown;
}
