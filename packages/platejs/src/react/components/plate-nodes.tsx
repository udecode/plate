import { clsx } from 'clsx';
import React from 'react';

import type {
  Element,
  ElementOf,
  Text,
  TextOf,
  EditorSchemaSource,
} from '../../facade';
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
import type { UnknownObject } from '../../lib/types/AnyObject';
import { useComposedRef } from '../internal/react-helpers';
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
  Omit<RenderElementProps<N>, 'path'> & {
    attributes: UnknownObject;
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

export const PlateElement = function PlateElement({
  as: Tag = 'div',
  children,
  insetProp,
  ref,
  ...props
}: Omit<RenderElementProps, 'attributes' | 'path'> &
  Pick<PlateNodeProps, 'ref'> & {
    attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements['div']> &
      UnknownObject;
    as?: 'div';
    className?: string;
    insetProp?: boolean;
    plugin?: {
      rules: {
        selection?: SelectionRules;
      };
    };
    style?: React.CSSProperties;
  }) {
  const attributes = {
    ...props.attributes,
    className:
      clsx(
        (props.attributes as { className?: string }).className,
        props.className
      ) || undefined,
    ref: useComposedRef(ref, getAttributeRef(props.attributes)),
    style: {
      ...(props.attributes as { style?: React.CSSProperties }).style,
      ...props.style,
    },
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
    props: Omit<RenderElementProps<N>, 'attributes' | 'path'> &
      Pick<PlateNodeProps<C>, 'ref'> & {
        attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
          UnknownObject;
        as?: T;
        className?: string;
        insetProp?: boolean;
        plugin?: {
          rules: {
            selection?: SelectionRules;
          };
        };
        style?: React.CSSProperties;
      }
  ): React.ReactElement;
  <T extends keyof HTMLElementTagNameMap = 'div'>(
    props: Omit<RenderElementProps, 'attributes' | 'path'> &
      Pick<PlateNodeProps, 'ref'> & {
        attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
          UnknownObject;
        as?: T;
        className?: string;
        insetProp?: boolean;
        plugin?: {
          rules: {
            selection?: SelectionRules;
          };
        };
        style?: React.CSSProperties;
      }
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
          data-plite-inline={
            (attributes as { 'data-plite-inline'?: boolean })[
              'data-plite-inline'
            ]
          }
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
          data-plite-inline={
            (attributes as { 'data-plite-inline'?: boolean })[
              'data-plite-inline'
            ]
          }
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

/** Props for the text component owned by a plugin descriptor. */
export type PlateTextProps<TPlugin extends PlateNodePropsDescriptor> =
  TPlugin extends PlateNodePropsDescriptor
    ? PlateNodeProps<PlateTextPropsConfig<TPlugin>> &
        RenderTextProps<PlateTextPropsNode<TPlugin>> & {
          attributes: UnknownObject;
        }
    : never;

export const PlateText = function PlateText({
  as: Tag = 'span',
  children,
  ref,
  ...props
}: (PlateNodeProps &
  RenderTextProps & {
    attributes: UnknownObject;
  }) &
  PlateHTMLProps<never, 'span'>) {
  const attributes = {
    ...props.attributes,
    className:
      clsx(
        (props.attributes as { className?: string }).className,
        props.className
      ) || undefined,
    ref: useComposedRef(ref, getAttributeRef(props.attributes)),
    style: {
      ...(props.attributes as { style?: React.CSSProperties }).style,
      ...props.style,
    },
  };

  return <Tag {...attributes}>{children}</Tag>;
} as unknown as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
  T extends keyof HTMLElementTagNameMap = 'span',
>(
  props: (PlateNodeProps<C> &
    RenderTextProps<N> & {
      attributes: UnknownObject;
    }) &
    PlateHTMLProps<C, T>
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
}: (PlateNodeProps &
  RenderLeafProps<
    Text,
    Text &
      Partial<
        [never] extends [never] ? {} : InferPluginDecoration<NoInfer<never>>
      >
  > & {
    attributes: UnknownObject;
    inset?: boolean;
  }) &
  PlateHTMLProps<never, 'span'>) {
  const attributes = {
    ...props.attributes,
    className:
      clsx(
        (props.attributes as { className?: string }).className,
        props.className
      ) || undefined,
    ref: useComposedRef(ref, getAttributeRef(props.attributes)),
    style: {
      ...(props.attributes as { style?: React.CSSProperties }).style,
      ...props.style,
    },
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
}: (PlateNodeProps<C> &
  RenderLeafProps<
    N,
    N & Partial<[C] extends [never] ? {} : InferPluginDecoration<NoInfer<C>>>
  > & {
    attributes: UnknownObject;
    inset?: boolean;
  }) &
  PlateHTMLProps<C, T>) => React.ReactElement;
