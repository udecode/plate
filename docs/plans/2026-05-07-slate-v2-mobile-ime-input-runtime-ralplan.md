---
date: 2026-05-07
topic: slate-v2-mobile-ime-input-runtime-ralplan
status: ralph-execution-done
skill: ralph
macro_theme: Mobile, IME, And Input Semantics
current_pass: complete
next_pass: none
score: 0.95
---

# Slate v2 Mobile / IME Input Runtime Ralplan

## 1. Current Verdict

Pass 12 plus the cross-editor test-mining addendum are complete. The Slate
Ralplan is `done`.

The closure pass found no contradiction between the scorecard, issue-sync text,
PR reference, and final gates. All scheduled pass rows are complete, score is
`0.95`, no dimension is below `0.85`, and the synced ledgers preserve the core
truth: this plan accepts the shared input-runtime owner model, but it does not
claim exact Android/iOS/IME fixes without matching proof.

The issue-sync accounting pass completed conservative durable sync without
inflating claims. The issue coverage matrix now backfills `#5711`, `#3634`,
and `#4961` as related rows; the fork dossier aligns stale `#6022`, `#5983`,
`#5183`, and `#5088` statuses down to `related`; the matrix, fork dossier, live
gitcrawl ledger, cluster ledger, and PR reference carry the Mobile/IME macro
sync counts. No exact `Fixes #...` or `Improves #...` Mobile/IME claim changed.
Score is now `0.95`; closure and the requested cross-editor mining pass are
complete.

The correct direction is not a new public API blitz and not one Android patch per
issue. Slate v2 already has the right owner shape in live source: a shared
`slate-react` input runtime, a `slate-dom` DOM bridge, explicit composition
state, native `beforeinput` / `input` listeners, Android manager integration,
selection import/export, repair, and kernel traces.

The related issue discovery pass confirms the shape: the frozen R7 input runtime
surface is `149` rows, all `cluster-synced`, with `117` high-confidence rows and
`32` medium-confidence rows. The live gitcrawl mirror adds `119` current keyword
candidates with the discovery filter. That sweep is candidate generation, not
claim proof.

The issue-ledger pass now gives the next accounting shape. Among the `123`
frozen R7 rows missing from current dossier coverage, `44` need long-form
dossier/proof-route rows, `59` stay matrix-only future proof rows, and `20` are
matrix-only non-claim rows. Pass 11 backfilled the three existing dossier rows
into the matrix and aligned the four matrix/dossier drift rows down to
`related`.

The pass-5 refresh confirms the earlier architecture call. Current
`../slate-v2` source still owns Mobile/IME through the shared input runtime, not
through one-off per-device patches: root runtime state and owners live in
`runtime-root-engine.ts:136`, `:188`, `:199`, `:246`, `:253`, `:283`, `:289`,
and `:345`; event-family routing lives in `runtime-event-engine.ts:162`, `:194`,
`:215`, and `:252`; composition is a first-class runtime path in
`runtime-composition-events.ts:36`, `:71`, and `:106`; Android is routed through
`runtime-android-engine.ts:8`; native `beforeinput` / `input` listeners stay in
`input-router.ts:91`; and `slate-dom` still exposes composing state plus Android
DOM offset handling in `dom-editor.ts:82`, `:166`, `:811`, `:1207`, and `:1511`.

The pass-5 refresh also confirms the proof boundary. Current browser tests give
desktop IME and synthetic mobile confidence, not exact device closure:
`rendering-strategy-runtime.test.ts:401` covers browser IME commit,
`:431` covers the generated composition gauntlet, and `:477` labels mobile as
`mobile-synthetic-composition`; `dom-coverage-boundaries.test.ts:248` explicitly
skips mobile for hidden-boundary IME; `dom-coverage-boundaries.test.ts:283`
covers mobile touch only; `generated-editing.test.ts:1027` is synthetic
selection-repair IME stress; and `dom-coverage.ts:347` is unit-level composition
boundary policy. The `package.json` scripts expose `check`, `check:full`,
`test:mobile-device-proof`, and `test:mobile-device-proof:raw`, so exact
Android/iOS claims have a route but still need matching artifacts.

The pass-4 boundary still stands: the `44` long-form rows are proof-route
backlog, not claim backlog. The `20` matrix-only non-claim rows stay out of PR
auto-close language. The former four drift rows now default to `related` until
exact proof says otherwise. The existing `v2-input-runtime` Ralplan is `done` as an
architecture bucket, and this macro plan has enough routing to drive follow-up
ledger work. It still cannot claim "all Mobile/IME issues". Desktop IME,
synthetic mobile, and Android helper tests are useful. They do not close Samsung
Keyboard, Android Firefox predictive typing, Hangul placeholder, Chinese
backspace, Android voice input, iOS Chinese input, or Windows Vietnamese rows
without matching proof.

Pass 6 adds the hard pressure test: the current runtime shape is still good, but
execution cannot start as a vague "make Mobile/IME better" effort. Performance
claims must name cohorts and repeated-unit budgets; native-behavior claims must
say which mode preserves browser find, selection, copy/paste, IME, mobile touch,
undo/history, and collaboration; migration claims must stay at the substrate
level; and tests must be vertical issue/proof rows, not a bulk dump of all `44`
long-form rows. The current source is strong enough to keep the direction:
root/runtime refs and memoized owners in `runtime-root-engine.ts:136`, `:188`,
`:214`, `:246`, `:266`, and `:345`; root native listeners in
`input-router.ts:91`; source-scoped listeners in `public-state.ts:2175` and
`:2483`; dirty runtime IDs and commit metadata in `public-state.ts:367`; and
render-budget stress rows in `generated-editing.test.ts:221`, `:947`, and
`:1020`. The missing part is release-grade budgets and exact device artifacts,
not a new public API.

Pass 7 turns the likely maintainer pushback into plan edits. The strongest
objections do not invalidate the direction; they tighten the stop rules. Raw
device proof is still mandatory for exact mobile closure, synthetic rows must be
labelled as synthetic in proof and PR text, performance claims need cohort plus
repeated-unit evidence, and issue-sync work must happen in proof-heavy batches
instead of trying to write all `44` long-form rows at once. The maintainer pass
also accepts that the runtime already has Android-specific ownership, so the
answer is to keep that ownership centralized in `runtime-android-engine.ts:8`
and `runtime-root-engine.ts:246`, not to scatter device policy through public
APIs.

Pass 8 turns the high-risk review into release stop rules. The highest-risk
failure is not "the plan is too cautious"; it is shipping an input change that
duplicates text, drops composition text, moves the caret, or over-claims a real
keyboard from synthetic proof. The plan keeps the runtime owner graph, but every
execution slice now needs an explicit failure-mode table: data loss, selection
corruption, public API lock-in, false mobile claim, React hot-path regression,
collab/history nondeterminism, and native behavior regression. Any one of those
failing in proof downgrades the claim or splits the slice before ledger sync.

Pass 9 locks the ecosystem story. Extension authors get typed `state` / `tx`
namespaces, runtime registration, commit listeners, and narrow React hooks; they
do not get raw public command slots or a Mobile/IME product namespace. Plate gets
the primitive input runtime, composing/focus/selection hooks, schema/extension
backbone, and proof gates it can wrap into richer UX. slate-yjs gets deterministic
operation replay, commit metadata, and typed remote metadata; it does not get
browser event timing encoded into the collaboration API. PR text must say this
plainly, or maintainers will read the plan as a broad adapter promise.

Pass 10 folds the accepted pass-7, pass-8, and pass-9 revisions into one
execution contract. The plan now has a single conservative rule set for batching,
synthetic labels, raw-device proof, performance budgets, adapter ownership,
high-risk failure modes, and ecosystem language. No contradiction was found: the
shared input runtime remains the right owner, the public API stays primitive,
and issue sync must preserve conservative `Related` / `Needs repro` language
until matching proof exists.

Current owner: `slate-ralplan`, complete.

Next owner after user review: `ralph` execution planning.

## 2. Intent / Boundary Record

Intent:

- run a Slate Ralplan over all Mobile/IME issues, not just one local bug;
- turn the top-ranked issue macro theme into an execution-grade plan with exact
  claim boundaries;
- keep the current input-runtime architecture if the live source already earned
  it, and focus the plan on the missing proof/accounting.

Desired outcome:

- every Mobile/IME issue is classified as `Fixes`, `Improves`, `Related`,
  `Not claimed`, `Needs repro`, `Stale`, or `Invalid`;
- every claimed fix has a matching proof route;
- no Android/iOS/IME issue is auto-closed from desktop-only or semantic-mobile
  proof;
- raw Slate exposes runtime primitives, not product policy;
- the `44` long-form rows are prepared for proof and dossier work without
  implying they are fixed or improved;
- the `20` matrix-only non-claim rows remain visible as pressure, not execution
  work.

In scope:

- `slate-react-v2` event/runtime ownership for beforeinput, input, keydown,
  composition, focus, selection import, Android integration, and repair;
- `slate-dom-v2` DOM point/range translation, composing state, Android zero-width
  handling, and browser-facing input bridges;
- live gitcrawl Mobile/IME rows and frozen ledger Mobile/IME rows;
- test-candidate maps for Android, iOS, IME, composition, and native input;
- proof tiering: unit, browser, generated scenario, synthetic mobile,
  Appium/raw-device, and explicit non-claim rows;
- routing and stop rules for existing matrix/dossier drift.

Non-goals:

- no Slate v2 implementation patch in this Ralplan pass;
- no dossier or PR-reference file sync in this pass;
- no product autocomplete, slash-command, mention, toolbar, spellcheck, or
  text-limit policy in raw Slate;
- no React Native support promise;
- no exact mobile claim from Playwright mobile viewport alone;
- no docs/support issue closure unless the row is actually docs/support;
- no upward claim promotion for `#6022`, `#5983`, `#5183`, or `#5088` from
  ledger drift alone.

Decision boundaries:

- this plan may decide issue classification, proof routes, package ownership,
  and pass order without another user question;
- this plan may not mark `done` until the scheduled passes are complete and the
  score reaches the Slate Ralplan threshold;
- device-specific claims require device-specific proof or stay non-claims;
- drift rows default downward to the more conservative claim unless exact proof
  promotes them;
- long-form dossier rows must state current proof level before any PR line is
  copied from them;
- unresolved browser/tooling proof stays `pending`, not `blocked`, while local
  issue discovery and plan hardening remain runnable;
- if a row asks for product behavior, raw Slate only owns the primitive that
  makes the behavior possible without DOM/model drift.

Unresolved user-decision points:

- none. The next work is evidence and classification, not a product choice.

Pass-4 pressure test:

| Risk | Boundary answer | Stop rule |
| --- | --- | --- |
| The `44` long-form rows get treated as fixes | They are proof-route backlog only. | No `Fixes` or `Improves` text without exact repro proof. |
| Product behavior leaks into raw Slate | Raw Slate owns primitives; Plate/app code owns product policy. | Reject APIs that encode autocomplete, mention, slash-command, toolbar, or spellcheck policy. |
| Drift rows get promoted because one file is optimistic | Drift is accounting debt, not proof. | Use the conservative matrix claim until exact proof exists. |
| Synthetic mobile proof is used for real keyboards | Synthetic rows only show architecture confidence. | Android/iOS/Samsung/Firefox Android/voice claims need matching environment proof. |
| Browser-specific IME rows become generic unit tests | Unit tests can guard contracts, not close browser reports. | Browser/device report closure requires a browser/device artifact. |

No user question asked: the repo evidence gives enough authority to keep moving.

## 3. Decision Brief

Principles:

- Browser input is a runtime protocol.
- Composition is first-class state.
- Native-owned input and model-owned commands must not fight over selection.
- Mobile claims require matching mobile evidence.
- Raw Slate stays unopinionated; product behavior belongs above it.

Top drivers:

- Mobile/IME is the highest-priority macro theme in the frozen corpus: `129`
  issues, priority `21.37`.
- The theme covers Android, iOS, Firefox Android, Windows IMEs, Hangul, Chinese,
  Vietnamese, predictive typing, placeholders, empty-state input, and suggestion
  replacement.
- Package ownership points to `slate-react-v2` plus `slate-dom-v2`, with `124`
  of `129` rows in runtime ownership.
- Pass 3 routed `149` R7 input-runtime rows: `44` long-form proof rows, `59`
  future proof rows, `20` non-claim rows, `3` matrix backfills, and `4` drift
  rows.
- Live source already has input-runtime structure, so a second architecture would
  be waste.
- Existing proof is promising but not enough for per-device issue closure.

Viable options:

| Option | Verdict | Reason |
| --- | --- | --- |
| Patch one issue/browser at a time | reject | Recreates legacy special-case sprawl and makes corpus claims impossible to audit. |
| Move Mobile/IME into pure core model code | reject | The failures are browser/runtime timing, DOM, selection, and composition problems. |
| Treat desktop Playwright IME as enough | reject | It would lie about Android/iOS keyboard behavior. |
| Keep the shared input runtime and harden proof/accounting | choose | It matches live source, package ownership, and issue pressure. |
| Write all `44` long-form rows before research/proof mapping | reject | It would create polished dossier text before proof ownership is tight. |
| Expose product-level input policy in raw Slate | reject | Raw Slate should expose stable hooks and runtime rules, not editor-app UX. |

Chosen shape:

```txt
native browser event
  -> input controller intent
  -> runtime ownership decision
  -> selection import/export policy
  -> composition / Android / model / app handling
  -> repair and kernel trace
  -> proof artifact
  -> issue claim or non-claim
```

Consequences:

- Exact Android/iOS closures stay expensive.
- Some rows will stay `Related` or `Needs repro` even if the architecture is
  correct.
- Pass 6 tested the refreshed source/proof map against performance, DX,
  migration, regression, and simplicity pressure.
- Existing `v2-input-runtime` decisions should be inherited unless the
  Mobile/IME-specific issue pass invalidates them.
- Matrix/dossier drift is not a reason to promote claims; it is a reason to
  sync ledgers after proof ownership is clear.

Follow-ups:

- run closure score and final gates;
- append fork issue dossier sections only for rows that need long-form fork
  accounting;
- update live issue ledgers only when future classification changes are
  grounded;
- keep exact fixes separate from architecture coverage.

Decision locks from pass 4:

| Decision | Lock | Reason |
| --- | --- | --- |
| Public API | keep current composition API until a routed row proves a missing primitive | Avoid freezing device-specific product policy into raw Slate. |
| Dossier batching | start with proof-heavy long-form rows, not all `44` at once | Dossier text without proof routes becomes audit theater. |
| Drift handling | sync to conservative claim by default | Exact proof, not optimism, promotes a row. |
| Device proof | match the reported environment | The bug is the keyboard/browser behavior, not just the abstract input event. |
| Implementation | no implementation from this Ralplan until closure or user acceptance | This skill is planning/review only. |
| Revision bundle | use the pass-10 execution contract during issue sync | It prevents accepted objections from being lost when claim rows are written. |

## 4. Confidence Scorecard

Total score: `0.95`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | Pass 6 applies the performance rules: root runtime uses refs/memoized owners for transient hot state in `runtime-root-engine.ts:136`, `:188`, `:214`, `:246`, `:266`, and `:345`; native input listeners attach once at the root in `input-router.ts:91`; source listeners are scoped in `public-state.ts:2175` and `:2483`; render-budget stress rows exist at `generated-editing.test.ts:221`, `:947`, and `:1020`; pass 11 keeps performance-sensitive Mobile/IME rows out of exact claims until cohort/device proof exists. |
| Slate-close unopinionated DX | 0.20 | 0.95 | Pass 10 consolidates the primitive-owned API rule: typed extension `state` / `tx` groups, runtime registration, commit listeners, composing state, native input hooks, input rules, and internal-control classification are enough unless a routed red proof row shows otherwise. Pass 11 synced the issue text without adding a product-specific Mobile/IME namespace. |
| Plate and slate-yjs migration backbone | 0.15 | 0.95 | Pass 10 consolidates adapter ownership: `migration-backbone-contract.ts:33` proves extension `state`/`tx` namespaces and rejects adapter-shaped `api`/`tf`/`plate`/`yjs` fields; `:171` proves deterministic replay with commit tags; `collab-history-runtime-contract.ts:30`, `:114`, and `:155` prove one commit truth, remote replay, and typed remote metadata. |
| Regression-proof testing strategy | 0.20 | 0.95 | Pass 10 binds proof tiers to issue-sync claim language: unit/runtime, browser integration, raw mobile/manual, stress/performance, migration/adoption, and docs/PR tiers must match the reported environment before any exact claim. Pass 11 made that claim policy durable in the matrix, dossier, live-ledger notes, and PR reference. |
| Research evidence completeness | 0.15 | 0.95 | Compiled ProseMirror, Lexical, Tiptap, EditContext/IME, performance-rule, live-source evidence, the pass-7 objection ledger, the pass-8 high-risk source refresh, the pass-9 ecosystem owner review, the pass-10 revision bundle, and pass-11 ledger sync now cover architecture, runtime perf, migration substrate, regression proof, simplicity pressure, maintainer adoption, failure modes, and issue accounting. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.95 | Pass 10 keeps richer product DX above raw Slate, rejects broad public commands and Mobile/IME product API, and makes narrow hooks plus typed extension groups the execution contract. Pass 11 preserves that boundary in the PR-facing issue text. |

Why not higher:

- The closure pass still has to re-read final gates and decide `done` versus
  another concrete revision.
- `44` long-form dossier/proof rows are routed, but individual execution-batch
  sections still need exact repro/proof before any claim promotion.
- Ecosystem synthesis is refreshed for architecture direction, maintainer
  objections, high-risk failure modes, adoption language, and issue accounting,
  not for final implementation closure.
- Exact mobile/IME proof remains mixed and in places tooling-bound.

## 5. Source-Backed Architecture North Star

The north star is already visible in live source.

- Root runtime owns `isComposing`, input controller state, Android manager ref,
  selection reconciler, repair runtime, kernel trace runtime, event runtime, and
  event bindings in
  `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:136`,
  `:188`, `:199`, `:246`, `:253`, `:283`, `:289`, and `:345`.
- Event runtime fans out to beforeinput, input, clipboard, drag, composition,
  focus/mouse, and keyboard handlers through one runtime object in
  `../slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts:162`
  and `:194`.
- Input classification handles composition, paste/drop, delete, insert, format,
  and internal controls in
  `../slate-v2/packages/slate-react/src/editable/input-controller.ts:121`,
  `:170`, and `:246`.
- Composition events run through `prepareEditableCompositionKernel`, trace
  ownership, and apply start/update/end in
  `../slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts:36`,
  `:71`, and `:106`.
- Android runtime is a first-class adapter to `useAndroidInputManager` in
  `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts:8`.
- Native DOM `beforeinput` and `input` are attached outside React's polyfill in
  `../slate-v2/packages/slate-react/src/editable/input-router.ts:91`.
- `slate-dom` exposes composing state, Android flush hooks, and Android
  zero-width handling in
  `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:82`,
  `:166`, `:811`, `:1207`, and `:1511`.

Decision: keep this owner model. The Ralplan work is to make it issue-grade and
proof-grade, not to replace it.

## 6. Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md:73` | One view owner for DOM selection import/export and composition mode | App commands reading DOM selection directly | Centralize DOM import/export and composition ownership | ProseMirror's full plugin/view tree | `slate-dom` + `slate-react` input runtime bridge | agree |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md:108` | Lifecycle tags for history, paste, collaboration, scroll, DOM selection, focus, composition | Anonymous update side effects | Typed commit metadata for composition and DOM selection policy | Class nodes, `$` helpers, command-first app API | kernel trace / commit metadata for Mobile/IME proofs | partial |
| Tiptap | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:71` | Selector posture and composable UI around an editor engine | Transaction-wide React rerenders | Selector hooks for shell UI, not editor-body churn | Product command chains as raw Slate's required UX | minimal Slate hook surface, richer Plate layer | partial |
| EditContext / layout research | `docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md:50` | Text input services, selection, geometry, and format feedback are explicit platform work | Treating IME formatting like ordinary decorations | Keep IME/platform formatting distinct from product overlays | Browser API lock-in before support matures | dedicated Mobile/IME runtime proof lane | agree |
| Existing Slate v2 recovery audit | `docs/research/decisions/slate-v2-editing-epoch-legacy-timing-recovery-audit.md:36` | Native beforeinput, Android manager, Safari/Chrome composition recovery, device proof boundary | Losing hard-earned legacy timing rules | Preserve recovered timing rules and proof boundaries | Literal legacy monolithic Editable | current runtime owners plus new issue proof | agree |

Research/source refresh status: complete for pass 5. No `docs/research` write
was required because the compiled layer already covers the current architecture
question and the remaining gap is issue/device proof, not missing ecosystem
research.

Pass-5 evidence ledger:

| Evidence class | Files refreshed | Disposition | Decision effect |
| --- | --- | --- | --- |
| Current Slate v2 source | `runtime-root-engine.ts`, `runtime-event-engine.ts`, `input-controller.ts`, `runtime-composition-events.ts`, `runtime-android-engine.ts`, `input-router.ts`, `dom-editor.ts` | evidenced | Keep the shared input-runtime owner model. |
| Current Slate v2 proof | `rendering-strategy-runtime.test.ts`, `dom-coverage-boundaries.test.ts`, `generated-editing.test.ts`, `dom-coverage.ts`, `package.json` proof scripts | partial | Current proof supports architecture confidence, not broad device closure. |
| Compiled editor architecture | ProseMirror transaction/view runtime, Lexical read/update runtime, Tiptap extension/DX, layout/IME lane, editing-epoch recovery audit | evidenced | Keep DOM import/export centralized, composition explicit, commit metadata typed, product policy above raw Slate. |
| Issue dossiers and public test rows | `5994-5918.md`, `5129-5066.md`, `4541-4392.md`, plus the existing test-candidate maps | evidenced | Prioritize proof-heavy Android empty-state, Chinese IME, autocorrect, heading Enter, and onChange rows first. |
| Raw-device proof | `package.json:59`, `:60`, `:63` provide scripts but no fresh artifacts in this pass | gap | Android/iOS/Samsung/Firefox Android/voice claims stay non-claims until matching artifacts exist. |

User-requested cross-editor IME/mobile mining addendum:

| Source | Local evidence read | What to steal | Slate v2 gap / target |
| --- | --- | --- | --- |
| Lexical composition E2E | `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:173`, `:174`, `:258`, `:371`, `:445`, `:636`, `:746`, `:852`, `:920`, `:1078`, `:1211`, `:1276`, `:1325` | CDP `Input.imeSetComposition` staged Japanese/Hiragana tests across line breaks, new formatting, emojis, mentions, hashtags, cancel/delete, overlay behavior, and Korean multi-format replacement | Slate v2 has a basic Japanese composition gauntlet; add translated rows for inline void/mention boundaries, formatting/decorations, cancellation, and UI overlay non-interference before any exact issue claim. |
| Lexical history / Safari regressions | `../lexical/packages/lexical-playground/__tests__/e2e/History.spec.mjs:508`, `:510`, `:781`, `:889`; `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:39`, `:73` | Undo grouping after composition, canceled composition not entering history, retained selection after IME undo, Safari delete-selection after composition end | Slate v2 needs history/collab commit-metadata proof for composed DOM input and Safari post-composition deletion rows, not just final text assertions. |
| Lexical mobile/native input source | `../lexical/packages/lexical/src/LexicalEvents.ts:655`, `:710`, `:1018`, `:1029`, `:1168`; `../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts:135`; `../lexical/packages/lexical-plain-text/src/index.ts:286`; `../lexical/packages/lexical-rich-text/src/index.ts:893` | Android `deleteContentBackward` composition-key reset/delay, Firefox composition-end timing, Safari compositionend-before-keydown, iOS word prediction/autocorrect plain-text handling, iOS Korean backspace native fallback | Translate into raw-device/manual rows for Android backspace/autocorrect, iOS prediction/Korean backspace, and Safari timing before promoting related Mobile/IME issues. |
| ProseMirror DOM-change/runtime | `../prosemirror/state/src/transaction.ts:36`, `:38`, `:39`; `../prosemirror/view/src/domchange.ts:82`, `:96`, `:124`, `:198`, `:204`, `:228`, `:239`; `../prosemirror/view/src/viewdesc.ts:769`, `:792`, `:808`, `:839` | Composition transaction metadata, protected local composition DOM, Chrome wrong-selection guards, Chrome delete/reinsert detection, Android virtual-keyboard fallback, iOS Enter/mobile DOM hacks | Slate v2 already has kernel traces and composition-owned selection; execution should add composition commit IDs/metadata assertions and DOM-change-style wrong-selection/Android fallback proof where missing. |
| ProseMirror web tests | `../prosemirror/view/test/webtest-domchange.ts:190`, `:198`, `:205`, `:211`, `:219` | Read DOM composition changes, text deletion/typing inside markup, ambiguous text replacement, and no repaint of active text node | Add low-level DOM sync tests around mark/decorator boundaries and active text-node preservation, especially for hidden-boundary and inline-void cases. |

Pass-9 ecosystem maintainer ledger:

| Audience | Likely reading | Accepted wording | Must not imply | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| Raw Slate extension authors | "Can I extend input behavior without monkeypatching the editor?" | Use typed `state` / `tx` extension groups, runtime registration, commit listeners, and narrow input hooks. | Public command slots, Mobile/IME product policy, or device flags. | `../slate-v2/packages/slate/src/interfaces/editor.ts:433`, `:480`, `:804`, `:859`, `:872`, `:886`, `:1589`, `:1594`; `generic-extension-namespace-contract.ts:22`, `:56`, `:118`, `:160`, `:187` | keep |
| Plate maintainers | "Can Plate build richer UX on this without raw Slate becoming Plate-shaped?" | Plate wraps primitive composition/focus/selection/input hooks and `state` / `tx` substrate. | Current-version Plate adapter compatibility or `api` / `tf` fields on raw Slate. | `migration-backbone-contract.ts:33`, `:41`, `:52`, `:73`, `:162`; `hooks.md:7`, `:25` | keep |
| slate-yjs / collaboration maintainers | "Will IME/runtime fixes replay deterministically?" | Rely on commit metadata, operation replay, commit listeners, and typed remote metadata; browser event timing stays local. | yjs-specific fields on raw Slate, remote inference of DOM timing, or exact adapter closure. | `collab-history-runtime-contract.ts:30`, `:114`, `:155`; `migration-backbone-contract.ts:171`; `editor.ts:700`, `:1217` | keep |
| React shell authors | "Can toolbar/shell UI observe state without rerendering the editor body?" | Use selector hooks and `editor.read`; keep composition/focus/selection reads out of large node trees. | Per-node subscriptions or product controls stealing composition/input ownership. | `hooks.md:7`, `:13`, `:25`, `:37`; `runtime-root-engine.ts:136`, `:188`, `:266` | keep |
| Release / PR reviewers | "Does this close all Mobile/IME issues?" | It routes Mobile/IME architecture and proof tiers; exact issue claims require matching proof and later ledger sync. | `Fixes` / `Improves` promotion from synthetic mobile, architecture coverage, or dossier text alone. | Section 12 issue routing; Section 14 proof tiers; Section 18 objection ledger; Section 16 high-risk stop rules | revise |
| Product plugin authors | "Can raw Slate ship autocomplete, suggestions, mentions, or text limits?" | Raw Slate exposes primitives; product UX belongs above it, likely in Plate/app packages. | Built-in product input policy in the raw Slate Mobile/IME runtime. | Section 7 public API target; `input-controller.ts:75`, `:170`, `:230`, `:246` | keep |

Pass-9 decision:

- keep the current ecosystem story because the live extension and commit
  substrate already gives extension, Plate, and collaboration owners something
  real to build on;
- revise PR and adoption language so it says "substrate and proof gates", not
  "Plate/yjs adapters are done";
- keep Mobile/IME product behavior out of raw Slate;
- route any missing primitive found during implementation to the revision pass
  before it becomes public API.

## 7. Public API Target

Keep:

- `editor.dom.isComposing(): boolean`;
- `useEditorComposing(): boolean`;
- `onDOMBeforeInput?: (event: InputEvent) => boolean | void`;
- narrow input rules / app hooks where already source-backed.

Do not add yet:

- a new Mobile/IME public API namespace;
- product autocomplete or text suggestion APIs;
- mobile-device feature flags as public Slate policy;
- issue-number-specific APIs.

Decision: the public API is not the current blocker. The issue pass may propose
new narrow extension points only if a concrete row proves existing hooks cannot
express the behavior without DOM/model drift.

## 8. Internal Runtime Target

Target:

- input controller classifies native intent;
- event runtime centralizes handler families;
- composition engine owns start/update/end state and trace rows;
- Android engine owns Android-specific pending diffs and selection timing;
- selection runtime imports browser selection only under explicit ownership;
- repair runtime patches DOM/model drift after the kernel decision;
- trace runtime records enough detail to prove issue claims.

Already done in live source:

- the owner graph exists across `runtime-root-engine.ts`, `runtime-event-engine.ts`,
  `input-controller.ts`, `runtime-composition-events.ts`,
  `runtime-android-engine.ts`, `runtime-input-events.ts`, and `input-router.ts`.

Gap:

- issue-specific proof rows must show the graph works for each Mobile/IME class.

## 9. Hook / Component / Render DX Target

Target:

- editor hooks expose composition/focus/selection state narrowly;
- renderers do not need to manually patch Mobile/IME DOM behavior;
- app renderers can remain ordinary Slate renderers;
- product controls inside the editor are classified as internal controls and do
  not hijack composition/input.

Evidence:

- internal control classification lives in
  `../slate-v2/packages/slate-react/src/editable/input-controller.ts:89`;
- `useEditorComposing` is public docs surface in
  `../slate-v2/docs/libraries/slate-react/hooks.md:7`.

Gap:

- inline void and interactive internal-control Mobile/IME issues need exact issue
  rows before any renderer contract change is proposed.

## 10. Plate Migration-Backbone Target

Plate should inherit:

- a stable input-runtime substrate;
- composition/focus/selection state hooks;
- input rule hooks that do not desync DOM and model;
- browser proof gates it can reuse without owning raw Slate internals.

Plate should not get:

- raw Slate product policy hardcoded for mentions, autocomplete, slash commands,
  or toolbar UX;
- current-version adapter promises from this Ralplan.

Pass-9 status: backbone and adoption wording reviewed; adapters still out of
scope.

Evidence:

- `../slate-v2/packages/slate/test/migration-backbone-contract.ts:33` proves
  extension `state` / `tx` namespaces and schema specs without adapter-shaped
  `api`, `tf`, `plate`, `yjs`, or feature fields on the editor surface.
- `../slate-v2/packages/slate/src/core/editor-runtime.ts:97` exposes snapshot,
  runtime-id, selection, subscribe, read, and update runtime groups behind one
  internal runtime.
- `../slate-v2/packages/slate/test/commit-metadata-contract.ts:18` and `:109`
  prove update tags, selection before/after, dirty runtime IDs, and typed
  metadata.

Decision: Plate migration pressure reinforces the current primitive substrate.
Do not add Plate-shaped editor APIs to raw Slate from this Mobile/IME plan.
PR/adoption language should say Plate can wrap the substrate, not that this plan
ships current-version Plate integration.

## 11. slate-yjs Migration-Backbone Target

Yjs/collab cares about deterministic local commits, selection metadata, and
composition lifecycle boundaries.

Target:

- composition start/update/end and DOM-selection policy should produce
  deterministic local commits or explicit browser-owned non-commit spans;
- remote apply should not infer browser event timing;
- issue fixes should not introduce hidden non-deterministic DOM-derived writes.

Status: ecosystem wording reviewed; current-version yjs adapter work remains out
of scope.

Evidence:

- `../slate-v2/packages/slate/test/migration-backbone-contract.ts:171` replays
  deterministic operations with commit tags and local-only runtime targets.
- `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts:30`
  publishes one commit truth for collab subscribers, extension listeners, and
  history.
- `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts:155`
  uses typed remote collaboration metadata to skip local undo history.

Decision: yjs/collab needs deterministic operations, commit metadata, and
local-only target semantics. It does not need Mobile/IME product policy or
browser-event timing encoded into raw collaboration APIs.

## 12. Full Issue-Ledger Accounting

Current corpus facts:

- Frozen issue corpus: `682` rows in
  `docs/slate-issues/open-issues-ledger.md:18`.
- Live gitcrawl overlay: `630` open issues in
  `docs/slate-issues/gitcrawl-live-open-ledger.md:12`.
- Mobile/IME macro theme: `129` issues, `cluster-synced`, no per-device closure
  without device proof in `docs/slate-issues/open-issues-ledger.md:84`.
- Mobile/IME is the top-ranked macro theme with priority `21.37` in
  `docs/slate-issues/issue-clusters.md:46`.
- Requirements R7 assigns input/composition/IME semantics to `slate-react-v2`
  plus `slate-dom-v2` in
  `docs/slate-issues/requirements-from-issues.md:247`.
- Package matrix assigns Mobile/IME to `slate-react-v2` + `slate-dom-v2`, with
  `124` runtime rows in `docs/slate-issues/package-impact-matrix.md:75`.

ClawSweeper related-issue pass:

- status: complete for discovery and pass-11 durable macro sync;
- trigger: this plan touches public runtime behavior, browser behavior, issue
  claims, and PR narrative;
- freshness: `gitcrawl doctor --json` reports `659` open Slate threads, `617`
  clusters, `last_sync_at: 2026-05-04T14:58:11.123944Z`,
  `api_supported: false`, and no GitHub token;
- frozen exact R7 input-runtime set: `149` rows, all `cluster-synced`;
- R7 confidence split: `117` high, `32` medium;
- R7 readiness split: `80` ready-with-minor-setup, `45` ready-now,
  `24` not-a-test-candidate;
- live gitcrawl candidate sweep: `119` current keyword rows with the pass-2
  filter; treat this as candidate generation because keyword matching includes
  adjacent selection, placeholder, spellcheck, and false-positive rows;
- issue coverage matrix: `28` current input-runtime/input-related rows found;
- fork issue dossier: `26` existing `v2-input-runtime` sections found;
- claim result: no exact `Fixes` or `Improves` additions;
- discovery result: existing related rows stay related/not-claimed; remaining
  R7 rows are related-discovered and wait for the issue-ledger pass.

Dossier output:

- existing dossier sections found for `#6022`, `#5983`, `#4400`, `#5883`,
  `#6051`, `#3777`, `#5095`, `#5096`, `#5603`, `#5669`, `#4994`, `#5026`,
  `#4001`, `#5989`, `#5984`, `#5931`, `#5830`, `#5643`, `#5130`, `#5050`,
  `#5014`, `#4348`, `#4223`, `#4067`, `#3568`, and `#3470`;
- pass 11 appended a Mobile/IME macro sync section and aligned the four stale
  drift statuses down to `related`;
- pass 3 decides that `44` of the `123` R7 rows missing from current dossier
  coverage need long-form dossier/proof-route sections, while `79` stay
  matrix-only for now.

Issue-ledger pass:

- status: complete for routing and pass-11 durable file sync;
- frozen R7 rows routed: `149`;
- existing matrix and dossier coverage: `23` R7 rows;
- existing dossier rows needing matrix backfill: `3`;
- new long-form dossier/proof-route rows needed: `44`;
- matrix-only future-proof rows: `59`;
- matrix-only non-claim rows: `20`;
- claim result: no exact `Fixes` or `Improves` additions from this pass.

Pass-3 routing matrix:

| Route | Count | Rows | Durable follow-up |
| --- | ---: | --- | --- |
| Existing matrix and dossier | 23 | `#6022`, `#5989`, `#5984`, `#5983`, `#5931`, `#5883`, `#5830`, `#5643`, `#5281`, `#5183`, `#5130`, `#3777`, `#3497`, `#3478`, `#3150`, `#5088`, `#5050`, `#5014`, `#4994`, `#4400`, `#4223`, `#4067`, `#4001` | Drift-check only; do not promote claims without proof. |
| Existing dossier, matrix backfill needed | 3 | `#5711`, `#3634`, `#4961` | Done in pass 11 as related matrix rows. |
| Needs long-form dossier and proof route | 44 | `#5891`, `#5836`, `#5805`, `#5680`, `#5666`, `#5653`, `#5493`, `#5375`, `#5371`, `#5291`, `#5175`, `#5173`, `#5167`, `#3873`, `#3695`, `#3611`, `#3587`, `#5099`, `#5083`, `#5078`, `#5034`, `#5023`, `#4959`, `#4861`, `#4770`, `#4719`, `#4693`, `#4640`, `#4602`, `#4543`, `#4531`, `#4521`, `#4372`, `#4354`, `#4353`, `#4269`, `#4232`, `#4136`, `#4085`, `#4031`, `#4030`, `#3943`, `#3942`, `#3882` | Write dossier sections before any PR claim; most require browser/device proof. |
| Matrix-only future proof | 59 | `#5697`, `#5639`, `#5611`, `#5569`, `#5487`, `#5484`, `#5481`, `#5433`, `#5430`, `#5420`, `#5398`, `#5380`, `#5274`, `#5213`, `#5181`, `#5152`, `#3878`, `#3858`, `#3821`, `#3742`, `#3696`, `#3601`, `#3582`, `#3432`, `#3412`, `#3354`, `#3325`, `#3317`, `#3162`, `#5117`, `#5010`, `#5004`, `#4795`, `#4738`, `#4721`, `#4712`, `#4704`, `#4696`, `#4681`, `#4673`, `#4560`, `#4541`, `#4495`, `#4466`, `#4323`, `#4317`, `#4316`, `#4309`, `#4094`, `#4046`, `#4010`, `#3947`, `#3929`, `#3926`, `#3917`, `#3911`, `#3909`, `#3893`, `#1498` | Keep matrix accounting; promote only if a later proof slice targets the row. |
| Matrix-only non-claim | 20 | `#5418`, `#5207`, `#3781`, `#3780`, `#3760`, `#3618`, `#3460`, `#3304`, `#3303`, `#3222`, `#3177`, `#4621`, `#4457`, `#4426`, `#4233`, `#4165`, `#4089`, `#4081`, `#2564`, `#2465` | Keep out of PR auto-close language; use as policy/API pressure only. |

Claim-level drift found:

| Issue | Matrix claim | Dossier status | Decision |
| --- | --- | --- | --- |
| `#6022` | Related | `related` | Aligned in pass 11; current plan does not promote Android mark-toggle without device proof. |
| `#5983` | Related | `related` | Aligned in pass 11; current plan does not promote Android voice input without device proof. |
| `#5183` | Related | `related` | Aligned in pass 11; Android keyboard activation still needs exact device proof for Mobile/IME claim. |
| `#5088` | Related | `related` | Aligned in pass 11; not a Mobile/IME exact claim in this plan. |

Pass-11 drift result: all four dossier statuses now align down to `related`.
No row was promoted.

Research/source refresh effect on issue-ledger accounting:

- The `44` long-form rows remain long-form proof-route rows. Pass 5 proves
  routing and owner fit; it does not prove issue closure.
- The strongest first batch should be rows with both clear dossier text and
  public test rows: Android empty-state / placeholder composition (`#5989`,
  `#5983`, `#5891`, `#5883`), Android Chinese delete / duplicate insertion
  (`#5984`, `#5083`, `#5078`, `#5034`, `#5023`), Android autocorrect /
  suggestion replacement (`#4531`, `#5653`), Android heading Enter / block type
  rows (`#4521`, `#5175`), inline-boundary IME rows (`#4693`, `#4136`), and
  empty-editor IME rows (`#4030`, `#3943`, `#3882`).
- The former four drift rows stay conservative at `related` until exact proof
  decides whether to promote.
- Live source did not produce a new public API requirement in pass 5.

Fixed issues:

- none from this Ralplan pass.

Materially improved issues:

- none from this Ralplan pass.

Related but not fixed initial seed:

| Issue | Cluster | Initial claim | Why | Proof route | Live ledger sync | PR line |
| --- | --- | --- | --- | --- | --- | --- |
| `#6051` | singleton | Related | Firefox Android + Samsung Keyboard live issue, no exact proof yet | raw Android Firefox/Samsung keyboard proof | synced macro note | related matrix only |
| `#6022` | `9` | Related | Android mark-toggle keyboard/caret failure, linked PR cluster | Android mark-toggle + typing proof | synced macro note | related matrix only |
| `#5989` | singleton | Related | Hangul placeholder composition, ready-with-minor-setup | Android Hangul placeholder composition proof | synced macro note | related matrix only |
| `#5984` | singleton | Related | Android Chinese backspace and one-change expectation | Android Chinese IME deletion proof | synced macro note | related matrix only |
| `#5983` | `11` | Related | Android voice input duplication in empty editor | Android voice input proof or explicit tooling gap | synced macro note | related matrix only |
| `#5974` | singleton | Related | Chrome iPhone emulator Chinese input is blocked-on-repro | emulator-specific repro decision | synced macro note | related matrix only |
| `#5931` | singleton | Related | Windows suggestions append instead of replace | Windows text suggestion acceptance proof | synced macro note | related matrix only |
| `#5918` | singleton | Needs repro | Vietnamese Windows IME row is blocked-on-repro | Windows Vietnamese repro first | synced macro note | related matrix only |
| `#5891` | singleton | Related | Android first-line autocorrect | Android autocorrect proof | synced macro note | related matrix only |
| `#5183` | `12` | Related | Android inline void keyboard summon | raw Android inline void keyboard proof | synced macro note | related matrix only |
| `#5130` | singleton | Related | Android Firefox predictive typing | Android Firefox predictive typing proof | synced macro note | related matrix only |
| `#4400` / `#5883` | `13` | Related | Android empty-node composition family | Android empty-node composition proof | synced macro note | related matrix only |
| `#5603` / `#5669` | `16` | Related | Native input event missing at boundaries | native input event parity proof | synced macro note | related matrix only |
| `#4994` / `#5026` | `18` | Related | Android readOnly change/input ops | Android readOnly transition proof | synced macro note | related matrix only |

Primary R7 families discovered in pass 2:

| Family | Rows | Issues |
| --- | ---: | --- |
| Focus/external DOM ownership | 16 | `#3821`, `#3742`, `#3696`, `#3634`, `#3601`, `#3582`, `#3497`, `#3412`, `#4010`, `#3947`, `#3929`, `#3926`, `#3917`, `#3911`, `#3909`, `#3893` |
| Mobile selection/input sync | 10 | `#6022`, `#5836`, `#5805`, `#5493`, `#5371`, `#5130`, `#3587`, `#5083`, `#4030`, `#3943` |
| Controlled/external value updates | 9 | `#5418`, `#5281`, `#5207`, `#3878`, `#3858`, `#3478`, `#3325`, `#4323`, `#4094` |
| Mobile text composition | 6 | `#5023`, `#4693`, `#4353`, `#4316`, `#4269`, `#4223` |
| Placeholder/empty-editor IME | 6 | `#3777`, `#4067`, `#4031`, `#4001`, `#3942`, `#3882` |
| Mobile empty-state input | 5 | `#5983`, `#5891`, `#5883`, `#5711`, `#5099` |
| Android input manager regressions | 4 | `#5175`, `#5167`, `#4621`, `#4400` |
| Composition/focus lifecycle | 3 | `#5830`, `#5653`, `#4232` |
| Upstream browser/React event gaps | 3 | `#3304`, `#3303`, `#3150` |

Two-row R7 families:

- Android readOnly: `#5034`, `#4994`;
- suppressed input: `#5152`, `#5010`;
- focus initialization: `#5213`, `#4696`;
- focus events: `#5004`, `#4560`;
- input interception: `#5050`, `#4795`;
- mobile autocorrect suggestions: `#4531`, `#4354`;
- mobile backspace: `#5984`, `#4959`;
- placeholder composition: `#5989`, `#4136`;
- iOS placeholder selection: `#5481`, `#4640`;
- placeholder timing: `#5420`, `#4673`;
- plugin/render composition: `#3222`, `#3177`;
- decoration/selection stability: `#3354`, `#3162`;
- render during composition: `#5433`, `#5398`;
- marks/decorations/inlines: `#2564`, `#2465`;
- SSR/hydration: `#5430`, `#5380`.

One-row R7 families:

- `57` one-row families remain. Do not explode them into claims in discovery
  pass. Pass 3 routed them as matrix rows, dossier rows, or explicit
  non-claims.

Current live high-signal rows not fully claimable yet:

| Group | Rows |
| --- | --- |
| Existing related matrix anchors | `#6051`, `#6022`, `#5989`, `#5984`, `#5983`, `#5974`, `#5931`, `#5918`, `#5891`, `#5183`, `#5130`, `#4400`, `#5883`, `#5603`, `#5669`, `#4994`, `#5026` |
| Newly surfaced live rows for issue-ledger routing | `#5805`, `#5836`, `#5680`, `#5666`, `#5493`, `#5643`, `#5639`, `#5398`, `#5391`, `#5175`, `#5178`, `#5173`, `#5099`, `#5078`, `#5034`, `#5023`, `#4693`, `#4521`, `#4354`, `#4232`, `#4136`, `#4030`, `#3943`, `#3882`, `#4466`, `#4372` |

Live gitcrawl ledger sync:

- updated in pass 11 with an append-only V2 sync note. The live table remains
  the raw gitcrawl mirror; the planning overlay records `149` routed rows, `44`
  long-form proof-route rows, `59` matrix-only future-proof rows, `20`
  matrix-only non-claim rows, `3` matrix backfills, and `4` drift rows aligned
  down to related.

Fork issue dossier sync:

- updated in pass 11. A Mobile/IME macro sync section records the reviewed
  surface, and `#6022`, `#5983`, `#5183`, and `#5088` now align with the
  conservative `related` matrix claim.

Issue coverage matrix sync:

- updated in pass 11. `#5711`, `#3634`, and `#4961` were added as related
  matrix rows; a Mobile/IME macro planning sync table records the `23 + 3 + 44
  + 59 + 20` route accounting without adding closure language.

PR description:

- updated in pass 11. The summary now reports `154` related issue matrix rows,
  the Mobile/IME macro counts, and `0` new exact fixed/improved Mobile/IME
  claims from this plan.

## 13. Legacy Regression Proof Matrix

| Class | Current evidence | Gap | Claim rule |
| --- | --- | --- | --- |
| Desktop IME commit | `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:401` composes Japanese text and asserts model text at `:428` | Does not prove Android/iOS | Desktop IME only |
| Generated composition trace | `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:431` runs composition gauntlet; mobile claim is explicitly `mobile-synthetic-composition` at `:477` | Needs raw-device promotion | Architecture confidence only for mobile |
| Selection repair during composition | `../slate-v2/playwright/stress/generated-editing.test.ts:1027` synthetic stress row | Needs language/device rows | Stress confidence only |
| DOM coverage + composition | `../slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:248` skips mobile for IME; `../slate-v2/packages/slate-dom/test/dom-coverage.ts:347` blocks boundary materialization while composing | Mobile hidden-boundary IME proof | Desktop/unit proof only |
| Mobile touch around hidden boundaries | `../slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:283` is mobile touch proof, not IME proof | Needs IME/device input rows | Touch usability only |
| Android zero-width / composition | `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:1207` carries Android zero-width composition handling | Needs issue exactness | Source evidence, not closure |
| Android manager | `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts:8` delegates to Android input manager | Needs feature-specific rows | Owner evidence, not closure |

## 14. Browser Stress / Parity Strategy

Proof tiers:

1. Unit/runtime contracts for input classification, composition state, Android
   manager decisions, DOM bridge offsets, and repair policy.
2. Generated browser scenario rows for native beforeinput, input, composition,
   selection import/export, and kernel trace legality.
3. Desktop native IME rows for Chromium, Firefox, and WebKit where supported.
4. Synthetic mobile rows for architecture confidence only.
5. Appium/raw-device rows for Android/iOS claims.
6. Manual or external device-lab rows for Samsung Keyboard, Android Firefox
   predictive typing, Gboard/autocorrect/voice, iOS Safari Chinese, and Windows
   IME rows when automation cannot drive the real input method.

No exact issue closure may skip the tier matching the reported environment.

Pass-5 proof inventory conclusion:

- Desktop Chromium IME proof exists for the rendering-strategy runtime.
- Synthetic composition proof exists for non-Chromium and mobile projects.
- Mobile touch proof exists around hidden DOM coverage boundaries.
- Unit proof exists for composition-boundary materialization policy.
- Raw Android/iOS proof scripts exist, but no fresh artifact from this Ralplan
  pass can promote a device-specific claim.

Cross-editor tests to steal before execution:

- Port Lexical's CDP staged IME pattern from
  `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`
  into Slate browser scenarios where the current `editor.ime.compose` helper is
  too coarse.
- Add translated cases for composition across inline voids/mentions, formatting
  boundaries, emojis/decorations, hidden DOM coverage boundaries, cancellation,
  delete-after-composition, and Korean replacement across multiple formatted
  text nodes.
- Add Lexical-style history rows: composed text forms the right undo group,
  canceled composition is not pushed to history, and undo restores selection.
- Keep Safari post-composition delete-selection rows from Lexical regression
  `8153-safari-ime-delete-selection.spec.mjs` as WebKit regression gates; both
  translated richtext rows landed in slice 24.
- Add ProseMirror-style DOM-change rows: composed DOM text is read without
  repainting the active text node, markup-bound text mutations are preserved,
  ambiguous replacement is resolved, and composition changes carry explicit
  commit metadata.
- Add Android/iOS raw-device or manual rows for the cases local desktop tests
  cannot prove: Android virtual-keyboard backspace/autocorrect, iOS word
  prediction, iOS Korean backspace, Samsung Keyboard, Android Firefox
  predictive typing, voice input, and iOS Safari Chinese.

Pass-6 performance and native-behavior contract:

| Surface | Budget / contract | Evidence | Remaining gap |
| --- | --- | --- | --- |
| Cohorts | normal `0-500`, medium `500-2000`, large `2000-10000`, stress `10000-50000`, plus complexity tags for custom renderers, decorations, hidden boundaries, inline voids, collaboration, mobile/IME | `performance/rules/cohort-segmentation.md` | Attach cohort tags to each implementation slice. |
| Repeated unit | hot unit is top-level block/root group; avoid per-block input listeners and broad React subscriptions | `runtime-root-engine.ts:136`, `:188`, `:214`, `:246`, `input-router.ts:91`, `public-state.ts:2483` | Record DOM/component/listener/memory tags in large/stress proof. |
| React runtime | use refs for transient state, selector-scoped updates, and root-level native listeners; keep typing/selection/IME urgent | `runtime-root-engine.ts:136`, `:188`, `:266`, `root-selector-sources.ts:110`, `:196`, `:208` | React Performance Tracks only if React work breadth becomes suspicious. |
| Render budgets | stress rows already assert no broad editable rerender for mention movement, projection selection, and mouse selection toolbar | `generated-editing.test.ts:221`, `:947`, `:1020` | Add exact Mobile/IME rows before issue closure. |
| Native behavior | faster modes must classify browser find, screen-reader traversal, native selection, copy/paste, select-all, IME, mobile touch, undo/history, collaboration, and follow-up typing | `performance/rules/editor-native-behavior-proof.md` | This contract is not yet attached to every routed issue family. |
| Degradation | optimize DOM-present normal/medium path first; shell/virtualized behavior is explicit large/stress policy, not default Mobile/IME proof | `performance/rules/degradation-contract.md`, `root-selector-sources.ts:228` | Need per-mode behavior table before implementation. |
| Migration | commit metadata and deterministic operation replay are the substrate proof | `commit-metadata-contract.ts:18`, `migration-backbone-contract.ts:171`, `collab-history-runtime-contract.ts:30` | No current-version Plate/yjs adapter promise from this plan. |

Pass-10 execution contract for issue sync:

| Accepted revision | Final rule for issue-sync text | Claim effect |
| --- | --- | --- |
| Proof-heavy batching | Sync the strongest proof-routed rows first; do not write all `44` long-form rows as if they are fixes. | Keeps unproven rows `Related`, `Needs repro`, or matrix-only. |
| Synthetic labels | Preserve `synthetic` in proof labels and PR text. | Synthetic mobile never becomes exact Android/iOS closure. |
| Raw-device proof | Match Samsung Keyboard, Android Firefox, voice input, iOS Chinese, Windows IME, or other reported environments before exact closure. | Device-specific rows stay non-claims without matching artifacts. |
| Performance evidence | Attach cohort, repeated-unit, listener, DOM/component, memory, and native-behavior evidence to large/stress claims. | Blocks broad performance language from narrow repro proof. |
| Adapter ownership | Say Plate/yjs can wrap the raw Slate substrate; do not say current adapters are complete. | Keeps adapter work out of raw Slate issue claims. |
| High-risk failure modes | Require per-slice checks for data loss, duplicate input, caret corruption, public API lock-in, false mobile claim, React hot-path regression, collab/history nondeterminism, and native behavior regression. | Any failure downgrades or splits the issue claim. |
| Ecosystem wording | Use typed `state` / `tx`, runtime registration, commit listeners, selector hooks, and composition primitives as the adoption story. | Rejects public command slots and Mobile/IME product policy. |
| Ledger order | Sync matrix/dossier/PR reference after proof boundaries and revision decisions settle. | Prevents optimistic durable claim text. |

## 15. Applicable Implementation-Skill Review Matrix

| Lens | Applicability | Reason | Current finding | Plan delta |
| --- | --- | --- | --- | --- |
| `vercel-react-best-practices` | applied pass 6 | React runtime, subscriptions, event listeners, and performance are in scope | Relevant rules are `client-event-listeners`, `rerender-use-ref-transient-values`, `rerender-defer-reads`, and `advanced-event-handler-refs`; current source mostly follows them with root native listeners and ref-owned transient state | Keep runtime outside per-node React state; do not add per-row listeners or broad subscriptions. |
| `performance-oracle` | applied pass 6 | Hot input path, repair, selection, large docs | Main risk is not obvious O(n^2) code in the current input runtime; risk is unbounded repeated-unit DOM/subscription/memory growth during proof and issue-specific fixes | Every implementation slice needs cohort, repeated-unit, memory/DOM, and interaction tags. |
| `performance` | applied pass 6 | Mobile/IME and rendering strategy claims need cohorting, repeated-unit budgets, native behavior contracts, and degradation rules | Existing render-budget stress rows are useful, but no full Mobile/IME cohort/INP/memory table exists yet | Add the pass-6 performance/native behavior contract as execution acceptance criteria. |
| `tdd` | applied pass 6 | Behavior/regression classes need tests before fixes | Use vertical public proof rows; do not write all `44` tests first | First implementation batch should start with one high-signal issue class and one failing/characterization proof row. |
| `regression-lock-pass` | applied pass 6 | Browser input and migration behavior are high regression risk | Existing contracts lock commit metadata, migration backbone, collab/history, target runtime, render budgets, and synthetic/mobile proof classes | Missing exact device/browser rows stay non-claims. |
| `code-simplicity-reviewer` | applied pass 6 | The plan could overgrow into a Mobile/IME framework | Simpler answer is keep the shared input runtime, add proof/budget contracts, and reject a new public namespace | Do not add new abstraction until a routed issue proves the existing primitive hooks cannot express the behavior. |
| `build-web-apps:shadcn` | skipped | No UI/editor chrome change | N/A | Keep UI out unless examples/debug chrome change |
| `react-useeffect` | applied pass 6 | Effects/listeners/browser APIs are in scope | Native listeners attach/detach through root ref; source subscriptions are centralized | Future edits must not add derived-state effects or repeated-unit subscriptions. |

## 16. High-Risk Deliberate-Mode Pre-Mortem

Status: complete for pass 8.

Trigger: yes. This plan touches selection, focus, IME, DOM repair, browser
runtime behavior, React runtime strategy, migration substrate, collaboration
metadata, public proof claims, issue ledgers, and release gates.

Current high-risk source owners refreshed in pass 8:

- root runtime state, input controller, Android manager, selection import,
  repair, kernel trace, and event runtime:
  `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:136`,
  `:188`, `:199`, `:214`, `:246`, `:253`, `:283`, `:289`, and `:345`;
- input handling and DOM input repair:
  `../slate-v2/packages/slate-react/src/editable/runtime-input-events.ts:52`,
  `:79`, `:89`, `:106`, and `:135`;
- composition start/update/end ownership:
  `../slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts:36`,
  `:71`, and `:106`;
- internal-control, keyboard, beforeinput, composition, and composing-state
  classification:
  `../slate-v2/packages/slate-react/src/editable/input-controller.ts:75`,
  `:121`, `:170`, `:230`, and `:246`;
- DOM bridge composing state, Android pending diff hooks, Android zero-width
  handling, point/range translation, and public DOM capability:
  `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:82`, `:161`,
  `:811`, `:1207`, `:1227`, `:1440`, and `:1511`;
- current proof scripts and proof split:
  `../slate-v2/package.json:58`, `:59`, `:60`, and `:63`;
- browser proof labels:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts:401`,
  `:431`, and `:477`;
- hidden-boundary split between desktop IME and mobile touch:
  `../slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:248`
  and `:283`;
- commit/collab substrate:
  `../slate-v2/packages/slate/test/commit-metadata-contract.ts:18`, `:84`,
  `:109`, and `:144`;
  `../slate-v2/packages/slate/test/migration-backbone-contract.ts:33` and
  `:171`;
  `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts:30`,
  `:114`, and `:155`.

Blast radius:

| Area | Files / owners | Users or consumers | Affected behavior | Required stop rule |
| --- | --- | --- | --- | --- |
| Input runtime | `slate-react/src/editable/*`, `input-router.ts`, `input-controller.ts`, `runtime-input-events.ts`, `runtime-composition-events.ts` | end users typing on desktop/mobile, app authors using raw Slate | beforeinput/input, composition, delete, history, format, internal controls | Any text duplication, dropped input, or untraced ownership transition blocks a claim. |
| Selection / DOM bridge | `slate-dom/src/plugin/dom-editor.ts`, selection import/export, repair runtime | end users, screen-reader/native selection users, browser integrations | caret, range translation, copy/paste, select-all, browser find, IME offsets | Exact issue claim needs browser/device proof for the reported environment. |
| Android / mobile | Android input manager, `runtime-android-engine.ts`, mobile proof scripts | Android/iOS/Samsung/Firefox Android/voice-input users | keyboard summon, predictive typing, voice input, zero-width composition | Raw-device or matching manual artifact required before exact closure. |
| React performance | root runtime refs, selector sources, render-budget stress rows | large-document users, Plate adopters, shell/virtualized consumers | rerenders, listener count, DOM churn, memory, INP-like interaction cost | Large/stress claim needs cohort plus repeated-unit evidence. |
| Collaboration / migration | commit metadata, operation replay, collab/history contracts | Plate, slate-yjs, collaboration adapters, extension authors | deterministic commits, undo/history, remote metadata, local-only target semantics | No adapter-shaped raw API; downgrade if a runtime fix creates nondeterministic commits. |
| Ledgers and PR text | issue matrix, fork dossier, live gitcrawl ledger, PR reference | maintainers, reviewers, issue reporters | `Fixes` / `Improves` / `Related` language and release proof | Sync after proof boundaries settle; no optimistic claim promotion. |

Pre-mortem:

| Scenario | What breaks | Why it is plausible | Guard | Verdict |
| --- | --- | --- | --- | --- |
| Data loss or duplicate text during composition | IME commits twice, deletes the wrong span, or drops the final text | `beforeinput`, DOM `input`, React input, Android pending diffs, and repair can all observe the same user action | Kernel trace plus unit/browser proof around `runtime-input-events.ts:52`, `:79`, `:89`, and composition rows | keep, but any duplicate/drop blocks claim |
| Caret jump or wrong range import | Selection moves after composition, hidden boundaries, inline voids, or Android zero-width text | DOM range translation has browser and Android compatibility paths | Browser/device rows must cover `toSlatePoint`/`toSlateRange` paths and visible caret/model selection | keep, with exact environment gate |
| Wrong public API gets frozen | A device-specific hook solves one bug and becomes permanent raw Slate policy | Mobile/IME bugs are emotionally urgent and app authors want an escape hatch | No new public namespace; new primitive only after a routed red proof row proves existing hooks fail | keep, API additions require revision pass |
| False mobile closure | Synthetic mobile composition passes but Samsung Keyboard, Android Firefox, voice input, or iOS Chinese still fails | Existing tests explicitly label mobile synthetic proof | PR and ledger text must preserve `synthetic` labels and raw-device gates | keep, no exact mobile claim |
| React hot-path regression | Fix adds per-block listeners, broad subscriptions, or repeated DOM scans | Input bugs often tempt local event handlers near the failing node | Cohort, repeated-unit, listener, DOM, memory, and render-budget evidence before large/stress claims | revise execution acceptance |
| Collab/history nondeterminism | Composition or repair produces commits remote replay cannot reproduce | DOM-derived timing can leak into model writes | Commit metadata, deterministic replay, and collab/history tests gate any runtime fix | keep substrate, block adapter claims |
| Native behavior regression | Model-owned input breaks browser find, copy/paste, select-all, screen-reader traversal, undo/history, or follow-up typing | Faster modes and repair can steal browser ownership | Native-behavior matrix must travel with each implementation slice | revise execution acceptance |

Expanded proof plan:

| Proof tier | Required rows | Existing evidence | Gap before claim |
| --- | --- | --- | --- |
| Unit/runtime | input intent, internal-control classification, composing state, Android manager decisions, DOM bridge offsets, commit metadata, collab replay | `input-controller.ts:75`, `:121`, `:170`, `:230`, `:246`; `commit-metadata-contract.ts:18`, `:109`; `collab-history-runtime-contract.ts:30`, `:114`, `:155` | Add issue-specific red/characterization rows before a fix. |
| Browser integration | native beforeinput/input/composition, selection import/export, hidden boundaries, copy/paste, undo/history, internal controls | `rendering-strategy-runtime.test.ts:401`, `:431`; `dom-coverage-boundaries.test.ts:248` | Cross-browser rows for exact issue classes, not only generic IME. |
| Raw mobile / manual | Android/iOS, Samsung Keyboard, Android Firefox predictive typing, Gboard/autocorrect/voice, iOS Safari Chinese, Windows IME when relevant | `package.json:59`, `:60`, `:63` provide proof lanes | Real artifact required before exact device closure. |
| Stress/performance | normal/medium/large/stress cohorts, repeated top-level unit, listener/DOM/memory/render budgets | `generated-editing.test.ts:221`, `:947`, `:1020`; Section 14 pass-6 performance contract | Attach the budget to each implementation slice that claims large/stress safety. |
| Migration/adoption | deterministic operations, commit tags, local-only runtime targets, typed remote metadata, no adapter-shaped raw fields | `migration-backbone-contract.ts:33`, `:171`; `collab-history-runtime-contract.ts:30`, `:155` | Plate/yjs adapter fixtures remain later work. |
| Docs/examples/PR | proof labels, supported claim text, proof-harness docs, non-claim rows | Section 12 issue routing, Section 18 objection ledger, Section 24 handoff outline | Sync only after proof boundaries and revision decisions settle. |

Rollback / hard-cut / remediation answer:

- If a proof row fails with data loss, duplicate input, or caret corruption,
  stop the implementation slice and keep the issue `Related` / `Needs repro`;
  do not sync optimistic claim text.
- If the failure requires a broad public API, route it back through the revision
  pass before accepting it; do not ship a Mobile/IME namespace by drift.
- If synthetic proof passes but raw-device proof is missing, downgrade the claim
  to architecture confidence and keep exact device rows non-claims.
- If a performance row fails, split the fix into owner-local runtime work before
  any ledger promotion.
- If collab/history determinism fails, block adapter-facing migration language
  and keep the plan at substrate repair.

High-risk verdict:

- keep the shared input-runtime owner graph;
- revise execution acceptance criteria to require a failure-mode table per
  implementation slice;
- split work by proof-heavy issue families, not by broad Mobile/IME category;
- drop any exact issue claim whose proof tier does not match the report;
- next owner is closure score and final gates, using the synced pass-11 claim
  text instead of reopening broad review.

## 17. Hard Cuts And Rejected Alternatives

Hard cuts:

- no per-device closure without per-device proof;
- no legacy monolithic `Editable` restoration;
- no product input policy in raw Slate;
- no new public API until the issue pass proves existing hooks cannot carry the
  behavior;
- no "mobile" claim from viewport-only Playwright rows.
- no public command slots from this Mobile/IME plan;
- no current-version Plate or slate-yjs adapter promise from raw Slate;
- no issue-sync promotion before proof tier and claim text agree.

Rejected:

- broad browser special-case tables without kernel traces;
- core-only fixes for browser event timing;
- app-level workarounds as Slate v2 architecture;
- issue-number decoration in PR text without claim classification.

## 18. Slate Maintainer Objection Ledger

| Change / decision | Who feels pain | Likely objection | Steelman antithesis | Tradeoff | Answer | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Keep exact mobile closures gated on raw-device proof | Maintainers, users waiting on Android/iOS fixes | "This slows closure." | Desktop proof catches many bugs faster. | Some rows stay pending longer. | Better slow than dishonest. Mobile keyboard behavior is the bug. | `docs/research/decisions/slate-v2-post-closure-architecture-review.md:58` | keep |
| Keep product input policy out of raw Slate | App authors | "I need autocomplete/text-limit/slash command behavior." | Product hooks are useful. | Apps must compose behavior above Slate. | Raw Slate should expose safe runtime primitives; Plate can package product UX. | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:80` | keep |
| Use current runtime owner graph rather than restart architecture | Browser/runtime maintainers | "Existing runtime may still have holes." | A cleaner rewrite could be tempting. | We inherit current source constraints. | The live graph already matches the issue pressure; proof/accounting is weaker than architecture direction. | `runtime-root-engine.ts:136`, `runtime-event-engine.ts:162` | keep |
| Keep raw-device proof as the closure gate | Release maintainers | "Device proof is too slow for a plan with `44` long-form rows." | Synthetic mobile and desktop IME proof would let the team ship faster. | Real device rows need hardware, tooling, or lab work. | Synthetic rows can route architecture, but PR text must not claim Android/iOS/Samsung/Firefox Android/voice closure until raw-device or matching manual artifacts exist. | `../slate-v2/package.json:59`, `:60`, `:63`; `rendering-strategy-runtime.test.ts:477` | keep |
| Stop after proof-heavy batches instead of all `44` rows | Plan/execution maintainers | "The dossier will drown the implementation before code starts." | Full accounting up front sounds safer. | Some related rows stay matrix-only longer. | Batch the highest-proof rows first, then sync claim text. Long-form text without proof routes is theater. | Section 12 pass-3 routing matrix; Section 14 proof tiers | revise |
| Keep Android-specific ownership centralized | Browser/runtime maintainers | "The architecture already has Android special casing, so it is not clean." | A generic runtime with no platform owner sounds purer. | Android remains a named runtime owner. | The honest architecture has a small Android owner wired through the root runtime, not scattered public device APIs. | `../slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts:8`; `runtime-root-engine.ts:246` | keep |
| Reject a broad Mobile/IME public namespace | API maintainers, app authors | "Without a public namespace, authors cannot solve local input bugs." | More public hooks can feel more empowering. | Some app escape hatches stay lower-level. | Add a new primitive only when a routed issue proves `onDOMBeforeInput`, composing state, input rules, and internal-control classification cannot express the behavior. | Section 7 public API target; `input-router.ts:91`; `input-controller.ts:89` | keep |
| Require cohort plus repeated-unit performance evidence | Performance reviewers | "This is too much process for input bugs." | A targeted browser repro can catch the visible bug. | More evidence work before large/stress claims. | Input fixes can silently add repeated listeners, subscriptions, or DOM churn; large/stress claims need cohort, DOM/component/listener/memory, and native-behavior rows. | Section 14 pass-6 performance contract; `runtime-root-engine.ts:136`, `:188`, `:266` | revise |
| Keep Plate/yjs adapters out of raw Slate closure | Plate/yjs maintainers | "Migration talk without adapters is evasive." | Adapter fixtures would make adoption feel real. | Raw Slate cannot prove current Plate/yjs integration end-to-end from this plan. | This plan owns the substrate: `state` / `tx`, deterministic commits, local-only targets, commit metadata, and typed remote metadata. Adapter work is a later owner. | `migration-backbone-contract.ts:33`, `:171`; `collab-history-runtime-contract.ts:30`, `:155` | keep |
| Keep issue-sync after proof boundaries settle | Release maintainers | "Ledger sync should happen immediately so the plan looks current." | Early sync gives an audit trail sooner. | Sync waits until claim text is stable. | Pass 11 synced after high-risk/revision passes so the durable files do not encode claims that proof later downgrades. | Section 12 drift rows; Section 25 final gates | revise |
| Label synthetic mobile proof explicitly | PR reviewers | "A `mobile` test name will be read as real mobile proof." | Shorter labels are easier to scan. | More verbose proof labels and PR text. | Any viewport or synthetic event row must say `synthetic`; exact device language is reserved for raw-device/manual artifacts. | `rendering-strategy-runtime.test.ts:477`; Section 14 proof tiers | revise |
| Keep fork dossier private until claims are exact | Maintainers reading upstream PRs | "A giant fork-local dossier is not a substitute for upstream comments." | Upstream issue comments create visible accountability. | Less immediate upstream signaling. | The fork dossier is planning/accounting, not upstream comment spam. PR text should link exact claims and proof, not dump every related row. | Required artifacts in `slate-ralplan`; Section 24 handoff outline | keep |
| Stop the review loop after scheduled gates | User, execution owner | "This can become infinite planning." | More review can always find another caveat. | Remaining risk must be handled by proof during execution. | After high-risk, ecosystem, revision, issue-sync, and closure gates, hand to `ralph`; do not add more broad review passes unless a gate finds a concrete contradiction. | Section 19 pass schedule; Section 22 owners | revise |

Pass-7 revisions accepted:

- add a batching stop rule: proof-heavy rows first, not all `44` long-form rows
  before code;
- add a synthetic label stop rule: viewport/mobile-synthetic rows never become
  exact mobile claim text;
- add a performance claim stop rule: large/stress claims require cohort,
  repeated-unit, DOM/component/listener/memory, and native-behavior evidence;
- add an adapter ownership stop rule: Plate/yjs adapter proof is later work;
  this plan owns raw Slate substrate only;
- add a review-loop stop rule: finish the scheduled gates, then hand execution
  to `ralph` unless a concrete contradiction appears.

Status: complete for pass 7. No objection invalidated the shared input-runtime
owner model, but several objections tightened claim labels, batching, performance
proof, and adapter ownership.

## 19. Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | live source, issue ledgers, test proof, research pages | created this macro plan and set score `0.77` | all issue classifications pending | `clawsweeper` |
| 2. Related issue discovery | complete | gitcrawl doctor, frozen R7 extraction, live keyword sweep, existing matrix/dossier counts | score to `0.80`; added 149-row R7 family map and high-signal live row set | durable per-row matrix/dossier routing | `slate-ralplan` |
| 3. Issue-ledger pass | complete | 149-row routing, 44 long-form rows, 79 matrix-only rows, 3 matrix backfills, 4 drift rows | score to `0.84`; added durable routing table | durable file sync completed in pass 11 | `slate-ralplan` |
| 4. Intent/boundary and decision brief | complete | pass-3 routing pressure test, stop rules, decision locks | score to `0.87`; hardened intent, non-goals, decision boundaries, and decision brief | research/source evidence was routed to pass 5 | `slate-ralplan` |
| 5. Research/source refresh | complete | current source/test/proof-script refresh, compiled research refresh, representative issue dossier refresh | score to `0.89`; ecosystem table now has a pass-5 evidence ledger | exact device/browser artifacts still missing for claims | `slate-ralplan` |
| 6. Performance/DX/migration/regression/simplicity passes | complete | live runtime perf source, Vercel/performance rules, migration/collab/commit contracts, render-budget stress rows, simplicity review | score to `0.91`; added cohort/repeated-unit/native-behavior contract and migration proof boundaries | maintainer objection rows routed to pass 7 | `slate-ralplan` |
| 7. Maintainer objection ledger | complete | steelman rows for device proof, batching, public API, Android ownership, performance proof, adapter ownership, issue sync, synthetic labels, fork dossier, and review-loop stop | score to `0.92`; accepted revisions for batching, synthetic labels, performance evidence, adapter ownership, and scheduled-gate stop | high-risk proof failures routed to pass 8 | `high-risk-deliberate-pass` |
| 8. High-risk deliberate pass | complete | refreshed runtime/proof source owners, blast-radius table, seven-scenario pre-mortem, expanded proof plan, rollback/remediation rules | score stays `0.92`; regression and research dimensions strengthened; execution slices now require failure-mode tables | ecosystem adoption language routed to pass 9 | `slate-ralplan` |
| 9. Ecosystem maintainer pass | complete | extension author, Plate, slate-yjs/collab, React shell, release/PR, and product-plugin adoption rows | score to `0.93`; adoption language now says substrate/proof gates, not adapter completion or product policy | accepted revisions routed to pass 10 | `slate-ralplan` |
| 10. Revision pass | complete | consolidated accepted pass-7/pass-8/pass-9 revisions into the execution contract, decision locks, hard cuts, scorecard, and phase order | score to `0.94`; issue-sync now has one conservative claim contract | ledger/dossier/PR sync completed in pass 11 | `slate-ralplan` |
| 11. Issue sync accounting | complete | matrix backfills for `#5711`, `#3634`, `#4961`; dossier macro sync; live ledger and cluster sync notes; PR reference summary update | score to `0.95`; conservative claim text is durable across matrix, dossier, live ledgers, and PR reference | closure score/final gates only | `slate-ralplan` |
| 12. Closure score and final gates | complete | final gate reread, synced-file consistency check, pass ledger check, PR reference check, completion-check rerun | completion state set to `done`; plan ready for user review and later `ralph` execution planning | none for Ralplan | user review |
| 13. Cross-editor IME/mobile test mining | complete | local `../lexical` and `../prosemirror` IME/mobile source and tests | added stolen-test backlog for execution; score stays `0.95` | none for Ralplan; execution must translate missing rows before claiming fixes | user review |

## 20. Plan Deltas From Review

Added in pass 1:

- created Mobile/IME macro Ralplan instead of reusing only the existing
  `v2-input-runtime` bucket plan;
- explicitly inherited the live input-runtime owner graph;
- separated architecture coverage from exact issue closure;
- set initial score to `0.77`;
- set ClawSweeper as next owner.

Dropped in pass 1:

- no implementation changes;
- no fixed issue claims;
- no PR-reference edits;
- no live-ledger status changes.

No-change defense:

- current public composition API stays unchanged because no pass-1 through
  pass-6 evidence proves it is too weak.

Added in pass 2:

- completed ClawSweeper-style related discovery for the Mobile/IME/input runtime
  surface;
- recorded `gitcrawl doctor` freshness and the local live keyword candidate
  count;
- extracted the frozen R7 input-runtime set: `149` rows, all
  `cluster-synced`;
- mapped primary, two-row, and one-row R7 families;
- found existing ledger coverage: `28` input-runtime matrix rows and `26`
  dossier sections;
- raised score to `0.80`.

Dropped in pass 2:

- no implementation changes;
- no fixed issue claims;
- no live-ledger status changes;
- no new dossier sections until the issue-ledger pass decides which rows need
  them.

Added in pass 3:

- routed all `149` frozen R7 input-runtime rows;
- decided `44` missing-dossier rows need long-form dossier/proof-route sections;
- decided `59` rows stay matrix-only future proof rows;
- decided `20` rows stay matrix-only non-claim rows;
- found `3` existing dossier rows that need matrix backfill;
- found `4` matrix/dossier claim-level drift rows;
- raised score to `0.84`.

Dropped in pass 3:

- no implementation changes;
- no new exact `Fixes` or `Improves` claims;
- no immediate file sync for matrix/dossier/PR reference because this pass only
  owns routing, not the later issue-sync accounting pass.

Added in pass 4:

- hardened the intent/boundary record against the pass-3 routing;
- made the `44` long-form rows proof-route backlog, not claim backlog;
- made the `20` matrix-only non-claim rows explicit non-execution pressure;
- added stop rules for drift rows, synthetic mobile proof, device proof, and
  product-policy leakage;
- added decision locks for public API, dossier batching, drift handling, device
  proof, and implementation timing;
- raised score to `0.87`.

Dropped in pass 4:

- no implementation changes;
- no dossier, matrix, live-ledger, or PR-reference sync;
- no user question because the repo evidence is enough to continue.

Added in pass 5:

- re-read current Slate v2 source owners for root runtime, event runtime, input
  controller, composition runtime, Android runtime, native input listeners, and
  `slate-dom` composing/Android offset handling;
- re-read current browser/unit/stress proof rows and confirmed the mobile proof
  split between synthetic composition, touch usability, and raw-device gates;
- rechecked compiled ProseMirror, Lexical, Tiptap, EditContext/IME, and editing
  recovery research and kept the current runtime owner model;
- tied representative issue dossiers and public test rows back to the `44`
  long-form proof backlog;
- raised score to `0.89`.

Dropped in pass 5:

- no implementation changes;
- no research-layer write, because the compiled research already answered the
  architecture question for this pass;
- no dossier, matrix, live-ledger, or PR-reference sync;
- no fixed/improved claim promotion from source evidence alone.

Added in pass 6:

- applied Vercel React, performance, performance-oracle, tdd,
  regression-lock, and simplicity lenses to the refreshed owner/proof map;
- added cohort, repeated-unit, React runtime, render-budget, native-behavior,
  degradation, and migration contracts;
- confirmed Plate/yjs migration pressure is substrate-level through
  `state` / `tx` namespaces, deterministic operation replay, commit metadata,
  and local-only runtime targets;
- locked the test strategy to vertical issue/proof rows rather than bulk-writing
  all `44` long-form rows;
- raised score to `0.91`.

Dropped in pass 6:

- no implementation changes;
- no new Mobile/IME public namespace;
- no virtualization or shell mode as default proof for Mobile/IME correctness;
- no current-version Plate/yjs adapter promise from raw Slate;
- no fixed/improved claim promotion from performance or migration evidence.

Added in pass 7:

- expanded the maintainer objection ledger from `3` seed rows to `13` reviewed
  decisions;
- kept the shared input-runtime owner model after fair objections;
- accepted revisions for proof-heavy batching, synthetic mobile labels,
  performance evidence, adapter ownership, issue-sync ordering, and scheduled
  review-loop stop;
- raised score to `0.92`.

Dropped in pass 7:

- no exact Mobile/IME issue promotion from objection review;
- no new public Mobile/IME namespace;
- no upstream issue-comment plan from the fork dossier;
- no extra broad review pass beyond the scheduled gates.

Added in pass 8:

- refreshed current high-risk owners in `../slate-v2` source and proof files;
- expanded the high-risk section into trigger, blast radius, seven-scenario
  pre-mortem, proof-tier table, rollback/remediation answer, and keep/revise
  verdict;
- added execution acceptance rules for data loss, selection corruption, public
  API lock-in, false mobile claims, React hot-path regression, collab/history
  nondeterminism, and native behavior regression;
- strengthened regression-proof and research-evidence score dimensions while
  keeping total score at `0.92`.

Dropped in pass 8:

- no exact Mobile/IME issue promotion from high-risk review;
- no implementation changes;
- no device/browser claim from synthetic proof;
- no adapter-shaped migration promise from raw Slate.

Added in pass 9:

- added ecosystem maintainer rows for raw Slate extension authors, Plate,
  slate-yjs/collab, React shell authors, release/PR reviewers, and product
  plugin authors;
- locked adoption language to substrate and proof gates rather than current
  Plate/yjs adapter completion;
- confirmed raw Slate offers typed `state` / `tx` groups, runtime registration,
  commit listeners, commit metadata, selector hooks, and composition primitives
  without public command slots or Mobile/IME product policy;
- raised score to `0.93`.

Dropped in pass 9:

- no new public command slots;
- no raw Slate Mobile/IME product namespace;
- no current-version Plate or slate-yjs adapter promise;
- no exact issue claim promotion from ecosystem wording.

Added in pass 10:

- consolidated pass-7, pass-8, and pass-9 accepted revisions into one execution
  contract for issue-sync text;
- updated decision locks, hard cuts, scorecard, phase order, and open questions
  so the next pass can write durable claim rows without reopening review;
- raised score to `0.94`.

Dropped in pass 10:

- no new issue discovery;
- no implementation changes;
- no ledger/dossier/PR-reference sync yet;
- no exact `Fixes` or `Improves` claim promotion from revision cleanup.

Added in pass 11:

- updated the issue coverage matrix with related backfill rows for `#5711`,
  `#3634`, and `#4961`;
- added a Mobile/IME macro planning sync table to the issue coverage matrix;
- appended a Mobile/IME macro sync section to the fork issue dossier;
- aligned stale dossier statuses for `#6022`, `#5983`, `#5183`, and `#5088`
  down to `related`;
- added V2 sync notes to the live gitcrawl ledger and gitcrawl cluster file;
- updated the PR reference with matrix row count, Mobile/IME macro counts, and
  `0` new exact fixed/improved Mobile/IME claims;
- raised score to `0.95`.

Dropped in pass 11:

- no implementation changes;
- no new exact `Fixes #...` or `Improves #...` claims;
- no all-at-once expansion of `44` proof-backlog rows into fake closure text;
- no raw-device or browser claim without matching proof.

Added in pass 12:

- re-read the completion file, continuation prompt, final gates, scorecard,
  pass-state ledger, PR reference, and synced issue artifacts;
- found no contradiction between the conservative issue-sync text and final
  gates;
- updated stale plan wording from the previous next owner to the final review /
  later `ralph` owner;
- marked the closure pass complete.

Dropped in pass 12:

- no implementation changes;
- no new review pass;
- no Mobile/IME issue claim promotion from closure.

Added in pass 13:

- read local `../lexical` IME/mobile composition E2E, history, Safari
  regression, Android/iOS timing, autocorrect, and Korean backspace evidence;
- read local `../prosemirror` transaction metadata, DOM-change, composition
  viewdesc, and DOM-change webtest evidence;
- compared that evidence to current `../slate-v2` composition proof and added a
  stolen-test execution backlog for missing rows.

Dropped in pass 13:

- no implementation changes;
- no new exact claim promotion;
- no claim that ProseMirror/Lexical architecture should be copied wholesale.

## 21. Open Questions And What Would Change The Decision

Open questions:

- Which of the `44` long-form rows can be closed with existing browser/unit
  proof after exact repro mapping, and which need new raw-device proof?
- Which of the `4` drift rows should be promoted in a later execution batch if
  exact proof appears?
- Which issue classes need raw Android/iOS proof versus generated browser proof?
- Does any issue require a new narrow public API, or can runtime/proof hardening
  handle it internally?
- Which proof-heavy batch should `ralph` execute first after user acceptance?

What would change the decision:

- a future execution batch finds a concrete contradiction between routed issue
  rows, proof tiers, conservative claim text, and runtime behavior;
- live source shows a current owner different from the runtime graph captured in
  pass 1 and refreshed in pass 5, pass 6, and pass 8;
- raw-device proof exposes a runtime architecture fault that cannot be handled
  by the current input controller / Android manager / DOM bridge split.

## 22. Implementation Phases With Owners

No implementation starts from this pass.

Draft phase order after plan closure:

1. User review of this Ralplan.
2. `ralph` execution planning after acceptance.
3. Proof inventory, missing red/proof rows, runtime fixes
   only where proof fails, then ledger/PR sync.

Owners:

- plan owner: `slate-ralplan`;
- issue discovery owner: `clawsweeper` for pass 2, complete;
- execution owner after user approval: later `ralph` continuation;
- implementation owner after plan acceptance: `slate-react-v2` and
  `slate-dom-v2` packages in `../slate-v2`.

## 23. Fast Driver Gates

Use focused gates after implementation slices, not during this planning pass:

```bash
cd /Users/zbeyens/git/slate-v2
bun test ./packages/slate-dom/test/dom-coverage.ts
bun test:stress
bun test:integration-local --project=chromium --grep "composition|IME|input"
bun test:mobile-device-proof
```

Closure gates may require:

```bash
cd /Users/zbeyens/git/slate-v2
bun check
bun check:full
bun test:mobile-device-proof:raw
```

Use `bun test:mobile-device-proof:raw` only on a machine/device lane that can
provide real Android/iOS artifacts.

## 24. Final User-Review Handoff

Accepted runtime owner model:

- Keep Slate v2's shared `slate-react` input runtime plus `slate-dom` bridge as
  the owner for Mobile/IME/input behavior.
- Keep Android-specific ownership centralized in `runtime-android-engine.ts`
  through the root runtime.
- Keep composition state, native listeners, selection import/export, repair,
  kernel traces, commit metadata, and selector hooks as primitives.

Public API:

- Kept: existing primitive runtime hooks and typed `state` / `tx` extension
  groups.
- Cut/rejected: broad public command slots, a raw Slate Mobile/IME product
  namespace, current-version Plate/yjs adapter promises, and product input
  policy in raw Slate.
- Added by this plan: no implementation API; this is planning/review only.

Issue accounting:

- Fixed Mobile/IME claims from this macro plan: `0`.
- Improved Mobile/IME claims from this macro plan: `0`.
- Frozen R7 input-runtime rows reviewed: `149`.
- Existing matrix/dossier anchors: `23`.
- Matrix backfills completed: `3` (`#5711`, `#3634`, `#4961`).
- Long-form proof-route backlog: `44`.
- Matrix-only future-proof rows: `59`.
- Matrix-only non-claim rows: `20`.
- Drift rows aligned down to `related`: `4` (`#6022`, `#5983`, `#5183`,
  `#5088`).

Proof gates:

- Unit/runtime proof can guard primitives.
- Browser proof is required for browser-specific closure.
- Synthetic mobile proof stays architecture confidence only.
- Raw-device or matching manual artifacts are required for Android/iOS/Samsung
  Keyboard/Firefox Android/voice input/Windows IME closure.
- Performance claims need cohort, repeated-unit, listener, DOM/component,
  memory, and native-behavior evidence.

Synced artifacts:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- `docs/slate-issues/gitcrawl-live-open-ledger.md`.
- `docs/slate-issues/gitcrawl-clusters.md`.
- `docs/slate-v2/references/pr-description.md`.

Implementation handoff:

- After user acceptance, run `ralph`.
- Before changing runtime code for a Mobile/IME issue, check whether the
  matching Lexical/ProseMirror stolen-test row above is missing in Slate v2; add
  or translate that proof first when the route exists.
- Execute proof-heavy batches first; do not bulk-write all `44` long-form rows
  before code.
- Fix runtime only where proof fails.
- Sync ledgers and PR text after each proof-backed execution slice.

## 25. Final Completion Gates

Slate Ralplan closure status: `done`.

Closure gate results:

- total score is at least `0.92`: pass, score `0.95`;
- no dimension is below `0.85`: pass, lowest dimension `0.92`;
- full issue-ledger pass is complete: pass;
- live gitcrawl ledger sync is complete for touched rows/clusters: pass, macro
  sync note appended;
- fork issue dossier sync is complete for reviewed rows: pass, macro section
  appended and four stale statuses aligned down;
- issue coverage matrix and PR reference are updated or explicitly unchanged:
  pass;
- ecosystem synthesis is complete: pass;
- high-risk deliberate mode is complete: pass;
- implementation-skill review matrix is complete: pass;
- all scheduled pass rows are complete: pass, including the user-requested
  cross-editor IME/mobile test-mining addendum;
- no exact Mobile/IME issue is claimed without matching proof: pass.

## 26. Ralph Execution State

Status: `pending`.

Activation:

- `ralph` accepted the completed Slate Ralplan for execution on
  2026-05-07T12:45:37+08:00.
- Completion state moved back to `pending` because runnable proof and execution
  backlog remains.
- Current slice: `slice-57-mobile-ime-next-proof-route-selection`.

Slice 1 owner:

- `../slate-v2/playwright/integration/examples/mentions.test.ts`.
- `../slate-v2/packages/slate-browser/src/playwright/ime.ts` only if the
  existing IME helper cannot express the translated Lexical row.

Slice 1 target:

- Add one browser proof row translated from Lexical's staged CDP IME tests:
  compose Japanese text next to a markable inline mention and assert model text,
  selection, and kernel trace ownership.
- Keep this as proof/characterization first. Runtime code changes are allowed
  only if the new proof exposes a real failure.

Slice 1 claim policy:

- No exact `Fixes #...` or `Improves #...` claim from this slice by default.
- Related pressure rows: inline-boundary IME (`#4693`, `#4136`) and broader
  Mobile/IME proof backlog.
- Keep synthetic/mobile labels honest; desktop Chromium IME proof is not Android
  or iOS proof.

Slice 1 required evidence:

- Focused Playwright row for the mentions example, ideally Chromium first.
- If the proof changes maintainer-facing claim text, sync
  `docs/slate-v2/references/pr-description.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-issues/gitcrawl-live-open-ledger.md`, and
  `docs/slate-issues/gitcrawl-clusters.md`.
- If no claim text changes, record `reference docs: no change` here with the
  reason.

Slice 1 result:

- Added `commits staged IME composition before a markable inline mention` to
  `../slate-v2/playwright/integration/examples/mentions.test.ts`.
- The row translates Lexical's CDP staged IME pattern into Slate v2's mentions
  example and asserts inserted model text, preserved inline mention, final
  selection, and allowed `compositionend` kernel trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is new proof coverage and does not
  promote any `Fixes #...` or `Improves #...` claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "commits staged IME composition before a markable inline mention"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/mentions.test.ts`.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because more Mobile/IME proof batches remain.

Next slice:

- `slice-2-lexical-ime-history-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate Lexical's IME history grouping rows so composed text forms
  the right undo group and canceled composition does not enter history.

Slice 2 result:

- Added `undoes committed IME composition as one history step` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates Lexical's IME history proof into Slate v2's runtime
  example: staged native composition commits text, one undo removes the
  committed text, selection returns to the original caret, and `compositionend`
  remains an allowed kernel transition.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not promote
  any `Fixes #...` or `Improves #...` claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "undoes committed IME composition as one history step"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 3 is still runnable.

Next slice:

- `slice-3-lexical-ime-cancel-history-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate Lexical's canceled-composition history row so canceled
  composition does not enter undo history.

Slice 3 result:

- Added `does not push canceled IME composition onto history` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Added local `cancelNativeComposition` CDP helper because the shared
  `editor.ime.compose` helper only expresses committed composition.
- Initial proof attempt used `a` as a sentinel and failed because the full model
  text already contains `a`; corrected the sentinel to `!` and reran the same
  focused proof.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not promote
  any `Fixes #...` or `Improves #...` claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "does not push canceled IME composition onto history"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 4 is still runnable.

Next slice:

- `slice-4-lexical-safari-ime-delete-selection-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`
  or a narrower WebKit/Safari-capable example test.
- Target: translate Lexical regression `8153-safari-ime-delete-selection` so a
  selection can be deleted after composition ends without extra deletion or
  stale selection behavior.

Slice 4 result:

- Added `deletes shell-backed selection after WebKit compositionend` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Added local `dispatchCompositionEnd` helper to mirror Lexical regression
  `8153-safari-ime-delete-selection`: WebKit fires `compositionend`, browser
  select-all creates shell-backed selection, then Backspace deletes the selected
  content and leaves a collapsed Slate selection at the document start.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not promote
  any `Fixes #...` or `Improves #...` claim.
- Focused WebKit proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=webkit --grep "deletes shell-backed selection after WebKit compositionend"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 5 is still runnable.

Next slice:

- `slice-5-prosemirror-dom-change-markup-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/richtext.test.ts` or a narrower
  low-level Slate DOM/browser test.
- Target: translate ProseMirror DOM-change tests for text deletion/typing inside
  markup and active text-node preservation.

Slice 5 result:

- Added `syncs browser text mutations inside bold markup` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row translates ProseMirror's markup DOM-change rows into Slate's browser
  contract: typing inside bold `rich` produces `riZch`, preserves the bold
  markup, advances Slate selection inside the marked text, then Backspace
  returns to `rich` with selection restored.
- Initial proof tried to require ProseMirror-style same text-node identity and
  failed. That exact mechanism is not Slate's contract for marked input; the
  final row keeps the behavior proof and rejects text-node identity as a
  required invariant here.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not promote
  any `Fixes #...` or `Improves #...` claim.
- Focused proof passed after narrowing the invariant:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 6 is still runnable.

Next slice:

- `slice-6-prosemirror-ambiguous-replacement-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- Target: translate ProseMirror's ambiguous text replacement row around marked
  text, proving typed-over text lands in the intended marked node instead of
  duplicating adjacent content.

Slice 6 result:

- Added `resolves ambiguous browser insertion at a mark boundary` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row translates ProseMirror's ambiguous replacement pressure into Slate's
  marked-boundary contract: inserting a space at the end of bold `rich` before
  the adjacent unmarked space keeps the inserted character inside the bold leaf,
  advances selection inside that marked leaf, and Backspace restores the
  original marked text.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not promote
  any `Fixes #...` or `Improves #...` claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "resolves ambiguous browser insertion at a mark boundary"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 7 is still runnable.

Next slice:

- `slice-7-lexical-ios-autocorrect-plain-text-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/richtext.test.ts` or a narrower
  clipboard/native-input test.
- Target: translate Lexical's iOS word prediction/autocorrect plain-text row so
  identical `text/html` and `text/plain` prediction payloads do not inject HTML
  or break selection formatting.

Slice 7 result:

- Added `treats iOS prediction payload as plain text inside formatted selection`
  to `../slate-v2/playwright/integration/examples/paste-html.test.ts`.
- Updated `../slate-v2/site/examples/ts/paste-html.tsx` so the HTML-paste
  example detects real identical `text/html` + `text/plain` payloads and routes
  them through text insertion, preserving current selection formatting instead
  of parsing plain prediction text as an HTML fragment.
- The guard checks the actual `text/plain` data type before comparing payloads,
  so HTML-only paste events still use the rich HTML path.
- Initial proof failed with
  `TypeError: Cannot read properties of undefined (reading 'length')`, proving
  the old handler misrouted the prediction-shaped payload.
- Runtime code changes: paste-html example extension only; core runtime
  unchanged.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and example
  behavior, not an exact Mobile/IME issue closure.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/paste-html.test.ts --project=chromium --grep "treats iOS prediction payload as plain text inside formatted selection"`.
- Regression proof for the rich HTML path also passed:
  `bun playwright test playwright/integration/examples/paste-html.test.ts --project=chromium --grep "pasted bold text uses|treats iOS prediction payload"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/paste-html.test.ts site/examples/ts/paste-html.tsx`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 8 is still runnable.

Next slice:

- `slice-8-prosemirror-composition-commit-metadata-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`
  or the narrowest existing commit/kernel metadata contract.
- Target: translate ProseMirror's composition transaction metadata pressure into
  a Slate v2 proof that composition commits carry explicit runtime metadata /
  trace ownership without promoting exact Android/iOS claims.

Slice 8 result:

- Added `records runtime metadata for committed IME composition` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's composition transaction metadata pressure
  into Slate v2's runtime proof shape: native Chromium IME composition must
  produce explicit `compositionstart`, `compositionupdate`, and
  `compositionend` kernel trace entries with `intent: composition`,
  `ownership: native-allowed`, `nativeAllowed: true`, editor target ownership,
  frame IDs, and allowed transitions.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not promote
  any `Fixes #...` or `Improves #...` claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "records runtime metadata for committed IME composition"`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.

Next slice:

- `slice-9-prosemirror-android-virtual-keyboard-fallback-proof`.
- Candidate owner:
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`,
  `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts`, or the
  narrowest existing Android input-manager contract.
- Target: translate ProseMirror's Android virtual-keyboard fallback pressure
  into a unit/browser-contract proof for Android `insertReplacementText` /
  `deleteContentBackward` routing through the centralized Android/input runtime.
  This is architecture proof only, not exact Android device closure.

Slice 9 result:

- Added Android-style replacement/backspace beforeinput coverage to
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.
- The row translates ProseMirror's Android virtual-keyboard fallback pressure
  into Slate v2's model-owned input contract: `insertReplacementText` replaces
  the current selection through the beforeinput command path, and
  `deleteContentBackward` routes through a model-owned delete with explicit
  caret repair.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is architecture proof and does not
  promote any exact Android device claim.
- Initial `bun test packages/slate-react/test/model-input-strategy-contract.test.ts`
  attempt was the wrong runner because root Bun ignores `*.test.*`; the package
  Vitest runner is the correct focused gate.
- Focused proof passed:
  `bun test:vitest test/model-input-strategy-contract.test.ts` from
  `../slate-v2/packages/slate-react`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/test/model-input-strategy-contract.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 10 is still runnable.

Next slice:

- `slice-10-lexical-ime-formatting-boundary-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- Target: translate Lexical's staged CDP IME formatting-boundary rows so native
  composition inside marked text preserves the mark, advances selection inside
  the marked leaf, and records composition trace ownership without exact mobile
  device closure.

Slice 10 result:

- Added `commits IME composition inside bold markup` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row translates ProseMirror's `handles composition inside marks` pressure
  into Slate's marked-text contract: DOM composition inside bold `rich` at
  offset 2 produces `riすしch`, preserves the bold mark, advances selection
  inside the marked leaf, records composition trace ownership, and two
  Backspaces restore the original marked text and caret.
- The initial native CDP proof failed when both model selection and DOM
  selection inserted at the end of the bold leaf (`richすし`) instead of inside
  the marked text. A follow-up `replacementStart` / `replacementEnd` experiment
  also failed by targeting the wrong document offset. That route is not an
  honest proof for mid-mark composition in this harness.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not
  promote any exact Mobile/IME issue claim or native-CDP/mobile-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition inside bold markup" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 11 is still runnable.
- ce-compound note added:
  `docs/solutions/developer-experience/2026-05-07-slate-browser-ime-proof-rows-need-honest-dom-composition.md`.

Next slice:

- `slice-11-prosemirror-ime-decoration-boundary-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`.
- Target: translate ProseMirror's composition-with-decorations rows so IME
  composition inside decorated/highlighted text is not interrupted or
  overwritten by decoration rendering. This is browser proof only, not exact
  Android/iOS device closure.

Slice 11 result:

- Added `commits IME composition inside decorated text` to
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`.
- The row translates ProseMirror's composition-with-decorations pressure into
  Slate's highlighted-text contract: DOM composition inside decorated `lph`
  inserts `すし` at the selected offset, preserves `data-tone="warm"`,
  advances selection after the committed text, records allowed composition trace
  ownership, and two Backspaces restore the original text and caret.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not
  promote any exact Mobile/IME issue claim or native-CDP/mobile-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "commits IME composition inside decorated text" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/highlighted-text.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 12 is still runnable.

Next slice:

- `slice-12-prosemirror-ime-spanning-nodes-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts` or the
  narrowest existing browser example that exposes adjacent decorated text
  nodes.
- Target: translate ProseMirror's composition-spanning-multiple-nodes row so a
  browser-owned composition that crosses adjacent decorated DOM nodes imports
  the final text without overwriting nearby rendered decoration content. This is
  browser proof only, not exact Android/iOS device closure.

Slice 12 result:

- Added `commits IME composition spanning decorated text nodes` to
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`.
- Factored the local DOM composition helper in the highlighted-text suite so the
  inside-decoration and spanning-decoration rows share the same event/mutation
  proof shape.
- The first proof failed with visible duplicate DOM text:
  expected `alすしbeta`, received `alすしすしbeta`.
- Debug evidence showed the Slate model was already correct at `alすしbeta`;
  the duplicate was a stale unmanaged browser text node outside
  `[data-slate-string="true"]` in the projected text host.
- Fixed `../slate-v2/packages/slate-react/src/editable/composition-state.ts` so
  the Chrome composition-end fallback removes unmanaged composition text nodes
  after writing the committed text into the model.
- Runtime code changes: Chrome composition fallback DOM cleanup for unmanaged
  text outside Slate string wrappers.
- Issue claims changed: none.
- Reference docs: no change, because this is proof/runtime coverage and does
  not promote any exact Mobile/IME issue claim or native-CDP/mobile-device
  claim.
- Focused proof passed after the runtime fix:
  `bun playwright test playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "commits IME composition spanning decorated text nodes" --retries=0`.
- Adjacent decorated IME regression proof passed:
  `bun playwright test playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "commits IME composition inside decorated text|commits IME composition spanning decorated text nodes" --retries=0`.
- Existing richtext mid-mark IME regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition inside bold markup" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts playwright/integration/examples/highlighted-text.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound note added:
  `docs/solutions/ui-bugs/2026-05-07-slate-react-chrome-composition-fallback-must-clean-unmanaged-projection-dom-text.md`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 13 is still runnable.

Next slice:

- `slice-13-prosemirror-ime-widget-adjacent-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/mentions.test.ts` or the
  narrowest existing inline-void/widget browser example.
- Target: translate ProseMirror's `doesn't overwrite widgets next to the
  composition` row so IME composition next to an inline widget/void preserves
  the widget and committed text without exact Android/iOS device closure.

Slice 13 result:

- Added `commits IME composition between inline mentions without overwriting
  them` to `../slate-v2/playwright/integration/examples/mentions.test.ts`.
- The row translates ProseMirror's widget-adjacent composition pressure into
  Slate's markable-inline mention contract: DOM composition inside the text
  node between two inline mentions commits `すし`, preserves both mention
  widgets, advances selection in the text node, and records allowed composition
  trace ownership.
- Initial native CDP proof failed honestly: it committed at the end of the
  between-mentions text (`or すし!`) instead of the selected offset. The row was
  switched to the DOM-composition proof shape instead of treating CDP offsets as
  equivalent.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not
  promote any exact Mobile/IME issue claim or native-CDP/mobile-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "commits IME composition between inline mentions without overwriting them" --retries=0`.
- Existing mention IME regression proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "commits staged IME composition before a markable inline mention|commits IME composition between inline mentions without overwriting them" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/mentions.test.ts packages/slate-react/src/editable/composition-state.ts playwright/integration/examples/highlighted-text.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; the CDP-offset limitation is already covered
  by the slice-10 DOM composition proof note, and this slice added no distinct
  reusable runtime lesson.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 14 is still runnable.

Next slice:

- `slice-14-prosemirror-ime-overlap-cancel-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`
  or the narrowest existing browser/runtime test that can apply a model change
  during composition.
- Target: translate ProseMirror's composition-cancel rows for overlapping model
  changes so Slate does not duplicate, lose, or over-claim composition text when
  a model change overlaps the active composition range. This is browser proof
  only, not exact Android/iOS device closure.

Slice 14 result:

- Added `drops active IME composition when a model change overlaps it` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's `cancels composition when a change fully
  overlaps with it` pressure into Slate's input-runtime contract: a real DOM
  composition starts inside `default block 1`, a model-owned replacement
  overlaps that active composition range, and the later `compositionend` must
  not append stale committed composition text.
- The first proof failed with `---すし`, proving Chrome's composition-end
  fallback still wrote the stale composition payload after the overlapping
  model change had already replaced the range.
- Fixed `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
  and `../slate-v2/packages/slate-react/src/editable/runtime-composition-events.ts`
  so the Chrome composition-end fallback skips model insertion when the active
  composition has been superseded by a model-owned command, while still cleaning
  unmanaged composition DOM text.
- A too-tight first fix skipped legitimate DOM-current composition updates and
  broke the spanning decorated text row by producing `albeta`; narrowed the
  cancellation test to the actual model-owned command signal.
- Runtime code changes: Chrome composition fallback cancellation for
  model-owned overlap, plus the event runtime now passes `inputController` to
  composition-end handling.
- Issue claims changed: none.
- Reference docs: no change, because this is proof/runtime coverage and does
  not promote any exact Mobile/IME issue claim or native-CDP/mobile-device
  claim.
- Focused proof passed after the runtime fix:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "drops active IME composition when a model change overlaps it" --retries=0`.
- Existing rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through the browser editing path|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it" --retries=0`.
- Existing richtext mid-mark IME regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition inside bold markup" --retries=0`.
- Existing decorated IME regression proof passed:
  `bun playwright test playwright/integration/examples/highlighted-text.test.ts --project=chromium --grep "commits IME composition inside decorated text|commits IME composition spanning decorated text nodes" --retries=0`.
- Existing mention IME regression proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "commits staged IME composition before a markable inline mention|commits IME composition between inline mentions without overwriting them" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/runtime-composition-events.ts playwright/integration/examples/rendering-strategy-runtime.test.ts playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/mentions.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound note added:
  `docs/solutions/ui-bugs/2026-05-07-slate-react-chrome-composition-fallback-must-cancel-model-owned-overlap.md`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 15 is still runnable.

Next slice:

- `slice-15-prosemirror-ime-non-overlap-change-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate ProseMirror's `doesn't cancel composition when a change
  happens elsewhere` row so a non-overlapping model change during composition
  does not cancel, duplicate, or misplace the committed composition text. This
  is browser proof only, not exact Android/iOS device closure.

Slice 15 result:

- Added `keeps active IME composition when a model change happens elsewhere` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's `doesn't cancel composition when a change
  happens elsewhere` pressure into Slate's runtime contract: a real DOM
  composition starts inside `default block 1`, a non-overlapping model operation
  inserts `!` into `default block 2`, and `compositionend` still commits `すし`
  at the original composition point.
- Runtime code changes: none for this slice; it verifies that the slice-14
  `model-owned` cancellation guard does not over-cancel non-overlapping model
  operations.
- Issue claims changed: none.
- Reference docs: no change, because this is proof/runtime coverage and does
  not promote any exact Mobile/IME issue claim or native-CDP/mobile-device
  claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "keeps active IME composition when a model change happens elsewhere" --retries=0`.
- Existing rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through the browser editing path|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|keeps active IME composition when a model change happens elsewhere" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/runtime-composition-events.ts playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Post-lint focused overlap/non-overlap proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "drops active IME composition when a model change overlaps it|keeps active IME composition when a model change happens elsewhere" --retries=0`.
- ce-compound evaluation: skipped; slice 15 adds a guardrail proof for the
  slice-14 runtime lesson and does not add a distinct reusable fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 16 is still runnable.

Next slice:

- `slice-16-prosemirror-ime-partial-overlap-cancel-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate ProseMirror's partial-overlap / inside-composition cancel
  rows so a model-owned change that intersects only part of the active
  composition still cancels the stale Chrome compositionend payload without
  exact Android/iOS device closure.

Slice 16 result:

- Added `drops active IME composition when a model change partially overlaps it`
  to `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's partial-overlap composition-cancel pressure:
  a real DOM composition starts inside `default block 1`, a nearby model-owned
  replacement intersects only part of the active composition neighborhood, and
  the later `compositionend` must not append stale `すし`.
- The first draft used an expanded DOM composition selection; Slate correctly
  deleted that range on `compositionstart`, so the row was tightened to a
  collapsed composition point plus a partial model-owned replacement.
- Runtime code changes: none for this slice; it verifies that the slice-14
  fallback cancellation handles narrower overlap pressure.
- Issue claims changed: none.
- Reference docs: no change, because this is proof/runtime coverage and does
  not promote any exact Mobile/IME issue claim or native-CDP/mobile-device
  claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "drops active IME composition when a model change partially overlaps it" --retries=0`.
- Focused overlap/non-overlap contract proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|keeps active IME composition when a model change happens elsewhere" --retries=0`.
- Existing rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through the browser editing path|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|keeps active IME composition when a model change happens elsewhere" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/runtime-composition-events.ts playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; slice 16 extends the slice-14 fallback
  cancellation lesson and does not add a distinct reusable fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 17 is still runnable.

Next slice:

- `slice-17-prosemirror-ime-inside-change-cancel-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate ProseMirror's `cancels composition when a change happens
  inside of it` row so an inside-range model-owned change cancels the stale
  Chrome compositionend payload without exact Android/iOS device closure.

Slice 17 result:

- Added `drops active IME composition when a model change happens at its
  insertion point` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's inside-composition cancel pressure into a
  Slate runtime row: a real DOM composition starts at the `default block 1`
  insertion point, a model-owned insert happens at that same point, and the
  later `compositionend` must not append stale `すし`.
- Runtime code changes: none for this slice; it verifies that the slice-14
  fallback cancellation also covers collapsed inside-point model changes.
- Issue claims changed: none.
- Reference docs: no change, because this is proof/runtime coverage and does
  not promote any exact Mobile/IME issue claim or native-CDP/mobile-device
  claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "drops active IME composition when a model change happens at its insertion point" --retries=0`.
- Focused overlap/non-overlap contract proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere" --retries=0`.
- Existing rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through the browser editing path|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/runtime-composition-events.ts playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; slice 17 extends the slice-14 fallback
  cancellation lesson and does not add a distinct reusable fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 18 is still runnable.

Next slice:

- `slice-18-prosemirror-ime-rapid-following-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate ProseMirror's `handles compositions rapidly following each
  other` row so two back-to-back DOM compositions in separate text blocks commit
  without stale composing state, text loss, or caret drift. This is browser
  proof only, not exact Android/iOS device closure.

Slice 18 result:

- Added `commits rapidly following IME compositions in separate text blocks` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's rapidly-following composition pressure into
  Slate's runtime contract: native Chromium IME composition commits at the end
  of `default block 1`, immediately followed by another native composition at
  the end of `default block 2`, with both model text and final caret preserved.
- The first assertion expected all six blocks from `assert.blockTexts`; the
  harness only reports the mounted visible block list for this surface, so the
  row now asserts the two visible edited blocks and separately checks model text
  still contains `default block 6`.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not
  promote any exact Mobile/IME issue claim or native-CDP/mobile-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits rapidly following IME compositions in separate text blocks" --retries=0`.
- Existing rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through the browser editing path|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/runtime-composition-events.ts playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; slice 18 adds proof coverage but no distinct
  reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 19 is still runnable.

Next slice:

- `slice-19-prosemirror-ime-cross-paragraph-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- Target: translate ProseMirror's `can handle cross-paragraph compositions` row
  into a Slate browser proof for composition spanning block boundaries without
  text loss, duplicated committed text, or exact Android/iOS device closure.

Slice 19 result:

- Added `commits cross-paragraph IME composition as one replacement` plus a
  local `selectDOMTextRange` helper to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates ProseMirror's cross-paragraph composition pressure into a
  Slate runtime row: a browser DOM composition spanning from `default block 1`
  into `default block 2` replaces the selected block range, merges the remaining
  suffix into the first block, preserves later model text, and leaves both
  model selection and DOM caret after the committed composition text.
- The first setup targeted `default block 3`, but that default example region is
  wrapped by the document-section control and the generic DOM selection
  assertion returned `null`. The final proof uses the first two editable text
  blocks and an explicit DOM range while syncing Slate's model selection through
  the browser handle.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not
  promote any exact Mobile/IME issue claim or native-CDP/mobile-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits cross-paragraph IME composition as one replacement" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; slice 19 extends the existing honest DOM
  composition proof-row lesson and did not add a distinct runtime fix pattern.

Next slice:

- `slice-20-lexical-ios-korean-backspace-native-proof`.
- Candidate owner:
  `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`.
- Target: translate Lexical's iOS Korean Backspace exception into a narrow Slate
  runtime contract: iOS + `ko-KR` + Backspace should defer to native input
  instead of becoming model-owned from keydown. This is runtime proof only, not
  exact raw-device iOS closure.

Slice 20 result:

- Added `shouldDeferBackspaceToNativeInput` to
  `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`.
- Added
  `../slate-v2/packages/slate-react/test/keyboard-input-strategy-contract.test.ts`.
- The row translates Lexical's iOS Korean Backspace guard from
  `../lexical/packages/lexical-plain-text/src/index.ts:286` and
  `../lexical/packages/lexical-rich-text/src/index.ts:893` into Slate's runtime
  contract.
- The first proof failed with
  `TypeError: shouldDeferBackspaceToNativeInput is not a function`.
- Runtime code now returns `keyDownUnhandled()` before destructive Backspace is
  model-owned when the narrow predicate is true: iOS, `navigator.language ===
  'ko-KR'`, and backward delete.
- Runtime code still keeps non-Korean iOS Backspace and non-Backspace keys out
  of this exception.
- Issue claims changed: none.
- Reference docs: no change, because this is a runtime contract proof and does
  not promote any exact iOS keyboard or raw-device claim.
- Focused proof passed:
  `bun test:vitest test/keyboard-input-strategy-contract.test.ts`.
- Adjacent package contract proof passed:
  `bun test:vitest test/keyboard-input-strategy-contract.test.ts test/model-input-strategy-contract.test.ts test/editing-kernel-contract.test.ts`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/keyboard-input-strategy.ts packages/slate-react/test/keyboard-input-strategy-contract.test.ts`.
- Post-lint adjacent package contract proof passed:
  `bun test:vitest test/keyboard-input-strategy-contract.test.ts test/model-input-strategy-contract.test.ts test/editing-kernel-contract.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound note added:
  `docs/solutions/ui-bugs/2026-05-07-slate-react-ios-korean-backspace-must-stay-native-owned.md`.

Next slice:

- `slice-21-lexical-ime-typeahead-menu-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/mentions.test.ts`.
- Target: translate Lexical's `Typeahead menu should not close during IME
  composition` row so the mentions portal stays visible while Chromium IME
  composition is active. This is desktop Chromium overlay proof only, not exact
  mobile-device closure.

Slice 21 result:

- Added `keeps mention portal open during IME composition` to
  `../slate-v2/playwright/integration/examples/mentions.test.ts`.
- The row translates Lexical's typeahead/IME overlay pressure into Slate's
  mentions example: after `@ma` opens the portal, active Chromium IME composition
  must not close it while composition text is still in progress.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof coverage and does not
  promote any exact Mobile/IME issue claim or native-CDP/mobile-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "keeps mention portal open during IME composition" --retries=0`.
- Existing mention IME regression proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "keeps mention portal open during IME composition|commits staged IME composition before a markable inline mention|commits IME composition between inline mentions without overwriting them" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/mentions.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a Lexical
  overlay row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 22 is still runnable.

Slice 22 result:

- Added `replaces multiple formatted text nodes with Korean IME composition` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row translates Lexical's
  `Can replace multiple formatted text nodes with IME composition (Korean)`
  into a Slate rich-text proof using Chromium CDP `Input.imeSetComposition`.
- The first synthetic proof was intentionally red but too weak: it changed DOM
  text while Slate model text still contained the old content.
- The CDP proof exposed the real runtime issue: trusted native composition
  needs model-selection pre-delete, visible mark capture, model-owned insert
  while composing, and cleanup of stale browser-owned composition text in
  managed Slate strings.
- Runtime changes:
  `../slate-v2/packages/slate-react/src/editable/composition-state.ts` now
  gates expanded-selection pre-delete on trusted native composition, captures
  composition marks synchronously, tracks latest composition text, and repairs
  stale composition text left inside managed DOM strings.
- Runtime changes:
  `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts` now
  requests a render after model-owned text insertion during composition.
- The adjacent bold IME row now asserts semantic mark preservation across split
  bold leaves instead of requiring React to merge adjacent `<strong>` output.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium CDP proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- ce-compound note added:
  `docs/solutions/ui-bugs/2026-05-07-slate-react-ime-formatted-selection-needs-native-owned-cleanup.md`.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "replaces multiple formatted text nodes with Korean IME composition" --retries=0`.
- Richtext regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup|commits IME composition inside bold markup|replaces multiple formatted text nodes with Korean IME composition" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/mutation-controller.ts playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.

Next slice:

- `slice-23-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  cross-editor backlog.
- Target: choose the next missing Mobile/IME proof route after the ProseMirror
  composition rows, Lexical iOS Korean native-backspace contract, Lexical
  typeahead overlay row, and Lexical Korean multi-format composition row,
  preserving raw-device boundaries.

Slice 23 result:

- Selected the Lexical Safari/WebKit delete-after-composition regression route.
- Local evidence read:
  `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs`.
- The route owns two WebKit-only rows: select-all + Backspace after
  `compositionend`, and Shift+ArrowUp range deletion after `compositionend`.
- Decision: translate both rows into richtext WebKit browser proof because they
  exercise real browser selection/deletion after Safari-style composition
  timing. This is WebKit browser proof, not exact iOS/raw-device closure.

Slice 24 result:

- Added `dispatchWebKitCompositionEnd` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- Added `deletes rich text selection after WebKit compositionend`.
- Added `deletes rich text line selection after WebKit compositionend`.
- The rows translate Lexical regression #8153 into Slate richtext browser
  proof: Safari-style `compositionend` must not leave stale composition state
  that prevents select-all deletion or native line-selection deletion.
- Initial focused proof was red on assertion shape, not runtime behavior:
  WebKit serializes block selection text with line breaks, and the richtext
  empty document renders `Enter some rich text…` as visible placeholder text
  while Slate model text is empty.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is WebKit browser proof and does not
  promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=webkit --grep "deletes rich text (selection|line selection) after WebKit compositionend" --retries=0`.
- Richtext WebKit deletion regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=webkit --grep "deletes rich text (selection|line selection) after WebKit compositionend|keeps caret editable after browser Backspace deletes selected range|removes the current block after browser triple click and Backspace" --retries=0`.
- Existing rendering-strategy WebKit composition regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=webkit --grep "deletes shell-backed selection after WebKit compositionend" --retries=0`.
- Focused lint/format passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Post-lint focused WebKit proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=webkit --grep "deletes rich text (selection|line selection) after WebKit compositionend" --retries=0`.
- ce-compound evaluation: skipped; this reused existing IME/WebKit proof
  lessons and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 25 is still runnable.

Next slice:

- `slice-25-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the ProseMirror
  composition rows, Lexical iOS Korean native-backspace contract, Lexical
  typeahead overlay row, Lexical Korean multi-format composition row, and
  Lexical Safari delete-after-composition rows, preserving raw-device
  boundaries.

Slice 25 result:

- Selected the Lexical history row
  `RangeSelection should be retained when undo IME`.
- Local evidence read:
  `../lexical/packages/lexical-playground/__tests__/e2e/History.spec.mjs`.
- Decision: translate the row into Slate's rendering-strategy runtime example
  using Chromium CDP IME over an expanded backward DOM selection. This is
  desktop Chromium IME/history proof, not exact mobile-device closure.

Slice 26 result:

- Added `restores expanded selection after undoing IME replacement` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row translates Lexical's undo-selection pressure into Slate's runtime
  contract: replacing the selected `b` in `ab` with IME text yields `aす`, and
  one undo restores both `ab` and the original backward selection.
- The first proof failed: undo left `a`, proving trusted native composition
  pre-delete and the Chrome composition-end fallback insert were separate
  history batches.
- Runtime change:
  `../slate-v2/packages/slate-react/src/editable/composition-state.ts` now
  tracks trusted native expanded-selection pre-delete and merges the following
  Chrome composition-end fallback insert into that history batch.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium CDP proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- ce-compound note added:
  `docs/solutions/ui-bugs/2026-05-07-slate-react-ime-replacement-undo-must-merge-native-predelete.md`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|restores expanded selection after undoing IME replacement|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Richtext Chromium IME regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup|commits IME composition inside bold markup|replaces multiple formatted text nodes with Korean IME composition" --retries=0`.
- WebKit rendering-strategy regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=webkit --grep "deletes shell-backed selection after WebKit compositionend" --retries=0`.
- WebKit richtext regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=webkit --grep "deletes rich text (selection|line selection) after WebKit compositionend" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/composition-state.ts playwright/integration/examples/rendering-strategy-runtime.test.ts playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.

Next slice:

- `slice-27-lexical-floating-toolbar-ime-proof`.
- Candidate owner:
  `../slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`.
- Target: translate Lexical's `Floating toolbar should not be displayed when
  using IME` row so the hovering toolbar stays hidden while Chromium IME
  composition is active, then appears for a real expanded selection after commit.
  This is desktop Chromium overlay proof only, not exact mobile-device closure.

Slice 27 result:

- Selected the Lexical floating-toolbar IME row from
  `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`.
- Decision: use Slate's `hovering-toolbar` example because it has the same
  selection-driven overlay behavior and an existing Playwright owner.
- No runtime or product-code edit was planned before proof.

Slice 28 result:

- Added `keeps hovering toolbar hidden during IME composition` to
  `../slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`.
- The row proves active Chromium IME composition does not display the hovering
  toolbar, while a real expanded DOM selection after commit still displays it.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium overlay proof and
  does not promote any exact Mobile/IME issue claim or raw-device claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/hovering-toolbar.test.ts --project=chromium --grep "keeps hovering toolbar hidden during IME composition" --retries=0`.
- Hovering-toolbar regression proof passed:
  `bun playwright test playwright/integration/examples/hovering-toolbar.test.ts --project=chromium --grep "hovering toolbar" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/hovering-toolbar.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Accidental broad examples command was not used as slice evidence:
  `bun playwright test playwright/integration/examples/hovering-toolbar.test.ts --project=chromium --retries=0` expanded to the broader Chromium examples suite and failed on unrelated check-list, persistent-annotation, table, and huge-document rows. The targeted hovering-toolbar grep above is the relevant proof.
- ce-compound evaluation: skipped; this is a proof-only port of a Lexical
  overlay row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 29 is still runnable.

Next slice:

- `slice-29-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, Lexical iOS Korean native-backspace contract,
  Lexical typeahead overlay row, Lexical floating-toolbar overlay row, Lexical
  Korean multi-format composition row, Lexical IME undo-selection row, and
  Lexical Safari delete-after-composition rows, preserving raw-device
  boundaries.

Slice 29 result:

- Selected the Lexical history row `Merge IME input when less delay` from
  `../lexical/packages/lexical-playground/__tests__/e2e/History.spec.mjs`.
- Decision: translate the Slate-owned part of the row, not Lexical's literal
  millisecond history policy. Slate history currently merges by operation shape
  and explicit metadata, so the honest proof is immediate native text plus
  immediately following IME composition undoing as one user action.
- No runtime code edit was planned before proof.

Slice 30 result:

- Added `undoes native text and immediately following IME composition together`
  to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves that browser-native `Input.insertText("a")` followed by
  Chromium IME composition `す` becomes one undoable action, restoring the
  original text and caret after a single undo.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium IME/history proof
  and does not promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "undoes native text and immediately following IME composition together" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|restores expanded selection after undoing IME replacement|does not push canceled IME composition onto history|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a Lexical
  history row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 31 is still runnable.

Next slice:

- `slice-31-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, Lexical iOS Korean native-backspace contract,
  Lexical typeahead and floating-toolbar overlay rows, Lexical Korean
  multi-format composition row, Lexical IME undo-selection and immediate
  text-plus-IME history rows, and Lexical Safari delete-after-composition rows,
  preserving raw-device boundaries.

Slice 31 result:

- Considered ProseMirror's `can deal with Android-style newline-after-composition`
  row from `../prosemirror/view/test/webtest-composition.ts`.
- Deferred that row because the source mutates the editor DOM into a new block
  shape and collapses into the new line, which is a larger DOM-change owner and
  easy to over-claim without Android proof.
- Selected Lexical's `Can type, delete and cancel Hiragana via IME` row from
  `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`
  instead.
- Decision: translate the cancellation stability contract into Slate's
  rendering-strategy runtime example using Chromium CDP IME. This is desktop
  Chromium IME proof, not exact mobile-device closure.

Slice 32 result:

- Added `keeps text stable after type-delete-cancel IME composition` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves a staged Hiragana composition that types, deletes back to a
  shorter candidate, then cancels leaves the model text stable and keeps the
  selection stable both at the end of text and before a following space.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium IME proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "keeps text stable after type-delete-cancel IME composition" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|restores expanded selection after undoing IME replacement|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a Lexical
  cancellation row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 33 is still runnable.

Next slice:

- `slice-33-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, Lexical iOS Korean native-backspace contract,
  Lexical typeahead and floating-toolbar overlay rows, Lexical Korean
  multi-format composition row, Lexical IME undo-selection and immediate
  text-plus-IME history rows, Lexical type/delete/cancel row, and Lexical
  Safari delete-after-composition rows, preserving raw-device boundaries.

Slice 33 result:

- Selected ProseMirror's `handles replacement of existing words` row from
  `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate it into Slate's rendering-strategy runtime example as a
  plain existing-word IME replacement row. This gives a simpler baseline than
  the existing formatted-selection and multi-format replacement rows.

Slice 34 result:

- Added `replaces an existing word with IME composition` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves selecting `two` in `one two three` and committing IME text
  replaces only that word, preserves surrounding text, advances selection after
  the committed text, and records an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium IME proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "replaces an existing word with IME composition" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|restores expanded selection after undoing IME replacement|replaces an existing word with IME composition|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  replacement row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 35 is still runnable.

Next slice:

- `slice-35-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  Lexical iOS Korean native-backspace contract, Lexical typeahead and
  floating-toolbar overlay rows, Lexical Korean multi-format composition row,
  Lexical IME undo-selection and immediate text-plus-IME history rows, Lexical
  type/delete/cancel row, and Lexical Safari delete-after-composition rows,
  preserving raw-device boundaries.

Slice 35 result:

- Selected ProseMirror's `supports composition in a cursor wrapper` row from
  `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate ProseMirror stored-mark cursor composition into Slate's
  richtext example as active bold mark plus an empty block. This is desktop
  Chromium IME proof, not exact mobile-device closure.

Slice 36 result:

- Added `commits IME composition through an active mark in an empty block` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row proves an empty richtext block with active bold mark accepts Chromium
  IME composition, inserts `abc`, renders the committed text as `<strong>`,
  advances selection after the committed text, and records an allowed
  `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium IME proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition through an active mark in an empty block" --retries=0`.
- Richtext Chromium IME regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup|commits IME composition inside bold markup|commits IME composition through an active mark in an empty block|replaces multiple formatted text nodes with Korean IME composition" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  cursor-wrapper row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 37 is still runnable.

Next slice:

- `slice-37-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark row, Lexical iOS Korean
  native-backspace contract, Lexical typeahead and floating-toolbar overlay
  rows, Lexical Korean multi-format composition row, Lexical IME
  undo-selection and immediate text-plus-IME history rows, Lexical
  type/delete/cancel row, and Lexical Safari delete-after-composition rows,
  preserving raw-device boundaries.

Slice 37 result:

- Selected ProseMirror's
  `handles composition in a multi-child mark with a cursor wrapper` row from
  `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate ProseMirror's nested mark context into Slate's flat mark
  model as explicit active italic+code marks at the cursor before a bold-italic
  sibling.

Slice 38 result:

- Added `commits IME composition through an active mark before a formatted sibling`
  to `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- First attempt failed because the collapsed boundary did not implicitly carry
  italic in Slate's flat mark model; the browser inserted standalone `code`.
  The test was corrected to make the active italic+code mark set explicit
  before composition.
- The row proves Chromium IME composition inserts `oow` with active
  italic+code marks before the bold-italic `three` sibling, preserves the
  formatted sibling, advances selection after the committed text, and records an
  allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium IME proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition through an active mark before a formatted sibling" --retries=0`.
- Richtext Chromium IME regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "syncs browser text mutations inside bold markup|commits IME composition inside bold markup|commits IME composition through an active mark in an empty block|commits IME composition through an active mark before a formatted sibling|replaces multiple formatted text nodes with Korean IME composition" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  cursor-wrapper row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 39 is still runnable.

Next slice:

- `slice-39-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, Lexical iOS Korean
  native-backspace contract, Lexical typeahead and floating-toolbar overlay
  rows, Lexical Korean multi-format composition row, Lexical IME
  undo-selection and immediate text-plus-IME history rows, Lexical
  type/delete/cancel row, and Lexical Safari delete-after-composition rows,
  preserving raw-device boundaries.

Slice 39 result:

- Selected ProseMirror's `supports composition at start of block in a new node`
  row from `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate it with direct DOM composition in Slate's
  rendering-strategy runtime example so the browser inserts a composed text node
  before existing text.

Slice 40 result:

- Added `commits IME composition at the start of a text block` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves direct DOM composition at offset `0` inserts `!?` before
  `foo`, preserves the following text, advances both model and DOM caret after
  the committed prefix, and records an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium DOM composition
  proof and does not promote exact Mobile/IME issue closure or raw-device
  claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition at the start of a text block" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|restores expanded selection after undoing IME replacement|replaces an existing word with IME composition|commits IME composition at the start of a text block|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  start-of-block row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 41 is still runnable.

Next slice:

- `slice-41-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start-of-block DOM
  composition row, Lexical iOS Korean native-backspace contract, Lexical
  typeahead and floating-toolbar overlay rows, Lexical Korean multi-format
  composition row, Lexical IME undo-selection and immediate text-plus-IME
  history rows, Lexical type/delete/cancel row, and Lexical Safari
  delete-after-composition rows, preserving raw-device boundaries.

Slice 41 result:

- Selected ProseMirror's `supports composition inside existing text` row from
  `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate it with direct DOM composition at a mid-text collapsed
  selection in Slate's rendering-strategy runtime example.

Slice 42 result:

- Added `commits IME composition inside existing text` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves direct DOM composition at offset `1` in `foo` inserts `xyz`,
  yields `fxyzoo`, advances both model and DOM caret after the committed
  composition, and records an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium DOM composition
  proof and does not promote exact Mobile/IME issue closure or raw-device
  claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition inside existing text" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|restores expanded selection after undoing IME replacement|replaces an existing word with IME composition|commits IME composition at the start of a text block|commits IME composition inside existing text|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  inside-existing-text row and did not add a distinct reusable runtime fix
  pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 43 is still runnable.

Next slice:

- `slice-43-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start-of-block and
  inside-existing-text DOM composition rows, Lexical iOS Korean native-backspace
  contract, Lexical typeahead and floating-toolbar overlay rows, Lexical Korean
  multi-format composition row, Lexical IME undo-selection and immediate
  text-plus-IME history rows, Lexical type/delete/cancel row, and Lexical
  Safari delete-after-composition rows, preserving raw-device boundaries.

Slice 43 result:

- Selected ProseMirror's `supports composition at end of block in a new node`
  row from `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate it with direct DOM composition at the end of an existing
  text block in Slate's rendering-strategy runtime example, separate from the
  existing native-CDP end-of-block row.

Slice 44 result:

- Added `commits IME composition at the end of a text block` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves direct DOM composition at the end of `foo` inserts `!?`,
  yields `foo!?`, advances both model and DOM caret after the committed text,
  and records an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium DOM composition
  proof and does not promote exact Mobile/IME issue closure or raw-device
  claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition at the end of a text block" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|restores expanded selection after undoing IME replacement|replaces an existing word with IME composition|commits IME composition at the start of a text block|commits IME composition inside existing text|commits IME composition at the end of a text block|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  end-of-block row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 45 is still runnable.

Next slice:

- `slice-45-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start/end-of-block
  and inside-existing-text DOM composition rows, Lexical iOS Korean
  native-backspace contract, Lexical typeahead and floating-toolbar overlay
  rows, Lexical Korean multi-format composition row, Lexical IME
  undo-selection and immediate text-plus-IME history rows, Lexical
  type/delete/cancel row, and Lexical Safari delete-after-composition rows,
  preserving raw-device boundaries.

Slice 45 result:

- Selected ProseMirror's `supports composition in an empty block` row from
  `../prosemirror/view/test/webtest-composition.ts`.
- Decision: translate it through Slate's `custom-placeholder` example so an
  empty placeholder-backed editor accepts native Chromium IME composition and
  hides the placeholder after commit.

Slice 46 result:

- Added `commits IME composition from the custom placeholder empty state` to
  `../slate-v2/playwright/integration/examples/placeholder.test.ts`.
- The row proves a collapsed empty placeholder selection commits `abc`, yields
  model text `abc`, advances selection to offset `3`, hides the placeholder,
  and records an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium IME proof and
  does not promote exact Mobile/IME issue closure or raw-device claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/placeholder.test.ts --project=chromium --grep "commits IME composition from the custom placeholder empty state" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/placeholder.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- Accidental broad command note:
  `bun playwright test playwright/integration/examples/placeholder.test.ts --project=chromium --retries=0`
  unexpectedly expanded to the full examples/stress suite; it failed unrelated
  checklist, annotation, table, and huge-document rows after 218 passing tests.
  This broad run is not used as slice evidence.
- ce-compound evaluation: skipped; this is a proof-only port of a ProseMirror
  empty-block row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 47 is still runnable.

Next slice:

- `slice-47-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start/end-of-block,
  inside-existing-text, and custom-placeholder empty-state DOM composition
  rows, Lexical iOS Korean native-backspace contract, Lexical typeahead and
  floating-toolbar overlay rows, Lexical Korean multi-format composition row,
  Lexical IME undo-selection and immediate text-plus-IME history rows, Lexical
  type/delete/cancel row, and Lexical Safari delete-after-composition rows,
  preserving raw-device boundaries.

Slice 47 result:

- Selected Lexical's `Can undo composed Hirigana via IME after composition ends
  (#2479)` row from
  `../lexical/packages/lexical-playground/__tests__/e2e/History.spec.mjs`.
- Decision: translate the row into Slate's rendering-strategy runtime as
  delayed Hiragana native composition, delayed native space, delayed second
  composition, then undo each logical user step.

Slice 48 result:

- Added `undoes delayed Hiragana IME compositions as separate history steps` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- First proof failed usefully: after `すし もじあ`, one undo returned to the
  initial document instead of stopping at `すし `. Root cause:
  browser-native text imports reached `slate-history` only as adjacent
  `insert_text` operations, so the generic adjacent-text merge heuristic had no
  user-pause boundary.
- Runtime fix added
  `../slate-v2/packages/slate-react/src/editable/input-history.ts` and applies
  delayed native-text `history: { mode: 'push' }` metadata from
  `composition-state.ts` and `dom-repair-queue.ts`. Immediate native text plus
  immediate IME composition still merges.
- Issue claims changed: none.
- Reference docs: no maintainer-facing claim file changed, because this is
  desktop Chromium IME/history proof and does not promote exact Mobile/IME
  issue closure or raw-device claims.
- Focused proof passed after the runtime fix and post-lint rerun:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "undoes delayed Hiragana IME compositions as separate history steps" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|undoes delayed Hiragana IME compositions as separate history steps|restores expanded selection after undoing IME replacement|replaces an existing word with IME composition|commits IME composition at the start of a text block|commits IME composition inside existing text|commits IME composition at the end of a text block|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/input-history.ts packages/slate-react/src/editable/composition-state.ts packages/slate-react/src/editable/dom-repair-queue.ts playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound note added:
  `docs/solutions/ui-bugs/2026-05-07-slate-react-native-ime-history-boundaries-need-explicit-push-metadata.md`.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 49 is still runnable.

Next slice:

- `slice-49-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start/end-of-block,
  inside-existing-text, and custom-placeholder empty-state DOM composition
  rows, Lexical iOS Korean native-backspace contract, Lexical typeahead and
  floating-toolbar overlay rows, Lexical Korean multi-format composition row,
  Lexical IME undo-selection, immediate text-plus-IME, and delayed Hiragana IME
  history rows, Lexical type/delete/cancel row, and Lexical Safari
  delete-after-composition rows, preserving raw-device boundaries.

Slice 49 result:

- Selected Lexical's `Can type Hiragana via IME between emojis` row from
  `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`.
- Decision: translate the useful Slate-owned part as direct DOM composition at
  a UTF-16 surrogate-pair boundary, without importing Lexical's emoji
  autocomplete surface.

Slice 50 result:

- Added `commits IME composition between emoji text` to
  `../slate-v2/playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- The row proves composing `すし` between two `🙂` characters yields
  `🙂すし🙂`, preserves the second emoji, advances the selection after the
  committed text at the correct UTF-16 offset, and records an allowed
  `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium DOM composition
  proof and does not promote exact Mobile/IME issue closure or raw-device
  claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition between emoji text" --retries=0`.
- Rendering-strategy IME regression proof passed:
  `bun playwright test playwright/integration/examples/rendering-strategy-runtime.test.ts --project=chromium --grep "commits IME composition through|records runtime metadata for committed IME composition|undoes committed IME composition as one history step|undoes native text and immediately following IME composition together|undoes delayed Hiragana IME compositions as separate history steps|restores expanded selection after undoing IME replacement|replaces an existing word with IME composition|commits IME composition at the start of a text block|commits IME composition inside existing text|commits IME composition at the end of a text block|commits IME composition between emoji text|does not push canceled IME composition onto history|keeps text stable after type-delete-cancel IME composition|drops active IME composition when a model change overlaps it|drops active IME composition when a model change partially overlaps it|drops active IME composition when a model change happens at its insertion point|keeps active IME composition when a model change happens elsewhere|commits rapidly following IME compositions in separate text blocks|commits cross-paragraph IME composition as one replacement" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/rendering-strategy-runtime.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a Lexical
  emoji-boundary row and did not add a distinct reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 51 is still runnable.

Next slice:

- `slice-51-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start/end-of-block,
  inside-existing-text, and custom-placeholder empty-state DOM composition
  rows, Lexical iOS Korean native-backspace contract, Lexical typeahead and
  floating-toolbar overlay rows, Lexical Korean multi-format composition row,
  Lexical IME undo-selection, immediate text-plus-IME, delayed Hiragana IME
  history, and emoji-boundary rows, Lexical type/delete/cancel row, and Lexical
  Safari delete-after-composition rows, preserving raw-device boundaries.

Slice 51 result:

- Selected Lexical's mention-boundary IME rows from
  `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`,
  focusing on the still-missing "at the end of a mention" shape.
- Decision: Slate already had before-mention, between-mentions, and
  typeahead-open proof; add a direct DOM composition row at the start of the
  text node immediately after an inline mention.

Slice 52 result:

- Added `commits IME composition immediately after an inline mention` to
  `../slate-v2/playwright/integration/examples/mentions.test.ts`.
- The row proves composing `すし` immediately after the first mention preserves
  both inline mentions, inserts into the following text node, advances selection
  after the committed text, and records an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is desktop Chromium DOM composition
  proof and does not promote exact Mobile/IME issue closure or raw-device
  claims.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "commits IME composition immediately after an inline mention" --retries=0`.
- Mentions IME regression proof passed:
  `bun playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "keeps mention portal open during IME composition|commits staged IME composition before a markable inline mention|commits IME composition between inline mentions without overwriting them|commits IME composition immediately after an inline mention" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/mentions.test.ts`.
- TypeScript root gate passed:
  `bun typecheck:root`.
- ce-compound evaluation: skipped; this is a proof-only port of a Lexical
  inline-mention boundary row and did not add a distinct reusable runtime fix
  pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 53 is still runnable.

Next slice:

- `slice-53-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the covered
  ProseMirror composition rows, ProseMirror existing-word replacement row,
  ProseMirror cursor-wrapper active-mark rows, ProseMirror start/end-of-block,
  inside-existing-text, and custom-placeholder empty-state DOM composition
  rows, Lexical iOS Korean native-backspace contract, Lexical typeahead,
  floating-toolbar, and inline-mention boundary rows, Lexical Korean
  multi-format composition row, Lexical IME undo-selection,
  immediate text-plus-IME, delayed Hiragana IME history, and emoji-boundary
  rows, Lexical type/delete/cancel row, and Lexical Safari
  delete-after-composition rows, preserving raw-device boundaries.

Slice 53 result:

- Classified the remaining Lexical
  `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs`
  rows after the new emoji and inline-mention proof.
- Accounting: base Hiragana typing is covered by slice 48's final text plus
  undo-boundary proof; new-bold-format is covered by active-mark cursor rows;
  between-emojis is covered by slice 50; type/delete/cancel is covered by slice
  32; floating toolbar, typeahead, Korean multi-format, and inline mention
  boundaries are covered by earlier/new rows.
- Explicit deferrals: Lexical's soft line-break row is not directly portable
  while Slate v2 `insertSoftBreak` still aliases block split; hashtag rows are
  product/plugin-specific and need a Slate hashtag surface before they can
  become raw Slate proof. These remain backlog pressure, not exact claims.

Slice 54 result:

- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof-route accounting and does
  not promote exact Mobile/IME issue closure or raw-device claims.
- ce-compound evaluation: skipped; this is accounting against already read
  Lexical rows and did not add a new runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 55 is still runnable.

Next slice:

- `slice-55-mobile-ime-next-proof-route-selection`.
- Candidate owner:
  `docs/plans/2026-05-07-slate-v2-mobile-ime-input-runtime-ralplan.md` plus
  the narrowest matching `../slate-v2` source/test owner selected from the
  remaining Lexical/ProseMirror Mobile/IME backlog.
- Target: choose the next missing Mobile/IME proof route after the translated
  ProseMirror composition rows, the covered or classified Lexical
  `Composition.spec.mjs` rows, Lexical iOS Korean native-backspace contract,
  Lexical history rows, Lexical type/delete/cancel row, and Lexical Safari
  delete-after-composition rows, preserving raw-device and product-plugin
  boundaries.

Slice 55 result:

- Classified the remaining Lexical
  `../lexical/packages/lexical-playground/__tests__/e2e/History.spec.mjs` IME
  rows after the delayed Hiragana history fix.
- Accounting: `Cancel composition not push undo stack` is covered by
  `does not push canceled IME composition onto history`; `Merge IME input when
  less delay` is covered by `undoes native text and immediately following IME
  composition together` plus the delayed split row; `RangeSelection should be
  retained when undo IME` is covered by `restores expanded selection after
  undoing IME replacement`.
- Decision: no new code/test row was added because each remaining Lexical
  history row has an existing focused Slate proof with matching behavior.
  Re-running duplicate rows would add noise, not confidence.

Slice 56 result:

- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof-route accounting and does
  not promote exact Mobile/IME issue closure or raw-device claims.
- ce-compound evaluation: skipped; this is accounting against already read
  Lexical rows and did not add a new runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 57 is still runnable.

Slice 57 result:

- Classified Lexical's Safari regression source at
  `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs`.
- Accounting: `Can delete all text selected with Cmd+A after IME composition
  end on Safari` is covered by Slate's WebKit `deletes rich text selection
  after WebKit compositionend` row and the shell-backed `deletes shell-backed
  selection after WebKit compositionend` row; `Can delete multi-paragraph
  selection with Shift+ArrowUp after IME composition end on Safari` is covered
  by `deletes rich text line selection after WebKit compositionend`.
- Decision: no new code/test row was added because the exact WebKit
  stale-compositionend selection/delete behaviors already have matching Slate
  proof rows. Re-running duplicate rows would be noise.

Slice 58 result:

- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is proof-route accounting and does
  not promote exact Mobile/IME issue closure or raw-device claims.
- ce-compound evaluation: skipped; this is accounting against already covered
  Safari/WebKit rows and did not add a new runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 59 is still runnable.

Slice 59 result:

- Selected issue `#5891`, `[Android] The autocorrect doesn't work when
  creating the first line`, from
  `docs/slate-issues/open-issues-dossiers/5912-5771.md` and
  `docs/slate-issues/test-candidate-map/5912-5771.md`.
- Decision: translate the proof route as empty-state `insertReplacementText` /
  autocorrect architecture coverage first, not exact raw Android keyboard
  closure.

Slice 60 result:

- Added `routes Android-style first-line autocorrect through empty-state
  replacement text` to
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.
- The row proves `insertReplacementText` at an empty first-line selection
  inserts the replacement text, advances model selection after the inserted
  text, and returns no repair request.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the
  Android/autocorrect route, not an exact `#5891` raw-device closure.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Failed-command note: root `bun test
  packages/slate-react/test/model-input-strategy-contract.test.ts...` is wrong
  for this file because `bunfig.toml` ignores `*.test.*`; the correct focused
  runner is package Vitest.
- Focused proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "routes Android-style first-line autocorrect through empty-state replacement text"`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Package typecheck passed:
  `bun --filter slate-react typecheck`.
- ce-compound evaluation: defer until the lane closeout; the useful reusable
  finding is the Vitest-owned `*.test.*` runner boundary.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 61 is still runnable.

Slice 61 result:

- Selected issue `#5099`, Android empty placeholder backspace behavior, from
  `docs/slate-issues/open-issues-dossiers/5129-5066.md` and
  `docs/slate-issues/test-candidate-map/5129-5066.md`.
- Decision: translate the proof route as empty-state `deleteContentBackward`
  architecture coverage first, not exact raw Android Chrome keyboard closure.

Slice 62 result:

- Added `keeps Android-style empty-state backspace from mutating placeholder
  text` to
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.
- The row proves model-owned empty-state `deleteContentBackward` leaves editor
  text empty, keeps selection at `[0,0]/0`, and requests only caret repair.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the
  Android/backspace route, not an exact `#5099` raw-device closure.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "keeps Android-style empty-state backspace from mutating placeholder text"`.
- Focused regression proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "routes Android-style first-line autocorrect through empty-state replacement text|keeps Android-style empty-state backspace from mutating placeholder text"`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Package typecheck passed:
  `bun --filter slate-react typecheck`.
- ce-compound evaluation: defer until the lane closeout; this reuses the same
  Vitest-owned test-file runner boundary as slice 60.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 63 is still runnable.

Slice 63 result:

- Selected the Android/CJK duplicate-delete proof family from the strong first
  batch, especially issue `#5984` from
  `docs/slate-issues/open-issues-dossiers/5994-5918.md`, issue `#5083` from
  `docs/slate-issues/open-issues-dossiers/5129-5066.md`, and issue `#5023`
  from `docs/slate-issues/open-issues-dossiers/5064-4971.md`.
- Decision: translate the proof route as model-owned expanded CJK composition
  insertion/deletion coverage first, not exact Sogou/Android device closure.

Slice 64 result:

- Added `replaces expanded CJK composition selection once` and
  `deletes expanded CJK composition selection once` to
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.
- The rows prove `insertFromComposition` over an expanded CJK selection inserts
  one replacement string without duplicate text, and `deleteByComposition` over
  an expanded CJK selection deletes one selected unit without requiring a second
  delete.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the Android/CJK
  route, not exact `#5984`, `#5083`, or `#5023` device/browser closure.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "replaces expanded CJK composition selection once|deletes expanded CJK composition selection once"`.
- Focused regression proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "Android-style first-line autocorrect|Android-style empty-state backspace|expanded CJK composition selection once"`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Package typecheck passed:
  `bun --filter slate-react typecheck`.
- ce-compound evaluation: defer until the lane closeout; this adds no new
  reusable runtime-fix pattern beyond the existing issue-proof row pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 65 is still runnable.

Slice 65 result:

- Selected the remaining Android/CJK onChange/readOnly route around `#5078`,
  `#5034`, and `#5026`.
- Finding: `#5078` is not an inline-boundary CJK row; it is Android
  composition/onChange freshness. `#5034` and `#5026` are Android readOnly
  lifecycle rows. None are honestly closed by the model-input unit rows.

Slice 66 result:

- Decision: defer these to a React integration, Android manager, or
  raw-device/browser route that can observe onChange operations, readOnly
  transition behavior, and device/browser event timing.
- Runtime code changes: none.
- Issue claims changed: none.
- Reference docs: no change, because this is conservative proof-route
  accounting and does not promote exact Mobile/IME issue closure.
- ce-compound evaluation: skipped; this is classification against existing
  dossier/test-map rows and did not add a reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports
  `status: pending`, which is expected because slice 67 is still runnable.

Slice 67 result:

- Selected the autocomplete/suggestion replacement route and corrected the
  issue mapping from disk: `#5653` is Microsoft IME blur duplication, while
  Android autocomplete prefix replacement is `#5643`; `#4531` remains a broader
  Android suggestion-flicker row.
- Checked sibling coverage before adding proof. Lexical's closest stealable row
  is
  `../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs`,
  which dispatches `insertText` followed by `insertReplacementText` over a
  target range. The local ProseMirror sibling check did not expose a matching
  autocomplete/replacement row.
- Decision: translate the proof route as model-owned replacement text over the
  intended prefix range, not exact Android suggestion UI closure and not `#5653`
  focus/blur lifecycle closure.

Slice 68 result:

- Added `replaces an autocorrect prefix without appending after it` to
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.
- The row proves a native-style character insert followed by replacement text
  over the intended prefix range yields `IS`, not an appended duplicate, and
  leaves model selection after the replacement prefix.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the `#5643` /
  `#4531` replacement-pressure route only.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "autocorrect prefix|first-line autocorrect|empty-state backspace|expanded CJK"`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Package typecheck passed:
  `bun --filter slate-react typecheck`.
- ce-compound evaluation: defer until the lane closeout; this reuses the same
  Vitest-owned test-file runner boundary and the already documented
  honest-proof boundary.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 69 is still runnable.

Slice 69 result:

- Selected `#5653`, Microsoft IME blur duplication, because its dossier names a
  concrete event sequence: `compositionend`, then `beforeinput
  deleteContentBackward`, then `beforeinput insertText`.
- Checked sibling coverage. The local Lexical and ProseMirror checkouts did not
  expose an exact Microsoft IME blur row. The useful current-source owner was
  Slate's own beforeinput selection reconciliation.
- Added red proof `imports expanded delete target ranges from blur-time IME
  cleanup events` to
  `../slate-v2/packages/slate-react/test/selection-reconciler-contract.ts`.
- Red result: the focused proof failed because `syncSelectionForBeforeInput`
  ignored expanded target ranges for `deleteContentBackward` and kept the old
  collapsed model selection.

Slice 70 result:

- Updated
  `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts` so
  expanded beforeinput delete target ranges are imported even for
  forward/backward delete cleanup events. Collapsed delete target ranges still
  fall back to command-derived behavior.
- Runtime code changes: yes, targeted selection reconciliation fix.
- Issue claims changed: no exact `#5653` Windows/Microsoft IME closure was
  promoted. The fix covers the event-level runtime owner when the browser
  supplies an expanded delete target range during blur cleanup; exact
  Windows/IME closure still needs platform proof.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Red proof failed before the fix:
  `bun test ./packages/slate-react/test/selection-reconciler-contract.ts -t "imports expanded delete target ranges"`.
- Focused proof passed after the fix:
  `bun test ./packages/slate-react/test/selection-reconciler-contract.ts -t "imports expanded delete target ranges"`.
- Focused regression proof passed:
  `bun test ./packages/slate-react/test/selection-reconciler-contract.ts`.
- Adjacent regression proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "autocorrect prefix|first-line autocorrect|empty-state backspace|expanded CJK"`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/selection-reconciler.ts packages/slate-react/test/selection-reconciler-contract.ts packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Package typecheck passed:
  `bun --filter slate-react typecheck`.
- ce-compound evaluation: defer until lane closeout; the reusable technical
  lesson is likely that beforeinput delete target ranges are not optional for
  IME/focus cleanup.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 71 is still runnable.

Slice 71 result:

- Selected the Android heading Enter / block-type route around `#4521` and
  `#5175`.
- Found matching external shape in ProseMirror's
  `../prosemirror-commands/test/test-commands.ts` splitBlock heading rows and
  Lexical's
  `../lexical/packages/lexical-playground/__tests__/e2e/Headings/HeadingsEnterAtEnd.spec.mjs`
  / `HeadingsEnterInMiddle.spec.mjs`.
- Red attempt: the stolen paragraph-after-heading expectation failed against
  raw Slate. Decision: do not implement that expectation in raw Slate because
  it hardcodes product block policy. Keep paragraph-after-heading behavior in
  example/plugin/device proof.

Slice 72 result:

- Added `splits a custom block on Enter without dropping follow-up text` to
  `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`.
- The row proves raw model-owned `insertParagraph` splits a custom block, moves
  selection into the inserted block, and preserves the first follow-up inserted
  character. It intentionally does not force heading-to-paragraph product
  semantics.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the `#4521` /
  `#5175` raw runtime route, not exact Android heading DOM or last inserted
  element closure.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "splits a custom block"`.
- Focused regression proof passed:
  `bun --filter slate-react test:vitest -- model-input-strategy-contract.test.ts -t "custom block|autocorrect prefix|first-line autocorrect|empty-state backspace|expanded CJK"`.
- Adjacent regression proof passed:
  `bun test ./packages/slate-react/test/selection-reconciler-contract.ts`.
- Lint/format focused gate passed:
  `bun run lint:fix packages/slate-react/src/editable/selection-reconciler.ts packages/slate-react/test/selection-reconciler-contract.ts packages/slate-react/test/model-input-strategy-contract.test.ts`.
- Package typecheck passed:
  `bun --filter slate-react typecheck`.
- ce-compound evaluation: defer until lane closeout; the useful reusable lesson
  is the raw Slate primitive/product block-policy boundary.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 73 is still runnable.

Slice 73 result:

- Selected the inline-boundary / multibyte IME route around `#4693` and
  `#4136`.
- Issue source check:
  `docs/slate-issues/open-issues-dossiers/4741-4643.md` keeps `#4693` as
  Android Korean/Japanese composition architecture pressure, while
  `docs/slate-issues/open-issues-dossiers/4160-4074.md` keeps `#4136` as
  multibyte composition after clearing placeholder or near inline boundaries.
- Test-map check:
  `docs/slate-issues/test-candidate-map/4741-4643.md` asks for Android Korean
  composition in the richtext example, and
  `docs/slate-issues/test-candidate-map/4160-4074.md` asks for multibyte IME
  input after clearing placeholder or after an inline boundary.
- Sibling-source check found the relevant external rows:
  ProseMirror's `webtest-composition.ts` covers composition inside marks,
  multi-child marks, cursor wrappers, highlighted/decorated text,
  multi-node composition, and widgets next to composition; Lexical's
  `Composition.spec.mjs` covers Hiragana near mentions, IME after mentions,
  hashtags, typeahead stability, and Korean replacement across multiple
  formatted nodes.

Slice 74 result:

- Decision: do not add a new implementation row for `#4693` / `#4136` in this
  slice. The architecture route is already represented by existing Slate v2
  browser rows:
  `../slate-v2/playwright/integration/examples/richtext.test.ts` covers active
  mark cursor-wrapper composition and Korean replacement across formatted
  nodes; `../slate-v2/playwright/integration/examples/mentions.test.ts` covers
  composition before, between, and after inline mentions;
  `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
  covers decorated-text and spanning-decorator composition; and
  `../slate-v2/playwright/integration/examples/placeholder.test.ts` covers
  custom-placeholder empty-state composition.
- Runtime code changes: none.
- Issue claims changed: none. This is architecture coverage only; exact
  Android Korean/Japanese, Sogou, or multibyte crash closure still needs
  raw-device or issue-specific browser proof.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused verification: no code changed. Existing proof owners were re-read on
  disk instead of rerun.
- ce-compound evaluation: skipped; this slice only classified existing proof
  coverage and did not introduce a new reusable runtime fix pattern.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 75 is still runnable.

Slice 75 result:

- Selected the empty-editor IME route around `#4030`, `#3943`, and `#3882`.
- Issue source check:
  `docs/slate-issues/open-issues-dossiers/3948-3881.md` keeps `#3943` as a
  Safari Chinese composition caret-reset row and `#3882` as an empty richtext
  IME crash row. `docs/slate-issues/open-issues-dossiers/4067-3949.md` keeps
  `#4030` as a Safari list-item IME caret-reset row.
- Test-map check:
  `docs/slate-issues/test-candidate-map/3948-3881.md` asks for Safari Chinese
  composition caret stability and empty richtext IME typing without a crash;
  `docs/slate-issues/test-candidate-map/4067-3949.md` asks for Safari list
  item IME composition to keep caret position.
- Sibling-source check found ProseMirror's empty-block composition row in
  `../prosemirror/view/test/webtest-composition.ts`. The existing Slate v2
  custom-placeholder row was close, but it did not prove the richtext example
  empty-block route named by `#3882`.
- WebKit proof boundary check:
  `docs/solutions/logic-errors/2026-04-11-webkit-playwright-inserttext-is-a-direct-input-ceiling-not-a-direct-composition-lane.md`
  still applies. Desktop WebKit Playwright `insertText` is useful direct-input
  evidence, not honest composition evidence, so `#4030` and `#3943` stay
  deferred to Safari composition proof.

Slice 76 result:

- Added `commits IME composition in an empty rich text block` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row clears the richtext example, proves the placeholder-backed empty block
  accepts a native Chromium IME commit, asserts final model text `すし`,
  selection after the committed text, and an allowed `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the `#3882`
  empty-richtext route, not exact old Korean/Chinese crash closure. `#4030` and
  `#3943` remain Safari-specific deferred rows.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition in an empty rich text block" --retries=0`.
- Focused regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "empty rich text block|active mark in an empty block|replaces multiple formatted text nodes with Korean" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- Root TypeScript check passed:
  `bun run typecheck:root`.
- ce-compound evaluation: skipped; this reused the already documented honest
  browser IME proof boundary and did not introduce a new runtime fix pattern.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 77 is still runnable.

Slice 77 result:

- Selected the select-all / first-entry composition route around `#4067`,
  `#4031`, and `#4353`.
- Issue source check:
  `docs/slate-issues/open-issues-dossiers/4067-3949.md` keeps `#4067` as
  select-all then composition crash/desync, and `#4031` as empty-editor
  Japanese composition confirm crash. `docs/slate-issues/open-issues-dossiers/4390-4269.md`
  keeps `#4353` as select-all then Japanese composition wedging after the first
  character.
- Test-map check:
  `docs/slate-issues/test-candidate-map/4067-3949.md` asks for select-all then
  composition and empty-editor Japanese confirm rows; `docs/slate-issues/test-candidate-map/4390-4269.md`
  asks for select-all then start Japanese IME input.
- Sibling-source check found no exact Lexical or ProseMirror select-all IME row
  in the local checkouts. The closest external mechanism remains ProseMirror's
  empty-block composition row plus Slate's own expanded-selection and
  replacement IME rows.

Slice 78 result:

- Added `replaces select-all rich text with IME composition` to
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- The row selects all in the richtext example, starts native Chromium IME
  composition, commits `すし`, and asserts the full selection is replaced by one
  text node with selection after the committed text and an allowed
  `compositionend` trace.
- Runtime code changes: none.
- Issue claims changed: none; this is architecture proof for the
  `#4067`/`#4353` select-all composition route and complements the `#4031`
  empty-editor route, not exact old Japanese/Chinese crash closure.
- Reference docs: no change, because no exact Mobile/IME issue claim, public
  API text, release gate, or PR narrative was promoted.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "replaces select-all rich text with IME composition" --retries=0`.
- Focused regression proof passed:
  `bun playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "empty rich text block|select-all rich text|active mark in an empty block|replaces multiple formatted text nodes with Korean" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix playwright/integration/examples/richtext.test.ts`.
- Root TypeScript check passed:
  `bun run typecheck:root`.
- ce-compound evaluation: skipped; this is another browser proof row using the
  existing IME harness boundary and did not introduce a reusable runtime fix
  pattern.
- Completion gate result: `bun run completion-check` reports `status: pending`,
  which is expected because slice 79 is still runnable.

Slice 79 result:

- Selected the composition focus-lifecycle route around `#5830` and `#4232`.
- Issue source check:
  `docs/slate-issues/open-issues-dossiers/5912-5771.md` keeps `#5830` as
  `onBlur` not firing while Japanese/Korean composition is active in an empty
  editor. `docs/slate-issues/open-issues-dossiers/4268-4162.md` keeps `#4232`
  as select-all/delete plus composition corrupting text or pasting page text on
  blur.
- Test-map check:
  `docs/slate-issues/test-candidate-map/5912-5771.md` asks for composition
  `onBlur` on an empty editor when focus moves away mid-composition.
  `docs/slate-issues/test-candidate-map/4268-4162.md` asks for a broader
  Cmd+A/delete/composition/blur corruption row.
- Sibling-source check found ProseMirror keeps focus/blur lifecycle independent
  from composition state in `../prosemirror/view/src/input.ts`. Lexical
  registers `blur` as a root event in `../lexical/packages/lexical/src/LexicalEvents.ts`;
  the only local Lexical blur special case found was plugin-specific focus
  restoration in `LexicalDraggableBlockPlugin`, not a composition-blur proof
  row.

Slice 80 result:

- Added `fires blur when focus leaves during placeholder IME composition` to
  `../slate-v2/playwright/integration/examples/placeholder.test.ts`.
- Added a non-visual public `Editable.onBlur` counter to
  `../slate-v2/site/examples/ts/custom-placeholder.tsx` so the browser row
  proves the user callback route, not only a native DOM blur listener.
- The row starts Chromium CDP IME composition from the empty custom-placeholder
  editor, moves focus to an outside button mid-composition, asserts the outside
  target is focused, asserts the public `onBlur` callback fired exactly once,
  and asserts the Slate kernel recorded an allowed `blur` event.
- Runtime code changes: none.
- Issue claims changed: `#5830` is upgraded from "no exact composition-blur
  proof" to related architecture proof for Chromium empty-placeholder
  composition blur. No exact Japanese/Korean raw IME closure is claimed.
  `#4232` remains only partially represented by adjacent select-all and blur
  lifecycle rows; exact reverse-input/page-text-paste closure is not claimed.
- Reference docs: updated
  `docs/slate-v2/ledgers/issue-coverage-matrix.md` for the `#5830` related
  row. PR fixed/improved counts stay unchanged because this is not a
  `Fixes #...` or `Improves #...` claim.
- Focused proof passed:
  `bun playwright test playwright/integration/examples/placeholder.test.ts --project=chromium --grep "fires blur when focus leaves during placeholder IME composition" --retries=0`.
- Focused regression proof passed:
  `bun playwright test playwright/integration/examples/placeholder.test.ts --project=chromium --grep "custom placeholder empty state|focus leaves during placeholder IME|undoes typing from the custom placeholder" --retries=0`.
- Lint/format focused gate passed:
  `bun run lint:fix site/examples/ts/custom-placeholder.tsx playwright/integration/examples/placeholder.test.ts`.
- Root TypeScript check passed:
  `bun run typecheck:root`.
- ce-compound evaluation: skipped; this is a proof row and conservative ledger
  sync, not a new reusable runtime fix pattern.

Slice 81 result:

- Classified the remaining Mobile/IME rows after the translated
  Lexical/ProseMirror rows and the new Slate v2 proof slices.
- No new desktop/browser proof row was selected. The remaining exact-closure
  rows need one of four owners:
  raw-device/manual proof, Safari/WebKit-specific composition/autocorrect proof,
  Android readOnly/onChange integration proof, or product/plugin policy.
- Raw-device/manual exact-closure bucket:
  `#6051`, `#6022`, `#5983`, `#5989`, `#5883`, `#4400`, `#5680`, `#5493`,
  `#5130`, `#5836`, `#5805`, `#5666`, `#5291`, `#5371`, `#5167`, `#4959`,
  `#4861`, `#4602`, `#4354`, `#4372`, `#5183`, `#5391`. Existing Slate v2
  architecture covers the shared runtime pressure; exact closure still needs
  the reported Android/iOS/Samsung/Firefox Android/voice environment.
- Safari/WebKit/browser-specific exact-closure bucket:
  `#4030`, `#3943`, `#4640`, `#4543`, `#4085`. The local WebKit direct-input
  rows and Chromium IME rows do not honestly prove these Safari composition or
  autocorrect reports.
- Integration/readOnly/onChange bucket:
  `#5078`, `#5034`, `#5026`, `#4994`. The earlier slice preserved these as
  Android manager/readOnly integration rows because exact proof must observe
  emitted operations, onChange freshness, and readOnly transitions under the
  relevant Android path.
- Product/plugin/policy bucket:
  `#5928`, `#4532`, `#4223`, `#3573`, `#4621`, and the plugin/render
  composition rows such as `#3222`/`#3177`. These inform runtime/event policy
  but are not raw Slate exact bug closures.
- Already represented architecture rows without exact-issue promotion:
  `#3873` is covered by the existing keyboard-composition kernel contract;
  `#5173`, `#4232`, and `#4269` are represented by the focus-lifecycle,
  select-all, composition-cancel, and composition-keydown proof families, but
  their exact historical repros remain non-claims; `#3695`, `#5375`, `#4770`,
  and `#3611` are represented by active-mark, inline-boundary, emoji-boundary,
  and void/zero-width architecture proof families, not exact old browser/device
  closures.
- Reference docs: no additional fixed/improved claim sync required. The
  `#5830` related row was already synced in slice 80, and PR fixed/improved
  counts remain unchanged.
- Verification: no code changed in this slice. The relevant same-turn proof for
  the only new code/test surface remains the slice 80 focused Playwright row,
  focused placeholder regression run, `lint:fix`, and root TypeScript check.
- ce-compound evaluation: skipped. The reusable rules used here already exist
  in the plan and solution docs: synthetic/mobile proof labels stay explicit,
  raw-device claims need matching artifacts, and product/plugin rows do not
  become raw Slate closures.

Closure:

- Status: done for the requested Mobile/IME slate-ralplan execution.
- Exact fixed/improved Mobile/IME issue claims from this macro plan: none.
- The lane added or confirmed architecture proof rows, synced `#5830` related
  proof text, and explicitly preserved raw-device, Safari/WebKit, integration,
  and product/plugin non-claims.
- Remaining exact closures are future lanes, not autonomous desktop-proof work
  left in this run.
