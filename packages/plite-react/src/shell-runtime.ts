import type { CSSProperties } from 'react';

const defaultSpacerStyle = {
  height: '0',
  color: 'transparent',
  outline: 'none',
  position: 'absolute',
} satisfies CSSProperties;

export const getPliteElementShellAttributes = ({
  isInline = false,
  isVoid = false,
}: {
  isInline?: boolean;
  isVoid?: boolean;
}) => ({
  'data-plite-inline': isInline ? true : undefined,
  'data-plite-node': 'element' as const,
  'data-plite-void': isVoid ? true : undefined,
});

export const getPliteTextShellAttributes = ({
  domSync = false,
  domSyncReason,
}: {
  domSync?: boolean;
  domSyncReason?: string | null;
}) => ({
  'data-plite-dom-sync': domSync ? true : undefined,
  'data-plite-dom-sync-reason': domSync ? undefined : domSyncReason,
  'data-plite-node': 'text' as const,
});

export const getPliteLeafShellAttributes = () => ({
  'data-plite-leaf': true as const,
});

export const getPliteSpacerShellStyle = (style?: CSSProperties) => ({
  ...defaultSpacerStyle,
  ...style,
});

export const getPliteSpacerShellAttributes = ({
  style,
}: {
  style?: CSSProperties;
} = {}) => ({
  'data-plite-spacer': true as const,
  style: getPliteSpacerShellStyle(style),
});
