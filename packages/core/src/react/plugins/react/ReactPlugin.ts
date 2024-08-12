import { createPlugin } from '../../../lib';
import { withPlateReact } from './withPlateReact';

/** @see {@link withReact} */
export const ReactPlugin = createPlugin({
  key: 'dom',
  withOverrides: withPlateReact,
});
