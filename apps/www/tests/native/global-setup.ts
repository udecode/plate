import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  imeStatus,
  PINYIN_SIMPLIFIED,
  restoreInputSource,
  selectInputSource,
} from '../../../../tooling/ime/macos-ime.mjs';
import { launchNativeChrome } from '../../../../tooling/ime/native-chrome.mjs';
import { servingFingerprint } from '../../../../tooling/scripts/serving-fingerprint.mjs';
import { NATIVE_IME_STATE_PATH, type NativeImeState } from './native-ime-state';

export default async function globalSetup() {
  if (process.env.CI) {
    throw new Error(
      'The native IME lane is local only; refusing to run in CI.'
    );
  }
  if (process.platform !== 'darwin') {
    throw new Error('The native IME lane needs macOS.');
  }

  const status = imeStatus(PINYIN_SIMPLIFIED);
  const missing = [
    !status.parentEnabled && 'Pinyin - Simplified input method',
    !status.modeSelectable && 'a selectable Pinyin mode',
    !status.accessibility && 'Accessibility permission',
    !status.postEvents && 'event posting permission',
    !status.screenCapture && 'Screen Recording permission',
    status.restorePending &&
      'a pending restore (run tooling/ime/macos-ime.mjs restore)',
    status.lockOwner &&
      !status.lockStale &&
      'the host lock held by another session',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Native IME setup failure: missing ${missing.join(', ')}.`);
  }

  const serving = servingFingerprint();

  // This process holds the host lock until teardown restores the source.
  selectInputSource(PINYIN_SIMPLIFIED);

  let chrome: Awaited<ReturnType<typeof launchNativeChrome>>;

  try {
    chrome = await launchNativeChrome();
  } catch (error) {
    restoreInputSource();
    throw error;
  }

  const state: NativeImeState = {
    browser: chrome.browser,
    chromeArgs: chrome.args,
    chromePid: chrome.pid,
    endpoint: chrome.endpoint,
    lockOwner: process.pid,
    serving,
  };

  mkdirSync(dirname(NATIVE_IME_STATE_PATH), { recursive: true });
  writeFileSync(NATIVE_IME_STATE_PATH, JSON.stringify(state, null, 2));

  // Returned teardown runs only after a setup that launched Chrome.
  return () => {
    try {
      restoreInputSource();
    } finally {
      process.kill(chrome.pid, 'SIGTERM');
      rmSync(NATIVE_IME_STATE_PATH, { force: true });
    }
  };
}
