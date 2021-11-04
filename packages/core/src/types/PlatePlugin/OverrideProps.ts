import { GetNodeProps } from '../PlatePluginOptions/GetNodeProps';
import { PlateEditor } from '../SPEditor';

export type OverrideProps<T = {}> = (editor: PlateEditor<T>) => GetNodeProps;
