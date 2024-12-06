import type { Decorate, PlatePluginContext } from '@udecode/plate-common/react';

import {
  collapseSelection,
  deleteText,
  experimental_parseNode,
  isBlock,
  replaceText,
} from '@udecode/plate-common';
import { Range } from 'slate';

import type { LintConfig } from './lint-plugin';
import type { LintConfigPluginRuleContext, LintFixer } from './types';

import { resolveLintConfigs } from './utils/resolveLintConfigs';

export const decorateLint: Decorate<LintConfig> = (ctx) => {
  const {
    editor,
    entry: [node, path],
    getOptions,
    setOption,
    tf,
  } = ctx;
  const { configs } = getOptions();

  // Support only blocks for now
  if (!isBlock(editor, node)) {
    return [];
  }

  // First, filter configs that apply to this node
  const applicableConfigs = configs.filter(
    (config) =>
      !config.targets || // applies to all
      config.targets.some((target) => target.id === node.id) // specifically targets this node
  );

  if (applicableConfigs.length === 0) return [];

  // Resolve rules for this node's configs only
  const resolvedRules = resolveLintConfigs(applicableConfigs);

  const decorations = Object.entries(resolvedRules).flatMap(
    ([ruleId, rule]) => {
      const fixerActions: LintFixer = {
        insertTextAfter: ({ range, text }) => {
          const point = Range.end(range);
          editor.insertText(text, { at: point });
        },
        insertTextBefore: ({ range, text }) => {
          const point = Range.start(range);
          editor.insertText(text, { at: point });
        },
        remove: ({ range }) => {
          deleteText(editor, { at: range });
        },
        replaceText: ({ range, text }) => {
          replaceText(editor, {
            at: range,
            text: text,
          });
        },
      };

      const fixer = Object.fromEntries(
        Object.entries(fixerActions).map(([key, fn]) => [
          key,
          (options: any) => {
            fn(options);

            if (options.goNext && tokens.length > 2) {
              setTimeout(() => {
                tf.lint.focusNextMatch();
              }, 0);
            } else {
              collapseSelection(editor);
              setTimeout(() => {
                setOption('activeToken', null);
              }, 0);
            }
          },
        ])
      ) as LintFixer;

      const context: LintConfigPluginRuleContext = {
        ...(ctx as unknown as PlatePluginContext),
        id: ruleId,
        fixer,
        languageOptions: rule.languageOptions ?? {},
        options: rule.options ?? [],
        settings: rule.settings ?? {},
      };

      let parserOptions = rule.languageOptions?.parserOptions;

      if (typeof parserOptions === 'function') {
        parserOptions = parserOptions(context);
      }

      const { Token } = rule.create(context);

      const { decorations, tokens } = experimental_parseNode(editor, {
        at: path,
        match: parserOptions?.match ?? (() => false),
        maxLength: parserOptions?.maxLength,
        minLength: parserOptions?.minLength,
        splitPattern: parserOptions?.splitPattern,
        transform: Token,
      });

      setTimeout(() => {
        setOption('tokens', tokens);
      }, 0);

      return decorations.map(({ range, token }) => ({
        ...range,
        lint: true,
        token,
      }));
    }
  );

  return decorations;
};
