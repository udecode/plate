import React from 'react';

import type { Element, Path, Text } from '@platejs/plite';
import type { UnknownObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type {
  AnyPluginConfig,
  BasePluginContext,
  PluginConfig,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../lib';

type NodeAttributeProps = {
  attributes: UnknownObject & {
    className?: string;
    'data-plite-inline'?: boolean;
    style?: React.CSSProperties;
  };
  className?: string;
  style?: React.CSSProperties;
};

type MergedNodeAttributes<E extends HTMLElement> = UnknownObject & {
  className?: string;
  ref?: React.Ref<E>;
  style?: React.CSSProperties;
};

export const useNodeAttributes = <E extends HTMLElement>(
  props: NodeAttributeProps,
  ref?: React.Ref<E>
): MergedNodeAttributes<E> => ({
  ...props.attributes,
  className: clsx(props.attributes.className, props.className) || undefined,
  ref,
  style: { ...props.attributes.style, ...props.style },
});

export type PliteElementProps<
  N extends Element = Element,
  C extends AnyPluginConfig = PluginConfig,
> = PliteNodeProps<C> &
  RenderElementProps<N> & {
    attributes: UnknownObject;
    path: Path;
  };

export type PliteNodeProps<C extends AnyPluginConfig = PluginConfig> =
  BasePluginContext<C> & {
    /**
     * Optional ref to be merged with `attributes.ref`.
     *
     * @default undefined
     */
    ref?: React.Ref<HTMLElement>;
  };

export type PliteHTMLProps<
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = PliteNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element. */
  attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
    UnknownObject;
  as?: T;
  /** Class to be merged with `attributes.className`. */
  className?: string;
  /** Style to be merged with `attributes.style`. */
  style?: React.CSSProperties;
};

export type StyledPliteElementProps<
  N extends Element = Element,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = PliteElementProps<N, C> & PliteHTMLProps<C, T>;

export const PliteElement = React.forwardRef<
  HTMLDivElement,
  StyledPliteElementProps
>(function PliteElement({ as: Tag = 'div', children, ...props }, ref) {
  const attributes = useNodeAttributes(props, ref);

  const block =
    !!props.element.id && props.editor.read.schema.isBlock(props.element);
  const blockId =
    block && typeof props.element.id === 'string'
      ? props.element.id
      : undefined;

  return (
    <Tag
      data-plite-node="element"
      data-plite-inline={attributes['data-plite-inline']}
      data-block-id={blockId}
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
  RenderTextProps<N> & {
    attributes: UnknownObject;
  };

export type StyledPliteTextProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PliteTextProps<N, C> & PliteHTMLProps<C, T>;

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
  RenderLeafProps<N> & {
    attributes: UnknownObject;
    inset?: boolean;
  };

export type StyledPliteLeafProps<
  N extends Text = Text,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PliteLeafProps<N, C> & PliteHTMLProps<C, T>;

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
