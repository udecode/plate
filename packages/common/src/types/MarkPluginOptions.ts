import { OnKeyDownMarkOptions } from '../utils/getOnKeyDownMark';
import { Deserialize } from './Deserialize';
import { LeafToProps } from './NodeToProps';
import { RenderNodeOptions } from './RenderNodeOptions';

export type MarkPluginOptions = Partial<
  RenderNodeOptions & OnKeyDownMarkOptions & Deserialize & LeafToProps
>;
