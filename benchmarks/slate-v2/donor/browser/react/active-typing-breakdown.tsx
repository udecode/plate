import { mkdir, writeFile } from 'node:fs/promises';

import React, { Profiler } from 'react';
import type {
  Descendant,
  Element as SlateElement,
} from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import {
  createReactEditor,
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  type RenderTextProps,
  Slate,
} from '../../../../../packages/slate-react/src/index.ts';
import { mountApp, now, summarizeMetrics } from '../../shared/react-benchmark';

(globalThis as typeof globalThis & { React?: typeof React }).React = React;

const iterations = Number(
  process.env.REACT_ACTIVE_TYPING_BREAKDOWN_ITERATIONS || 3
);
const blocks = Number(process.env.REACT_ACTIVE_TYPING_BREAKDOWN_BLOCKS || 5000);
const typeOps = Number(
  process.env.REACT_ACTIVE_TYPING_BREAKDOWN_TYPE_OPS || 10
);
const segmentSize = Number(
  process.env.REACT_ACTIVE_TYPING_BREAKDOWN_ISLAND_SIZE || 32
);
const overscan = Number(
  process.env.REACT_ACTIVE_TYPING_BREAKDOWN_ACTIVE_RADIUS || 1
);
const customRenderers =
  process.env.REACT_ACTIVE_TYPING_BREAKDOWN_CUSTOM_RENDERERS !== '0';
const renderElementOnly =
  process.env.REACT_ACTIVE_TYPING_BREAKDOWN_RENDER_ELEMENT === '1';

type Counts = {
  elementRenders: number;
  leafRenders: number;
  textRenders: number;
};

const createChildren = () =>
  Array.from({ length: blocks }, (_, index) => ({
    type: index % 100 === 0 ? 'heading-one' : 'paragraph',
    children: [{ text: `block-${index} alpha beta gamma delta` }],
  })) as Descendant[];

const createRenderers = (counts: Counts) => {
  const renderElement = ({
    attributes,
    children,
    element,
  }: RenderElementProps<SlateElement>) => {
    counts.elementRenders += 1;
    return React.createElement(
      element.type === 'heading-one' ? 'h1' : 'p',
      attributes,
      children
    );
  };

  const renderText = ({ attributes, children }: RenderTextProps) => {
    counts.textRenders += 1;
    return React.createElement('span', attributes, children);
  };

  const renderLeaf = ({ attributes, children }: RenderLeafProps<unknown>) => {
    counts.leafRenders += 1;
    return React.createElement('span', attributes, children);
  };

  return { renderElement, renderLeaf, renderText };
};

const createMountedEditor = async () => {
  const editor = createReactEditor();
  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const counts: Counts = {
    elementRenders: 0,
    leafRenders: 0,
    textRenders: 0,
  };
  let profilerActualMs = 0;
  let profilerCommitCount = 0;
  const renderers = customRenderers
    ? createRenderers(counts)
    : renderElementOnly
      ? { renderElement: createRenderers(counts).renderElement }
      : {};
  const app = await mountApp(
    <Slate editor={editor}>
      <Profiler
        id="editable-blocks"
        onRender={(_id, phase, actualDuration) => {
          if (phase === 'update') {
            profilerActualMs += actualDuration;
            profilerCommitCount += 1;
          }
        }}
      >
        <Editable
          domStrategy={{
            overscan,
            type: 'partial-dom',
            segmentSize,
            threshold: 1,
          }}
          id="active-typing-breakdown"
          {...renderers}
        />
      </Profiler>
    </Slate>
  );

  const resetProfiler = () => {
    profilerActualMs = 0;
    profilerCommitCount = 0;
  };

  const readProfiler = () => ({
    profilerActualMs,
    profilerCommitCount,
  });

  return { ...app, counts, editor, readProfiler, resetProfiler };
};

const mountedTextCount = (container: Element) =>
  container.querySelectorAll('[data-slate-node="text"]').length;

const promoteSegment = async ({
  blockIndex,
  container,
  editor,
}: {
  blockIndex: number;
  container: Element;
  editor: ReturnType<typeof createReactEditor>;
}) => {
  const segmentIndex = Math.floor(blockIndex / segmentSize);
  const partialDOMPlaceholder = container.querySelector(
    `[data-slate-dom-strategy-placeholder="true"][data-slate-dom-strategy-segment="${segmentIndex}"]`
  );

  if (!partialDOMPlaceholder) {
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [blockIndex, 0], offset: 0 },
        focus: { path: [blockIndex, 0], offset: 0 },
      });
    });
    return;
  }

  partialDOMPlaceholder.dispatchEvent(
    new container.ownerDocument.defaultView!.MouseEvent('mousedown', {
      bubbles: true,
    })
  );
};

const measureScenario = async ({
  blockIndex,
  promote,
  selectBefore,
}: {
  blockIndex: number;
  promote: boolean;
  selectBefore?: boolean;
}) => {
  const samples: Record<string, number>[] = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const context = await createMountedEditor();
    const beforePromotionMountedText = mountedTextCount(context.container);

    if (promote) {
      const start = now();
      await React.act(async () => {
        await promoteSegment({
          blockIndex,
          container: context.container,
          editor: context.editor,
        });
      });
      const promotionMs = now() - start;
      const promotedMountedText = mountedTextCount(context.container);
      const typingMetrics = measureTyping(context, blockIndex);

      if (iteration > 0) {
        samples.push({
          beforePromotionMountedText,
          selectionMs: 0,
          promotionMs,
          promotedMountedText,
          ...typingMetrics,
        });
      }
    } else {
      let selectionMs = 0;

      if (selectBefore) {
        const start = now();
        await React.act(async () => {
          context.editor.update((tx) => {
            tx.selection.set({
              anchor: { path: [blockIndex, 0], offset: 0 },
              focus: { path: [blockIndex, 0], offset: 0 },
            });
          });
        });
        selectionMs = now() - start;
      }

      const typingMetrics = measureTyping(context, blockIndex);

      if (iteration > 0) {
        samples.push({
          beforePromotionMountedText,
          promotedMountedText: beforePromotionMountedText,
          promotionMs: 0,
          selectionMs,
          ...typingMetrics,
        });
      }
    }

    await context.dispose();
  }

  return summarizeMetrics(samples);
};

const measureTyping = (
  context: Awaited<ReturnType<typeof createMountedEditor>>,
  blockIndex: number
) => {
  const beforeCounts = { ...context.counts };
  let totalActMs = 0;
  let transformMs = 0;

  context.resetProfiler();

  for (let index = 0; index < typeOps; index += 1) {
    const start = now();
    React.act(() => {
      const transformStart = now();
      context.editor.update((tx) => {
        tx.text.insert('X', {
          at: { path: [blockIndex, 0], offset: index },
        });
      });
      transformMs += now() - transformStart;
    });
    totalActMs += now() - start;
  }

  const profiler = context.readProfiler();
  const text = Editor.string(context.editor, [blockIndex]);

  if (!text.startsWith('X'.repeat(typeOps))) {
    throw new Error(`Typing assertion failed for block ${blockIndex}`);
  }

  return {
    elementRenders: context.counts.elementRenders - beforeCounts.elementRenders,
    leafRenders: context.counts.leafRenders - beforeCounts.leafRenders,
    mountedTextAfterTyping: mountedTextCount(context.container),
    profilerActualMs: profiler.profilerActualMs,
    profilerCommitCount: profiler.profilerCommitCount,
    textRenders: context.counts.textRenders - beforeCounts.textRenders,
    totalActMs,
    transformMs,
  };
};

const measureSelectAll = async () => {
  const samples: Record<string, number>[] = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const context = await createMountedEditor();
    const beforeCounts = { ...context.counts };

    context.resetProfiler();

    const start = now();
    await React.act(async () => {
      context.editor.update((tx) => {
        tx.selection.set({
          anchor: Editor.point(context.editor, [], { edge: 'start' }),
          focus: Editor.point(context.editor, [], { edge: 'end' }),
        });
      });
    });
    const selectAllMs = now() - start;
    const profiler = context.readProfiler();

    if (iteration > 0) {
      samples.push({
        elementRenders:
          context.counts.elementRenders - beforeCounts.elementRenders,
        leafRenders: context.counts.leafRenders - beforeCounts.leafRenders,
        profilerActualMs: profiler.profilerActualMs,
        profilerCommitCount: profiler.profilerCommitCount,
        selectAllMs,
        textRenders: context.counts.textRenders - beforeCounts.textRenders,
      });
    }

    await context.dispose();
  }

  return summarizeMetrics(samples);
};

const result = {
  config: {
    overscan,
    blocks,
    customRenderers,
    segmentSize,
    renderElementOnly,
    iterations,
    typeOps,
  },
  lane: 'slate-react-active-typing-breakdown',
  scenarios: {
    middleShelledModelOnly: await measureScenario({
      blockIndex: Math.floor(blocks / 2),
      promote: false,
    }),
    middlePromoteThenType: await measureScenario({
      blockIndex: Math.floor(blocks / 2),
      promote: true,
    }),
    middleSelectThenType: await measureScenario({
      blockIndex: Math.floor(blocks / 2),
      promote: false,
      selectBefore: true,
    }),
    startActiveTyping: await measureScenario({
      blockIndex: 0,
      promote: false,
    }),
    selectAll: await measureSelectAll(),
  },
};

await mkdir('tmp', { recursive: true });
await writeFile(
  'tmp/slate-react-active-typing-breakdown-benchmark.json',
  `${JSON.stringify(result, null, 2)}\n`
);

console.log(JSON.stringify(result, null, 2));
