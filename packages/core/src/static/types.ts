import type { Element, Text } from '@platejs/plite';
import type { AnyObject } from '@udecode/utils';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  BasePluginContext,
} from '..';

export type BoxStaticProps = React.ComponentProps<'div'> & {
  as?: React.ElementType;
};

export type SlateRenderElementProps<
  N extends Element = Element,
  C extends AnyPluginConfig = PluginConfig,
> = PliteRenderNodeProps<C> & RenderElementProps<N>;

export type SlateRenderLeafProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
> = PliteRenderNodeProps<C> & RenderLeafProps<N>;

export type PliteRenderNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BasePluginContext<C> & {
    attributes?: AnyObject;
    className?: string;
    /** @see {@link NodeProps} */
    nodeProps?: AnyObject;
    style?: React.CSSProperties;
  };

export type SlateRenderTextProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
> = PliteRenderNodeProps<C> & RenderTextProps<N>;
