import type {
  LintConfigPlugin,
  LintConfigPluginRule,
  LintTokenSuggestion,
} from '../types';

export type ReplaceLintPluginOptions = {
  maxSuggestions?: number;
  replaceMap?: Map<string, { text: string }[]>;
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
          messageId: 'replaceWithText',
          suggest: replacements?.slice(0, maxSuggestions).map(
            (replacement): LintTokenSuggestion => ({
              data: { text: replacement.text },
              fix: (options) => {
                fixer.replaceText({
                  range: token.rangeRef.current!,
                  text: replacement.text,
                  ...options,
                });
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
            match: (token: string) => {
              return !!replaceMap?.has(token.toLowerCase());
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
