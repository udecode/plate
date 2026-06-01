'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { type SyntaxHighlighterProps, Prism } from 'react-syntax-highlighter';
import {
  coldarkDark,
  ghcolors,
} from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { useMounted } from '@/registry/hooks/use-mounted';

const SyntaxHighlighter =
  Prism as unknown as typeof React.Component<SyntaxHighlighterProps>;

type ThemedSyntaxHighlighterProps = Omit<SyntaxHighlighterProps, 'style'>;

const preSelector = 'pre[class*="language-"]';
const codeSelector = 'code[class*="language-"]';

function normalizeTheme(theme: Record<string, React.CSSProperties>) {
  const {
    background: _preBackground,
    backgroundColor: _preBackgroundColor,
    border: _preBorder,
    ...preStyle
  } = theme[preSelector] ?? {};
  const {
    background: _codeBackground,
    backgroundColor: _codeBackgroundColor,
    ...codeStyle
  } = theme[codeSelector] ?? {};

  return {
    ...theme,
    [codeSelector]: codeStyle,
    [preSelector]: preStyle,
  };
}

const lightTheme = normalizeTheme(
  ghcolors as Record<string, React.CSSProperties>
);
const darkTheme = normalizeTheme(
  coldarkDark as Record<string, React.CSSProperties>
);

export function ThemedSyntaxHighlighter({
  children,
  ...props
}: ThemedSyntaxHighlighterProps) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const theme = mounted && resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SyntaxHighlighter {...props} style={theme as any}>
      {children}
    </SyntaxHighlighter>
  );
}
