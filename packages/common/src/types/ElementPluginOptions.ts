import { OnKeyDownElementOptions } from '../utils/getOnKeyDownElement';
import { Deserialize } from './Deserialize';
import { ElementToProps } from './NodeToProps';
import { RenderNodeOptions } from './RenderNodeOptions';

export type ElementPluginOptions = Partial<
  RenderNodeOptions & OnKeyDownElementOptions & Deserialize & ElementToProps
>;
