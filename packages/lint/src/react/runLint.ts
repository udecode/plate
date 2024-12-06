import {
  collapseSelection,
  deleteText,
  experimental_parseNode,
  replaceText,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  type PlatePluginContext,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import { Range } from 'slate';

import type {
  LintConfigArray,
  LintConfigPluginRuleContext,
  LintFixer,
} from './types';

import { ExperimentalLintPlugin } from './lint-plugin';
import { resolveLintConfigs } from './utils/resolveLintConfigs';

export const runLint = (editor: PlateEditor, configs: LintConfigArray) => {
  const ctx = getEditorPlugin(editor, ExperimentalLintPlugin);
  const { setOption, tf } = ctx;

  setOption('configs', configs);
  const resolvedRules = resolveLintConfigs(configs);

  console.log('Resolved rules:', Object.keys(resolvedRules));

  // Create fixer actions once
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
        text,
      });
    },
  };

  console.log(resolvedRules);

  // Process each rule
  const annotations = Object.entries(resolvedRules).flatMap(
    ([ruleId, rule]) => {
      console.log('Processing rule:', ruleId);
      console.log('Rule settings:', rule.settings);

      const fixer = Object.fromEntries(
        Object.entries(fixerActions).map(([key, fn]) => [
          key,
          (options: any) => {
            fn(options);

            if (options.goNext) {
              setTimeout(() => {
                tf.lint.focusNextMatch();
              }, 0);
            } else {
              collapseSelection(editor);
              setTimeout(() => {
                setOption('activeAnnotation', null);
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

      console.log('Parser options:', parserOptions);

      const { Annotation } = rule.create(context);

      // Parse with transform
      const { annotations } = experimental_parseNode(editor, {
        match: parserOptions?.match ?? (() => false),
        maxLength: parserOptions?.maxLength,
        minLength: parserOptions?.minLength,
        splitPattern: parserOptions?.splitPattern,
        transform: Annotation,
      });

      console.log(`Annotations for ${ruleId}:`, annotations.length);

      return annotations;
    }
  );

  console.log('Total annotations:', annotations.length);
  setOption('annotations', annotations);
  editor.api.redecorate();
};
