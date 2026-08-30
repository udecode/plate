import type { Element, Path } from 'plitejs';

type ElementContentRootSlot<N extends Element> = N extends {
  childRoots: infer TRoots extends Readonly<Record<string, string>>;
}
  ? Extract<keyof TRoots, string>
  : string;

export type RenderElementSlots<N extends Element = Element> = {
  children: (options?: any) => any;
  contentBoundary: (props: any) => any;
  contentRoot: (slot: ElementContentRootSlot<N>, options?: any) => any;
};

export type RenderElementFn = (props: RenderElementProps) => any;

export type RenderElementProps<N extends Element = Element> = {
  attributes: {
    [key: string]: unknown;
    'data-plite-node': 'element';
    ref?: (element: HTMLElement | null) => void;
    className?: string;
    'data-plite-inline'?: true;
    'data-plite-void'?: true;
    dir?: 'auto' | 'ltr' | 'rtl';
    style?: any;
  };
  children: any;
  element: N;
  /** Pre-computed path for static rendering (avoids expensive findPath traversal). */
  path?: Path;
  /** Element-owned primary and named content renderers. */
  slots: RenderElementSlots<N>;
};
