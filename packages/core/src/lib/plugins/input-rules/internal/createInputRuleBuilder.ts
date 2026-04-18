import type { InputRuleBuilder } from '../types';

import {
  createBlockFenceInputRule,
  createBlockStartInputRule,
  createMarkInputRule,
} from '../createInputRules';
import { defineInputRule } from '../defineInputRule';

export const createInputRuleBuilder = (): InputRuleBuilder => ({
  blockFence: (config) => createBlockFenceInputRule(config),
  blockStart: (config) => createBlockStartInputRule(config),
  insertBreak: (rule) => defineInputRule(rule),
  insertData: (rule) => defineInputRule(rule),
  insertText: (rule) => defineInputRule(rule),
  mark: (config) => createMarkInputRule(config),
});
