import { State } from '../types/SlatePluginsStore';

export const getInitialState = (): State => ({
  plugins: [],
  value: [{ children: [{ text: '' }] }],
  elementKeys: [],
});
