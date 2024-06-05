import { createPluginFactory } from '../../../shared/utils/createPluginFactory';
import { withTReact } from './withTReact';

export const KEY_REACT = 'react';

/** @see {@link withReact} */
export const createReactPlugin = createPluginFactory({
  key: KEY_REACT,
  withOverrides: withTReact,
});
