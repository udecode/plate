import { DOMPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';
import { withPlateReact } from './withPlateReact';

/** @see {@link withReact} */
export const ReactPlugin = toPlatePlugin(DOMPlugin, {
  key: 'dom',
  extendEditor: withPlateReact as any,
});
