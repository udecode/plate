export type CollapseWhiteSpaceState = {
  inlineFormattingContext: {
    atStart: boolean;
    lastHasTrailingWhiteSpace: boolean;
  } | null;
  whiteSpaceRule: WhiteSpaceRule;
};

export type TrimEndRule = 'collapse' | 'single-newline';

export type TrimStartRule = 'all' | 'collapse';

export type WhiteSpaceRule = 'normal' | 'pre' | 'pre-line';
