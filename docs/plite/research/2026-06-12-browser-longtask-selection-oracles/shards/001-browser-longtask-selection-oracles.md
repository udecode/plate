# Shard 001: Browser Long-Task And Selection Oracles

## Verdict

The strongest lead is benchmark honesty, not runtime code. A browser long task
without Plite profiler/timer duration must be reported as unattributed browser
work until a repeat trace or local timer/profiler bucket proves Plite ownership.

## Evidence

- MDN and the W3C Long Tasks API describe long tasks as main-thread blocking
  browser tasks. The attribution API can provide context, but it does not make
  the task Plite-owned by default.
- Lexical uses document-level selectionchange handling and native
  window.getSelection endpoint assertions in e2e helpers.
- ProseMirror guards selection-to-DOM writes around ownership, browser-specific
  drag selection, and the race between a DOM selection mutation and the later
  selectionchange event.

## Promotion

Promote `benchmark-longtask-claim-width`:

- add phase fields for attributed and unattributed long-task duration;
- add lane fields for total, attributed, and unattributed long-task duration;
- add a claim-width label: `none`, `unattributed`, `partial`, or `attributed`;
- print attributed/unattributed type-after-delete long-task metrics;
- lock the shape with `core-benchmark-scripts-contract.ts`;
- rerun the focused contract and a tiny trace smoke.

Promote `plite-browser-selection-screenshot-helper`:

- route repeated visual-selection screenshots through the editor harness;
- keep screenshot attachments non-full-page by default;
- wire visual-native-selection and huge-document projected-selection rows to the
  helper;
- lock the shape with the plite-browser attachment contract.

## Rejections

- Do not copy editor-specific debounces or drag hacks into Plite from OSS.
- Do not start pagination architecture from this shard.
- Do not treat a single unattributed browser long task as a runtime regression
  when repeat traces and behavior proof are green.
