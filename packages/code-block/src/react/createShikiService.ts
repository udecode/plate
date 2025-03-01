import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  createSingletonShorthands,
} from 'shiki';

// Use Shiki managed singleton for bundled languages
const highlighter = createSingletonShorthands(createHighlighter);

/** Tokenize code with automatic language loading. */
export const tokenizeCode = async (
  code: string,
  lang: BundledLanguage,
  theme: BundledTheme
) => {
  const result = await highlighter.codeToTokens(code, {
    lang,
    theme,
  });

  return result.tokens;
};

interface TimeoutState {
  nextAllowedTime: number;
  timeoutId?: NodeJS.Timeout;
}

/** Optionally throttles rapid sequential highlighting operations */
export const throttleHighlighting = (
  performHighlight: () => Promise<void>,
  timeoutControl: TimeoutState,
  throttleMs: number
) => {
  const now = Date.now();
  clearTimeout(timeoutControl.timeoutId);

  const delay = Math.max(0, timeoutControl.nextAllowedTime - now);
  timeoutControl.timeoutId = setTimeout(() => {
    performHighlight().catch(console.error);
    timeoutControl.nextAllowedTime = now + throttleMs;
  }, delay);
};
