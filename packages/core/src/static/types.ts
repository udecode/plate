import type { TElement, TText } from '@platejs/slate';
import type { AnyObject } from '@udecode/utils';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  SlatePluginContext,
} from '..';

export type BoxStaticProps = React.ComponentProps<'div'> & {
  as?: React.ElementType;
};

export type SlateRenderElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = SlateRenderNodeProps<C> & RenderElementProps<N>;

export type SlateRenderLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = SlateRenderNodeProps<C> & RenderLeafProps<N>;

export type SlateRenderNodeProps<C extends AnyPluginConfig = PluginConfig> =
  SlatePluginContext<C> & {
    attributes?: AnyObject;
    className?: string;
    /** @see {@link NodeProps} */
    nodeProps?: AnyObject;
  };

export type SlateRenderTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = SlateRenderNodeProps<C> & RenderTextProps<N>;
