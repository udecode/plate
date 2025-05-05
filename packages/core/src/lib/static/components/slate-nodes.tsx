/* eslint-disable perfectionist/sort-jsx-props */
import React from 'react';

import type { Path, TElement, TText } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import { clsx } from 'clsx';

import type {
  AnyPluginConfig,
  AnySlatePlugin,
  PluginConfig,
  SlatePluginContext,
} from '../../plugin';
import type {
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../types';

export const useNodeAttributes = (props: any, ref?: any) => {
  return {
    ...props.attributes,
    className:
      clsx((props.attributes as any).className, props.className) || undefined,
    ref,
    style: { ...(props.attributes as any).style, ...props.style },
  };
};

export type SlateElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = SlateNodeProps<C> &
  RenderElementProps<N, T> & {
    path: Path;
    as?: T;
  };

export type SlateNodeProps<C extends AnyPluginConfig = PluginConfig> =
  SlatePluginContext<C> & {
    attributes?: AnyObject;
    className?: string;
    style?: React.CSSProperties;
  };

export const SlateElement = React.forwardRef(function SlateElement<
  N extends TElement = TElement,
  P extends AnySlatePlugin = AnySlatePlugin,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  { as: Tag = 'div' as T, children, ...props }: SlateElementProps<N, P, T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const attributes = useNodeAttributes(props, ref);

  const block = !!props.element.id && !!props.editor.api.isBlock(props.element);

  const belowRootComponents = props.editor?.pluginList
    .map((plugin) => plugin.render.belowRootNodes!)
    .filter(Boolean);

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

      {belowRootComponents?.map((Component: any, index: number) => (
        <Component key={index} {...(props as any)} />
      ))}
    </Tag>
  );
}) as <T extends keyof HTMLElementTagNameMap = 'div'>(
  props: SlateElementProps<TElement, AnySlatePlugin, T> &
    React.RefAttributes<HTMLDivElement>
) => React.ReactElement<any>;

export type SlateTextProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = SlateNodeProps<C> & RenderTextProps<N, T> & { as?: T };

export const SlateText = React.forwardRef<HTMLSpanElement, SlateTextProps>(
  ({ as: Tag = 'span', children, ...props }, ref) => {
    const attributes = useNodeAttributes(props, ref);

    return <Tag {...attributes}>{children}</Tag>;
  }
) as <
  N extends TText = TText,
  P extends AnySlatePlugin = AnySlatePlugin,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: SlateTextProps<N, P, T> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement<any>;

export type SlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = SlateNodeProps<C> & RenderLeafProps<N, T> & { as?: T };

export const SlateLeaf = React.forwardRef<HTMLSpanElement, SlateLeafProps>(
  ({ as: Tag = 'span', children, ...props }, ref) => {
    const attributes = useNodeAttributes(props, ref);

    return <Tag {...attributes}>{children}</Tag>;
  }
) as <
  N extends TText = TText,
  P extends AnySlatePlugin = AnySlatePlugin,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: SlateLeafProps<N, P, T> &
  React.RefAttributes<HTMLSpanElement>) => React.ReactElement<any>;
