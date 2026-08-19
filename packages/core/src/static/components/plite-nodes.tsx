import React from 'react';

import type { Element, ElementOf, Path, Text, TextOf } from '@platejs/plite';
import type { EditorSchemaSource } from '@platejs/plite/internal';
import type { UnknownObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type {
  AnyBasePluginDefinition,
  BasePluginContext,
  BasePluginDefinition,
  InferPluginDecoration,
  PluginReference,
  RenderElementProps,
  StaticRenderLeafProps as RenderLeafProps,
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

const getNodeAttributes = <E extends HTMLElement>(
  props: NodeAttributeProps,
  ref?: React.Ref<E>
): MergedNodeAttributes<E> => ({
  ...props.attributes,
  className: clsx(props.attributes.className, props.className) || undefined,
  ref,
  style: { ...props.attributes.style, ...props.style },
});

type PliteNodePropsDescriptor = EditorSchemaSource & PluginReference;

type PliteElementPropsNode<TPlugin extends PliteNodePropsDescriptor> = Extract<
  ElementOf<TPlugin>,
  Element
>;

type PliteElementPropsConfig<TPlugin extends PliteNodePropsDescriptor> =
  InternalPluginDefinitionOf<TPlugin>;

type PliteTextPropsNode<TPlugin extends PliteNodePropsDescriptor> = Extract<
  TextOf<TPlugin>,
  Text
>;

type PliteTextPropsConfig<TPlugin extends PliteNodePropsDescriptor> =
  InternalPluginDefinitionOf<TPlugin>;

type PliteElementRenderProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteNodeProps<C> &
  RenderElementProps<N> & {
    attributes: UnknownObject;
    path: Path;
  };

/** Props for the static element component owned by a plugin descriptor. */
export type PliteElementProps<TPlugin extends PliteNodePropsDescriptor> =
  TPlugin extends PliteNodePropsDescriptor
    ? PliteElementRenderProps<
        PliteElementPropsNode<TPlugin>,
        PliteElementPropsConfig<TPlugin>
      >
    : never;

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

type PliteElementComponentProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'div',
> = RenderElementProps<N> &
  Pick<PliteNodeProps<C>, 'ref'> & {
    attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
      UnknownObject;
    as?: T;
    className?: string;
    path: Path;
    style?: React.CSSProperties;
  };

export const PliteElement = function PliteElement({
  as: Tag = 'div',
  children,
  ref,
  ...props
}: PliteElementComponentProps<Element, any>) {
  const attributes = getNodeAttributes<HTMLDivElement>(
    props,
    ref as React.Ref<HTMLDivElement>
  );

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
} as {
  <
    N extends Element = Element,
    C extends AnyBasePluginDefinition = BasePluginDefinition,
    T extends keyof HTMLElementTagNameMap = 'div',
  >(
    props: PliteElementComponentProps<N, C, T>
  ): React.ReactElement;
  <T extends keyof HTMLElementTagNameMap = 'div'>(
    props: PliteElementComponentProps<Element, never, T>
  ): React.ReactElement;
};

type PliteTextRenderProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteNodeProps<C> &
  RenderTextProps<N> & {
    attributes: UnknownObject;
  };

/** Props for the static text component owned by a plugin descriptor. */
export type PliteTextProps<TPlugin extends PliteNodePropsDescriptor> =
  TPlugin extends PliteNodePropsDescriptor
    ? PliteTextRenderProps<
        PliteTextPropsNode<TPlugin>,
        PliteTextPropsConfig<TPlugin>
      >
    : never;

type PliteTextComponentProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PliteTextRenderProps<N, C> & PliteHTMLProps<C, T>;

export const PliteText = function PliteText({
  as: Tag = 'span',
  children,
  ref,
  ...props
}: PliteTextComponentProps<Text, any>) {
  const attributes = getNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
} as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: PliteTextComponentProps<N, C, T>
) => React.ReactElement;

type PliteLeafRenderProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = PliteNodeProps<C> &
  RenderLeafProps<N, N & Partial<InferPluginDecoration<NoInfer<C>>>> & {
    attributes: UnknownObject;
    inset?: boolean;
  };

/** Props for the static leaf component owned by a plugin descriptor. */
export type PliteLeafProps<TPlugin extends PliteNodePropsDescriptor> =
  TPlugin extends PliteNodePropsDescriptor
    ? PliteLeafRenderProps<
        PliteTextPropsNode<TPlugin>,
        PliteTextPropsConfig<TPlugin>
      >
    : never;

type PliteLeafComponentProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PliteLeafRenderProps<N, C> & PliteHTMLProps<C, T>;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const PliteLeaf = function PliteLeaf({
  as: Tag = 'span',
  children,
  inset,
  ref,
  ...props
}: PliteLeafComponentProps<Text, any>) {
  const attributes = getNodeAttributes(props, ref);

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
} as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: PliteLeafComponentProps<N, C, T>) => React.ReactElement;
