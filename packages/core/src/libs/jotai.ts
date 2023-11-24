import { ComponentPropsWithRef } from 'react';
import { Provider } from 'jotai';

export type JotaiProviderProps = ComponentPropsWithRef<typeof Provider>;

export { atom, useAtom, useAtomValue, Provider as JotaiProvider } from 'jotai';
