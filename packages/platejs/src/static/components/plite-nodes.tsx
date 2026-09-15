import { clsx } from 'clsx';
import React from 'react';

import type {
  Element,
  ElementOf,
  Path,
  Text,
  TextOf,
  EditorSchemaSource,
} from '../../facade';
import type {
  AnyBasePluginDefinition,
  BasePluginContext,
  BasePluginDefinition,
  PluginReference,
  RenderElementProps,
  StaticRenderLeafProps as RenderLeafProps,
  RenderTextProps,
} from '../../lib';
import type { InternalPluginDefinitionOf } from '../../lib/plugin/pluginDefinitionLookup.internal';
import type { UnknownObject } from '../../lib/types/AnyObject';

type NodeAttributeProps = {
  attributes: UnknownObject & {
    className?: string;
    'data-editor-inline'?: boolean;
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

type ElementRenderProps<
  N extends Element = Element,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = EditorNodeProps<C> &
  RenderElementProps<N> & {
    attributes: UnknownObject;
    path: Path;
  };

/** Props for the static element component owned by a plugin descriptor. */
export type EditorElementProps<TPlugin extends NodePropsDescriptor> =
  TPlugin extends NodePropsDescriptor
    ? ElementRenderProps<ElementPropsNode<TPlugin>, ElementPropsConfig<TPlugin>>
    : never;

export type EditorNodeProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Omit<BasePluginContext<C>, 'slots'> & {
  /**
   * Optional ref to be merged with `attributes.ref`.
   *
   * @default undefined
   */
  ref?: React.Ref<HTMLElement>;
};

export type EditorHTMLProps<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
  T extends keyof HTMLElementTagNameMap = 'div',
> = EditorNodeProps<C> & {
  /** HTML attributes to pass to the underlying HTML element. */
  attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
    UnknownObject;
  as?: T;
  /** Class to be merged with `attributes.className`. */
  className?: string;
  /** Style to be merged with `attributes.style`. */
  style?: React.CSSProperties;
};

export const EditorElement = function EditorElement({
  as: Tag = 'div',
  children,
  ref,
  ...props
}: Omit<RenderElementProps, 'attributes'> &
  Pick<EditorNodeProps<any>, 'ref'> & {
    attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements['div']> &
      UnknownObject;
    as?: 'div';
    className?: string;
    path: Path;
    style?: React.CSSProperties;
  }) {
  const attributes = getNodeAttributes<HTMLDivElement>(
    props,
    ref as React.Ref<HTMLDivElement>
  );

  return (
    <Tag
      data-editor-node="element"
      data-editor-inline={attributes['data-editor-inline']}
      {...attributes}
      style={{
        position: 'relative',
        ...attributes?.style,
      }}
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
    props: Omit<RenderElementProps<N>, 'attributes'> &
      Pick<EditorNodeProps<C>, 'ref'> & {
        attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
          UnknownObject;
        as?: T;
        className?: string;
        path: Path;
        style?: React.CSSProperties;
      }
  ): React.ReactElement;
  <T extends keyof HTMLElementTagNameMap = 'div'>(
    props: Omit<RenderElementProps, 'attributes'> &
      Pick<EditorNodeProps<never>, 'ref'> & {
        attributes: React.PropsWithoutRef<React.JSX.IntrinsicElements[T]> &
          UnknownObject;
        as?: T;
        className?: string;
        path: Path;
        style?: React.CSSProperties;
      }
  ): React.ReactElement;
};

/** Props for the static text component owned by a plugin descriptor. */
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
}: (EditorNodeProps<any> &
  RenderTextProps & {
    attributes: UnknownObject;
  }) &
  EditorHTMLProps<any, 'span'>) {
  const attributes = getNodeAttributes(props, ref);

  return <Tag {...attributes}>{children}</Tag>;
} as <
  N extends Text = Text,
  C extends AnyBasePluginDefinition = BasePluginDefinition,
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
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = EditorNodeProps<C> &
  RenderLeafProps<N, N> & {
    attributes: UnknownObject;
    inset?: boolean;
  };

/** Props for the static leaf component owned by a plugin descriptor. */
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
  inset,
  ref,
  ...props
}: (EditorNodeProps<any> &
  RenderLeafProps<Text, Text> & {
    attributes: UnknownObject;
    inset?: boolean;
  }) &
  EditorHTMLProps<any, 'span'>) {
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
}: (EditorNodeProps<C> &
  RenderLeafProps<N, N> & {
    attributes: UnknownObject;
    inset?: boolean;
  }) &
  EditorHTMLProps<C, T>) => React.ReactElement;
