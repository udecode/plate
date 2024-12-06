import type {
  LintAnnotationSuggestion,
  LintConfigPlugin,
  LintConfigPluginRule,
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
      Annotation: (annotation) => {
        const replacements = replaceMap?.get(annotation.text.toLowerCase());

        return {
          ...annotation,
          data: {
            ...annotation.data,
            type: replacements?.[0]?.type,
          },
          messageId: 'replaceWithText',
          suggest: replacements?.slice(0, maxSuggestions).map(
            (replacement): LintAnnotationSuggestion => ({
              data: {
                text: replacement.text,
                type: replacement.type,
              },
              fix: (options) => {
                fixer.replaceText({
                  range: annotation.rangeRef.current!,
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
