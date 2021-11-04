import { GetNodeProps } from '../PlatePluginOptions/GetNodeProps';
import { SPEditor } from '../SPEditor';

export type OverrideProps<T = TPlateEditor> = (editor: T) => GetNodeProps;
