import mergeWith from 'lodash/mergeWith.js';

import type {
  LintConfigArray,
  LintConfigRule,
  LintConfigRuleLevel,
  LintConfigRuleSeverity,
  LintConfigRuleSeverityString,
  ResolvedLintRules,
} from '../types';

/** https://eslint.org/docs/latest/use/configure/configuration-files#cascading-configuration-objects */
export function resolveLintConfigs(
  configs: LintConfigArray
): ResolvedLintRules {
  // Helper function for merging language options
  const mergeLanguageOptions = (objValue: any, srcValue: any) => {
    if (!objValue || !srcValue) return;

    return {
      ...objValue,
      parserOptions: objValue.parserOptions
        ? typeof objValue.parserOptions === 'function'
          ? (context: any) => ({
              ...objValue.parserOptions(context),
              ...(typeof srcValue.parserOptions === 'function'
                ? srcValue.parserOptions(context)
                : srcValue.parserOptions),
            })
          : {
              ...objValue.parserOptions,
              ...srcValue.parserOptions,
            }
        : srcValue.parserOptions,
    };
  };

  const mergedConfig = configs.reduce((acc, config) => {
    return mergeWith({}, acc, config, (objValue, srcValue, key) => {
      if (Array.isArray(objValue)) {
        return srcValue;
      }
      // Special handling for rules to merge their options
      if (objValue && typeof objValue === 'object' && 'rules' in objValue) {
        return {
          ...objValue,
          rules: {
            ...objValue.rules,
            ...srcValue.rules,
          },
        };
      }
      // Special handling for languageOptions
      if (key === 'languageOptions') {
        return mergeLanguageOptions(objValue, srcValue);
      }
    });
  }, {});

  if (!mergedConfig.plugins || !mergedConfig.rules) return {};

  const defaultLanguageOptions = mergedConfig.languageOptions ?? {};

  return Object.entries(mergedConfig.rules).reduce(
    (rulesAcc, [ruleId, entry]) => {
      const [pluginName, ruleName] = ruleId.split('/');
      const plugin = mergedConfig.plugins?.[pluginName];
      const rule = plugin?.rules?.[ruleName];

      if (!plugin || !rule) {
        return rulesAcc;
      }

      const ruleConfig = entry as LintConfigRule;
      const severity = Array.isArray(ruleConfig)
        ? normalizeSeverity(ruleConfig[0])
        : normalizeSeverity(ruleConfig);

      if (severity === 'off') {
        return rulesAcc;
      }

      const userOptions: any[] = Array.isArray(ruleConfig)
        ? ruleConfig.slice(1)
        : [];
      const defaultOptions = rule.meta.defaultOptions || [];

      const options = [
        {
          ...defaultOptions[0],
          ...userOptions[0],
          ...mergedConfig.settings,
        },
        ...defaultOptions.slice(1),
        ...userOptions.slice(1),
      ];

      const languageOptions = mergeWith(
        {},
        defaultLanguageOptions,
        rule.meta.languageOptions ?? {},
        (objValue, srcValue) => {
          if (Array.isArray(objValue)) {
            return srcValue;
          }
        }
      );

      return {
        ...rulesAcc,
        [ruleId]: {
          create: rule.create,
          languageOptions,
          linterOptions: { severity },
          meta: rule.meta,
          name: ruleId,
          options,
          settings: mergedConfig.settings ?? {},
        },
      };
    },
    {} as any
  );
}

function normalizeSeverity(
  level: LintConfigRuleLevel
): LintConfigRuleSeverityString {
  if (typeof level === 'number') {
    const numericLevel = level as LintConfigRuleSeverity;

    return numericLevel === 0 ? 'off' : numericLevel === 1 ? 'warn' : 'error';
  }

  return level as LintConfigRuleSeverityString;
}
