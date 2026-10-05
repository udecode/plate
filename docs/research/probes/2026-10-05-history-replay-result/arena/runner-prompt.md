# Architect runner: Plite history replay return contract

You are a read-only design runner. Do not edit, create or delete any file in the repository. Do not run anything that writes (no test suites, no installs, no formatters). Reading files and running read-only commands such as `git grep`, `rg`, `sed -n` and `cat` is fine. Return your whole candidate design package in your final reply; the orchestrator saves it. The repository is `/Users/zbeyens/git/plate-2` (branch `next`, the Plate v2 beta redesign, where breaking public APIs is allowed and compatibility never picks the target).

## Runner discipline

You are producing one candidate design in architect's parallel exploration. Output a candidate design package: type sketch, function signatures, module map, and prose rationale shaped per the rationale template below.

- Caller's usage first. Write the README-style usage and two or three real call sites before the types, then derive the type sketch from them. The usage is the spec.
- Data structures first. Trace each dominant access pattern through the proposed structure.
- Interface depth. Prefer a simple interface that pulls complexity into the callee.
- Shared state: if two actors might both write, ask "what happens?"
- Make boundaries visible: `not implemented` bodies, `// TODO` pseudocode for tricky logic, doc comments stating intent and invariants.
- Encode invariants in types: hard-to-misuse types > runtime checks > prose comments.
- Validate at boundaries, trust types inside. Single source of truth per invariant. Short call chains.
- You are one of several runners, each on a different model. Produce the best design your model can make. Do not hedge toward a safe middle; differences between candidates are the signal.

Screen your design against these red flags: shallow module, information leakage, temporal decomposition, pass-through method, split ownership, two ways to do one task, importable internals, hand-synced list. Assume the next contributor is an agent that sees only the files it opened and copies the nearest example.

## Task

Design, from first principles, the public contract of Plite history replay: what `editor.api.history.undo()` and `redo()` return, how a caller observes a replay that waits on an external owner, what the mounted runtime (`EditableDOMRuntime.dispatchHistory`/`replayHistory`, Cmd+Z, `useEditorHistory`) does with it, and how Plate Comments' comment-creation replay owner fits. You may conclude that the async replay lifecycle itself should be deleted or moved (for example Comments owning in-flight removal with optimistic rollback), but then say exactly which requirement below you break and why the trade is worth it.

Owner's words (2026-10-05, verbatim): "wow wow i should not need to do "void" editor.api.history.undo!! should we disable the lint? harsh honest feedback /best-api-review async editor operations, is it not dangerous for the sync expetations, do full research on whether to support async api like history, from first principles"

Today: `undo(): Promise<HistoryResult>`. A document batch applies synchronously inside the call and is wrapped in `Promise.resolve`; a batch with a `history: { replay }` effect claims the branch head and publishes `editor.read.history.pending()` before its first `await`, awaits its owner, then settles `applied` or `blocked`. A second replay while one is pending returns `busy`. Repository code has 275 `void` and 91 `await` call sites; all 6 production callers discard the Promise. The repository lint `typescript/no-floating-promises` (oxlint.config.ts) flags any un-handled Promise statement.

Requirements and hard laws (attack them if you think one is wrong, but name it):

1. TaskHub-22 AC1/AC2: after successful local comment creation, Cmd+Z removes it and Redo restores the same comment; edits A, comment B, edit C undo as C/B/A and redo A/B/C.
2. AC3/AC4: remote or other-user comment changes never enter local history; if B's thread diverged, undo reports blocked and never skips B to A.
3. AC5: a rejected, stale, thrown or concurrent replay does not consume the history entry or fork local state.
4. AC7: Comments persistence is server-first: the app `mutate` callback authorizes and persists before local publication.
5. docs/vision/plite.md: "Public updates are synchronous and cannot nest." Undo is documented as one complete editor update.
6. The 2026-09-23 owner request: "retain truthful async completion, unify replay timing, expose pending state, and remove the silent editor lock." Edits, selection and remote imports keep publishing while a replay is pending.
7. One result and error owner per mounted replay; no rejection goes unobserved; do not weaken the floating-promise lint.
8. Undo preserves skipped and remote changes, atomic updates, exact selection and root ownership, native composition grouping and editor or view retirement.

## Grounding (read these; the first four are required)

- `docs/plans/artifacts/2026-10-05-history-sync-replay-result/grounding-how.md`: traced model of the current flow.
- `docs/plans/2026-10-05-history-sync-replay-result.md`: the review verdict and its first-cut proposal. Treat it as one candidate to beat, not the answer.
- `docs/plans/topics/history.md`: current public API and the editor survey (eleven editors and VS Code).
- `docs/research/probes/2026-10-05-history-replay-result/history-timing.log` and `survey.tsv`: probe output on HEAD and survey data.
- Source: `packages/plitejs/src/history/history-plugin.ts` (types near line 92-112; `applyReplay`, `replayNow`, `replay` near 870-1070), `packages/plitejs/src/history/history-state.ts`, `packages/plitejs/src/core/transaction-values.ts` and `packages/plitejs/src/interfaces/editor.ts` (effect `history: { replay }` types), `packages/plitejs/src/react/editable/editable-dom-runtime.ts` (`replayHistory` ~1016, `dispatchHistory` ~1121), `packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, `packages/plitejs/src/react/hooks/use-plite-history.ts`, `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` (`commentCreationHistoryEffect`, `replayCreation`, `commitMutation`, `mutate`).
- Law and history: `VISION.md`, `docs/vision/plite.md` (around lines 295-325), `docs/research/decisions/history-ownership.md`, `docs/research/decisions/transactions-synchronous-boundary.md`, `docs/plans/2026-09-23-history-replay-lifecycle-revised.md` (findings F1-F10 and decision rows), `docs/plans/2026-09-19-taskhub-22-comment-creation-undo-redo-regression.md`.
- Docs that teach the call: `content/docs/(guides)/history.mdx`, `content/docs/api/react-hooks.mdx`.
- Entrypoint graph: `tooling/entrypoints/entrypoint-dag.mjs` (history is the `plitejs/history` headless entrypoint; Plate re-exports it). Note that `editable-dom-runtime.ts:75-86` hand-copies the history result union as `ModelHistoryResult` and reaches the service through `editor.api as unknown as { history?: ... }` (~1037); check in the graph whether `plitejs/react` may import `plitejs/history` before you keep or remove that copy.

## Output

Reply with one markdown document, under 1800 words, with these sections in order:

1. **Problem**: one paragraph, naming the constraints you honored and any you chose to break.
2. **Usage (caller's view)**: the README snippet, then real call sites: a toolbar or event handler, a test that asserts a document undo, a test or app path that waits for a comment-creation undo, and the mounted Cmd+Z path.
3. **Shape**: the type sketch in one `ts` block (public types, `HistoryApi`, the effect owner's replay type, mounted dispatcher signature, `not implemented` bodies), then the data flow, load-bearing decisions, what is encoded in types, and interface depth.
4. **Deleted and added**: every public noun, private owner, listener or state you delete, merge or add, each with the behavior it carried and where that behavior goes.
5. **Tradeoffs accepted**: "we accept X in exchange for Y" bullets.
6. **Alternatives considered**: at least two structurally different shapes, one line each on why they lost.
7. **Requirement check**: one row per requirement 1-8: kept, changed or broken, with the reason.
8. **Open questions and risks**: phrased as questions.
9. **Next implementation step**: one sentence.
