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
  PluginReference,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  SelectionRules,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { UnknownObject } from '../../lib/types/AnyObject';
import { useComposedRef } from '../internal/react-helpers';
import type { EditableElementSlots } from '../plite-react';
import type { AnyPluginContext, PluginContext } from '../plugin';

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

type NodePropsDescriptor = EditorSchemaSource & PluginReference;

type ElementPropsNode<TPlugin extends NodePropsDescriptor> = Extract<
  ElementOf<TPlugin>,
  Element
>;

type ElementPropsConfig<TPlugin extends NodePropsDescriptor> =
  InternalPluginDefinitionOf<TPlugin>;

type TextPropsNode<TPlugin extends NodePropsDescriptor> = Extract<
  TextOf<TPlugin>,
  Text
>;

type TextPropsConfig<TPlugin extends NodePropsDescriptor> =
  InternalPluginDefinitionOf<TPlugin>;

type NodeContext<C extends AnyBasePluginDefinition> = [C] extends [never]
  ? Omit<AnyPluginContext, 'slots'>
  : Omit<PluginContext<C>, 'slots'>;

type ElementRenderProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = never,
> = EditorNodeProps<C> &
  Omit<RenderElementProps<N>, 'path' | 'slots'> & {
    attributes: UnknownObject;
    slots: Omit<EditableElementSlots, 'contentRoot'> &
      Pick<RenderElementProps<N>['slots'], 'contentRoot'>;
  };

/** Props for the element component owned by a plugin descriptor. */
export type EditorElementProps<TPlugin extends NodePropsDescriptor> =
  TPlugin extends NodePropsDescriptor
    ? ElementRenderProps<ElementPropsNode<TPlugin>, ElementPropsConfig<TPlugin>>
    : never;

export type EditorNodeProps<C extends AnyBasePluginDefinition = never> =
  NodeContext<NoInfer<C>> & {
    /**
     * Optional ref to be merged with `attributes.ref`
     *
     * @default undefined
     */
    ref?: any;
  };

export type EditorHTMLProps<
  C extends AnyBasePluginDefinition = never,
  T extends
    | React.ComponentType<ElementRenderProps>
    | keyof HTMLElementTagNameMap = 'div',
> = EditorNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element */
  attributes: React.PropsWithoutRef<
    T extends React.ComponentType<ElementRenderProps>
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

export const EditorElement = function EditorElement({
  as: Tag = 'div',
  children,
  insetProp,
  ref,
  ...props
}: Omit<RenderElementProps, 'attributes' | 'path'> &
  Pick<EditorNodeProps, 'ref'> & {
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
      Pick<EditorNodeProps<C>, 'ref'> & {
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
      Pick<EditorNodeProps, 'ref'> & {
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
          data-editor-node="element"
          data-editor-inline={
            (attributes as { 'data-editor-inline'?: boolean })[
              'data-editor-inline'
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
          data-editor-node="element"
          data-editor-inline={
            (attributes as { 'data-editor-inline'?: boolean })[
              'data-editor-inline'
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
export type EditorTextProps<TPlugin extends NodePropsDescriptor> =
  TPlugin extends NodePropsDescriptor
    ? EditorNodeProps<TextPropsConfig<TPlugin>> &
        RenderTextProps<TextPropsNode<TPlugin>> & {
          attributes: UnknownObject;
        }
    : never;

export const EditorText = function EditorText({
  as: Tag = 'span',
  children,
  ref,
  ...props
}: (EditorNodeProps &
  RenderTextProps & {
    attributes: UnknownObject;
  }) &
  EditorHTMLProps<never, 'span'>) {
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
  props: (EditorNodeProps<C> &
    RenderTextProps<N> & {
      attributes: UnknownObject;
    }) &
    EditorHTMLProps<C, T>
) => React.ReactElement;

type LeafRenderProps<
  N extends Text = Text,
  C extends AnyBasePluginDefinition = never,
> = EditorNodeProps<C> &
  RenderLeafProps<N, N> & {
    attributes: UnknownObject;
    inset?: boolean;
  };

/** Props for the leaf component owned by a plugin descriptor. */
export type EditorLeafProps<TPlugin extends NodePropsDescriptor> =
  TPlugin extends NodePropsDescriptor
    ? LeafRenderProps<TextPropsNode<TPlugin>, TextPropsConfig<TPlugin>>
    : never;

const NonBreakingSpace = () => (
  <span style={{ fontSize: 0, lineHeight: 0 }} contentEditable={false}>
    {String.fromCodePoint(160)}
  </span>
);

export const EditorLeaf = function EditorLeaf({
  as: Tag = 'span',
  children,
  inset: insetProp,
  ref,
  ...props
}: (EditorNodeProps &
  RenderLeafProps<Text, Text> & {
    attributes: UnknownObject;
    inset?: boolean;
  }) &
  EditorHTMLProps<never, 'span'>) {
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
}: (EditorNodeProps<C> &
  RenderLeafProps<N, N> & {
    attributes: UnknownObject;
    inset?: boolean;
  }) &
  EditorHTMLProps<C, T>) => React.ReactElement;
