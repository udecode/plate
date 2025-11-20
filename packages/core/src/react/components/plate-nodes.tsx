import React from 'react';

import type { Path, TElement, TText } from '@platejs/slate';
import type { UnknownObject } from '@udecode/utils';

import { useComposedRef } from '@udecode/react-utils';
import { clsx } from 'clsx';

import type {
  AnyPluginConfig,
  PluginConfig,
  RenderChunkProps,
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
} from '../../lib';
import type { PlatePluginContext } from '../plugin';

import { useEditorMounted } from '../stores';

export const useNodeAttributes = (props: any, ref?: any) => ({
  ...props.attributes,
  className:
    clsx((props.attributes as any).className, props.className) || undefined,
  ref: useComposedRef(ref, props.attributes.ref),
  style: { ...(props.attributes as any).style, ...props.style },
});

export type PlateChunkProps = RenderChunkProps;

export type PlateElementProps<
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
> = PlateNodeProps<C> &
  RenderElementProps<N> & {
    attributes: UnknownObject;
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
  N extends TElement = TElement,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'div',
> = Omit<PlateElementProps<N, C>, keyof DeprecatedNodeProps> &
  PlateHTMLProps<C, T> & {
    insetProp?: boolean;
  };

export const PlateElement = React.forwardRef(function PlateElement(
  { as: Tag = 'div', children, insetProp, ...props }: StyledPlateElementProps,
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

  const inset =
    insetProp ?? props.plugin?.rules.selection?.affinity === 'directional';

  return (
    <>
      {inset && <NonBreakingSpace />}
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
        {inset && <NonBreakingSpace />}
      </Tag>
    </>
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
> = PlateNodeProps<C> &
  RenderTextProps<N> &
  DeprecatedNodeProps & {
    attributes: UnknownObject;
  };

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
> = PlateNodeProps<C> &
  RenderLeafProps<N> &
  DeprecatedNodeProps & { attributes: UnknownObject; inset?: boolean };

export type StyledPlateLeafProps<
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
> = Omit<PlateLeafProps<N, C>, keyof DeprecatedNodeProps> &
  PlateHTMLProps<C, T>;

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
}) as <
  N extends TText = TText,
  C extends AnyPluginConfig = PluginConfig,
  T extends keyof HTMLElementTagNameMap = 'span',
>({
  className,
  ...props
}: StyledPlateLeafProps<N, C, T>) => React.ReactElement;
