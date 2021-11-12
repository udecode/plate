import { PlateEditor } from '../../PlateEditor';
import { GetNodeProps } from '../../PlatePluginOptions/GetNodeProps';
import { PlatePlugin } from './PlatePlugin';

export type OverrideProps<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: PlatePlugin<T, P>
) => GetNodeProps;
