import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import { IS_WEBKIT } from '@platejs/slate-dom';

type VoidIntrinsicTag =
  | 'area'
  | 'base'
  | 'br'
  | 'col'
  | 'embed'
  | 'hr'
  | 'img'
  | 'input'
  | 'link'
  | 'meta'
  | 'param'
  | 'source'
  | 'track'
  | 'wbr';

export type PlaceholderIntrinsicTag = Exclude<
  keyof HTMLElementTagNameMap,
  VoidIntrinsicTag
>;

type SlatePlaceholderProps = {
  as?: PlaceholderIntrinsicTag;
  children: ReactNode;
  dir?: 'rtl';
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
};

type SlatePlaceholderComponentProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

const defaultPlaceholderStyle = {
  position: 'absolute',
  top: 0,
  pointerEvents: 'none',
  width: '100%',
  maxWidth: '100%',
  display: 'block',
  opacity: '0.333',
  userSelect: 'none',
  textDecoration: 'none',
  WebkitUserModify: IS_WEBKIT ? 'inherit' : undefined,
} satisfies CSSProperties;

export const getSlatePlaceholderStyle = (
  style?: CSSProperties
): CSSProperties => ({
  ...defaultPlaceholderStyle,
  ...style,
});

/**
 * Render non-editable placeholder content inside an editable surface.
 *
 * The placeholder is aria-hidden, pointer-inert, and styled to overlay the
 * empty editable block without becoming editor content.
 */
export const SlatePlaceholder = ({
  as = 'span',
  children,
  dir,
  ref,
  style,
}: SlatePlaceholderProps) => {
  const Component = as as ElementType<SlatePlaceholderComponentProps>;

  return (
    <Component
      aria-hidden
      contentEditable={false}
      data-slate-placeholder
      dir={dir}
      ref={ref}
      style={getSlatePlaceholderStyle(style)}
    >
      {children}
    </Component>
  );
};
