import {
  type BuiltinLanguage,
  type BuiltinTheme,
  type BundledLanguage,
  type BundledTheme,
  type ThemedToken,
  createHighlighter,
  createSingletonShorthands,
} from 'shiki';

// Use Shiki managed singleton for bundled languages, create a fresh instance for custom languages
const highlighter = createSingletonShorthands(createHighlighter);

// const customHighlighterCache = new Map<string, Promise<Highlighter>>();

// const getCachedCustomHighlighter = async (
//   cacheKey: string,
//   lang: BuiltinLanguage | string,
//   theme: BuiltinTheme | string
// ) => {
//   let instance = customHighlighterCache.get(cacheKey);
//   if (!instance) {
//     instance = createHighlighter({
//       langs: [lang as BundledLanguage],
//       themes: [theme as BundledTheme],
//     });
//     customHighlighterCache.set(cacheKey, instance);
//   }
//   return instance;
// };

export type CodeToken = {
  bgColor?: string;
  color?: string;
  fontStyle?: number;
};

interface CodeTokenRange {
  range: { end: number; start: number };
  token: CodeToken;
}

export const createShikiService = () => {
  const tokenizeCode = async (
    code: string,
    lang: BuiltinLanguage | string,
    theme: BuiltinTheme | string
  ): Promise<ThemedToken[][]> => {
    try {
      const result = await highlighter.codeToTokens(code, {
        lang: lang as BundledLanguage,
        theme: theme as BundledTheme,
      });

      return result.tokens;
    } catch (error) {
      console.error('Shiki highlighting error:', error);
      return [];
    }
  };

  return {
    tokenizeCode,
  };
};
