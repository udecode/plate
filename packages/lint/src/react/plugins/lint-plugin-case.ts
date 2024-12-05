import { Node } from 'slate';

import type { LintConfigPlugin, LintConfigPluginRule } from '../types';

export type CaseLintPluginOptions = {
  ignoredWords?: string[];
  maxSuggestions?: number;
};

const caseMatchRule: LintConfigPluginRule<CaseLintPluginOptions> = {
  create: ({ fixer, options }) => {
    const ignoredWords = options[0].ignoredWords ?? [];

    return {
      Token: (token) => {
        const text = token.text;

        // Skip if word is in ignored list
        if (ignoredWords.includes(text)) return token;
        // Check if first letter is lowercase using startsWith
        if (text && /^[a-z]/.test(text)) {
          const suggestion = text.charAt(0).toUpperCase() + text.slice(1);

          return {
            ...token,
            messageId: 'capitalizeFirstLetter',
            suggest: [
              {
                data: { text: suggestion },
                fix: (options) => {
                  fixer.replaceText({
                    range: token.rangeRef.current!,
                    text: suggestion,
                    ...options,
                  });
                },
              },
            ],
          };
        }

        return token;
      },
    };
  },
  meta: {
    defaultOptions: [
      {
        ignoredWords: [],
      },
    ],
    hasSuggestions: true,
    type: 'suggestion',
  },
};

const plugin = {
  meta: {
    name: 'case',
  },
  rules: {
    sentence: caseMatchRule,
  },
} satisfies LintConfigPlugin;

export const caseLintPlugin = {
  ...plugin,
  configs: {
    all: {
      languageOptions: {
        parserOptions: (context) => {
          const { editor, options: contextOptions } = context;
          const text = Node.string(editor.children[0]);
          const ignoredWords = contextOptions[0]?.ignoredWords ?? [];

          console.log('Parsing text:', text);
          console.log('Ignored words:', ignoredWords);

          return {
            context: {
              getTokenPosition: (token: string, text: string) => {
                const match = new RegExp(`\\b${token}\\b`).exec(text);
                const position = match?.index ?? 0;
                console.log(
                  'Getting position for token:',
                  token,
                  'position:',
                  position
                );

                return position;
              },
              isValidTokenContext: (position: number, text: string) => {
                if (position === 0) {
                  console.log('Position 0, valid context');

                  return true;
                }

                const prevChar = text[position - 2];
                const isValid =
                  prevChar === '.' || prevChar === '!' || prevChar === '?';
                console.log(
                  'Checking context at position:',
                  position,
                  'prevChar:',
                  prevChar,
                  'isValid:',
                  isValid
                );

                return isValid;
              },
              text,
            },
            match: (token: string) => {
              console.log('\nMatching token:', token);

              if (ignoredWords.includes(token)) {
                console.log('Token is ignored');

                return false;
              }
              if (!/^[a-z]/.test(token)) {
                console.log('Token starts with uppercase');

                return false;
              }

              // Get position
              const match = new RegExp(`\\b${token}\\b`).exec(text);
              const position = match?.index ?? 0;
              console.log('Token position:', position);

              // Check position
              if (position === 0) {
                console.log('Token at start of text');

                return true;
              }

              const prevChar = text[position - 2];
              const isValid =
                prevChar === '.' || prevChar === '!' || prevChar === '?';
              console.log('Previous char:', prevChar, 'isValid:', isValid);

              return isValid;
            },
            splitPattern: /\b[\dA-Za-z]+\b/g,
          };
        },
      },
      name: 'case/all',
      plugins: { case: plugin },
      rules: {
        'case/sentence': ['error'],
      },
    },
  },
} satisfies LintConfigPlugin<CaseLintPluginOptions>;
