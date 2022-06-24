import { ComponentProps } from 'react';
import { atom, Provider, useAtom, useAtomValue } from 'jotai';
import { Scope } from 'jotai/core/atom';

export type JotaiProviderProps = ComponentProps<typeof Provider>;

export type { Scope };

export const JotaiProvider = Provider;

export { atom, useAtom, useAtomValue };
