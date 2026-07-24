import React, {
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { useEditableDOMHostFact } from '../hooks/use-claim-editable-dom-commit';

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

type PlitePlaceholderProps = {
  as?: PlaceholderIntrinsicTag;
  children: ReactNode;
  dir?: 'rtl';
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
};

type PlitePlaceholderComponentProps = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
};

const defaultPlaceholderStyle = {
  position: 'absolute',
  top: 0,
  pointerEvents: 'none',
  width: '100%',
  maxWidth: '100%',
  display: 'block',
  userSelect: 'none',
} satisfies CSSProperties;

export const getPlitePlaceholderStyle = (
  style?: CSSProperties,
  webkit = false
): CSSProperties => ({
  ...defaultPlaceholderStyle,
  WebkitUserModify: webkit ? 'inherit' : undefined,
  ...style,
});

/**
 * Render non-editable placeholder content inside an editable surface.
 *
 * The placeholder is aria-hidden, pointer-inert, and styled to overlay the
 * empty editable block without becoming editor content.
 */
export const PlitePlaceholder = ({
  as = 'span',
  children,
  dir,
  ref,
  style,
}: PlitePlaceholderProps) => {
  const Component = as as ElementType<PlitePlaceholderComponentProps>;
  const webkit = useEditableDOMHostFact(
    (runtime) => runtime.isWebKitHost,
    false
  );

  return (
    <Component
      aria-hidden
      contentEditable={false}
      data-plite-placeholder
      dir={dir}
      ref={ref}
      style={getPlitePlaceholderStyle(style, webkit)}
    >
      {children}
    </Component>
  );
};
