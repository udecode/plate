/* eslint-disable perfectionist/sort-jsx-props */
import React from 'react';

import type { Path, TElement, TText } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import { useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../lib';
import type { AnyPlatePlugin, PlatePluginContext } from '../plugin';

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
  T extends keyof HTMLElementTagNameMap = 'div',
> = PlateNodeProps<C> &
  RenderElementProps<N, T> & {
    path: Path;
    as?: T;
  };

export type PlateNodeProps<C extends AnyPluginConfig = PluginConfig> =
  PlatePluginContext<C> & {
    attributes?: AnyObject;
    className?: string;
    style?: React.CSSProperties;
  };

export const PlateElement = React.forwardRef(function PlateElement<
  N extends TElement = TElement,
  P extends AnyPlatePlugin = AnyPlatePlugin,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  { as: Tag = 'div' as T, children, ...props }: PlateElementProps<N, P, T>,
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
}) as <T extends keyof HTMLElementTagNameMap = 'div'>(
  props: PlateElementProps<TElement, AnyPlatePlugin, T> &
    React.RefAttributes<HTMLDivElement>
) => React.ReactElement<any>;

export type PlateTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PlateNodeProps<C> & RenderTextProps<N, T> & { as?: T };

export const PlateText = React.forwardRef<HTMLSpanElement, PlateTextProps>(
  ({ as: Tag = 'span', children, ...props }, ref) => {
    const attributes = useNodeAttributes(props, ref);

    return <Tag {...attributes}>{children}</Tag>;
  }
) as <
  N extends TText = TText,
  P extends AnyPlatePlugin = AnyPlatePlugin,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: PlateTextProps<N, P, T> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement<any>;

export type PlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PlateNodeProps<C> & RenderLeafProps<N, T> & { as?: T };

export const PlateLeaf = React.forwardRef<HTMLSpanElement, PlateLeafProps>(
  ({ as: Tag = 'span', children, ...props }, ref) => {
    const attributes = useNodeAttributes(props, ref);

    return <Tag {...attributes}>{children}</Tag>;
  }
) as <
  N extends TText = TText,
  P extends AnyPlatePlugin = AnyPlatePlugin,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: PlateLeafProps<N, P, T> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement<any>;
