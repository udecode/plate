import type { Element, Text } from '../facade';
import type {
  AnyBasePluginContext,
  BasePluginContext,
} from '../lib/plugin/BasePlugin';
import type { BasePluginDefinition } from '../lib/plugin/PluginDefinition';
import type { AnyObject } from '../lib/types/AnyObject';
import type { RenderElementProps as BaseRenderElementProps } from '../lib/types/RenderElementProps';
import type { StaticRenderLeafProps } from '../lib/types/RenderLeafProps';
import type { RenderTextProps as BaseRenderTextProps } from '../lib/types/RenderTextProps';

export type RenderElementProps<
  N extends Element = Element,
  C extends BasePluginDefinition = BasePluginDefinition,
> = RenderNodeProps<C> & BaseRenderElementProps<N>;

export type RenderLeafProps<
  N extends Text = Text,
  C extends BasePluginDefinition = BasePluginDefinition,
> = RenderNodeProps<C> & StaticRenderLeafProps<N, N>;

type ErasedBasePluginContext = AnyBasePluginContext;

export type RenderNodeProps<
  C extends BasePluginDefinition = BasePluginDefinition,
> = (0 extends 1 & C ? ErasedBasePluginContext : BasePluginContext<C>) & {
  attributes?: AnyObject;
  className?: string;
  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
  style?: React.CSSProperties;
};

export type RenderTextProps<
  N extends Text = Text,
  C extends BasePluginDefinition = BasePluginDefinition,
> = RenderNodeProps<C> & BaseRenderTextProps<N>;
