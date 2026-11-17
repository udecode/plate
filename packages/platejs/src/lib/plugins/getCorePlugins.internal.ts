import { OverridePlugin } from '../../internal/plugin/OverridePlugin';
import type { DefinitionOf } from '../plugin';
import { AffinityPlugin } from './affinity';
import { DebugPlugin } from './debug';
import { DOMPlugin } from './dom';
import { ElementStatePlugin } from './element-state';
import { HistoryPlugin } from './HistoryPlugin';
import { HtmlPlugin } from './html';
import { InputRulesPlugin } from './input-rules/InputRulesPlugin';
import { BaseParagraphPlugin } from './paragraph';
import { TransferPlugin } from './TransferPlugin';

export type CorePlugins = readonly [
  typeof DebugPlugin,
  typeof ElementStatePlugin,
  typeof DOMPlugin,
  typeof HistoryPlugin,
  typeof TransferPlugin,
  typeof InputRulesPlugin,
  typeof OverridePlugin,
  typeof HtmlPlugin,
  typeof AffinityPlugin,
  typeof BaseParagraphPlugin,
];

export const getCorePlugins = (): CorePlugins => [
  DebugPlugin,
  ElementStatePlugin,
  DOMPlugin,
  HistoryPlugin,
  TransferPlugin,
  InputRulesPlugin,
  OverridePlugin,
  HtmlPlugin,
  AffinityPlugin,
  BaseParagraphPlugin,
];

/** Compact normalized definitions installed by every Base editor. */
export type CorePluginDefinition = DefinitionOf<CorePlugins[number]>;
