import { DOMPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';
import { withPlateReact } from './withPlateReact';

/** Installs the current Plate React runtime enhancer. */
export const ReactPlugin = toPlatePlugin(DOMPlugin, {
  key: 'dom',
  extendEditor: withPlateReact,
});
