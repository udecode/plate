import { createPlugin } from '../../../lib';
import { withPlateReact } from './withPlateReact';

export const KEY_REACT = 'react';

/** @see {@link withReact} */
export const ReactPlugin = createPlugin({
  key: KEY_REACT,
  withOverrides: withPlateReact,
});
