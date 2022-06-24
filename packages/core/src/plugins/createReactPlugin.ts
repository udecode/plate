import { createPluginFactory } from '../utils/plate/createPluginFactory';
import { withTReact } from './withTReact';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = createPluginFactory({
  key: 'react',
  withOverrides: withTReact,
});
