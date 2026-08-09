import React from 'react';

import type { Element, ElementOf, Path, Text } from '@platejs/plite';
import type { EditorSchemaSource } from '@platejs/plite/internal';
import type { UnknownObject } from '@udecode/utils';

import { useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

import type {
  AnyBasePluginDefinition,
  PluginReference,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { AnyPlatePluginContext, PlatePluginContext } from '../plugin';

const VOID_HTML_TAGS = new Set<keyof HTMLElementTagNameMap>([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

export const useNodeAttributes = (props: any, ref?: any) => ({
  ...props.attributes,
  className:
    clsx((props.attributes as any).className, props.className) || undefined,
  ref: useComposedRef(ref, props.attributes.ref),
  style: { ...(props.attributes as any).style, ...props.style },
});

export const isHtmlVoidElementTag = (tag: keyof HTMLElementTagNameMap) =>
  VOID_HTML_TAGS.has(tag);

export const useBlockIdAttributeRef = <T extends HTMLElement>(
  blockId: unknown,
  ref?: React.Ref<T>
) => {
  const blockIdRef = React.useCallback(
    (node: T | null) => {
      if (!node) return;

      if (blockId) {
        node.setAttribute('data-block-id', String(blockId));
      } else {
        node.removeAttribute('data-block-id');
      }
    },
    [blockId]
  );

  return useComposedRef(blockIdRef, ref);
};

type PlateElementPropsDescriptor = EditorSchemaSource & PluginReference;

type PlateElementPropsNode<
  TElementOrPlugin extends Element | PlateElementPropsDescriptor,
> = TElementOrPlugin extends PlateElementPropsDescriptor
  ? Extract<ElementOf<TElementOrPlugin>, Element>
  : Extract<TElementOrPlugin, Element>;

type PlateElementPropsConfig<
  TElementOrPlugin extends Element | PlateElementPropsDescriptor,
> = TElementOrPlugin extends PlateElementPropsDescriptor
  ? InternalPluginDefinitionOf<TElementOrPlugin>
  : never;

type PlateNodeContext<C extends AnyBasePluginDefinition> = [C] extends [never]
  ? AnyPlatePluginContext
  : PlatePluginContext<C>;

export type PlateElementProps<
  TElementOrPlugin extends Element | PlateElementPropsDescriptor = Element,
  C extends AnyBasePluginDefinition = PlateElementPropsConfig<TElementOrPlugin>,
> = PlateNodeProps<C> &
  RenderElementProps<PlateElementPropsNode<TElementOrPlugin>> & {
    attributes: UnknownObject;
    path: Path;
  };

export type PlateNodeProps<C extends AnyBasePluginDefinition = never> =
  PlateNodeContext<NoInfer<C>> & {
    /**
     * Optional ref to be merged with `attributes.ref`
     *
     * @default undefined
     */
    ref?: any;
  };

export type PlateHTMLProps<
  C extends AnyBasePluginDefinition = never,
  T extends
    | React.ComponentType<PlateElementProps>
    | keyof HTMLElementTagNameMap = 'div',
> = PlateNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element */
  attributes: React.PropsWithoutRef<
    T extends React.ComponentType<PlateElementProps>
      ? React.ComponentProps<T>
      : T extends keyof HTMLElementTagNameMap
        ? React.JSX.IntrinsicElements[T]
        : never
  >;
  as?: T;
  /** Class to be merged with `attributes.className` */
  className?: string;
  /** Style to be merged with `attributes.style` */
  style?: React.CSSProperties;
};

export type StyledPlateElementProps<
  N extends Element | PlateElementPropsDescriptor = Element,
  C extends AnyBasePluginDefinition = PlateElementPropsConfig<N>,
  T extends keyof HTMLElementTagNameMap = 'div',
> = PlateElementProps<N, C> &
  PlateHTMLProps<C, T> & {
    insetProp?: boolean;
  };

export const PlateElement = React.forwardRef(function PlateElement(
  { as: Tag = 'div', children, insetProp, ...props }: StyledPlateElementProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const blockId =
    props.element.id && props.editor.read.schema.isBlock(props.element)
      ? props.element.id
      : undefined;
  const blockIdRef = useBlockIdAttributeRef(blockId, ref);
  const attributes = useNodeAttributes(
    {
      attributes: props.attributes,
      className: props.className,
      style: props.style,
    },
    blockIdRef
  );

  const inset =
    insetProp ?? props.plugin?.rules.selection?.affinity === 'directional';

  return (
    <PlateElementBody attributes={attributes} inset={inset} tag={Tag}>
      {children}
    </PlateElementBody>
  );
}) as unknown as <
  N extends Element | PlateElementPropsDescriptor = Element,
  C extends AnyBasePluginDefinition = PlateElementPropsConfig<N>,
  T extends keyof HTMLElementTagNameMap = 'div',
>(
  props: StyledPlateElementProps<N, C, T>
) => React.ReactElement;

function PlateElementBody({
  attributes,
  children,
  inset,
  tag: Tag,
}: {
  attributes: any;
  children: React.ReactNode;
  inset: boolean;
  tag: keyof HTMLElementTagNameMap;
}) {
  const isVoidTag = isHtmlVoidElementTag(Tag);

  return (
    <>
      {inset && <NonBreakingSpace />}
      {isVoidTag ? (
        <div
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
          <Tag contentEditable={false} />
          {children}
        </div>
      ) : (
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
          {inset && <NonBreakingSpace />}
        </Tag>
      )}
      {inset && isVoidTag && <NonBreakingSpace />}
    </>
  );
}

export type PlateTextProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
> = PlateNodeProps<C> &
  RenderTextProps<N> & {
    attributes: UnknownObject;
  };

export type StyledPlateTextProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PlateTextProps<N, C> & PlateHTMLProps<C, T>;

export const PlateText = React.forwardRef<
  HTMLSpanElement,
  StyledPlateTextProps
>(({ as: Tag = 'span', children, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
}) as unknown as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: StyledPlateTextProps<N, C, T>
) => React.ReactElement;

export type PlateLeafProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
> = PlateNodeProps<C> &
  RenderLeafProps<N> & { attributes: UnknownObject; inset?: boolean };

export type StyledPlateLeafProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PlateLeafProps<N, C> & PlateHTMLProps<C, T>;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const PlateLeaf = React.forwardRef<
  HTMLSpanElement,
  StyledPlateLeafProps
>(({ as: Tag = 'span', children, inset: insetProp, ...props }, ref) => {
  const attributes = useNodeAttributes(props, ref);

  const inset = insetProp ?? props.plugin?.rules.selection?.affinity === 'hard';

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
}) as unknown as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: StyledPlateLeafProps<N, C, T>) => React.ReactElement;
