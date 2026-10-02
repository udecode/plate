import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const NATIVE_IME_STATE_PATH = join(
  process.cwd(),
  'test-results/native-ime/state.json'
);

export type NativeImeState = {
  browser: string;
  chromeArgs: string;
  chromePid: number;
  endpoint: string;
  /** The process that holds the host input-source lock for the whole run. */
  lockOwner: number;
  serving: { dirtyFingerprint: string; head: string };
};

export const readNativeImeState = (): NativeImeState =>
  JSON.parse(readFileSync(NATIVE_IME_STATE_PATH, 'utf-8'));
