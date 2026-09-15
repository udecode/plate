import type { CSSProperties } from 'react';

type PliteSpacerShellAttributes = {
  'data-editor-spacer': true;
  style: CSSProperties;
};

const defaultSpacerStyle = {
  caretColor: 'transparent',
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
  'data-editor-inline': isInline ? true : undefined,
  'data-editor-node': 'element' as const,
  'data-editor-void': isVoid ? true : undefined,
});

export const getPliteTextShellAttributes = ({
  domSync = false,
  domSyncReason,
}: {
  domSync?: boolean;
  domSyncReason?: string | null;
}) => ({
  'data-editor-dom-sync': domSync ? true : undefined,
  'data-editor-dom-sync-reason': domSync ? undefined : domSyncReason,
  'data-editor-node': 'text' as const,
});

export const getPliteLeafShellAttributes = () => ({
  'data-editor-leaf': true as const,
});

export const getPliteSpacerShellStyle = (
  style?: CSSProperties
): CSSProperties => ({
  ...defaultSpacerStyle,
  ...style,
});

export const getPliteSpacerShellAttributes = ({
  style,
}: {
  style?: CSSProperties;
} = {}): PliteSpacerShellAttributes => ({
  'data-editor-spacer': true as const,
  style: getPliteSpacerShellStyle(style),
});
