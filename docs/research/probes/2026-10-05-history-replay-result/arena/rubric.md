# Arena rubric: Plite history replay return contract

Score each candidate 0-4 on each criterion (0 contradicted, 1 weak, 2 mixed, 3 good with named gaps, 4 strong), cite the candidate's own text and the repository source that confirms or refutes it, then recommend one base.

1. **Laws.** Keeps requirements 1-8 of the runner brief, or breaks one only with a concrete reason and a stated trade. In particular: shared C/B/A order, a refused replay never consumes the entry, server-first comments, public updates synchronous, no rejection that nobody observes, lint not weakened.
2. **Caller cost and timing honesty.** An event handler, a test of a document undo and an app that needs the final outcome each write the shortest correct code. The return value says whether the effect already happened; no caller must know the hidden batch kind before calling.
3. **Interface depth and deletion.** Smallest public surface for the capability. Counts what it deletes (mounted `await`, focus listeners, version checks, duplicate `ModelHistoryResult`, dead branches) against what it adds. Penalize the red flags: two ways to do one task, hand-synced lists, split ownership, pass-through methods.
4. **Failure semantics.** Owner throw, settle-commit throw (the stuck-pending candidate defect), history retirement mid-replay, overlapping replay (`busy`), and a synchronous owner result each have one owner and a defined outcome.
5. **Adoption and proof.** Names the real callers, docs and tests that change; the proof can run on the existing Bun, React and Chromium runners; phases are independently valuable.
