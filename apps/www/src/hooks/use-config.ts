import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Config = {
  installationType: 'cli' | 'manual';
  packageManager: 'bun' | 'npm' | 'pnpm' | 'yarn';
};

const configAtom = atomWithStorage<Config>('config', {
  installationType: 'cli',
  packageManager: 'pnpm',
});

export function useConfig() {
  return useAtom(configAtom);
}
