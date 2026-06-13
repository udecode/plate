# OSS Viewport Selection Proof

Date: 2026-06-13

Scope:
- Inspect mature OSS viewport/selection architecture for portable Slate v2 proof
  patterns.
- Promote only source-backed proof, benchmark, or doc leads. Do not copy code.

Sources:
- CodeMirror view, local clone: `/Users/zbeyens/git/codemirror-view`.

Outcome:
- CodeMirror reinforces four Slate v2 proof requirements:
  - selection endpoints outside the main viewport need explicit DOM/projection
    handling, not hope;
  - viewport and actually visible/rendered ranges are different metrics;
  - measurement loops need stabilization guards and explicit geometry-change
    invalidation;
  - drawn/projected selection must be treated as a visual layer with viewport
    invalidation and double-highlight protection.

Decision:
- Keep as research/proof leads. No runtime patch from this packet.

Slate-native follow-up:
- Existing huge-document visual rows already cover the most urgent double
  highlight and scrollbar/drag failure classes.
- Benchmark hygiene keeps viewport-like mounted/pending counts, boundary counts,
  materialization metrics, and projected selection marker counts distinct
  instead of treating DOM count as the only budget.
- Future selection-oracle work should keep asserting native/model/projected
  selection agreement and "not both native and projected" for the same range.
