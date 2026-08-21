import type { Element, ElementOf, Path, Text, TextOf } from '@platejs/plite';
import type { EditorSchemaSource } from '@platejs/plite/internal';
import { useComposedRef } from '@udecode/react-utils';
import type { UnknownObject } from '@udecode/utils';
import { clsx } from 'clsx';
import React from 'react';

import type {
  AnyBasePluginDefinition,
  InferPluginDecoration,
  PluginReference,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  SelectionRules,
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

const getAttributeRef = (attributes: UnknownObject) =>
  (attributes as { ref?: React.Ref<HTMLElement> }).ref;

export const isHtmlVoidElementTag = (tag: keyof HTMLElementTagNameMap) =>
  VOID_HTML_TAGS.has(tag);

type PlateNodePropsDescriptor = EditorSchemaSource & PluginReference;

type PlateElementPropsNode<TPlugin extends PlateNodePropsDescriptor> = Extract<
  ElementOf<TPlugin>,
  Element
>;

type PlateElementPropsConfig<TPlugin extends PlateNodePropsDescriptor> =
  InternalPluginDefinitionOf<TPlugin>;

type PlateTextPropsNode<TPlugin extends PlateNodePropsDescriptor> = Extract<
  TextOf<TPlugin>,
  Text
>;

type PlateTextPropsConfig<TPlugin extends PlateNodePropsDescriptor> =
  InternalPluginDefinitionOf<TPlugin>;

type PlateNodeContext<C extends AnyBasePluginDefinition> = [C] extends [never]
  ? AnyPlatePluginContext
  : PlatePluginContext<C>;

type PlateElementRenderProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = never,
> = PlateNodeProps<C> &
  RenderElementProps<N> & {
    attributes: UnknownObject;
    path: Path;
  };

/** Props for the element component owned by a plugin descriptor. */
export type PlateElementProps<TPlugin extends PlateNodePropsDescriptor> =
  TPlugin extends PlateNodePropsDescriptor
    ? PlateElementRenderProps<
        PlateElementPropsNode<TPlugin>,
        PlateElementPropsConfig<TPlugin>
      >
    : never;

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
    | React.ComponentType<PlateElementRenderProps>
    | keyof HTMLElementTagNameMap = 'div',
> = PlateNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element */
  attributes: React.PropsWithoutRef<
    T extends React.ComponentType<PlateElementRenderProps>
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

type PlateElementComponentProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'div',
> = RenderElementProps<N> &
  Pick<PlateNodeProps<C>, 'ref'> & {
    attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
      UnknownObject;
    as?: T;
    className?: string;
    insetProp?: boolean;
    path: Path;
    plugin?: {
      rules: {
        selection?: SelectionRules;
      };
    };
    style?: React.CSSProperties;
  };

export const PlateElement = function PlateElement({
  as: Tag = 'div',
  children,
  insetProp,
  ref,
  ...props
}: PlateElementComponentProps) {
  const attributes = {
    ...props.attributes,
    className:
      clsx((props.attributes as any).className, props.className) || undefined,
    ref: useComposedRef(ref, getAttributeRef(props.attributes)),
    style: { ...(props.attributes as any).style, ...props.style },
  };

  const inset =
    insetProp ?? props.plugin?.rules.selection?.affinity === 'directional';

  return (
    <PlateElementBody attributes={attributes} inset={inset} tag={Tag}>
      {children}
    </PlateElementBody>
  );
} as unknown as {
  <
    N extends Element = Element,
    C extends AnyBasePluginDefinition = never,
    T extends keyof HTMLElementTagNameMap = 'div',
  >(
    props: PlateElementComponentProps<N, C, T>
  ): React.ReactElement;
  <T extends keyof HTMLElementTagNameMap = 'div'>(
    props: PlateElementComponentProps<Element, never, T>
  ): React.ReactElement;
};

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

type PlateTextRenderProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
> = PlateNodeProps<C> &
  RenderTextProps<N> & {
    attributes: UnknownObject;
  };

/** Props for the text component owned by a plugin descriptor. */
export type PlateTextProps<TPlugin extends PlateNodePropsDescriptor> =
  TPlugin extends PlateNodePropsDescriptor
    ? PlateTextRenderProps<
        PlateTextPropsNode<TPlugin>,
        PlateTextPropsConfig<TPlugin>
      >
    : never;

type PlateTextComponentProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PlateTextRenderProps<N, C> & PlateHTMLProps<C, T>;

export const PlateText = function PlateText({
  as: Tag = 'span',
  children,
  ref,
  ...props
}: PlateTextComponentProps) {
  const attributes = {
    ...props.attributes,
    className:
      clsx((props.attributes as any).className, props.className) || undefined,
    ref: useComposedRef(ref, getAttributeRef(props.attributes)),
    style: { ...(props.attributes as any).style, ...props.style },
  };

  return <Tag {...attributes}>{children}</Tag>;
} as unknown as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: PlateTextComponentProps<N, C, T>
) => React.ReactElement;

type PlateLeafRenderProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
> = PlateNodeProps<C> &
  RenderLeafProps<
    N,
    N & Partial<[C] extends [never] ? {} : InferPluginDecoration<NoInfer<C>>>
  > & {
    attributes: UnknownObject;
    inset?: boolean;
  };

/** Props for the leaf component owned by a plugin descriptor. */
export type PlateLeafProps<TPlugin extends PlateNodePropsDescriptor> =
  TPlugin extends PlateNodePropsDescriptor
    ? PlateLeafRenderProps<
        PlateTextPropsNode<TPlugin>,
        PlateTextPropsConfig<TPlugin>
      >
    : never;

type PlateLeafComponentProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
> = PlateLeafRenderProps<N, C> & PlateHTMLProps<C, T>;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const PlateLeaf = function PlateLeaf({
  as: Tag = 'span',
  children,
  inset: insetProp,
  ref,
  ...props
}: PlateLeafComponentProps) {
  const attributes = {
    ...props.attributes,
    className:
      clsx((props.attributes as any).className, props.className) || undefined,
    ref: useComposedRef(ref, getAttributeRef(props.attributes)),
    style: { ...(props.attributes as any).style, ...props.style },
  };

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
} as unknown as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: PlateLeafComponentProps<N, C, T>) => React.ReactElement;
