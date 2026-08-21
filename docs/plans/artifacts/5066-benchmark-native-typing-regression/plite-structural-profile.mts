import { ContentSlice, createEditor } from '@platejs/plite';

import { getInternalDocumentRootChange } from '../../../../packages/plite/src/core/change/document-change';
import { getRootChangeApplyStats } from '../../../../packages/plite/src/core/change/root-change';

type ProfileEvent = Readonly<{
  duration: number;
  id: string;
}>;

const blockCount = Number(process.env.PLITE_STRUCTURAL_PROFILE_BLOCKS ?? 1000);
const operation = process.env.PLITE_STRUCTURAL_PROFILE_OPERATION ?? 'move';
const events: ProfileEvent[] = [];
const editor = createEditor({
  initialValue: Array.from({ length: blockCount }, (_, index) => ({
    children: [{ text: `block-${index}` }],
    type: 'paragraph',
  })),
});

const profileOwner = globalThis as typeof globalThis & {
  __PLITE_REACT_RENDER_PROFILER__?: {
    acceptsCoreDuration: (id: string) => boolean;
    record: (event: ProfileEvent) => void;
  };
};

profileOwner.__PLITE_REACT_RENDER_PROFILER__ = {
  acceptsCoreDuration: () => true,
  record: (event) => events.push(event),
};

const run = () => editor.update((tx) => {
  if (operation === 'set') {
    tx.nodes.set(
      { type: 'benchmark-heading' },
      {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 8, path: [31, 0] },
          kind: 'text',
        },
        match: (node) => 'children' in node && node.type === 'paragraph',
      }
    );
  } else if (operation === 'insert') {
    tx.nodes.insert(
      Array.from({ length: 32 }, (_, index) => ({
        children: [{ text: `inserted-${index}` }],
        type: 'paragraph',
      })),
      { at: [Math.floor(blockCount / 2)] }
    );
  } else if (operation === 'fragment') {
    tx.selection.set({
      anchor: { offset: 0, path: [Math.floor(blockCount / 2), 0] },
      focus: { offset: 0, path: [Math.floor(blockCount / 2), 0] },
      kind: 'text',
    });
    tx.slice.replace(
      ContentSlice.closed([
        {
          children: [{ bold: true, text: 'heading' }],
          type: 'heading-one',
        },
        { children: [{ text: 'fragment alpha' }], type: 'paragraph' },
        {
          children: [
            { text: 'fragment ' },
            { bold: true, text: 'bold ' },
            { italic: true, text: 'italic' },
          ],
          type: 'paragraph',
        },
      ])
    );
  } else if (operation === 'type') {
    tx.selection.set({
      anchor: { offset: 0, path: [Math.floor(blockCount / 2), 0] },
      focus: { offset: 0, path: [Math.floor(blockCount / 2), 0] },
      kind: 'text',
    });
    tx.text.insert('x');
  } else if (operation === 'remove') {
    tx.nodes.remove({ at: [0] });
  } else if (operation === 'split') {
    tx.nodes.split({ at: { offset: 5, path: [0, 0] } });
  } else {
    tx.nodes.move({ at: [0], to: [blockCount - 1] });
  }
});

run();
events.length = 0;
const start = performance.now();
run();

const duration = performance.now() - start;
const committedRootChange = editor.read.lastCommit()
  ? getInternalDocumentRootChange(editor.read.lastCommit()!.changes, 'main')
  : undefined;

profileOwner.__PLITE_REACT_RENDER_PROFILER__ = undefined;

const totals = new Map<string, { count: number; duration: number }>();

for (const event of events) {
  const total = totals.get(event.id) ?? { count: 0, duration: 0 };

  total.count += 1;
  total.duration += event.duration;
  totals.set(event.id, total);
}

console.log(
  JSON.stringify(
    {
      blockCount,
      change: editor.read.lastCommit()?.changes.toJSON(),
      duration: Number(duration.toFixed(3)),
      operation,
      events: [...totals]
        .map(([id, total]) => ({
          count: total.count,
          duration: Number(total.duration.toFixed(3)),
          id,
        }))
        .sort((left, right) => right.duration - left.duration),
      rootChangeApply: committedRootChange
        ? getRootChangeApplyStats(committedRootChange)
        : null,
    },
    null,
    2
  )
);
