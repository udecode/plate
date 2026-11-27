import { type Browser, chromium, type Page } from '@playwright/test';

import {
  acquireSerialLock,
  forwardDevTools,
  readRestoreState,
  recordOwnedTarget,
  releaseRunResources,
  releaseSerialLock,
  reversePort,
  showChrome,
  waitForDevTools,
} from './android';
import { findOwnedPage } from './android-lane';
import { type GuardedEndpoint, startGuardedEndpoint } from './guard';

export type DeviceRun = {
  close: () => Promise<GuardedEndpoint['refused']>;
  endpoint: string;
  page: Page;
  serial: string;
  targetId: string;
};

export const openDeviceRun = async (
  serial: string,
  {
    ports,
    takeOverStale = false,
    url,
  }: { ports: number[]; takeOverStale?: boolean; url: string }
): Promise<DeviceRun> => {
  acquireSerialLock(serial, { takeOverStale });
  if (takeOverStale) {
    const stale = readRestoreState(serial);

    if (stale && (stale.forwards.length > 0 || stale.reverses.length > 0)) {
      releaseRunResources(serial, {
        closedTargets: [],
        forwards: stale.forwards,
        reverses: stale.reverses,
      });
    }
  }

  const forwards: string[] = [];
  const reverses: string[] = [];
  let guard: GuardedEndpoint | null = null;
  let browser: Browser | null = null;
  let targetId: string | null = null;

  const close = async () => {
    let closed = false;

    if (browser && targetId) {
      const session = await browser.newBrowserCDPSession().catch(() => null);

      closed = Boolean(
        await session
          ?.send('Target.closeTarget', { targetId })
          .then(() => true)
          .catch(() => false)
      );
    }
    await browser?.close().catch(() => {});
    await guard?.close();
    releaseRunResources(serial, {
      closedTargets: targetId && closed ? [targetId] : [],
      forwards,
      reverses,
    });
    releaseSerialLock(serial);
    return guard?.refused ?? [];
  };

  try {
    showChrome(serial);

    const devtoolsPort = forwardDevTools(serial);

    forwards.push(`tcp:${devtoolsPort}`);
    for (const port of ports) reverses.push(reversePort(serial, port));
    await waitForDevTools(devtoolsPort);
    guard = await startGuardedEndpoint({ upstreamPort: devtoolsPort });
    browser = await chromium.connectOverCDP(guard.endpoint, {
      noDefaults: true,
    });

    const session = await browser.newBrowserCDPSession();
    ({ targetId } = await session.send('Target.createTarget', { url }));
    recordOwnedTarget(serial, targetId);
    await session.detach();

    const page = await findOwnedPage(browser, targetId, 50);

    await page.waitForLoadState('load');

    return { close, endpoint: guard.endpoint, page, serial, targetId };
  } catch (error) {
    await close();
    throw error;
  }
};
