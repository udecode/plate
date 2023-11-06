export type WhiteSpaceRule = 'normal' | 'pre' | 'pre-line';

export type TrimStartRule = 'collapse' | 'all';
export type TrimEndRule = 'collapse' | 'single-newline';

export type CollapseWhiteSpaceState = {
  inlineFormattingContext: null | {
    atStart: boolean;
    lastHasTrailingWhiteSpace: boolean;
  };

  whiteSpaceRule: WhiteSpaceRule;
};
