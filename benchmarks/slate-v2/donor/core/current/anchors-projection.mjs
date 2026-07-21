import assert from "node:assert/strict";

import {
  createEditor,
  DocumentChange,
} from "../../../../../packages/plite/src/index.ts";
import * as Editor from "../../../../../packages/plite/src/internal/index.ts";
import { summarize, writeBenchmarkArtifact } from "../../shared/stats.mjs";

const iterations = Number(
  process.env.PLITE_ANCHORS_PROJECTION_BENCH_ITERATIONS || 5
);
const blockCount = Number(
  process.env.PLITE_ANCHORS_PROJECTION_BENCH_BLOCKS || 120
);
const anchorCount = Number(
  process.env.PLITE_ANCHORS_PROJECTION_BENCH_ANCHORS || 40
);
const steps = Number(process.env.PLITE_ANCHORS_PROJECTION_BENCH_STEPS || 20);
const mode =
  process.env.PLITE_ANCHORS_PROJECTION_BENCH_MODE === "bulk" ? "bulk" : "full";

const createChildren = (count) =>
  Array.from({ length: count }, (_, index) => ({
    type: "paragraph",
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

const projectRangeSameBlockMs =
  mode === "full"
    ? measureLane(createEditorWithChildren, (editor) => {
        let totalSegments = 0;

        for (let index = 0; index < steps; index += 1) {
          const segments = Editor.projectRange(editor, {
            anchor: { path: [index % blockCount, 0], offset: 1 },
            focus: { path: [index % blockCount, 0], offset: 6 },
          });

          totalSegments += segments.length;
        }

        assert.equal(totalSegments, steps);
      })
    : null;

const projectRangeCrossBlockMs =
  mode === "full"
    ? measureLane(createEditorWithChildren, (editor) => {
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
      })
    : null;

const rangeAnchorTextRebaseMs =
  mode === "full"
    ? measureLane(createEditorWithChildren, (editor) => {
        const anchors = Array.from({ length: anchorCount }, (_, index) =>
          editor.anchor(
            {
              anchor: { path: [index, 0], offset: 1 },
              focus: { path: [index, 0], offset: 4 },
            },
            { association: "inward", deletion: "nearest" }
          )
        );

        for (let index = 0; index < Math.min(steps, anchorCount); index += 1) {
          insertText(editor, "X", {
            at: { path: [index, 0], offset: 0 },
          });
        }

        assert.equal(
          anchors.every((anchor) => anchor.resolve() != null),
          true
        );

        anchors.forEach((anchor) => {
          anchor.release();
        });
      })
    : null;

const rangeAnchorStructuralRebaseMs =
  mode === "full"
    ? measureLane(createEditorWithChildren, (editor) => {
        const anchors = Array.from({ length: anchorCount }, (_, index) =>
          editor.anchor(
            {
              anchor: { path: [index, 0], offset: 1 },
              focus: { path: [index, 0], offset: 4 },
            },
            { association: "inward", deletion: "nearest" }
          )
        );

        for (
          let index = Math.min(steps, anchorCount) - 1;
          index >= 0;
          index -= 1
        ) {
          write(editor, (tx) =>
            tx.nodes.move({
              at: [index],
              to: [blockCount - 1],
            })
          );
        }

        assert.equal(
          anchors.some((anchor) => anchor.resolve() != null),
          true
        );

        anchors.forEach((anchor) => {
          anchor.release();
        });
      })
    : null;

const anchorResolveMs =
  mode === "full"
    ? measureLane(
        () => {
          const editor = createEditorWithChildren();
          const anchors = Array.from({ length: anchorCount }, (_, index) =>
            editor.anchor(
              {
                anchor: { path: [index, 0], offset: 1 },
                focus: { path: [index, 0], offset: 5 },
              },
              { association: "inward", deletion: "nearest" }
            )
          );

          return anchors;
        },
        (anchors) => {
          assert.equal(
            anchors.every((anchor) => anchor.release() != null),
            true
          );
        }
      )
    : null;

const measureBulkAnchorRegistry = () => {
  const setupSamples = [];
  const createSamples = [];
  const changeSamples = [];
  const rebaseSamples = [];
  const resolveSamples = [];
  const activeAnchorCount = Math.min(anchorCount, blockCount);
  const activeSteps = Math.min(steps, activeAnchorCount);

  for (let iteration = 0; iteration < iterations + 1; iteration += 1) {
    let start = performance.now();
    const before = { children: createChildren(blockCount) };
    const editor = createEditor();
    Editor.replace(editor, {
      ...before,
      marks: null,
      selection: null,
    });
    const setupMs = performance.now() - start;

    start = performance.now();
    const anchors = Array.from({ length: activeAnchorCount }, (_, index) =>
      editor.anchor(
        {
          anchor: { path: [index, 0], offset: 1 },
          focus: { path: [index, 0], offset: 5 },
        },
        { association: "inward", deletion: "nearest" }
      )
    );
    const createMs = performance.now() - start;

    start = performance.now();
    const after = {
      children: createChildren(blockCount).map((node, index) =>
        index < activeSteps
          ? {
              ...node,
              children: [{ text: `X${node.children[0].text}` }],
            }
          : node
      ),
    };
    const change = DocumentChange.between(before, after);
    const changeMs = performance.now() - start;

    start = performance.now();
    write(editor, (tx) => {
      tx.changes.apply(change);
    });
    const rebaseMs = performance.now() - start;

    start = performance.now();
    const resolved = anchors.map((anchor) => anchor.resolve());
    const resolveMs = performance.now() - start;

    assert.equal(
      resolved.every((value) => value != null),
      true
    );
    for (let index = 0; index < activeSteps; index += 1) {
      assert.deepEqual(resolved[index], {
        anchor: { path: [index, 0], offset: 2 },
        focus: { path: [index, 0], offset: 6 },
      });
    }

    anchors.forEach((anchor) => {
      anchor.release();
    });

    if (iteration > 0) {
      setupSamples.push(setupMs);
      createSamples.push(createMs);
      changeSamples.push(changeMs);
      rebaseSamples.push(rebaseMs);
      resolveSamples.push(resolveMs);
    }
  }

  return {
    changeMs: summarize(changeSamples),
    correctness: true,
    createMs: summarize(createSamples),
    rebaseMs: summarize(rebaseSamples),
    resolveMs: summarize(resolveSamples),
    setupMs: summarize(setupSamples),
  };
};

const bulkAnchorRegistry = measureBulkAnchorRegistry();

const summary = {
  lane: "plite-anchors-projection",
  iterations,
  mode,
  config: {
    blockCount,
    anchorCount,
    steps,
  },
  lanes: {
    bulkAnchorRegistry,
    ...(mode === "full"
      ? {
          anchorResolveMs,
          projectRangeCrossBlockMs,
          projectRangeSameBlockMs,
          rangeAnchorStructuralRebaseMs,
          rangeAnchorTextRebaseMs,
        }
      : {}),
  },
};

await writeBenchmarkArtifact(
  "tmp/plite-anchors-projection-benchmark.json",
  summary
);

console.log(JSON.stringify(summary, null, 2));
