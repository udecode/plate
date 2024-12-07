/* eslint-disable jest/no-conditional-expect */
import type { LintConfigArray } from '../types';

import { caseLintPlugin } from '../plugins';
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
          replace: {
            replaceMap: replaceMap,
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    expect(result[ruleKey].name).toBe(ruleKey);
    expect(result[ruleKey].linterOptions.severity).toBe('error');
    expect(result[ruleKey].options.replaceMap).toBe(replaceMap);
    expect(result[ruleKey].options.maxSuggestions).toBe(8);
  });

  it('should handle language options merging', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all,
      {
        settings: {
          replace: {
            parserOptions: {
              match: (params) => true,
              minLength: 4,
            },
            replaceMap: replaceMap,
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey].options.parserOptions).toBeDefined();

    const parserOptions = result[ruleKey].options.parserOptions({
      options: result[ruleKey].options,
    } as any);

    // Should have both default and user settings
    expect(parserOptions.minLength).toBe(4); // User setting
    expect(parserOptions.splitPattern).toBeDefined(); // Default setting
    expect(typeof parserOptions.match).toBe('function');

    // Test the merged match function
    expect(
      parserOptions.match?.({
        end: 5,
        fullText: 'hello world',
        getContext: () => '',
        start: 0,
        text: 'hello',
      })
    ).toBe(true);
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
          replace: {
            replaceMap: replaceMap,
          },
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
          replace: {
            replaceMap: replaceMap,
          },
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
          replace: {
            replaceMap: replaceMap,
          },
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
        settings: {
          replace: {
            maxSuggestions: 5,
            parserOptions: {
              match: (params) => true,
              maxLength: 4,
            },
            replaceMap: replaceMap,
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey].options.maxSuggestions).toBe(5);
    expect(result[ruleKey].options.replaceMap).toBe(replaceMap);
    expect(result[ruleKey].options.parserOptions).toBeDefined();
  });

  it('should merge settings from multiple configs', () => {
    const configs: LintConfigArray = [
      {
        plugins: { replace: replaceLintPlugin },
        rules: {
          'replace/text': ['error', {}],
        },
        settings: {
          replace: {
            parserOptions: {
              match: ({ text }) => text.length > 2,
            },
            setting1: 'value1',
          },
        },
      },
      {
        settings: {
          replace: {
            parserOptions: {
              minLength: 3,
            },
            setting2: 'value2',
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';
    expect(result[ruleKey].options.parserOptions({} as any)).toEqual({
      match: expect.any(Function),
      minLength: 3,
    });

    expect(result[ruleKey]).toBeDefined();
    expect(result[ruleKey].options).toMatchObject({
      maxSuggestions: 8,
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
          replace: {
            replaceMap: replaceMap,
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    expect(result[ruleKey].options.replaceMap).toBe(replaceMap);
  });

  it('should merge parser options correctly when both are objects', () => {
    const configs: LintConfigArray = [
      {
        plugins: { replace: replaceLintPlugin },
        rules: {
          'replace/text': ['error'],
        },
        settings: {
          replace: {
            parserOptions: {
              match: (params) => params.text.length > 2,
              splitPattern: /\w+/g,
            },
          },
        },
      },
      {
        settings: {
          replace: {
            parserOptions: {
              match: (params) => params.text.length > 4,
              minLength: 3,
            },
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    const parserOptions = result[ruleKey].options.parserOptions({} as any);

    expect(parserOptions).toBeDefined();
    expect(parserOptions).toHaveProperty('match');
    expect(parserOptions).toHaveProperty('splitPattern');
    expect(parserOptions).toHaveProperty('minLength');
  });

  it('should handle empty or undefined configs gracefully', () => {
    const configs: LintConfigArray = [{}, replaceLintPlugin.configs.all, {}];

    const result = resolveLintConfigs(configs);
    expect(result).toBeDefined();
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  it('should handle function merging in parser options', () => {
    const configs: LintConfigArray = [
      {
        plugins: { replace: replaceLintPlugin },
        rules: {
          'replace/text': ['error'],
        },
        settings: {
          replace: {
            parserOptions: (context) => ({
              match: (params) => true,
              splitPattern: /\w+/g,
            }),
          },
        },
      },
      {
        settings: {
          replace: {
            parserOptions: (context) => ({
              match: (params) => true,
              splitPattern: /\w+/g,
            }),
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    const parserOptions = result[ruleKey].options.parserOptions;
    expect(typeof parserOptions).toBe('function');
  });

  it('should preserve each plugin parserOptions when merging multiple plugins', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all,
      caseLintPlugin.configs.all,
      {
        settings: {
          case: {
            ignoredWords: ['test'],
          },
          replace: {
            replaceMap: new Map([['hello', [{ text: '👋' }]]]),
          },
        },
      },
    ];

    const resolvedRules = resolveLintConfigs(configs);

    // Check replace rule's parserOptions
    const replaceRule = resolvedRules['replace/text'];

    const replaceParserOptions = replaceRule.options.parserOptions({
      options: replaceRule.options,
    } as any);

    // Verify replace plugin's splitPattern
    expect(replaceParserOptions.splitPattern).toEqual(
      /\b[\dA-Za-z]+(?:['-]\w+)*\b/g
    );

    // Check case rule's parserOptions
    const caseRule = resolvedRules['case/capitalize-sentence'];
    const caseParsed = caseRule.options.parserOptions({
      options: {
        ignoredWords: ['test'],
      },
    } as any);

    // Verify case plugin's splitPattern
    expect(caseParsed.splitPattern).toEqual(/\b[A-Za-z][\dA-Za-z]*\b/g);

    // Test that each plugin's match function works correctly
    expect(
      replaceParserOptions.match?.({
        end: 5,
        fullText: 'hello world',
        getContext: () => '',
        start: 0,
        text: 'hello',
      })
    ).toBe(true);

    expect(
      caseParsed.match?.({
        end: 5,
        fullText: 'hello world. test here.',
        getContext: ({ before = 0 }) => '',
        start: 0,
        text: 'hello',
      })
    ).toBe(true);
  });

  it('should handle parser options in settings', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all,
      {
        settings: {
          replace: {
            parserOptions: {
              match: ({ text }) => text.length > 4,
              minLength: 3,
            },
            replaceMap: replaceMap,
          },
        },
      },
    ];

    const result = resolveLintConfigs(configs);
    const ruleKey = 'replace/text';

    expect(result[ruleKey]).toBeDefined();
    const parsedOptions = result[ruleKey].options.parserOptions({} as any);

    expect(parsedOptions).toBeDefined();
    expect(typeof parsedOptions.match).toBe('function');
    expect(parsedOptions.minLength).toBe(3);

    // Test the match function
    expect(
      parsedOptions.match?.({
        end: 6,
        fullText: 'longer',
        getContext: () => '',
        start: 0,
        text: 'longer',
      })
    ).toBe(true);
  });

  it('should filter configs by targets', () => {
    const configs: LintConfigArray = [
      {
        ...replaceLintPlugin.configs.all,
        targets: [{ id: 'node1' }],
      },
      {
        ...caseLintPlugin.configs.all,
        targets: [{ id: 'node2' }],
      },
      {
        settings: {
          replace: {
            replaceMap: new Map([['hello', [{ text: '👋' }]]]),
          },
        },
      },
    ];

    // Test node1 target
    const node1Result = resolveLintConfigs(configs, { id: 'node1' });
    expect(node1Result['replace/text']).toBeDefined();
    expect(node1Result['case/capitalize-sentence']).toBeUndefined();

    // Test node2 target
    const node2Result = resolveLintConfigs(configs, { id: 'node2' });
    expect(node2Result['replace/text']).toBeUndefined();
    expect(node2Result['case/capitalize-sentence']).toBeDefined();

    // Test no target (should apply all)
    const allResult = resolveLintConfigs(configs);
    expect(allResult['replace/text']).toBeDefined();
    expect(allResult['case/capitalize-sentence']).toBeDefined();
  });

  it('should handle configs with no targets', () => {
    const configs: LintConfigArray = [
      replaceLintPlugin.configs.all, // No targets = applies to all
      {
        ...caseLintPlugin.configs.all,
        targets: [{ id: 'node1' }],
      },
    ];

    // Test specific target
    const node1Result = resolveLintConfigs(configs, { id: 'node1' });
    expect(node1Result['replace/text']).toBeDefined(); // No targets = applies to all
    expect(node1Result['case/capitalize-sentence']).toBeDefined();

    // Test different target
    const node2Result = resolveLintConfigs(configs, { id: 'node2' });
    expect(node2Result['replace/text']).toBeDefined(); // No targets = applies to all
    expect(node2Result['case/capitalize-sentence']).toBeUndefined();
  });
});
