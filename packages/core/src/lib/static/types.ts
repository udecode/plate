import type { TElement, TText } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';
import type { DecoratedRange } from 'slate';

import type {
  AnyPluginConfig,
  PluginConfig,
  SlatePluginContext,
} from '../plugin';

export type PlateRenderElementStaticProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = PlateRenderNodeStaticProps<C> & TRenderElementStaticProps<N>;

export interface TRenderElementStaticProps<N extends TElement = TElement> {
  attributes: {
    'data-slate-node': 'element';
    ref: any;
    'data-slate-inline'?: true;
    'data-slate-void'?: true;
    dir?: 'rtl';
  };
  children: any;
  element: N;
}

export type PlateRenderNodeStaticProps<
  C extends AnyPluginConfig = PluginConfig,
> = SlatePluginContext<C> & {
  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
};

export type PlateRenderLeafStaticProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = PlateRenderNodeStaticProps<C> & TRenderLeafStaticProps<N>;

export interface TRenderLeafStaticProps<N extends TText = TText> {
  attributes: {
    'data-slate-leaf'?: true;
    'data-slate-node'?: 'text';
  };
  children: any;
  decorations: DecoratedRange[];
  leaf: N;
  text: N;
}

export type BoxStaticProps = React.ComponentProps<'div'> & {
  as?: React.ElementType;
};

export type TextStaticProps = React.ComponentProps<'span'> & {
  as?: React.ElementType;
};
