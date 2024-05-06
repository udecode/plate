import { createPluginFactory } from '../../../shared/utils/createPluginFactory';
import { withTReact } from './withTReact';

/** @see {@link withReact} */
export const createReactPlugin = createPluginFactory({
  key: 'react',
  withOverrides: withTReact,
});
