import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';
import { StyledComponentPropsOptions } from '../../components/StyledComponent/StyledComponent.types';

// Data of Element node
export interface AlignNodeData {}
// Element node
export interface AlignNode extends ElementWithAttributes, AlignNodeData {}

// renderElement options given as props
export interface AlignRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface AlignElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    AlignRenderElementPropsOptions {
  element: AlignNode;
}

export type AlignKeyOption =
  | 'align_left'
  | 'align_center'
  | 'align_justify'
  | 'align_right';

// Plugin options
export type AlignPluginOptionsValues = RenderNodeOptions &
  RootProps<AlignRenderElementPropsOptions> &
  NodeToProps<AlignNode, AlignRenderElementPropsOptions> &
  Deserialize;
export type AlignPluginOptionsKeys = keyof AlignPluginOptionsValues;
export type AlignPluginOptions<
  Value extends AlignPluginOptionsKeys = AlignPluginOptionsKeys
> = Partial<Record<AlignKeyOption, Pick<AlignPluginOptionsValues, Value>>>;

// renderElement options
export type AlignRenderElementOptionsKeys = AlignPluginOptionsKeys;
export interface AlignRenderElementOptions
  extends AlignPluginOptions<AlignRenderElementOptionsKeys> {}

// deserialize options
export interface AlignDeserializeOptions
  extends AlignPluginOptions<'type' | 'rootProps' | 'deserialize'> {}
