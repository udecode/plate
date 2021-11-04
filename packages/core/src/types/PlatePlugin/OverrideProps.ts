import { PlateEditor } from '../PlateEditor';
import { GetNodeProps } from '../PlatePluginOptions/GetNodeProps';

export type OverrideProps<T = {}> = (editor: PlateEditor<T>) => GetNodeProps;
