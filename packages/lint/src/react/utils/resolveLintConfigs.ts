import type {
  LintConfigArray,
  LintConfigRule,
  LintConfigRuleLevel,
  ResolvedLintRules,
} from '../types';

/** Convert parserOptions to a function */
const toParserFunction = (parserOptions: any) => {
  if (typeof parserOptions === 'function') {
    return parserOptions;
  }
  if (parserOptions) {
    return () => parserOptions;
  }

  return () => ({});
};

/** Merge plugin settings from multiple configs */
const mergePluginSettings = (configs: LintConfigArray, pluginName: string) => {
  return configs.reduce((acc, config) => {
    const pluginSettings = config.settings?.[pluginName];

    if (!pluginSettings) return acc;
    // Special handling for parserOptions
    if (pluginSettings.parserOptions) {
      const accParserFn = toParserFunction(acc.parserOptions);
      const newParserFn = toParserFunction(pluginSettings.parserOptions);

      return {
        ...acc,
        ...pluginSettings,
        parserOptions: (ctx: any) => ({
          ...accParserFn(ctx),
          ...newParserFn(ctx),
        }),
      };
    }

    // Merge other settings
    return {
      ...acc,
      ...pluginSettings,
    };
  }, {} as any);
};

export function resolveLintConfigs(
  configs: LintConfigArray,
  target?: { id: string }
): ResolvedLintRules {
  // Filter configs by target
  const filteredConfigs = target
    ? configs.filter(
        (config) =>
          !config?.targets || // No targets = applies to all
          config.targets.some((t) => t.id === target.id)
      )
    : configs;

  // Merge plugins and rules in order
  const { plugins, rules } = filteredConfigs.reduce(
    (acc, config) => ({
      plugins: { ...acc.plugins, ...config.plugins },
      rules: { ...acc.rules, ...config.rules },
    }),
    { plugins: {}, rules: {} }
  );

  if (!plugins || !rules) return {};

  // Resolve rules
  return Object.entries(rules).reduce((rulesAcc, [ruleId, entry]) => {
    const [pluginName, ruleName] = ruleId.split('/');
    const plugin = plugins[pluginName];
    const rule = plugin?.rules?.[ruleName];

    // Skip if plugin or rule not found
    if (!plugin || !rule) return rulesAcc;

    const ruleConfig = entry as LintConfigRule;
    const severity = Array.isArray(ruleConfig)
      ? normalizeSeverity(ruleConfig[0])
      : normalizeSeverity(ruleConfig);

    if (severity === 'off') return rulesAcc;

    const userOptions: any = Array.isArray(ruleConfig)
      ? (ruleConfig[1] ?? {})
      : {};
    const defaultOptions: any = rule.meta.defaultOptions ?? {};
    const settings: any = mergePluginSettings(configs, pluginName);

    // Merge options, preserving plugin's parserOptions
    const options = {
      ...defaultOptions,
      ...settings,
      ...userOptions,
      parserOptions: (ctx: any) => ({
        ...defaultOptions.parserOptions?.(ctx),
        ...settings.parserOptions?.(ctx),
        ...userOptions.parserOptions?.(ctx),
      }),
    };

    return {
      ...rulesAcc,
      [ruleId]: {
        create: rule.create,
        linterOptions: { severity },
        meta: rule.meta,
        name: ruleId,
        options,
      },
    };
  }, {} as any);
}

function normalizeSeverity(level: LintConfigRuleLevel) {
  if (typeof level === 'number') {
    return level === 0 ? 'off' : level === 1 ? 'warn' : 'error';
  }

  return level;
}
