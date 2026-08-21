import type { Element } from '@platejs/plite';
import { migrateElementIds, type Descendant, type Value } from 'platejs';

import { createHugeDocumentValue } from '@/registry/examples/values/huge-document-value';

export type EditorPerfWorkloadId =
  | 'huge-mixed-block'
  | 'huge-paragraph'
  | 'huge-heading'
  | 'huge-blockquote'
  | 'huge-bold'
  | 'huge-code'
  | 'huge-highlight'
  | 'huge-hr'
  | 'huge-italic'
  | 'huge-kbd'
  | 'huge-script'
  | 'huge-strikethrough'
  | 'huge-underline'
  | 'huge-dense-text'
  | 'huge-dense-inline-props'
  | 'huge-paragraph-fallback';

export type ScenarioWorkloadId = Exclude<EditorPerfWorkloadId, 'huge-bold'>;

export type ElementIdFragmentBenchmarkKind =
  | 'raw-import'
  | 'seeded-duplicate-paste';

type WorkloadDefinition = {
  description: string;
  id: EditorPerfWorkloadId;
  label: string;
  scenarioSelectable: boolean;
};

const BLOCKQUOTE_TEXT =
  'Blockquote benchmark copy. This forces render.as-only element plugins instead of the fallback paragraph path.';
const BOLD_TEXT =
  'Bold benchmark copy. This forces render.as-only mark plugins without changing the element path.';
const CODE_TEXT =
  'Code benchmark copy. This forces render.as-only decoration plugins without changing the element path.';
const HIGHLIGHT_TEXT =
  'Highlight benchmark copy. This forces render.as-only mark plugins without changing the element path.';
const HR_TEXT = '';
const ITALIC_TEXT =
  'Italic benchmark copy. This forces render.as-only mark plugins without changing the element path.';
const KBD_TEXT =
  'Kbd benchmark copy. This forces hard-affinity render.as-only mark plugins without changing the element path.';
const STRIKETHROUGH_TEXT =
  'Strikethrough benchmark copy. This forces render.as-only mark plugins without changing the element path.';
const SCRIPT_TEXT =
  'Script benchmark copy. This forces an enum-valued mark renderer without changing the element path.';
const UNDERLINE_TEXT =
  'Underline benchmark copy. This forces render.as-only mark plugins without changing the element path.';
const DENSE_TEXT_SEGMENTS = [
  'Alpha segment.',
  'Beta segment.',
  'Gamma segment.',
  'Delta segment.',
  'Epsilon segment.',
  'Zeta segment.',
];

export const EDITOR_PERF_WORKLOADS: WorkloadDefinition[] = [
  {
    description:
      'The original huge document mix: headings every hundred blocks, paragraphs everywhere else.',
    id: 'huge-mixed-block',
    label: 'Huge mixed block',
    scenarioSelectable: true,
  },
  {
    description: 'Huge paragraph-only document.',
    id: 'huge-paragraph',
    label: 'Huge paragraph',
    scenarioSelectable: true,
  },
  {
    description: 'Huge heading-only document.',
    id: 'huge-heading',
    label: 'Huge heading',
    scenarioSelectable: true,
  },
  {
    description:
      'Huge blockquote-only document. This hits the unknown-element fallback path without extra plugins.',
    id: 'huge-blockquote',
    label: 'Huge blockquote',
    scenarioSelectable: true,
  },
  {
    description:
      'Huge dense-text document with many text leaves per paragraph but no extra plugins.',
    id: 'huge-dense-text',
    label: 'Huge dense text',
    scenarioSelectable: true,
  },
  {
    description:
      'Huge dense-inline-props document with many leaf props but no extra plugins.',
    id: 'huge-dense-inline-props',
    label: 'Huge dense inline props',
    scenarioSelectable: true,
  },
  {
    description:
      'Huge paragraph document rewritten to an unmapped type. This isolates the fallback element branch.',
    id: 'huge-paragraph-fallback',
    label: 'Huge paragraph fallback',
    scenarioSelectable: true,
  },
  {
    description:
      'Huge bold-only document for mark-side lanes with BoldPlugin or the full basic-mark plugin set.',
    id: 'huge-bold',
    label: 'Huge bold',
    scenarioSelectable: false,
  },
  {
    description:
      'Huge highlight-only document for mark-side lanes with HighlightPlugin.',
    id: 'huge-highlight',
    label: 'Huge highlight',
    scenarioSelectable: false,
  },
  {
    description: 'Huge code-only document for leaf-side lanes with CodePlugin.',
    id: 'huge-code',
    label: 'Huge code',
    scenarioSelectable: true,
  },
  {
    description:
      'Huge horizontal-rule-only document for structural control lanes with HorizontalRulePlugin.',
    id: 'huge-hr',
    label: 'Huge hr',
    scenarioSelectable: false,
  },
  {
    description: 'Huge kbd-only document for leaf-side lanes with KbdPlugin.',
    id: 'huge-kbd',
    label: 'Huge kbd',
    scenarioSelectable: false,
  },
  {
    description:
      'Huge italic-only document for mark-side lanes with ItalicPlugin.',
    id: 'huge-italic',
    label: 'Huge italic',
    scenarioSelectable: false,
  },
  {
    description:
      'Huge strikethrough-only document for mark-side lanes with StrikethroughPlugin.',
    id: 'huge-strikethrough',
    label: 'Huge strikethrough',
    scenarioSelectable: false,
  },
  {
    description:
      'Huge script-mark document for mark-side lanes with ScriptPlugin.',
    id: 'huge-script',
    label: 'Huge script',
    scenarioSelectable: false,
  },
  {
    description:
      'Huge underline-only document for mark-side lanes with UnderlinePlugin.',
    id: 'huge-underline',
    label: 'Huge underline',
    scenarioSelectable: false,
  },
];

export const SCENARIO_WORKLOADS = EDITOR_PERF_WORKLOADS.filter(
  (workload) => workload.scenarioSelectable
) as Array<{
  description: string;
  id: ScenarioWorkloadId;
  label: string;
  scenarioSelectable: true;
}>;

const mixedBlockDocumentCache = new Map<number, Value>();
const paragraphDocumentCache = new Map<number, Value>();
const headingDocumentCache = new Map<number, Value>();
const blockquoteDocumentCache = new Map<number, Value>();
const markDocumentCache = new Map<string, Value>();
const denseTextDocumentCache = new Map<number, Value>();
const denseInlinePropsDocumentCache = new Map<number, Value>();
const fallbackParagraphDocumentCache = new Map<number, Value>();
const elementIdFragmentDocumentCache = new Map<
  string,
  { fragment: Value; value: Value }
>();
const seededDocumentCache = new Map<string, Value>();

export function cloneValue(value: Value): Value {
  return value.map((node) => structuredClone(node));
}

export function createBenchIdFactory(
  counter: { count: number },
  prefix = 'bench'
) {
  return () => {
    counter.count += 1;

    return `${prefix}-${counter.count}`;
  };
}

export function getDefaultElementIdFragmentBlockCount(blocks: number) {
  return Math.max(25, Math.min(200, Math.floor(blocks / 25)));
}

function buildMixedBlockValue(blocks: number): Value {
  const cachedValue = mixedBlockDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = createHugeDocumentValue({ blocks, engine: 'plate' });

  mixedBlockDocumentCache.set(blocks, value);

  return cloneValue(value);
}

function buildParagraphValue(blocks: number): Value {
  const cachedValue = paragraphDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, () => ({
    children: [{ text: 'Huge document paragraph.' }],
    type: 'paragraph',
  })) as Value;

  paragraphDocumentCache.set(blocks, value);

  return cloneValue(value);
}

function buildHeadingValue(blocks: number): Value {
  const cachedValue = headingDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, (_, index) => ({
    children: [{ text: `Huge document heading ${index + 1}.` }],
    level: 1,
    type: 'heading',
  })) as Value;

  headingDocumentCache.set(blocks, value);

  return cloneValue(value);
}

function buildBlockquoteValue(blocks: number): Value {
  const cachedValue = blockquoteDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, () => ({
    children: [{ text: BLOCKQUOTE_TEXT }],
    type: 'blockquote',
  })) as Value;

  blockquoteDocumentCache.set(blocks, value);

  return cloneValue(value);
}

function buildMarkedValue({
  blocks,
  cacheKey,
  markKey,
  markValue,
  text,
}: {
  blocks: number;
  cacheKey: string;
  markKey:
    | 'bold'
    | 'code'
    | 'highlight'
    | 'italic'
    | 'kbd'
    | 'script'
    | 'strikethrough'
    | 'underline';
  markValue?: 'sub' | 'sup' | true;
  text: string;
}): Value {
  const resolvedCacheKey = `${cacheKey}:${blocks}`;
  const cachedValue = markDocumentCache.get(resolvedCacheKey);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, () => ({
    children: [{ [markKey]: markValue ?? true, text }],
    type: 'paragraph',
  })) as Value;

  markDocumentCache.set(resolvedCacheKey, value);

  return cloneValue(value);
}

function buildBoldValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'bold',
    markKey: 'bold',
    text: BOLD_TEXT,
  });
}

function buildCodeValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'code',
    markKey: 'code',
    text: CODE_TEXT,
  });
}

function buildHighlightValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'highlight',
    markKey: 'highlight',
    text: HIGHLIGHT_TEXT,
  });
}

function buildItalicValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'italic',
    markKey: 'italic',
    text: ITALIC_TEXT,
  });
}

function buildHorizontalRuleValue(blocks: number): Value {
  const resolvedCacheKey = `hr:${blocks}`;
  const cachedValue = markDocumentCache.get(resolvedCacheKey);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, () => ({
    children: [{ text: HR_TEXT }],
    type: 'horizontalRule',
  })) as Value;

  markDocumentCache.set(resolvedCacheKey, value);

  return cloneValue(value);
}

function buildKbdValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'kbd',
    markKey: 'kbd',
    text: KBD_TEXT,
  });
}

function buildStrikethroughValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'strikethrough',
    markKey: 'strikethrough',
    text: STRIKETHROUGH_TEXT,
  });
}

function buildScriptValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'script',
    markKey: 'script',
    markValue: 'sub',
    text: SCRIPT_TEXT,
  });
}

function buildUnderlineValue(blocks: number): Value {
  return buildMarkedValue({
    blocks,
    cacheKey: 'underline',
    markKey: 'underline',
    text: UNDERLINE_TEXT,
  });
}

function buildDenseTextValue(blocks: number): Value {
  const cachedValue = denseTextDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, (_, blockIndex) => ({
    children: DENSE_TEXT_SEGMENTS.map((segment, segmentIndex) => ({
      text: `${segment} ${blockIndex}-${segmentIndex} `,
    })),
    type: 'paragraph',
  })) as Value;

  denseTextDocumentCache.set(blocks, value);

  return cloneValue(value);
}

function buildDenseInlinePropsValue(blocks: number): Value {
  const cachedValue = denseInlinePropsDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = Array.from({ length: blocks }, (_, blockIndex) => ({
    children: DENSE_TEXT_SEGMENTS.map((segment, segmentIndex) => ({
      commentId: `comment-${blockIndex}-${segmentIndex}`,
      ...(segmentIndex % 2 === 0 ? { search: 'hit' } : {}),
      text: `${segment} ${blockIndex}-${segmentIndex} `,
      tokenCount: segment.length,
    })),
    type: 'paragraph',
  })) as Value;

  denseInlinePropsDocumentCache.set(blocks, value);

  return cloneValue(value);
}

function buildFallbackParagraphValue(blocks: number): Value {
  const cachedValue = fallbackParagraphDocumentCache.get(blocks);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const value = buildMixedBlockValue(blocks).map((node) => {
    const nextNode = structuredClone(node) as Element;

    return {
      ...nextNode,
      ...(nextNode.type === 'paragraph' ? { type: 'quote' } : {}),
    } as Descendant;
  }) as Value;

  fallbackParagraphDocumentCache.set(blocks, value);

  return cloneValue(value);
}

export function getEditorPerfWorkloadValue({
  blocks,
  workloadId,
}: {
  blocks: number;
  workloadId: EditorPerfWorkloadId;
}) {
  switch (workloadId) {
    case 'huge-paragraph':
      return buildParagraphValue(blocks);
    case 'huge-heading':
      return buildHeadingValue(blocks);
    case 'huge-blockquote':
      return buildBlockquoteValue(blocks);
    case 'huge-bold':
      return buildBoldValue(blocks);
    case 'huge-code':
      return buildCodeValue(blocks);
    case 'huge-highlight':
      return buildHighlightValue(blocks);
    case 'huge-hr':
      return buildHorizontalRuleValue(blocks);
    case 'huge-italic':
      return buildItalicValue(blocks);
    case 'huge-kbd':
      return buildKbdValue(blocks);
    case 'huge-strikethrough':
      return buildStrikethroughValue(blocks);
    case 'huge-script':
      return buildScriptValue(blocks);
    case 'huge-underline':
      return buildUnderlineValue(blocks);
    case 'huge-dense-text':
      return buildDenseTextValue(blocks);
    case 'huge-dense-inline-props':
      return buildDenseInlinePropsValue(blocks);
    case 'huge-paragraph-fallback':
      return buildFallbackParagraphValue(blocks);
    case 'huge-mixed-block':
      return buildMixedBlockValue(blocks);
  }
}

export function getSeededEditorPerfWorkloadValue({
  blocks,
  cacheKey,
  workloadId,
}: {
  blocks: number;
  cacheKey?: string;
  workloadId: EditorPerfWorkloadId;
}) {
  const resolvedCacheKey = cacheKey ?? `${workloadId}:${blocks}`;
  const cachedValue = seededDocumentCache.get(resolvedCacheKey);

  if (cachedValue) {
    return cloneValue(cachedValue);
  }

  const seededValue = migrateElementIds(
    getEditorPerfWorkloadValue({ blocks, workloadId }),
    {
      generateId: createBenchIdFactory(
        { count: 0 },
        `seed-${resolvedCacheKey.replace(/[^a-z0-9-]/gi, '-')}`
      ),
    }
  ).value;

  seededDocumentCache.set(resolvedCacheKey, seededValue);

  return cloneValue(seededValue);
}

export function getElementIdFragmentBenchmarkData({
  blocks,
  fragmentBlocks = getDefaultElementIdFragmentBlockCount(blocks),
  kind,
}: {
  blocks: number;
  fragmentBlocks?: number;
  kind: ElementIdFragmentBenchmarkKind;
}) {
  const resolvedFragmentBlocks = Math.max(1, Math.min(blocks, fragmentBlocks));
  const cacheKey = `${kind}:${blocks}:${resolvedFragmentBlocks}`;
  const cachedValue = elementIdFragmentDocumentCache.get(cacheKey);

  if (cachedValue) {
    return {
      fragment: cloneValue(cachedValue.fragment),
      value: cloneValue(cachedValue.value),
    };
  }

  let value: Value;
  let fragment: Value;

  if (kind === 'seeded-duplicate-paste') {
    const sourceValue = getSeededEditorPerfWorkloadValue({
      blocks,
      cacheKey: `element-id-fragment:${blocks}`,
      workloadId: 'huge-mixed-block',
    });

    value = sourceValue;
    fragment = sourceValue
      .slice(0, resolvedFragmentBlocks)
      .map((node) => structuredClone(node)) as Value;
  } else {
    value = getEditorPerfWorkloadValue({
      blocks,
      workloadId: 'huge-mixed-block',
    });
    fragment = getEditorPerfWorkloadValue({
      blocks: resolvedFragmentBlocks,
      workloadId: 'huge-mixed-block',
    });
  }

  elementIdFragmentDocumentCache.set(cacheKey, { fragment, value });

  return {
    fragment: cloneValue(fragment),
    value: cloneValue(value),
  };
}
