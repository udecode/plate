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
    const replaceMap = options.replaceMap;
    const maxSuggestions = options.maxSuggestions;

    return {
      Annotation: (annotation) => {
        const replacements = replaceMap?.get(annotation.text.toLowerCase());

        return {
          ...annotation,
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
          type: replacements?.[0]?.type,
        };
      },
    };
  },
  meta: {
    defaultOptions: {
      maxSuggestions: 8,
    },
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
      name: 'replace/all',
      plugins: { replace: plugin },
      rules: {
        'replace/text': ['error', {}],
      },
      settings: {
        replace: {
          parserOptions: ({ options }) => {
            return {
              match: ({ text }) => {
                return !!options.replaceMap?.has(text.toLowerCase());
              },
              splitPattern: /\b[\dA-Za-z]+(?:['-]\w+)*\b/g,
            };
          },
        },
      },
    },
  },
} satisfies LintConfigPlugin<ReplaceLintPluginOptions>;
