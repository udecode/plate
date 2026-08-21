import type { Element, Path } from '@platejs/plite';
import type { EditableElementSlots } from '@platejs/plite-react';
import type React from 'react';

type ElementContentRootSlot<N extends Element> = N extends {
  childRoots: infer TRoots extends Readonly<Record<string, string>>;
}
  ? Extract<keyof TRoots, string>
  : string;

export type RenderElementSlots<N extends Element = Element> = Omit<
  EditableElementSlots,
  'contentRoot'
> & {
  contentRoot: (
    slot: ElementContentRootSlot<N>,
    options?: Parameters<EditableElementSlots['contentRoot']>[1]
  ) => React.ReactNode;
};

export type RenderElementFn = (
  props: RenderElementProps
) => React.ReactElement | null;

export type RenderElementProps<N extends Element = Element> = {
  attributes: {
    [key: string]: unknown;
    'data-plite-node': 'element';
    ref?: React.RefCallback<HTMLElement>;
    className?: string;
    'data-plite-inline'?: true;
    'data-plite-void'?: true;
    dir?: React.HTMLAttributes<HTMLElement>['dir'];
    style?: React.CSSProperties;
  };
  children: React.ReactNode;
  element: N;
  /** Pre-computed path for static rendering (avoids expensive findPath traversal). */
  path?: Path;
  /** Element-owned primary and named content renderers. */
  slots: RenderElementSlots<N>;
};
