import { createPluginFactory } from '../../../shared/utils/createPluginFactory';
import { withTReact } from './withTReact';

export const REACT_PLUGIN_KEY = 'react';

/** @see {@link withReact} */
export const createReactPlugin = createPluginFactory({
  key: REACT_PLUGIN_KEY,
  withOverrides: withTReact,
});
