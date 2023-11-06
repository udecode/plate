/**
 * Actual <pre> elements are treated differently, so track these as a separate
 * rule.
 */
export type WhiteSpaceRule = 'normal' | 'actual-pre' | 'pre' | 'pre-line';

export type TrimStartRule = 'collapse' | 'all';
export type TrimEndRule = 'collapse' | 'single-newline';

export type CollapseWhiteSpaceState = {
  inlineFormattingContext: null | {
    atStart: boolean;
    lastHasTrailingWhiteSpace: boolean;
  };

  whiteSpaceRule: WhiteSpaceRule;
};
