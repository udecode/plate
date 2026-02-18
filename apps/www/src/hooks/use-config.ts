import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Config = {
  installationType: 'cli' | 'manual';
  packageManager: 'bun' | 'npm' | 'pnpm' | 'yarn';
  radius: number;
};

const configAtom = atomWithStorage<Config>('config', {
  installationType: 'cli',
  packageManager: 'pnpm',
  radius: 0.5,
});

export function useConfig() {
  return useAtom(configAtom);
}
