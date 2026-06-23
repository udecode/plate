import React from 'react';

import type { Element, Path, Text } from '@platejs/plite';
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

export type PliteElementProps<
  N extends Element = Element,
  C extends AnyPluginConfig = PluginConfig,
> = PliteNodeProps<C> &
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

export type PliteNodeProps<C extends AnyPluginConfig = PluginConfig> =
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
> = PliteNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element */
  attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
    UnknownObject;
  as?: T;
  /** Class to be merged with `attributes.className` */
  className?: string;
  /** Style to be merged with `attributes.style` */
  style?: React.CSSProperties;
};

export type StyledPliteElementProps<
  N extends Element = Element,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = Omit<PliteElementProps<N, C>, keyof DeprecatedNodeProps> &
  SlateHTMLProps<C, T>;

export const PliteElement = React.forwardRef(function PliteElement(
  { as: Tag = 'div', children, ...props }: StyledPliteElementProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const attributes = useNodeAttributes(props, ref);

  const block = !!props.element.id && !!props.editor.api.isBlock(props.element);

  return (
    <Tag
      data-plite-node="element"
      data-plite-inline={attributes['data-plite-inline']}
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
  N extends Element = Element,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  props: StyledPliteElementProps<N, C, T>
) => React.ReactElement;

export type PliteTextProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
> = PliteNodeProps<C> &
  RenderTextProps<N> &
  DeprecatedNodeProps & {
    attributes: UnknownObject;
  };

export type StyledPliteTextProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<PliteTextProps<N, C>, keyof DeprecatedNodeProps> &
  SlateHTMLProps<C, T>;

export const PliteText = React.forwardRef<
  HTMLSpanElement,
  StyledPliteTextProps
>(({ as: Tag = 'span', children, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
}) as <
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: StyledPliteTextProps<N, C, T>
) => React.ReactElement;

export type PliteLeafProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
> = PliteNodeProps<C> &
  RenderLeafProps<N> &
  DeprecatedNodeProps & {
    attributes: UnknownObject;
    inset?: boolean;
  };

export type StyledPliteLeafProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<PliteLeafProps<N, C>, keyof DeprecatedNodeProps> &
  SlateHTMLProps<C, T>;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const PliteLeaf = React.forwardRef<
  HTMLSpanElement,
  StyledPliteLeafProps
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
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: StyledPliteLeafProps<N, C, T>) => React.ReactElement;
