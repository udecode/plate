import type { Style } from '@/registry/styles';
import type { Theme } from '@/registry/themes';

import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type Config = {
  radius: number;
  style: Style['name'];
  theme: Theme['name'];
};

const configAtom = atomWithStorage<Config>('config', {
  radius: 0.5,
  style: 'default',
  theme: 'slate',
});

export function useConfig() {
  return useAtom(configAtom);
}
