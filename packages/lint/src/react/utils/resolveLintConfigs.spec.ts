/* eslint-disable jest/no-conditional-expect */
import type { LintConfigArray } from '../types';

import { replaceLintPlugin } from '../plugins/lint-plugin-replace';
import { resolveLintConfigs } from './resolveLintConfigs';

/**
 * - ✅ Basic config merging
 * - ✅ Settings merging
 * - ✅ Language options merging
 * - ✅ Rule severity handling (both numeric and string)
 * - ✅ Disabled rules
 * - ✅ Invalid configs
 * - ✅ Empty/undefined configs
 * - ✅ Targets handling
 * - ✅ Function merging in parser options
 */

describe('resolveLintConfigs', () => {
  const replaceMap = new Map([
    ['hello', [{ emoji: '👋' }]],
    ['world', [{ emoji: '🌍' }, { emoji: '🌎' }]],
  ]);

  it('should merge multiple configs correctly', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    expect(result[ruleKey].name).toBe(ruleKey);
    expect(result[ruleKey].linterOptions.severity).toBe('error');
    expect(result[ruleKey].options[0].replaceMap).toBe(replaceMap);
    expect(result[ruleKey].options[0].maxSuggestions).toBe(8);
  });

  it('should handle language options merging', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all,
      {
        languageOptions: {
          parserOptions: {
            match: (params) => true,
            minLength: 4,
          },
        },
        settings: {
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey].languageOptions.parserOptions).toBeDefined();

    const parserOptionsFn = result[ruleKey].languageOptions.parserOptions;

    if (typeof parserOptionsFn !== 'function') {
      throw new TypeError('Expected parserOptions to be a function');
    }

    const parserOptions = parserOptionsFn({
      id: 'test',
      fixer: {},
      languageOptions: {},
      options: [{ replaceMap: replaceMap }],
      settings: {},
    } as any);

    expect(parserOptions.minLength).toBe(4);
    expect(parserOptions.splitPattern).toBeDefined();
    expect(typeof parserOptions.match).toBe('function');
  });

  it('should handle rule severity levels', () => {
    const configs: LintConfigArray = [
      {
        ...replaceLintPlugin.configs.all,
        rules: {
          'replace/text': ['warn'],
        },
      },
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    expect(result['replace/text'].linterOptions.severity).toBe('warn');
  });

  it('should handle numeric severity levels', () => {
    const configs: LintConfigArray = [
      {
        ...replaceLintPlugin.configs.all,
        rules: {
          'replace/text': [2],
        },
      },
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    expect(result['replace/text'].linterOptions.severity).toBe('error');
  });

  it('should skip disabled rules', () => {
    const configs: LintConfigArray = [
      {
        ...replaceLintPlugin.configs.all,
        rules: {
          'replace/text': 'off',
        },
      },
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    expect(result['replace/text']).toBeUndefined();
  });

  it('should return empty object for invalid configs', () => {
    const configs: LintConfigArray = [
      {
        rules: {
          'nonexistent/rule': ['error'],
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    expect(result).toEqual({});
  });

  it('should merge multiple configs with different settings', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all,
      {
        languageOptions: {
          parserOptions: {
            match: (params) => true,
            maxLength: 4,
          },
        },
        settings: {
          maxSuggestions: 5,
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey].options[0].maxSuggestions).toBe(5);
    expect(result[ruleKey].options[0].replaceMap).toBe(replaceMap);
    expect(result[ruleKey].languageOptions.parserOptions).toBeDefined();
  });

  it('should merge settings from multiple configs', () => {
    const configs: LintConfigArray = [
      {
        plugins: { replace: replaceLintPlugin },
        rules: {
          'replace/text': ['error'],
        },
        settings: {
          setting1: 'value1',
        },
      },
      {
        settings: {
          setting2: 'value2',
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    expect(result[ruleKey].settings).toEqual({
      setting1: 'value1',
      setting2: 'value2',
    });
  });

  it('should handle targets in config objects', () => {
    const configs: LintConfigArray = [
      {
        ...replaceLintPlugin.configs.all,
        targets: [{ id: 'target1' }, { id: 'target2' }],
      },
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    expect(result[ruleKey].options[0].replaceMap).toBe(replaceMap);
  });

  it('should merge parser options correctly when both are objects', () => {
    const configs: LintConfigArray = [
      {
        languageOptions: {
          parserOptions: {
            match: (params) => params.text.length > 2,
            splitPattern: /\w+/g,
          },
        },
        plugins: { replace: replaceLintPlugin },
        rules: {
          'replace/text': ['error'],
        },
      },
      {
        languageOptions: {
          parserOptions: {
            match: (params) => params.text.length > 4,
            minLength: 3,
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    const parserOptions = result[ruleKey].languageOptions.parserOptions;

    expect(parserOptions).toBeDefined();
    expect(parserOptions).toHaveProperty('match');
    expect(parserOptions).toHaveProperty('splitPattern');
    expect(parserOptions).toHaveProperty('minLength');
  });

  it('should handle empty or undefined configs gracefully', () => {
    const configs: LintConfigArray = [
      undefined as any,
      null as any,
      {},
      replaceLintPlugin.configs.all,
    ];

    const result = resolveLintConfigs(configs);
    expect(result).toBeDefined();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it('should handle function merging in parser options', () => {
    const configs: LintConfigArray = [
      {
        languageOptions: {
          parserOptions: (context) => ({
            match: (params) => true,
            splitPattern: /\w+/g,
          }),
        },
        plugins: { replace: replaceLintPlugin },
        rules: {
          'replace/text': ['error'],
        },
      },
      {
        languageOptions: {
          parserOptions: (context) => ({
            match: (params) => true,
            splitPattern: /\w+/g,
          }),
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    const parserOptions = result[ruleKey].languageOptions.parserOptions;
    expect(typeof parserOptions).toBe('function');
  });
});
