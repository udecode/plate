import type { CSSProperties } from 'react';

const defaultSpacerStyle = {
  height: '0',
  color: 'transparent',
  outline: 'none',
  position: 'absolute',
} satisfies CSSProperties;

export const getSlateElementShellAttributes = ({
  isInline = false,
  isVoid = false,
}: {
  isInline?: boolean;
  isVoid?: boolean;
}) => ({
  'data-slate-inline': isInline ? true : undefined,
  'data-slate-node': 'element' as const,
  'data-slate-void': isVoid ? true : undefined,
});

export const getSlateTextShellAttributes = ({
  domSync = false,
  domSyncReason,
}: {
  domSync?: boolean;
  domSyncReason?: string | null;
}) => ({
  'data-slate-dom-sync': domSync ? true : undefined,
  'data-slate-dom-sync-reason': domSync ? undefined : domSyncReason,
  'data-slate-node': 'text' as const,
});

export const getSlateLeafShellAttributes = () => ({
  'data-slate-leaf': true as const,
});

export const getSlateSpacerShellStyle = (style?: CSSProperties) => ({
  ...defaultSpacerStyle,
  ...style,
});

export const getSlateSpacerShellAttributes = ({
  style,
}: {
  style?: CSSProperties;
} = {}) => ({
  'data-slate-spacer': true as const,
  style: getSlateSpacerShellStyle(style),
});
