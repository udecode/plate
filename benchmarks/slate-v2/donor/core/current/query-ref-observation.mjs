import { createEditor } from '../../../../../packages/slate/src/index.ts';
import { Editor } from '../../../../../packages/slate/src/internal/index.ts';
import {
  round,
  summarize,
  writeBenchmarkArtifact,
} from '../../shared/stats.mjs';

const iterations = Number(process.env.DRIFT_BENCH_ITERATIONS || 5);
const blockCount = Number(process.env.DRIFT_BENCH_BLOCKS || 200);
const writeOps = Number(process.env.DRIFT_BENCH_WRITE_OPS || 40);
const queryOps = Number(process.env.DRIFT_BENCH_QUERY_OPS || 200);
const refCount = Number(process.env.DRIFT_BENCH_REFS || 50);

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: 'paragraph',
    children: [{ text: `block-${index}` }],
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

const countIterator = (iterator) => {
  let count = 0;

  for (const _ of iterator) {
    count += 1;
  }

  return count;
};

const collectIterator = (iterator) => {
  const entries = [];

  for (const entry of iterator) {
    entries.push(entry);
  }

  return entries;
};

const matchesTopLevelPath = (targetIndex) => (_node, path) =>
  path.length === 1 && path[0] === targetIndex;

const readFirstMatchByArray = (editor, targetIndex) =>
  editor.read(
    (state) =>
      collectIterator(
        state.nodes.entries({
          at: [],
          match: matchesTopLevelPath(targetIndex),
        })
      )[0]
  );

const readFirstMatchByToArray = (editor, targetIndex) =>
  editor.read(
    (state) =>
      state.nodes.toArray({
        at: [],
        match: matchesTopLevelPath(targetIndex),
      })[0]
  );

const readFirstMatchByFind = (editor, targetIndex) =>
  editor.read((state) =>
    state.nodes.find({
      at: [],
      match: matchesTopLevelPath(targetIndex),
    })
  );

const readFirstMatchBySome = (editor, targetIndex) =>
  editor.read((state) =>
    state.nodes.some({
      at: [],
      match: matchesTopLevelPath(targetIndex),
    })
  );

const readAllByArray = (editor) =>
  editor.read(
    (state) => collectIterator(state.nodes.entries({ at: [] })).length
  );

const readAllByToArray = (editor) =>
  editor.read((state) => state.nodes.toArray({ at: [] }).length);

const readAllByMappedToArray = (editor) =>
  editor.read(
    (state) => state.nodes.toArray({ at: [] }, ([, path]) => path).length
  );

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

const writeOnlyInsertTextMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    for (let index = 0; index < writeOps; index += 1) {
      const path = [index % blockCount, 0];

      insertText(editor, 'X', {
        at: { path, offset: 0 },
      });
    }
  }
);

const nodesReadAfterWriteMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let nodeCount = 0;

    for (let index = 0; index < writeOps; index += 1) {
      const path = [index % blockCount, 0];

      insertText(editor, 'X', {
        at: { path, offset: 0 },
      });

      nodeCount += editor.read((state) =>
        countIterator(state.nodes.entries({ at: [] }))
      );
    }

    if (nodeCount <= 0) {
      throw new Error('nodesReadAfterWriteMs did not observe any nodes');
    }
  }
);

const firstMatchArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByArray(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchArrayMs did not observe every first match');
  }
});

const firstMatchToArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByToArray(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchToArrayMs did not observe every first match');
  }
});

const firstMatchFindMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByFind(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchFindMs did not observe every first match');
  }
});

const firstMatchSomeMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchBySome(editor, 0)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('firstMatchSomeMs did not observe every first match');
  }
});

const allEntriesArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let total = 0;

  for (let index = 0; index < queryOps; index += 1) {
    total += readAllByArray(editor);
  }

  if (total <= 0) {
    throw new Error('allEntriesArrayMs did not observe any entries');
  }
});

const allEntriesToArrayMs = measureLane(createEditorWithChildren, (editor) => {
  let total = 0;

  for (let index = 0; index < queryOps; index += 1) {
    total += readAllByToArray(editor);
  }

  if (total <= 0) {
    throw new Error('allEntriesToArrayMs did not observe any entries');
  }
});

const allEntriesMappedToArrayMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let total = 0;

    for (let index = 0; index < queryOps; index += 1) {
      total += readAllByMappedToArray(editor);
    }

    if (total <= 0) {
      throw new Error('allEntriesMappedToArrayMs did not observe any entries');
    }
  }
);

const lastMatchFindMs = measureLane(createEditorWithChildren, (editor) => {
  let seen = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (readFirstMatchByFind(editor, blockCount - 1)) {
      seen += 1;
    }
  }

  if (seen !== queryOps) {
    throw new Error('lastMatchFindMs did not observe every last match');
  }
});

const noMatchFindMs = measureLane(createEditorWithChildren, (editor) => {
  let missing = 0;

  for (let index = 0; index < queryOps; index += 1) {
    if (!readFirstMatchByFind(editor, blockCount + 1)) {
      missing += 1;
    }
  }

  if (missing !== queryOps) {
    throw new Error('noMatchFindMs unexpectedly found a match');
  }
});

const positionsReadAfterWriteMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    let positionCount = 0;

    for (let index = 0; index < writeOps; index += 1) {
      const blockIndex = index % blockCount;
      const path = [blockIndex, 0];

      insertText(editor, 'X', {
        at: { path, offset: 0 },
      });

      positionCount += countIterator(
        Editor.positions(editor, { at: [blockIndex] })
      );
    }

    if (positionCount <= 0) {
      throw new Error(
        'positionsReadAfterWriteMs did not observe any positions'
      );
    }
  }
);

const pathRefRebaseMs = measureLane(createEditorWithChildren, (editor) => {
  const refs = Array.from({ length: refCount }, (_, index) =>
    Editor.pathRef(editor, [index])
  );
  let seen = 0;

  for (let index = 0; index < Math.min(writeOps, refCount); index += 1) {
    write(editor, (tx) =>
      tx.nodes.move({
        at: [index],
        to: [blockCount - 1],
      })
    );

    for (const ref of refs) {
      if (ref.current) {
        seen += 1;
      }
    }
  }

  refs.forEach((ref) => {
    ref.unref();
  });

  if (seen <= 0) {
    throw new Error('pathRefRebaseMs did not observe any live refs');
  }
});

const rangeRefRebaseMs = measureLane(createEditorWithChildren, (editor) => {
  const refs = Array.from({ length: refCount }, (_, index) =>
    Editor.rangeRef(editor, {
      anchor: { path: [index, 0], offset: 0 },
      focus: { path: [index, 0], offset: 2 },
    })
  );
  let seen = 0;

  for (let index = 0; index < Math.min(writeOps, refCount); index += 1) {
    insertText(editor, 'YZ', {
      at: { path: [index, 0], offset: 1 },
    });

    for (const ref of refs) {
      if (ref.current) {
        seen += 1;
      }
    }
  }

  refs.forEach((ref) => {
    ref.unref();
  });

  if (seen <= 0) {
    throw new Error('rangeRefRebaseMs did not observe any live refs');
  }
});

const rangeRefsInspectionMs = measureLane(
  createEditorWithChildren,
  (editor) => {
    const refs = Array.from({ length: refCount }, (_, index) =>
      Editor.rangeRef(editor, {
        anchor: { path: [index, 0], offset: 0 },
        focus: { path: [index, 0], offset: 1 },
      })
    );
    let seen = 0;

    for (let index = 0; index < Math.min(writeOps, refCount); index += 1) {
      insertText(editor, 'Q', {
        at: { path: [index, 0], offset: 0 },
      });

      seen += Editor.rangeRefs(editor).size;
    }

    refs.forEach((ref) => {
      ref.unref();
    });

    if (seen <= 0) {
      throw new Error('rangeRefsInspectionMs did not observe any tracked refs');
    }
  }
);

const summary = {
  lane: 'drift-query-ref-observation',
  iterations,
  config: {
    blockCount,
    queryOps,
    refCount,
    writeOps,
  },
  lanes: {
    writeOnlyInsertTextMs,
    nodesReadAfterWriteMs,
    firstMatchArrayMs,
    firstMatchToArrayMs,
    firstMatchFindMs,
    firstMatchSomeMs,
    allEntriesArrayMs,
    allEntriesToArrayMs,
    allEntriesMappedToArrayMs,
    lastMatchFindMs,
    noMatchFindMs,
    positionsReadAfterWriteMs,
    pathRefRebaseMs,
    rangeRefRebaseMs,
    rangeRefsInspectionMs,
  },
  deltaFromWriteOnlyMeanMs: {
    nodesReadAfterWriteMs: round(
      nodesReadAfterWriteMs.mean - writeOnlyInsertTextMs.mean
    ),
    positionsReadAfterWriteMs: round(
      positionsReadAfterWriteMs.mean - writeOnlyInsertTextMs.mean
    ),
    pathRefRebaseMs: round(pathRefRebaseMs.mean - writeOnlyInsertTextMs.mean),
    rangeRefRebaseMs: round(rangeRefRebaseMs.mean - writeOnlyInsertTextMs.mean),
    rangeRefsInspectionMs: round(
      rangeRefsInspectionMs.mean - writeOnlyInsertTextMs.mean
    ),
  },
};

await writeBenchmarkArtifact(
  'tmp/slate-query-ref-observation-benchmark.json',
  summary
);

console.log(JSON.stringify(summary, null, 2));
