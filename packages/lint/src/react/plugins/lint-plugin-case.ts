import type { LintConfigPlugin, LintConfigPluginRule } from '../types';

export type CaseLintPluginOptions = {
  ignoredWords?: string[];
  maxSuggestions?: number;
};

const caseMatchRule: LintConfigPluginRule<CaseLintPluginOptions> = {
  create: ({ fixer, options }) => {
    const ignoredWords = options.ignoredWords ?? [];

    return {
      Annotation: (annotation) => {
        const text = annotation.text;

        // Skip if word is in ignored list or is part of URL/email
        if (ignoredWords.includes(text) || /\.|@/.test(text)) {
          return annotation;
        }
        // Skip if not a regular word or already capitalized
        if (!/^[a-z][\da-z]*$/i.test(text) || /^[A-Z]/.test(text)) {
          return annotation;
        }
        // Check if first letter is lowercase
        if (text && /^[a-z]/.test(text)) {
          const suggestion = text.charAt(0).toUpperCase() + text.slice(1);

          return {
            ...annotation,
            messageId: 'capitalizeFirstLetter',
            suggest: [
              {
                data: { text: suggestion },
                fix: (options) => {
                  fixer.replaceText({
                    range: annotation.rangeRef.current!,
                    text: suggestion,
                    ...options,
                  });
                },
              },
            ],
          };
        }

        return annotation;
      },
    };
  },
  meta: {
    defaultOptions: {
      ignoredWords: [],
    },
    hasSuggestions: true,
    type: 'suggestion',
  },
};

const plugin = {
  meta: {
    name: 'case',
  },
  rules: {
    'capitalize-sentence': caseMatchRule,
  },
} satisfies LintConfigPlugin;

export const caseLintPlugin = {
  ...plugin,
  configs: {
    all: {
      name: 'case/all',
      plugins: { case: plugin },
      rules: {
        'case/capitalize-sentence': ['error', {}],
      },
      settings: {
        case: {
          parserOptions: ({ options }) => {
            // Helper to check if a word is part of URL/email
            const isUrlOrEmail = (
              text: string,
              fullText: string,
              start: number
            ) => {
              // Check if part of email
              if (text.includes('@')) return true;

              // Check if part of URL (look before and after)
              const beforeDot = fullText.slice(Math.max(0, start - 10), start);
              const afterDot = fullText.slice(
                start + text.length,
                start + text.length + 10
              );

              return (
                /\.[a-z]/i.test(beforeDot + text) ||
                /^[a-z]*\./.test(text + afterDot)
              );
            };

            return {
              match: (params) => {
                const {
                  fullText,
                  getContext,
                  start,
                  text: annotation,
                } = params;

                // Skip ignored words and parts of URLs/emails
                if (
                  options.ignoredWords?.includes(annotation) ||
                  isUrlOrEmail(annotation, fullText, start)
                ) {
                  return false;
                }
                // Skip if already capitalized
                if (/^[A-Z]/.test(annotation)) {
                  return false;
                }
                // Skip if not a regular word (contains special characters or mixed case)
                if (
                  !/^[a-z][\da-z]*$/i.test(annotation) ||
                  /[A-Z]/.test(annotation.slice(1))
                ) {
                  return false;
                }

                // Get previous context with enough characters for sentence boundaries
                const prevText = getContext({ before: 5 });

                // Check for sentence boundaries, including quotes and parentheses
                const isStartOfSentence =
                  start === 0 || // First word in text
                  /[!.?]\s*(?:["')\]}]\s*)*$/.test(prevText) || // Punctuation followed by optional closing chars and whitespace
                  /[!.?]\s*["'([{]\s*$/.test(prevText); // Punctuation followed by opening chars and whitespace

                return isStartOfSentence;
              },
              // Update pattern to better match words
              splitPattern: /\b[A-Za-z][\dA-Za-z]*\b/g,
            };
          },
        },
      },
    },
  },
} satisfies LintConfigPlugin<CaseLintPluginOptions>;
