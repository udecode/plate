import assert from 'node:assert/strict';

import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import { summarize, writeBenchmarkArtifact } from '../../shared/stats.mjs';

const iterations = Number(process.env.REFS_PROJECTION_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.REFS_PROJECTION_BENCH_BLOCKS || 120);
const refCount = Number(process.env.REFS_PROJECTION_BENCH_REFS || 40);
const steps = Number(process.env.REFS_PROJECTION_BENCH_STEPS || 20);

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index}-content` }],
  }));

const createEditorWithChildren = () => {
  const editor = createEditor();
  Editor.replace(editor, {
    children: createChildren(blockCount),
    selection: null,
    marks: null,
  });
  return editor;
};

const write = (editor, fn) => {
  editor.update(fn);
};

const insertText = (editor, text, options) => {
  write(editor, (tx) => tx.text.insert(text, options));
};

const measureLane = (setup, run) => {
  const samples = [];

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    const editor = setup();
    const start = performance.now();
    run(editor);
    const duration = performance.now() - start;

    if (iteration > 0) {
      samples.push(duration);
    }
  }

  return summarize(samples);
};

const projectRangeSameBlockMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let totalSegments = 0;

    for (let index = 0; index < steps; index += 1) {
      const segments = Editor.projectRange(editor, {
        anchor: { path: [index % blockCount, 0], offset: 1 },
        focus: { path: [index % blockCount, 0], offset: 6 },
      });

      totalSegments += segments.length;
    }

    assert.equal(totalSegments, steps);
  }
);

const projectRangeCrossBlockMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let totalSegments = 0;

    for (let index = 0; index < steps; index += 1) {
      const segments = Editor.projectRange(editor, {
        anchor: { path: [index % blockCount, 0], offset: 2 },
        focus: {
          path: [Math.min((index % blockCount) + 1, blockCount - 1), 0],
          offset: 4,
        },
      });

      totalSegments += segments.length;
    }

    assert.ok(totalSegments > steps);
  }
);

const rangeRefTextRebaseMs = measureLane(createEditorWithChildren, (editor) => {
  const refs = Array.from({ length: refCount }, (_, index) =>
    Editor.rangeRef(editor, {
      anchor: { path: [index, 0], offset: 1 },
      focus: { path: [index, 0], offset: 4 },
    })
  );

  for (let index = 0; index < Math.min(steps, refCount); index += 1) {
    insertText(editor, 'X', {
      at: { path: [index, 0], offset: 0 },
    });
  }

  assert.equal(
    refs.every((ref) => ref.current != null),
    true
  );

  refs.forEach((ref) => {
    ref.unref();
  });
});

const rangeRefStructuralRebaseMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const refs = Array.from({ length: refCount }, (_, index) =>
      Editor.rangeRef(editor, {
        anchor: { path: [index, 0], offset: 1 },
        focus: { path: [index, 0], offset: 4 },
      })
    );

    for (let index = Math.min(steps, refCount) - 1; index >= 0; index -= 1) {
      write(editor, (tx) =>
        tx.nodes.move({
          at: [index],
          to: [blockCount - 1],
        })
      );
    }

    assert.equal(
      refs.some((ref) => ref.current != null),
      true
    );

    refs.forEach((ref) => {
      ref.unref();
    });
  }
);

const bookmarkResolveMs = measureLane(createEditorWithChildren, (editor) => {
  const bookmarks = Array.from({ length: refCount }, (_, index) =>
    Editor.bookmark(editor, {
      anchor: { path: [index, 0], offset: 1 },
      focus: { path: [index, 0], offset: 5 },
    })
  );

  for (let index = 0; index < Math.min(steps, refCount); index += 1) {
    insertText(editor, 'Y', {
      at: { path: [index, 0], offset: 0 },
    });
  }

  let resolved = 0;

  for (const bookmark of bookmarks) {
    if (bookmark.resolve()) {
      resolved += 1;
    }
  }

  assert.equal(resolved, refCount);

  bookmarks.forEach((bookmark) => {
    bookmark.unref();
  });
});

const summary = {
  lane: 'slate-refs-projection',
  iterations,
  config: {
    blockCount,
    refCount,
    steps,
  },
  lanes: {
    projectRangeSameBlockMs,
    projectRangeCrossBlockMs,
    rangeRefTextRebaseMs,
    rangeRefStructuralRebaseMs,
    bookmarkResolveMs,
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-refs-projection-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
