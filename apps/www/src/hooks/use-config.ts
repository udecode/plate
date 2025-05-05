import type { BaseColor } from '@/registry/registry-base-colors';

import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Config = {
  installationType: 'cli' | 'manual';
  packageManager: 'bun' | 'npm' | 'pnpm' | 'yarn';
  radius: number;
  theme: BaseColor['name'];
};

const configAtom = atomWithStorage<Config>('config', {
  installationType: 'cli',
  packageManager: 'pnpm',
  radius: 0.5,
  theme: 'slate',
});

export function useConfig() {
  return useAtom(configAtom);
}
