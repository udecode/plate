import { ComponentPropsWithRef } from 'react';
import { Provider } from 'jotai';

export type JotaiProviderProps = ComponentPropsWithRef<typeof Provider>;

export { atom, useAtom, useAtomValue, Provider as JotaiProvider } from 'jotai';
// eslint-disable-next-line import/no-unresolved
export { type Scope } from 'jotai/core/atom';
