import React from 'react';

import type { Element, ElementOf, Path, Text } from '@platejs/plite';
import type { EditorSchemaSource } from '@platejs/plite/internal';
import type { UnknownObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type {
  AnyBasePluginDefinition,
  BasePluginContext,
  BasePluginDefinition,
  PluginReference,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';

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

type PliteElementPropsDescriptor = EditorSchemaSource & PluginReference;

type PliteElementPropsNode<
  TElementOrPlugin extends Element | PliteElementPropsDescriptor,
> = TElementOrPlugin extends PliteElementPropsDescriptor
  ? Extract<ElementOf<TElementOrPlugin>, Element>
  : Extract<TElementOrPlugin, Element>;

type PliteElementPropsConfig<
  TElementOrPlugin extends Element | PliteElementPropsDescriptor,
> = TElementOrPlugin extends PliteElementPropsDescriptor
  ? InternalPluginDefinitionOf<TElementOrPlugin>
  : BasePluginDefinition;

export type PliteElementProps<
  TElementOrPlugin extends Element | PliteElementPropsDescriptor = Element,
  C extends AnyBasePluginDefinition = PliteElementPropsConfig<TElementOrPlugin>,
> = PliteNodeProps<C> &
  RenderElementProps<PliteElementPropsNode<TElementOrPlugin>> & {
    attributes: UnknownObject;
    path: Path;
  };

export type PliteNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = BasePluginContext<C> & {
  /**
   * Optional ref to be merged with `attributes.ref`.
   *
   * @default undefined
   */
  ref?: React.Ref<HTMLElement>;
};

export type PliteHTMLProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
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
  N extends Element | PliteElementPropsDescriptor = Element,
  C extends AnyBasePluginDefinition = PliteElementPropsConfig<N>,
  T extends keyof HTMLElementTagNameMap = 'div',
> = PliteElementProps<N, C> & PliteHTMLProps<C, T>;

export const PliteElement = React.forwardRef<
  HTMLDivElement,
  StyledPliteElementProps<Element, any>
>(function PliteElement({ as: Tag = 'div', children, ...props }, ref) {
  const attributes = useNodeAttributes(props, ref);

  return (
    <Tag
      data-plite-node="element"
      data-plite-inline={attributes['data-plite-inline']}
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
  N extends Element | PliteElementPropsDescriptor = Element,
  C extends AnyBasePluginDefinition = PliteElementPropsConfig<N>,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  props: StyledPliteElementProps<N, C, T>
) => React.ReactElement;

export type PliteTextProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteNodeProps<C> &
  RenderTextProps<N> & {
    attributes: UnknownObject;
  };

export type StyledPliteTextProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PliteTextProps<N, C> & PliteHTMLProps<C, T>;

export const PliteText = React.forwardRef<
  HTMLSpanElement,
  StyledPliteTextProps<Text, any>
>(({ as: Tag = 'span', children, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
}) as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: StyledPliteTextProps<N, C, T>
) => React.ReactElement;

export type PliteLeafProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteNodeProps<C> &
  RenderLeafProps<N> & {
    attributes: UnknownObject;
    inset?: boolean;
  };

export type StyledPliteLeafProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PliteLeafProps<N, C> & PliteHTMLProps<C, T>;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const PliteLeaf = React.forwardRef<
  HTMLSpanElement,
  StyledPliteLeafProps<Text, any>
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
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: StyledPliteLeafProps<N, C, T>) => React.ReactElement;
