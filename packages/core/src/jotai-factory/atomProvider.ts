import { ComponentProps } from 'react';
import { Provider } from 'jotai';

export type AtomProviderProps = ComponentProps<typeof Provider>;

export { Provider as AtomProvider } from 'jotai';
