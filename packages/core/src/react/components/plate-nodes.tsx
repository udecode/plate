/* eslint-disable perfectionist/sort-jsx-props */
import React from 'react';

import type { Path, TElement, TText } from '@udecode/slate';
import type { UnknownObject } from '@udecode/utils';

import { useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../lib';
import type { PlatePluginContext } from '../plugin';

import { useEditorMounted } from '../stores';

export const useNodeAttributes = (props: any, ref?: any) => {
  return {
    ...props.attributes,
    className:
      clsx((props.attributes as any).className, props.className) || undefined,
    ref: useComposedRef(ref, props.attributes.ref),
    style: { ...(props.attributes as any).style, ...props.style },
  };
};

export type PlateElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = PlateNodeProps<C> &
  RenderElementProps<N> & {
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

export type PlateNodeProps<C extends AnyPluginConfig = PluginConfig> =
  PlatePluginContext<C> & {
    /**
     * Optional ref to be merged with `attributes.ref`
     *
     * @default undefined
     */
    ref?: any;
  };

export type PlateHTMLProps<
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = PlateNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element */
  attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
    UnknownObject;
  as?: T;
  /** Class to be merged with `attributes.className` */
  className?: string;
  /** Style to be merged with `attributes.style` */
  style?: React.CSSProperties;
};

export type StyledPlateElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = Omit<PlateElementProps<N, C>, keyof DeprecatedNodeProps> &
  PlateHTMLProps<C, T>;

export const PlateElement = React.forwardRef(function PlateElement(
  { as: Tag = 'div', children, ...props }: StyledPlateElementProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const attributes = useNodeAttributes(props, ref);

  const mounted = useEditorMounted();
  const block = React.useMemo(
    () =>
      mounted &&
      !!props.element.id &&
      !!props.editor.api.isBlock(props.element),
    [props.element, props.editor, mounted]
  );

  const belowRootComponents = React.useMemo(
    () =>
      props.editor?.pluginList
        .map((plugin) => plugin.render.belowRootNodes!)
        .filter(Boolean),
    [props.editor?.pluginList]
  );

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

      {belowRootComponents?.map((Component, index) => (
        <Component key={index} {...(props as any)} />
      ))}
    </Tag>
  );
}) as <
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  props: StyledPlateElementProps<N, C, T>
) => React.ReactElement;

export type PlateTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = PlateNodeProps<C> & RenderTextProps<N> & DeprecatedNodeProps;

export type StyledPlateTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<PlateTextProps<N, C>, keyof DeprecatedNodeProps> &
  PlateHTMLProps<C, T>;

export const PlateText = React.forwardRef<
  HTMLSpanElement,
  StyledPlateTextProps
>(({ as: Tag = 'span', children, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
}) as <
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: StyledPlateTextProps<N, C, T>
) => React.ReactElement;

export type PlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
> = PlateNodeProps<C> & RenderLeafProps<N> & DeprecatedNodeProps;

export type StyledPlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<PlateLeafProps<N, C>, keyof DeprecatedNodeProps> &
  PlateHTMLProps<C, T>;

export const PlateLeaf = React.forwardRef<
  HTMLSpanElement,
  StyledPlateLeafProps
>(({ as: Tag = 'span', children, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
}) as <
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: StyledPlateLeafProps<N, C, T>) => React.ReactElement;
