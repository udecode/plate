import { createPlugin } from '../../../shared';
import { withTReact } from './withTReact';

export const KEY_REACT = 'react';

/** @see {@link withReact} */
export const ReactPlugin = createPlugin({
  key: KEY_REACT,
  withOverrides: withTReact,
});
