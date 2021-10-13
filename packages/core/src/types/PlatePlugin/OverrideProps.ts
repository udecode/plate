import { GetNodeProps } from '../PlatePluginOptions/GetNodeProps';
import { SPEditor } from '../SPEditor';

export type OverrideProps<T extends SPEditor = SPEditor> = (
  editor: T
) => GetNodeProps;
