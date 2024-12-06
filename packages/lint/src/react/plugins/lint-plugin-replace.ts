import type {
  LintConfigPlugin,
  LintConfigPluginRule,
  LintTokenSuggestion,
} from '../types';

export type ReplaceLintPluginOptions = {
  maxSuggestions?: number;
  replaceMap?: Map<string, { text: string; type?: string }[]>;
};

const replaceMatchRule: LintConfigPluginRule<ReplaceLintPluginOptions> = {
  create: ({ fixer, options }) => {
    const replaceMap = options[0].replaceMap;
    const maxSuggestions = options[0].maxSuggestions;

    return {
      Token: (token) => {
        const replacements = replaceMap?.get(token.text.toLowerCase());

        return {
          ...token,
          data: {
            ...token.data,
            type: replacements?.[0]?.type,
          },
          messageId: 'replaceWithText',
          suggest: replacements?.slice(0, maxSuggestions).map(
            (replacement): LintTokenSuggestion => ({
              data: {
                text: replacement.text,
                type: replacement.type,
              },
              fix: (options) => {
                console.log(token.rangeRef.current);
                fixer.replaceText({
                  range: token.rangeRef.current!,
                  text: replacement.text,
                  ...options,
                });
                console.log(token.rangeRef.current);
              },
            })
          ),
        };
      },
    };
  },
  meta: {
    defaultOptions: [
      {
        maxSuggestions: 8,
      },
    ],
    hasSuggestions: true,
    type: 'suggestion',
  },
};

const plugin = {
  meta: {
    name: 'replace',
  },
  rules: {
    text: replaceMatchRule,
  },
} satisfies LintConfigPlugin;

export const replaceLintPlugin = {
  ...plugin,
  configs: {
    all: {
      languageOptions: {
        parserOptions: ({ options }) => {
          const replaceMap = options[0].replaceMap;

          return {
            match: ({ text }) => {
              return !!replaceMap?.has(text.toLowerCase());
            },
            splitPattern: /\b[\dA-Za-z]+(?:['-]\w+)*\b/g,
          };
        },
      },
      name: 'replace/all',
      plugins: { replace: plugin },
      rules: {
        'replace/text': ['error'],
      },
    },
  },
} satisfies LintConfigPlugin<ReplaceLintPluginOptions>;
