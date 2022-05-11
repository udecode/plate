import { createPluginFactory } from '../utils/createPluginFactory';
import { withTReact } from './withTReact';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = createPluginFactory({
  key: 'react',
  withOverrides: withTReact,
});
