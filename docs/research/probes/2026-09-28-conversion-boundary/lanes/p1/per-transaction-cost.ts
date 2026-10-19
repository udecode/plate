// Lane P1 probe: per-transaction cost on the 50 KB rich preview (1,179
// top-level nodes). build-preview.ts parses the preview the same way as
// ../../amendment/splice-profile.ts; this probe loads that cache into an editor
// with the same Plate schema plugins as createTestEditor. MarkdownPlugin is
// omitted because it only contributes `validate` and `api`, never transaction
// work, and other lanes are editing its source.
//
// Lanes:
//   splice-skip     remove + insert of the last top-level node, history: 'skip'
//   splice-history  the same splice, recorded in history
//   type-end        one-character tx.text.insert at the end of the last text
//                   node, default history (merged into one typing batch)
//   type-after-skip one saved keystroke after 60 history-skipped tail splices,
//                   with an existing undo entry to map through them
//
// Prints one JSON line with timings and correctness hashes. Run from the
// repository root:
//   bun --preload ./docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/alias.ts \
//     docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/per-transaction-cost.ts
// P1_PLITE_SRC=<dir> loads Plite from another source tree (see ab.ts).
// P1_LANES=splice-skip,type-end limits the lanes (for CPU profiles).
// P1_BYTES=5000 uses a smaller cached preview for scaling comparisons.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { BaseParagraphPlugin, createEditor } from '../../../../../../packages/platejs/src/core';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../../../../../../packages/platejs/src/features/basic-nodes';
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from '../../../../../../packages/platejs/src/features/basic-styles';
import { BaseCalloutPlugin } from '../../../../../../packages/platejs/src/features/callout';
import { BaseCodeBlockPlugin } from '../../../../../../packages/platejs/src/features/code-block';
import { BaseDatePlugin } from '../../../../../../packages/platejs/src/features/date';
import { BaseDetailsPlugin } from '../../../../../../packages/platejs/src/features/details';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../../../../../../packages/platejs/src/features/footnote';
import { BaseColumnPlugin } from '../../../../../../packages/platejs/src/features/layout';
import { BaseLinkPlugin } from '../../../../../../packages/platejs/src/features/link';
import { BaseListPlugin } from '../../../../../../packages/platejs/src/features/list';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../../../../../../packages/platejs/src/features/media';
import { BaseMentionPlugin } from '../../../../../../packages/platejs/src/features/mention';
import { BaseTablePlugin } from '../../../../../../packages/platejs/src/features/table';
import { BaseTocPlugin } from '../../../../../../packages/platejs/src/features/toc';
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from '../../../../../../packages/platejs/src/math';

const bytes = Number(process.env.P1_BYTES ?? 50_000);
const previewFile = path.resolve(
  import.meta.dir,
  `../../../../../../node_modules/.cache/p1-conversion-boundary/preview-${bytes}.json`
);
const nodes = JSON.parse(readFileSync(previewFile, 'utf8'));
const lanes = new Set(
  (
    process.env.P1_LANES ??
    'splice-skip,splice-history,type-end,type-after-skip'
  ).split(',')
);

const hash = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);

const summarize = (samples: number[]) => {
  const sorted = [...samples].sort((a, b) => a - b);
  const at = (q: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];

  return {
    mean: Number(
      (
        samples.reduce((sum, sample) => sum + sample, 0) / samples.length
      ).toFixed(3)
    ),
    median: Number(at(0.5).toFixed(3)),
    n: samples.length,
    p90: Number(at(0.9).toFixed(3)),
  };
};

const createTarget = () => {
  const editor = createEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseBlockquotePlugin,
      BaseHorizontalRulePlugin,
      BaseBoldPlugin,
      BaseItalicPlugin,
      BaseUnderlinePlugin,
      BaseCodePlugin,
      BaseStrikethroughPlugin,
      BaseScriptPlugin,
      BaseHighlightPlugin,
      BaseKbdPlugin,
      BaseFontBackgroundColorPlugin,
      BaseFontColorPlugin,
      BaseFontFamilyPlugin,
      BaseFontSizePlugin,
      BaseFontWeightPlugin,
      BaseLinkPlugin,
      BaseCodeBlockPlugin,
      BaseFootnoteDefinitionPlugin,
      BaseFootnotePlugin,
      BaseListPlugin,
      BaseMentionPlugin,
      BaseDatePlugin,
      BaseDetailsPlugin,
      BaseEquationPlugin,
      BaseInlineEquationPlugin,
      BaseFilePlugin,
      BaseAudioPlugin,
      BaseImagePlugin,
      BaseMediaEmbedPlugin,
      BaseVideoPlugin,
      BaseColumnPlugin,
      BaseTablePlugin,
      BaseCalloutPlugin,
      BaseTocPlugin,
    ],
  }) as any;

  editor.update({ history: 'skip' }).value.replace({ children: nodes });

  return editor;
};

const splice = (history: boolean, rounds = 60) => {
  const target = createTarget();
  const last = nodes.length - 1;
  const samples: number[] = [];

  for (let round = 0; round < rounds; round += 1) {
    const replacement = {
      children: [{ text: `tail ${round}` }],
      type: 'paragraph',
    };
    const author = (tx: any) => {
      tx.nodes.remove({ at: [last] });
      tx.nodes.insert(replacement, { at: [last] });
    };
    const start = performance.now();

    if (history) target.update(author);
    else target.update({ history: 'skip' }, author);
    samples.push(performance.now() - start);
  }

  return {
    ...summarize(samples),
    undoDepth: target.read.history().undos.length,
    valueHash: hash(target.read.value()),
  };
};

const lastTextPoint = (children: readonly any[]) => {
  const pointPath: number[] = [];
  let node: any = { children };

  while (Array.isArray(node.children)) {
    const index = node.children.length - 1;

    pointPath.push(index);
    node = node.children[index];
  }

  return { offset: node.text.length, path: pointPath };
};

const typeAtEnd = async (keystrokes = 200) => {
  const target = createTarget();
  const initialHash = hash(target.read.value());
  const samples: number[] = [];

  target.update({ history: 'skip' }, (tx: any) => {
    tx.selection.set(lastTextPoint(nodes));
  });

  for (let index = 0; index < keystrokes; index += 1) {
    const character = String.fromCharCode(97 + (index % 26));
    const start = performance.now();

    target.update((tx: any) => {
      tx.text.insert(character);
    });
    samples.push(performance.now() - start);
  }

  const typedHash = hash(target.read.value());
  const undoDepth = target.read.history().undos.length;

  await target.api.history.undo();

  return {
    ...summarize(samples),
    restoredAfterUndo: hash(target.read.value()) === initialHash,
    typedHash,
    undoDepth,
  };
};

// Streaming publishes with history: 'skip' into a document that already has
// undo history; the next saved edit must map that history through every
// skipped splice.
const typeAfterSkippedSplices = async (splices = 60) => {
  const target = createTarget();
  const last = nodes.length - 1;

  target.update({ history: 'skip' }, (tx: any) => {
    tx.selection.set({ offset: 0, path: [0, 0] });
  });
  target.update((tx: any) => {
    tx.text.insert('x');
  });
  for (let round = 0; round < splices; round += 1) {
    target.update({ history: 'skip' }, (tx: any) => {
      tx.nodes.remove({ at: [last] });
      tx.nodes.insert(
        { children: [{ text: `tail ${round}` }], type: 'paragraph' },
        { at: [last] }
      );
    });
  }

  const start = performance.now();

  target.update((tx: any) => {
    tx.text.insert('y');
  });

  const keystroke = performance.now() - start;
  const typedHash = hash(target.read.value());
  const undoDepth = target.read.history().undos.length;

  await target.api.history.undo();

  return {
    keystroke: Number(keystroke.toFixed(3)),
    typedHash,
    undoDepth,
    undoneHash: hash(target.read.value()),
  };
};

const result: Record<string, unknown> = {
  bytes,
  plite: process.env.P1_PLITE_SRC ?? 'packages/plitejs/src',
  topLevelNodes: nodes.length,
};

if (lanes.has('splice-skip')) result['splice-skip'] = splice(false);
if (lanes.has('splice-history')) result['splice-history'] = splice(true);
if (lanes.has('type-end')) result['type-end'] = await typeAtEnd();
if (lanes.has('type-after-skip')) {
  result['type-after-skip'] = await typeAfterSkippedSplices();
}

console.log(JSON.stringify(result));
