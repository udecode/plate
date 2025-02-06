import type { TElement, TText } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import type {
  AnyPluginConfig,
  PluginConfig,
  SlatePluginContext,
} from '../plugin';
import type { RenderElementProps } from '../types/RenderElementProps';
import type { RenderLeafProps } from '../types/RenderLeafProps';

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
    className?: string;
    /** @see {@link NodeProps} */
    nodeProps?: AnyObject;
  };

export type TextStaticProps = React.ComponentProps<'span'> & {
  as?: React.ElementType;
};
