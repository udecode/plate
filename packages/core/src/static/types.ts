import type { Element, Text } from '@platejs/plite';
import type { AnyObject } from '@udecode/utils';

import type {
  AnyBasePluginDefinition,
  BasePluginDefinition,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  BasePluginContext,
} from '..';

export type BoxStaticProps = React.ComponentProps<'div'> & {
  as?: React.ElementType;
};

export type PliteRenderElementProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteRenderNodeProps<C> & RenderElementProps<N>;

export type PliteRenderLeafProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteRenderNodeProps<C> & RenderLeafProps<N>;

type ErasedBasePluginContext = {
  api: object;
  readonly installed: boolean;
  read: object;
  store: object;
  type: string;
  update: object;
};

export type PliteRenderNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = (0 extends 1 & C ? ErasedBasePluginContext : BasePluginContext<C>) & {
  attributes?: AnyObject;
  className?: string;
  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
  style?: React.CSSProperties;
};

export type PliteRenderTextProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteRenderNodeProps<C> & RenderTextProps<N>;
