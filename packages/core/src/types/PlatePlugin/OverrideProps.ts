import { GetNodeProps } from '../PlatePluginOptions/GetNodeProps';
import { PlateEditor } from '../PlateEditor';

export type OverrideProps<T = {}> = (editor: PlateEditor<T>) => GetNodeProps;
