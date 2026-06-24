---
date: 2026-05-07
topic: plite-architecture-deslop-review
status: done-execution
skill: slate-ralplan
score: 0.94
---

# Plite Architecture Deslop Review Ralplan

## 1. Current Verdict

Do not rewrite Plite again.

The current architecture is the right backbone: Plite model/operations, a small
public editor instance, `editor.read` / `editor.update`, typed `state` / `tx`
extension namespaces, a runtime-owned React/input shell, deterministic commits,
and conservative browser proof. A whole rewrite would mostly re-open decisions
that the live source has already resolved.

The cleanest next move is bounded deslop, not architecture replacement:

- keep the public core API small and type-led;
- keep the internal static `Editor` helper table ugly and explicitly internal;
- do not expose `Editor.*`, primitive writers, `SlateSpacer`, or command/chain
  sugar as normal public Plite API;
- reduce test and doc reliance on `plite/internal` only where it hides public
  API expectations;
- keep Mobile/IME and browser behavior under the shared runtime owner graph;
- avoid broad runtime facade churn unless proof shows a real owner leak.

Final answer: the architecture is strong enough to keep. Refactor only the
remaining legacy-teaching seams and internal-helper test debt. No rewrite.

## 2. Intent / Boundary Record

Intent:

- answer whether the current Plite architecture is the absolute best,
  cleanest, maintainable shape after the latest Mobile/IME and API hard cuts;
- apply a deslop lens without using it as an excuse for a speculative rewrite;
- decide whether the next owner should rewrite, refactor, cleanup, or stop.

Desired outcome:

- a source-backed keep/rewrite/refactor verdict;
- a focused cleanup list with behavior locks;
- no implementation edits from this planning skill.

In scope:

- public `slate` API surface;
- internal `plite/internal` helper boundary;
- `plite-react` render shell, selector hooks, runtime input ownership, and
  Mobile/IME owner graph;
- Plate and slate-yjs migration backbone;
- Lexical, ProseMirror, and Tiptap strategy comparison;
- deslop smells in the current architecture and tests.

Non-goals:

- no Plite code patch in this Ralplan pass;
- no current-version Plate or slate-yjs adapter work;
- no new command/chain API for raw Plite;
- no exact mobile/device issue claim changes;
- no broad test rewrite for its own sake.

Decision boundaries:

- breaking cleanup is allowed before publish if it removes a normal public
  footgun;
- internal/test helpers may survive when they are fenced behind
  `plite/internal`;
- runtime owners should be split only by proven ownership leakage, not file
  size discomfort;
- issue claims remain unchanged because this review changes no user-facing
  behavior.

Unresolved user-decision points:

- none.

## 3. Decision Brief

Principles:

- one public lifecycle for coherent reads and writes;
- raw Plite stays unopinionated and model-first;
- browser input is runtime protocol, not React component state;
- operations and commits are the collaboration/history truth;
- cleanup must remove real ambiguity, not just rename working code.

Top drivers:

- the live package already exports `Editor` as type-only from
  `/Users/zbeyens/git/plite/packages/plite/src/index.ts:6`;
- live `BaseEditor` exposes only `read`, `subscribe`, `update`, and `extend` at
  `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:480`;
- public-surface tests lock the editor instance method set and reject public
  static `Editor` value export at
  `/Users/zbeyens/git/plite/packages/plite/test/public-surface-contract.ts:320`
  and `:337`;
- `plite-react` no longer exports `SlateSpacer` from the public package index,
  and the surface test guards that at
  `/Users/zbeyens/git/plite/packages/plite-react/test/surface-contract.tsx:204`;
- input ownership is centralized in `useEditableRootRuntime` and owner engines
  at
  `/Users/zbeyens/git/plite/packages/plite-react/src/editable/runtime-root-engine.ts:106`,
  `:199`, `:246`, and `:283`.

Viable options:

| Option                                          | Verdict | Why                                                                                    |
| ----------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| Whole rewrite again                             | reject  | It would discard a now-good public lifecycle and re-open solved API/runtime decisions. |
| Keep architecture with no cleanup               | reject  | Internal helper usage in tests and docs can still blur the public story.               |
| Add raw Plite command/chain sugar               | reject  | Tiptap-style sugar belongs in product layers such as Plate, not raw Plite core.        |
| Keep architecture and run bounded deslop slices | choose  | It preserves the proven substrate and targets only remaining ambiguity.                |

Chosen option:

- keep the architecture;
- run cleanup only against scoped public-surface, docs, and test-helper seams;
- keep browser/runtime refactors proof-led.

Consequences:

- future contributors get one public core story: `createEditor`,
  `editor.read`, `editor.update`, `editor.extend`, and `defineEditorExtension`;
- tests may still use `plite/internal`, but only when explicitly proving
  internals;
- docs/examples must stay stricter than tests;
- issue closure remains conservative.

## 4. Confidence Scorecard

| Dimension                                                | Weight | Score | Evidence                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------- | -----: | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |   0.20 |  0.94 | React is kept as projection, while `useEditableRootRuntime` owns stable runtime refs and engines in `/Users/zbeyens/git/plite/packages/plite-react/src/editable/runtime-root-engine.ts:106`, `:188`, `:199`, `:246`, and `:283`. Large-surface render budgets exist in `/Users/zbeyens/git/plite/playwright/stress/generated-editing.test.ts:221`, `:947`, and `:1020`. |
| Plite-close unopinionated DX                             |   0.20 |  0.93 | The public editor instance is locked to `extend`, `read`, `subscribe`, and `update` in `/Users/zbeyens/git/plite/packages/plite/test/public-surface-contract.ts:132`; root exports keep `Editor` type-only in `/Users/zbeyens/git/plite/packages/plite/src/index.ts:6`.                                                                                                 |
| Plate and slate-yjs migration-backbone shape             |   0.15 |  0.94 | Extension namespaces are typed as `state` and `tx` groups in `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:433`, `:441`, and `:477`; current Plate/Tiptap command sugar is deliberately rejected as raw Plite law.                                                                                                                                     |
| Regression-proof testing strategy                        |   0.20 |  0.93 | Public-surface guards, render-void contracts, runtime owner audits, generated stress rows, and Mobile/IME proof rows now exist. Exact device claims remain non-claims without matching artifacts.                                                                                                                                                                             |
| Research evidence completeness                           |   0.15 |  0.94 | Fresh local source checks covered Lexical dirty/composition/update logic, ProseMirror transaction/replace-range strategy, and Tiptap extension/command DX.                                                                                                                                                                                                                    |
| shadcn-style composability and hook/component minimalism |   0.10 |  0.93 | `renderVoid` receives content-only props and runtime owns hidden DOM at `/Users/zbeyens/git/plite/packages/plite-react/test/surface-contract.tsx:437` and `:485`; public hooks expose selector-style APIs from `/Users/zbeyens/git/plite/packages/plite-react/src/index.ts:77`.                                                                                         |

Weighted total: `0.94`.

## 5. Source-Backed Architecture North Star

Keep:

- model-first `slate`;
- type-only public `Editor`;
- `editor.read((state) => ...)`;
- `editor.update((tx) => ...)`;
- `defineEditorExtension` plus typed `state` / `tx` extension groups;
- runtime-owned browser shell, selection import/export, IME, Android, repair,
  and kernel trace;
- generated browser proof and conservative issue claims.

Cut from normal public API:

- public static `Editor` value;
- public primitive writer exports;
- public `SlateSpacer`;
- normal app docs that teach `plite/internal`;
- command/chain sugar in raw Plite.

## 6. Ecosystem Strategy Synthesis

| System              | Source                                                                                                                                            | Mechanism                                                                      | Avoids                                           | Steal                                                           | Reject                                                | Plite target                                             | Verdict |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- | ------- |
| Lexical             | `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts:243` and `:965`                                                                | read/update discipline, dirty leaves/elements, composition key, transform loop | whole-tree work and composition corruption       | dirty runtime buckets, update tags, composition-specific proof  | class node model and `$function` public style         | Plite runtime dirty ids plus `read` / `update` lifecycle | agree   |
| Lexical events      | `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEvents.ts:161` and `:179`                                                                 | root event table plus `beforeinput` when available                             | scattered browser policy                         | centralized input ownership and composition-aware event routing | copying Lexical command registry as raw public API    | Plite root runtime and event engines                     | partial |
| ProseMirror         | `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:26` and `:67`                                                                            | transaction carries doc changes, selection mapping, and metadata               | stale selection after edits                      | tx-local selection/read authority and metadata                  | integer position model                                | Plite path/range tx with commit metadata                 | agree   |
| ProseMirror replace | `/Users/zbeyens/git/prosemirror/transform/src/replace.ts:334`                                                                                     | fit slices by target depth and schema constraints                              | broad post-hoc normalization after paste/replace | bulk fragment fitting strategy for large paste/replace          | full schema-first identity                            | Plite fragment insertion fast paths with explicit proof  | partial |
| Tiptap              | `/Users/zbeyens/git/tiptap/packages/core/src/Extension.ts:23` and `/Users/zbeyens/git/tiptap/packages/extension-code-block/src/code-block.ts:187` | extension configs expose command DX over ProseMirror                           | raw engine complexity in app code                | composable extension ergonomics for Plate                       | raw Plite `editor.commands` / `chain().focus().run()` | Plate owns product command sugar over Plite state/tx     | diverge |

Strategy:

- Plite should keep the hybrid already chosen: Lexical-style runtime locality,
  ProseMirror-style transaction/fitting discipline, and Tiptap-style extension
  ergonomics above the raw core.
- The current source mostly matches this. The deslop target is remaining
  teaching/test ambiguity, not architecture replacement.

## 7. Public API Target

Accepted current shape:

- `createEditor`, `isEditor`, `defineEditorExtension`, `elementProperty`;
- type-only `Editor`;
- pure data namespaces: `Node`, `Path`, `Point`, `Range`, `Element`, `Text`,
  `Operation`, `Scrubber`;
- editor instance methods: `read`, `update`, `subscribe`, `extend`;
- no root public static editor helper table.

Deslop target:

- tests that are meant to prove public API should avoid `plite/internal`;
- tests that prove internal transforms may keep explicit `plite/internal`
  imports;
- docs/examples should stay stricter than tests.

## 8. Internal Runtime Target

Keep the runtime owner graph:

- `useEditableRootRuntime` orchestrates root refs and engine wiring;
- composition, Android, repair, selection import/export, beforeinput/input,
  clipboard, drag/drop, and trace stay in runtime modules;
- React components attach stable handlers and render projection.

Do not split runtime files merely because they are large. Split only if a test
or review proves an owner violation, duplicated policy body, or hot-path
subscription leak.

## 9. Hook / Component / Render DX Target

Keep:

- selector hooks: `useEditorSelector`, `useEditorState`, `useNodeSelector`,
  `useTextSelector`, `useElementSelected`;
- content-only `renderVoid`;
- runtime-owned hidden anchors/spacers;
- `PliteElement`, `PliteText`, `PliteLeaf`, and placeholder primitives as
  normal public building blocks.

Reject:

- eager `selected` / `focused` void props;
- app-owned hidden void children;
- public `SlateSpacer`.

## 10. Plate Migration-Backbone Target

Plate should migrate product APIs onto:

- raw `state` / `tx` extension groups;
- schema/spec policy;
- selector hooks and content targets;
- deterministic commits and local-only runtime ids.

Raw Plite should not freeze current Plate `editor.api` / `editor.tf` or Tiptap
command/chain sugar as core law.

## 11. slate-yjs Migration-Backbone Target

slate-yjs should use:

- deterministic operations;
- commit metadata;
- explicit remote replay;
- local-only target/runtime ids;
- schema/spec interpretation that is independent from DOM timing.

No current adapter support is required by this review.

## 12. Issue-Ledger Accounting

ClawSweeper related-issue pass: skipped for this pass.

Reason: this review changes no Plite implementation, no issue claim, no PR
fixed/improved count, and no public behavior surface. Existing issue-ledger
owners remain:

- whole-rewrite and public API hard-cut plans for API/runtime shape;
- Mobile/IME Ralplan for input-runtime issue classifications;
- issue coverage matrix for fixed/improved/related rows.

Issue matrix:

| Issue | Cluster             | Claim       | Why                               | Proof route    | Live ledger sync | PR line   |
| ----- | ------------------- | ----------- | --------------------------------- | -------------- | ---------------- | --------- |
| none  | architecture review | Not claimed | No behavior changed in this pass. | no-code review | unchanged        | unchanged |

Reference sync:

- `docs/plite-issues/gitcrawl-live-open-ledger.md`: unchanged, no issue status
  change.
- `docs/plite/ledgers/fork-issue-dossier.md`: unchanged, no reviewed issue
  section added.
- `docs/plite/ledgers/issue-coverage-matrix.md`: unchanged, no fixed or
  related issue row added.
- `docs/plite/references/pr-description.md`: unchanged, no PR claim/API
  text change.

## 13. Legacy Regression Proof Matrix

| Surface           | Current proof                                                                                                              | Deslop stance                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Public core API   | `/Users/zbeyens/git/plite/packages/plite/test/public-surface-contract.ts:132` and `:337`                                | Keep; add only if a new public surface appears.     |
| State/tx writes   | `/Users/zbeyens/git/plite/packages/plite/src/interfaces/editor.ts:461`                                                  | Keep; do not add parallel public writers.           |
| Void/render DX    | `/Users/zbeyens/git/plite/packages/plite-react/test/surface-contract.tsx:437` and `:485`                                | Keep; no public spacer.                             |
| Input/IME runtime | `/Users/zbeyens/git/plite/packages/plite-react/src/editable/runtime-root-engine.ts:199` and Mobile/IME browser rows     | Keep; exact device claims need device proof.        |
| Large rendering   | `/Users/zbeyens/git/plite/packages/plite-react/test/rendering-strategy-and-scroll.tsx:386` and generated stress budgets | Keep; budgets can be made more release-grade later. |

## 14. Browser Stress / Parity Strategy

Keep the existing strategy:

- unit contracts for public API and internal runtime boundaries;
- React/JSDOM contracts for selector fanout and render shape;
- Playwright integration rows for browser behavior;
- generated stress rows for render budgets, shell behavior, IME, paste,
  selection, and replay.

Future deslop should not delete browser rows just because they look repetitive.
They are behavior locks.

## 15. Applicable Implementation-Skill Review Matrix

| Lens                        | Applicability | Findings                                                                      | Plan delta                                                     |
| --------------------------- | ------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Vercel React best practices | applied       | React remains projection; runtime subscriptions are selector/source oriented. | No rewrite; split only proven owner leaks.                     |
| performance-oracle          | applied       | Dirty runtime ids, large-doc budgets, and staged/virtualized proof exist.     | Add release-grade p95/p99 budgets later, not a rewrite.        |
| performance                 | applied       | Large repeated editor surfaces are in scope.                                  | Keep cohort metrics; no broad perf claim without budget proof. |
| tdd                         | applied       | Behavior locks exist for public API, render, runtime, Mobile/IME.             | Deslop slices need focused regression proof before cleanup.    |
| build-web-apps:shadcn       | skipped       | No UI app surface changed in this review.                                     | No delta.                                                      |
| react-useeffect             | applied       | Runtime effects synchronize DOM/browser systems.                              | No effect rewrite without concrete leak.                       |

## 16. High-Risk Deliberate-Mode Pre-Mortem

Triggered because the review covers public API, runtime, browser behavior, and
migration backbone.

Failure scenarios:

- cleanup removes an internal helper that tests need to prove runtime behavior;
- a runtime split moves browser policy back into React components;
- a public convenience API is added for friendliness and recreates old Plite
  API sprawl.

Proof plan:

- public-surface contract after any API export change;
- focused Plite React runtime test after any owner split;
- browser proof after any IME, selection, paste, shell, or DOM coverage change;
- docs/examples grep after any docs cleanup.

Rollback answer:

- keep cleanup slices small and reversible;
- do not combine runtime owner splits with behavioral fixes.

## 17. Hard Cuts And Rejected Alternatives

Hard cuts:

- no whole rewrite;
- no public `Editor` static helper value;
- no public primitive writer exports;
- no public `SlateSpacer`;
- no raw Plite `editor.commands` / `editor.chain`;
- no product Mobile/IME policy namespace in raw Plite;
- no exact device issue claim from desktop/synthetic proof.

Rejected alternatives:

- rewriting runtime facades because they are large;
- moving Mobile/IME into core model code;
- preserving `Editor.*` as friendly docs syntax;
- importing Tiptap command DX into raw Plite;
- treating current Plate/slate-yjs adapters as release requirements.

## 18. Plite Maintainer Objection Ledger

| Change / stance                             | Likely objection                              | Answer                                                                                                                                                                          | Verdict |
| ------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Keep `plite/internal` static `Editor` table | "This is legacy API hiding under a new path." | It is explicitly internal and not exported from root; tests and internals still need a helper table. Public guards reject root export.                                          | keep    |
| No whole rewrite                            | "The runtime is still big."                   | Size is not the failure criterion. Owner leakage, subscription fanout, or behavior regressions are. Existing runtime owner tests and browser rows are more valuable than churn. | keep    |
| No command/chain sugar                      | "Tiptap DX is nicer."                         | Product sugar belongs in Plate. Raw Plite needs primitive, unopinionated state/tx.                                                                                              | keep    |
| Bounded test deslop                         | "Tests using internal helpers look messy."    | Internal tests may be messy when proving internals. Public API tests and docs should be stricter.                                                                               | keep    |

## 19. Pass Schedule And Pass-State Ledger

| Pass                          | Status   | Evidence added                                                      | Plan delta                         | Open issues                 | Next owner                           |
| ----------------------------- | -------- | ------------------------------------------------------------------- | ---------------------------------- | --------------------------- | ------------------------------------ |
| 1. Current-state read         | complete | live public API, render DX, runtime owner graph, prior closed plans | created this plan                  | none                        | pass 2                               |
| 2. Ecosystem research refresh | complete | Lexical, ProseMirror, Tiptap local source checks                    | added strategy table               | none                        | pass 3                               |
| 3. Deslop pressure            | complete | public/internal helper grep, docs/test surface grep                 | chose bounded cleanup over rewrite | no code edits in this skill | pass 4                               |
| 4. Risk and closure score     | complete | scorecard, issue no-claim accounting, maintainer objections         | set score `0.94` and closed review | none                        | user review / later Ralph if desired |

## 20. Plan Deltas From Review

Added:

- explicit no-rewrite verdict;
- current live-source pointers for public API and runtime owner graph;
- deslop scope and behavior locks;
- ecosystem synthesis for Lexical, ProseMirror, and Tiptap;
- issue-ledger no-claim accounting.

Dropped:

- any suggestion to split runtime modules by size alone;
- any suggestion to add command/chain sugar to raw Plite;
- any suggestion to promote exact Mobile/IME issue claims.

Strengthened:

- public docs/examples must be stricter than internal tests;
- `plite/internal` helper use is acceptable only as internal proof support.

## 21. Open Questions

None for this review.

What would change the decision:

- a public-surface test shows duplicate public write/read paths returned;
- a runtime owner audit finds browser policy in React components;
- performance proof shows broad subscription fanout;
- a real browser/device row fails because the owner graph cannot express the
  fix without a deeper rewrite.

## 22. Implementation Phases With Owners

No implementation starts from this Ralplan. Later Ralph/deslop work, if desired:

1. Public-doc and example grep cleanup.
2. Test-helper audit: separate public API tests from internal proof tests.
3. Internal static helper naming audit under `plite/internal`.
4. Runtime owner audit only when a failing proof names an owner leak.
5. Release-grade performance budgets for repeated editor surfaces.

## 23. Fast Driver Gates

For any later cleanup slice:

- public API export change: `bun --filter plite test:node -- public-surface-contract.ts`;
- Plite React surface change: `bun --filter plite-react test:vitest -- surface-contract.tsx`;
- runtime owner change: `bun --filter plite-react test:vitest -- kernel-authority-audit-contract.ts`;
- browser behavior change: matching Playwright row;
- docs cleanup: public-surface grep test plus relevant docs/examples check.

## 24. Final User-Review Handoff Outline

Accepted decisions:

- Public API: keep type-only `Editor`; normal editor instance stays `read`,
  `update`, `subscribe`, `extend`.
- Core writes: keep writes in `tx`; no public primitive writer exports.
- Internal helpers: keep `plite/internal` static table as internal/test owner.
- React/runtime: keep shared root runtime; split only proven owner leaks.
- Render DX: keep content-only `renderVoid`; runtime owns spacers and hidden
  anchors.
- Hooks: keep selector hooks; no eager broad selection/focus props.
- Plate: product command/UI sugar lives above raw Plite.
- slate-yjs: rely on deterministic operations, commits, and remote replay.
- Tests: keep browser/stress rows; deslop only where tests hide public API law.
- Issues: no fixed/improved claim changes from this review.
- Rewrite: rejected.

## 25. Final Completion Gates

| Gate                                 | Result                  |
| ------------------------------------ | ----------------------- |
| score at least `0.92`                | pass: `0.94`            |
| no dimension below `0.85`            | pass                    |
| live source cited for current shape  | pass                    |
| ecosystem synthesis complete         | pass                    |
| issue ledger accounting explicit     | pass: no claims changed |
| high-risk deliberate mode complete   | pass                    |
| deslop scope bounded                 | pass                    |
| no implementation edits from Ralplan | pass                    |
| final user-review handoff available  | pass                    |

Completion verdict: `done`.

## 26. Ralph Execution Grounding

Started: 2026-05-08T00:15:49+08:00.

Task statement:

- execute the latest architecture/deslop plan after user approval via Ralph.

Desired outcome:

- run bounded deslop slices from section 22 without rewriting Plite or
  changing issue claims unless the cleanup actually changes a public or
  behavior surface.

Known facts / evidence:

- review score is `0.94`;
- architecture verdict stays keep/no rewrite;
- implementation phases are ordered in section 22;
- phase 1 is public-doc and example grep cleanup.

Constraints:

- public docs/examples must not teach `plite/internal`, public `Editor.*`
  helper values, public primitive writers, `SlateSpacer`, or command/chain
  sugar as normal raw Plite API;
- internal package source and internal tests may still use `plite/internal`
  when proving internal behavior;
- generated `site/out` and `.next` output are not source owners.

Unknowns / open questions:

- whether phase 1 produces source edits or a recorded no-op after grep.

Likely touchpoints:

- `content/docs/plite`;
- `apps/www/examples`;
- source-only grep results excluding generated site output.

Execution ledger:

| Time                      | Pass                            | Owner                  | Evidence                                                                                                                                                                                                                                                                                                                     | Result                            | Next                                                                |
| ------------------------- | ------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| 2026-05-08T00:15:49+08:00 | deslop-pass                     | public docs/examples   | completion state reset to pending; `active goal state` refreshed                                                                                                                                                                                                                                                              | started                           | grep source docs/examples and patch only real public-teaching drift |
| 2026-05-08T00:21:19+08:00 | deslop-pass                     | public docs/examples   | removed `plite/internal` from `apps/www/src/app/(app)/examples/plite/_examples/forced-layout.tsx`; replaced stale `Editor.children` prose in `content/docs/plite/libraries/slate-react/annotations.md`; source grep clean; `bun typecheck:site`, public-surface contract, `bun check`, and focused forced-layout Playwright stress row passed | phase 1 complete                  | phase 2 test-helper audit                                           |
| 2026-05-08T00:22:15+08:00 | deslop-pass                     | package tests          | completion state moved to phase 2                                                                                                                                                                                                                                                                                            | in progress                       | grep package tests for public-vs-internal helper ambiguity          |
| 2026-05-08T00:29:59+08:00 | deslop-pass                     | package tests          | moved public read/update and generic API tests off `plite/internal`; focused public/helper tests passed                                                                                                                                                                                                                      | phase 2 complete                  | phase 3 internal helper naming audit                                |
| 2026-05-08T00:29:59+08:00 | deslop-pass                     | internal helper naming | verified source uses `InternalEditor` internally and root `slate` exports `Editor` type-only; `plite/internal` keeps the compatibility alias                                                                                                                                                                                 | phase 3 complete, no code edit    | phase 4 runtime owner audit                                         |
| 2026-05-08T00:29:59+08:00 | deslop-pass                     | runtime owner audit    | no failing runtime proof named an owner leak; existing kernel authority inventory remains the owner lock                                                                                                                                                                                                                     | phase 4 skipped by plan condition | phase 5 performance budget audit                                    |
| 2026-05-08T00:29:59+08:00 | deslop-pass                     | performance budgets    | repeated-surface render budgets already exist in `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts`; no extra budget edit needed for this cleanup slice                                                                                                                                                             | phase 5 complete, no code edit    | release discipline and closeout                                     |
| 2026-05-08T00:29:59+08:00 | debug + verification-sweep-pass | closeout               | removed stale `editor.operations` from `packages/plite-dom/test/bridge.ts`; refreshed classified escape-hatch counts; `bun test:release-discipline`, `bun lint:fix`, `bun check`, and focused forced-layout Playwright row passed in `Plate repo root`                                                           | execution done                    | completion state done                                               |
