import React from 'react';

import type { Path, TElement, TText } from '@platejs/slate';
import type { UnknownObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  SlatePluginContext,
} from '../../lib';

export const useNodeAttributes = (props: any, ref?: any) => ({
  ...props.attributes,
  className:
    clsx((props.attributes as any).className, props.className) || undefined,
  ref,
  style: { ...(props.attributes as any).style, ...props.style },
});

export type SlateElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = SlateNodeProps<C> &
  RenderElementProps<N> & {
    attributes: UnknownObject;
    path: Path;
  } & DeprecatedNodeProps;

type DeprecatedNodeProps = {
  /**
   * @deprecated Optional class to be merged with `attributes.className`.
   * @default undefined
   */
  className?: string;
  /**
   * @deprecated Optional style to be merged with `attributes.style`
   * @default undefined
   */
  style?: React.CSSProperties;
};

export type SlateNodeProps<C extends AnyPluginConfig = PluginConfig> =
  SlatePluginContext<C> & {
    /**
     * Optional ref to be merged with `attributes.ref`
     *
     * @default undefined
     */
    ref?: any;
  };

export type SlateHTMLProps<
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = SlateNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element */
  attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
    UnknownObject;
  as?: T;
  /** Class to be merged with `attributes.className` */
  className?: string;
  /** Style to be merged with `attributes.style` */
  style?: React.CSSProperties;
};

export type StyledSlateElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = Omit<SlateElementProps<N, C>, keyof DeprecatedNodeProps> &
  SlateHTMLProps<C, T>;

export const SlateElement = React.forwardRef(function SlateElement(
  { as: Tag = 'div', children, ...props }: StyledSlateElementProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const attributes = useNodeAttributes(props, ref);

  const block = !!props.element.id && !!props.editor.api.isBlock(props.element);

  return (
    <Tag
      data-slate-node="element"
      data-slate-inline={attributes['data-slate-inline']}
      data-block-id={block ? props.element.id : undefined}
      {...attributes}
      style={
        {
          position: 'relative',
          ...attributes?.style,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}) as <
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  props: StyledSlateElementProps<N, C, T>
) => React.ReactElement;

export type SlateTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = SlateNodeProps<C> &
  RenderTextProps<N> &
  DeprecatedNodeProps & {
    attributes: UnknownObject;
  };

export type StyledSlateTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<SlateTextProps<N, C>, keyof DeprecatedNodeProps> &
  SlateHTMLProps<C, T>;

export const SlateText = React.forwardRef<
  HTMLSpanElement,
  StyledSlateTextProps
>(({ as: Tag = 'span', children, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
}) as <
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: StyledSlateTextProps<N, C, T>
) => React.ReactElement;

export type SlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = SlateNodeProps<C> &
  RenderLeafProps<N> &
  DeprecatedNodeProps & {
    attributes: UnknownObject;
    inset?: boolean;
  };

export type StyledSlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<SlateLeafProps<N, C>, keyof DeprecatedNodeProps> &
  SlateHTMLProps<C, T>;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const SlateLeaf = React.forwardRef<
  HTMLSpanElement,
  StyledSlateLeafProps
>(({ as: Tag = 'span', children, inset, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  if (inset) {
    return (
      <>
        <NonBreakingSpace />
        <Tag {...attributes}>
          {children}
          <NonBreakingSpace />
        </Tag>
      </>
    );
  }

  return <Tag {...attributes}>{children}</Tag>;
}) as <
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: StyledSlateLeafProps<N, C, T>) => React.ReactElement;
