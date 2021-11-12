/**
 * Plugin options to get `renderElement` for elements and `renderLeaf` for marks.
 */
import { PlatePlugin } from '../plugins/PlatePlugin/PlatePlugin';

export type RenderNodeOptions = Pick<
  PlatePlugin,
  'component' | 'getNodeProps' | 'overrideProps'
> &
  Pick<Required<PlatePlugin>, 'type'>;
