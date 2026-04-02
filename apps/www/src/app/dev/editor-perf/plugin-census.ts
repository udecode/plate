import type { EditorPerfWorkloadId } from './workloads';

export type EditorPerfPluginSetId =
  | 'basic'
  | 'blockquote-only'
  | 'bold-only'
  | 'code-only'
  | 'horizontal-rule-only'
  | 'heading-only'
  | 'italic-only'
  | 'underline-only'
  | 'none';

export type CorePluginCensusEntryId =
  | 'blockquote'
  | 'bold'
  | 'code'
  | 'heading'
  | 'horizontal-rule'
  | 'italic'
  | 'underline';

export type CorePluginCensusPerformanceClass =
  | 'affinity-bearing marks'
  | 'cheap marks/text wrappers'
  | 'cheap structural renderers';

export type CorePluginCensusEntry = {
  activatedWorkload: EditorPerfWorkloadId;
  description: string;
  id: CorePluginCensusEntryId;
  inactiveWorkload: EditorPerfWorkloadId;
  label: string;
  performanceClass: CorePluginCensusPerformanceClass;
  pluginSet: EditorPerfPluginSetId;
  provisionalMountBudgetMs: number;
};

export const CORE_PLUGIN_CENSUS_ENTRIES: CorePluginCensusEntry[] = [
  {
    activatedWorkload: 'huge-blockquote',
    description:
      'Cheap structural renderer. Measures the isolated blockquote element path without the full basic-blocks bundle muddying it.',
    id: 'blockquote',
    inactiveWorkload: 'huge-paragraph',
    label: 'BlockquotePlugin',
    performanceClass: 'cheap structural renderers',
    pluginSet: 'blockquote-only',
    provisionalMountBudgetMs: 12,
  },
  {
    activatedWorkload: 'huge-heading',
    description:
      'Cheap structural renderer. Measures the isolated heading path without blockquote or horizontal-rule fan-out.',
    id: 'heading',
    inactiveWorkload: 'huge-paragraph',
    label: 'HeadingPlugin',
    performanceClass: 'cheap structural renderers',
    pluginSet: 'heading-only',
    provisionalMountBudgetMs: 12,
  },
  {
    activatedWorkload: 'huge-bold',
    description:
      'Cheap mark wrapper. Measures the isolated bold mark path without the full basic-marks bundle.',
    id: 'bold',
    inactiveWorkload: 'huge-paragraph',
    label: 'BoldPlugin',
    performanceClass: 'cheap marks/text wrappers',
    pluginSet: 'bold-only',
    provisionalMountBudgetMs: 8,
  },
  {
    activatedWorkload: 'huge-code',
    description:
      'Affinity-bearing mark. Measures the isolated code mark path without bold/italic sibling fan-out.',
    id: 'code',
    inactiveWorkload: 'huge-paragraph',
    label: 'CodePlugin',
    performanceClass: 'affinity-bearing marks',
    pluginSet: 'code-only',
    provisionalMountBudgetMs: 12,
  },
  {
    activatedWorkload: 'huge-italic',
    description:
      'Cheap mark wrapper. Measures the isolated italic mark path without the full basic-marks bundle.',
    id: 'italic',
    inactiveWorkload: 'huge-paragraph',
    label: 'ItalicPlugin',
    performanceClass: 'cheap marks/text wrappers',
    pluginSet: 'italic-only',
    provisionalMountBudgetMs: 8,
  },
  {
    activatedWorkload: 'huge-underline',
    description:
      'Cheap mark wrapper. Measures the isolated underline mark path without the full basic-marks bundle.',
    id: 'underline',
    inactiveWorkload: 'huge-paragraph',
    label: 'UnderlinePlugin',
    performanceClass: 'cheap marks/text wrappers',
    pluginSet: 'underline-only',
    provisionalMountBudgetMs: 8,
  },
  {
    activatedWorkload: 'huge-hr',
    description:
      'Cheap structural renderer. Measures the isolated horizontal-rule element path without heading or blockquote siblings.',
    id: 'horizontal-rule',
    inactiveWorkload: 'huge-paragraph',
    label: 'HorizontalRulePlugin',
    performanceClass: 'cheap structural renderers',
    pluginSet: 'horizontal-rule-only',
    provisionalMountBudgetMs: 12,
  },
];
