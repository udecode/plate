import type { Element, Text } from '../facade';
import type {
  AnyBasePluginContext,
  BasePluginContext,
} from '../lib/plugin/BasePlugin';
import type {
  BasePluginDefinition,
  InferPluginDecoration,
} from '../lib/plugin/PluginDefinition';
import type { AnyObject } from '../lib/types/AnyObject';
import type { RenderElementProps } from '../lib/types/RenderElementProps';
import type { StaticRenderLeafProps } from '../lib/types/RenderLeafProps';
import type { RenderTextProps } from '../lib/types/RenderTextProps';

export type BoxStaticProps = React.ComponentProps<'div'> & {
  as?: React.ElementType;
};

export type PliteRenderElementProps<
  N extends Element = Element,
  C extends BasePluginDefinition = BasePluginDefinition,
> = PliteRenderNodeProps<C> & RenderElementProps<N>;

export type PliteRenderLeafProps<
  N extends Text = Text,
  C extends BasePluginDefinition = BasePluginDefinition,
> = PliteRenderNodeProps<C> &
  StaticRenderLeafProps<N, N & Partial<InferPluginDecoration<NoInfer<C>>>>;

type ErasedBasePluginContext = AnyBasePluginContext;

export type PliteRenderNodeProps<
  C extends BasePluginDefinition = BasePluginDefinition,
> = (0 extends 1 & C ? ErasedBasePluginContext : BasePluginContext<C>) & {
  attributes?: AnyObject;
  className?: string;
  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
  style?: React.CSSProperties;
};

export type PliteRenderTextProps<
  N extends Text = Text,
  C extends BasePluginDefinition = BasePluginDefinition,
> = PliteRenderNodeProps<C> & RenderTextProps<N>;
