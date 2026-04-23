---
date: 2026-04-06
topic: slate-v2-next-major-autonomous-phase
status: active
supersedes: 2026-04-05-phase5-cashout-read
---

# Slate v2 Next Major Autonomous Phase

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Choose the strongest next major autonomous phase for
`/Users/zbeyens/git/slate-v2`, aligned with
[Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star), that
maximizes release-shaped progress without reopening already-proved seams.

## Decision

Run a **proof-before-prose Phase 7 cashout with a reset/load contract gate**:

- make the replacement/reset boundary explicit first
- then publicize the proved anchor surface in `/Users/zbeyens/git/slate-v2`
- turn internal proof truth into honest repo-facing package/docs/example truth
- widen compatibility and benchmark proof only where a public claim needs it
- keep engine/runtime hardening narrow and reactive to real blockers

Bluntly:

- do **not** spend the next phase on more geometry cousins
- do **not** start a fresh greenfield core rewrite
- do **not** pretend Phase 7 is done just because `plate-2` has internal docs

The next major phase is not “invent the better engine again”.

It is:

- prove and state the load-bearing reset/load contract first
- make the replacement-candidate repo tell the same truth the proof stack
  already earned
- prove only the extra rows needed to support that public story

## Why This Is The Highest-Leverage Move Now

Evidence already says the earlier cashout work landed:

- the transaction/snapshot core is real in
  [/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts)
  and
  [/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
- the anchor runtime surface is real in
  [/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts),
  [/Users/zbeyens/git/slate-v2/site/examples/ts/rich-inline.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/rich-inline.tsx),
  and
  [/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts)
- the replacement candidate has already passed the rename cut, React 19.2
  convergence, and rebuilt replacement scoreboard in:
  [2026-04-06-slate-v2-rename-cut.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-06-slate-v2-rename-cut.md),
  [2026-04-06-slate-v2-react-19-2-convergence.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-06-slate-v2-react-19-2-convergence.md),
  and
  [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- `slate-browser` is already a first-class package with a real editor harness in
  [/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md](/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md)
  and
  [/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts)

The real gap now is not just repo truth. It is policy plus repo truth:

- internal docs in `plate-2` already describe the compatibility envelope and
  migration posture
- the scoreboard still says the missing blockers are:
  - broader curated compatibility rows
  - a migration story
  - explicit preserved / dropped / redefined policy
- the repo-facing
  [/Users/zbeyens/git/slate-v2/Readme.md](/Users/zbeyens/git/slate-v2/Readme.md)
  is still mostly legacy-era framing
- the root README still points at stale `slate-v2-*` example filenames and an
  old package table that omits `slate-dom` and `slate-browser`
- `slate`, `slate-dom`, `slate-react`, and `slate-history` still have no
  package-level README truth surface
- `slate-browser` still carries transitional `waitFor*` compatibility options in
  its `openExample(...)` API even though the real direction is the `ready`
  contract
- `slate-browser` README is partly ahead of the actual repo command surface, so
  even the best-documented package is not yet fully honest

That is why the highest-leverage move now is:

- explicit replacement/reset contract first
- one more load-bearing migration seam first
- then publicization plus a small, curated proof widening

Not deeper seam farming, but also not docs-first theater.

## What Not To Do Yet

1. Do not widen geometry proof unless a public claim or migration row fails for
   a real model reason.
2. Do not start middleware/plugin-phase redesign just because
   [Part I. Engine North Star](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-i-engine-north-star) names it as
   end-state direction.
3. Do not restore broad legacy examples or suites into
   `/Users/zbeyens/git/slate-v2`.
4. Do not chase a blanket replacement claim.
5. Do not build a generic multi-backend `slate-browser` driver abstraction.
6. Do not spend this phase discovering the next geometry seam for sport.

## RALPLAN-DR Summary

### Principles

1. Public claims must be backed by a named proof lane or they do not ship.
2. Keep the engine/runtime contract boring and explicit; fix only what blocks
   honest publicization.
3. `slate-browser` is proof infrastructure, not disposable test glue.
4. Legacy Slate is a semantic oracle, not a package surface to resurrect.
5. Prefer one credible adoption path over ten vague maybe-paths.

### Decision Drivers

1. Release-shaped leverage per proof dollar.
2. Honest repo-facing package/runtime story.
3. Minimal reopening of already-proved core seams.

### Viable Options

#### Option A: Reopen the engine/runtime architecture directly

Pros:

- most aligned with the greenfield north star in `engine.md`
- could reduce long-term retrofit debt

Cons:

- low immediate release leverage
- reopens settled seams before the current candidate is honestly publicized
- burns proof budget on architecture introspection instead of adoption blockers

#### Option B: Repo-facing Phase 7 cashout on the proved anchor

Pros:

- highest release leverage right now
- uses the proof stack already earned
- closes the biggest gap between internal truth and repo truth
- keeps engine/runtime fixes narrow and evidence-driven

Cons:

- can fossilize awkward seams if the public story outruns the real contract
- requires discipline to avoid turning docs work into vague marketing

#### Option C: Aggressive compatibility widening first

Pros:

- moves fastest toward a stronger replacement claim

Cons:

- risks cargo-culting legacy behaviors that are not worth preserving
- invites proof sprawl across old surfaces before the adoption story is
  curated

### Strongest Antithesis

The best argument against this phase is that publicization can freeze a polite
lie: if the current replacement candidate still hides important retrofit debt,
then turning the repo into a clean story just makes later correction more
expensive.

### Real Tradeoff Tension

There is a real tension between:

- making the replacement candidate legible enough for real adoption work
- keeping enough design slack to still fix a bad engine/runtime seam if the next
  curated compatibility row exposes it

The highest-risk seam is the reset/load contract currently expressed through
`Editor.replace(...)` and `useSlateReplace(...)`.

### Synthesis

Publicize only the proved anchor and only the claims backed by stable lanes.

If a new curated migration row exposes a real contract weakness, pivot inside
the phase to a narrow seam fix, prove it, sync docs, then resume the public
cashout.

Default narrow pivot if needed:

- make reset/load semantics explicit instead of continuing to smuggle them
  through generic replace language

## Pre-Mortem

### 1. Public docs outrun proof

Failure:

- the README/package docs promise replacement readiness broader than the
  scoreboard and browser lanes justify

Mitigation:

- every preserved/improved claim must map to an exact lane in:
  - `replacement-compatibility.test.ts`
  - replacement benchmark scripts
  - `slate-browser` browser lanes

### 2. Legacy oracle cargo cult

Failure:

- the phase copies legacy example/test mechanics instead of preserving the user
  behavior that matters

Mitigation:

- import scenario intent only
- reject legacy-only details like exact toolbar styling, chunk counts, or
  legacy example structure unless the v2 surface explicitly preserves them

### 3. `slate-browser` abstraction drift

Failure:

- the phase turns `slate-browser` into a generic driver playground instead of a
  sharp proof contract

Mitigation:

- keep `openExample(...)` editor-shaped
- migrate callsites toward `ready`
- remove or quarantine transitional `waitFor*` options instead of layering more
  aliases

### 4. Reset/load policy stays implicit

Failure:

- the public story lands before the most load-bearing adoption seam is stated
  and proved

Mitigation:

- add a hard gate for replacement/reset history/selection semantics before broad
  README/package publicization

## Expanded Test Plan

### Unit

- `packages/slate/test/snapshot-contract.ts` when public replacement or
  selection semantics move
- `packages/slate-history/test/history-contract.ts` when migration rows expose
  undo/redo or replace-based reset regressions
- `packages/slate-dom/test/bridge.ts` and
  `packages/slate-dom/test/clipboard-boundary.ts` for shadow/iframe/clipboard
  seam fallout
- `packages/slate-react/test/runtime.tsx` for replace/history/selector-scope
  guarantees on the anchor surface

### Integration

- `playwright/integration/examples/replacement-compatibility.test.ts` as the
  curated replacement matrix
- targeted `slate-browser` package tests when the harness API changes
- anchor and placeholder/example-specific Playwright rows when a new public
  claim is added

### E2E

- local Chromium anchor lane:
  `playwright/integration/examples/rich-inline.test.ts`
- `slate-browser` IME/clipboard/anchors commands when browser-facing seams move
- cross-repo local replacement matrix against `../slate`

### Observability

- replacement scoreboard and benchmark JSON outputs stay human-readable and
  consumable by docs
- doc sync includes an explicit preserved / improved / not-yet-promised matrix
- stale-path drift checks catch old `slate-v2-*` names in public repo docs

## Phase Scope

### 1. Reset/Load Contract Gate

Before broad publicization, define and prove the controlled replacement
boundary.

Likely files:

- [/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-replace.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-replace.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/rich-inline.test.ts)
- a small repo-facing contract page documenting:
  - history policy on replacement/reset
  - selection policy on replacement/reset
  - what is preserved versus intentionally reset

Required proof:

- one focused runtime/browser lane showing replacement/reset plus
  history/selection behavior on the anchor surface

### 2. Repo-Facing Public Surface Cashout

Make `/Users/zbeyens/git/slate-v2` tell the truth about the current candidate.

Likely files:

- [/Users/zbeyens/git/slate-v2/Readme.md](/Users/zbeyens/git/slate-v2/Readme.md)
- [/Users/zbeyens/git/slate-v2/site/examples/Readme.md](/Users/zbeyens/git/slate-v2/site/examples/Readme.md)
- `/Users/zbeyens/git/slate-v2/packages/slate/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md`
- any repo-local docs page needed for compatibility envelope / migration posture

What this must say:

- the anchor surface
- the current compatibility envelope
- the migration rule
- the proof-lane ownership model
- what is still intentionally not promised
- `slate-browser` as proof infrastructure with its own conservative promise,
  not as settled product architecture

### 3. Curated Compatibility / Benchmark Widening

Add only the extra rows needed to justify the public story.

Likely files:

- [/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)
- replacement benchmark scripts under `/Users/zbeyens/git/slate-v2/scripts/`
- [/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

Default new rows:

- replacement placeholder row
- one selection/history/replace row tied to the reset/load contract gate
- one additional curated preserved/improved row only if the public docs need it
- one additional benchmark family only if the scoreboard gap is still real

### 4. `slate-browser` Truthfulness Pass

Treat `slate-browser` as the proof contract for the replacement repo.

Likely files:

- [/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md](/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md)
- any remaining Playwright rows still using `waitFor*` compatibility options

Expected move:

- migrate toward `ready`
- keep the current explicit backend split
- add no fake generic driver layer

### 5. Narrow Reset/Load Hardening Only If Forced

Do this only if the curated migration rows expose a real ambiguity.

Likely files:

- [/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-replace.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-replace.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- [/Users/zbeyens/git/slate-v2/site/examples/ts/rich-inline.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/rich-inline.tsx)

### 6. Internal Doc Sync

Every completed slice also updates:

- [/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [/Users/zbeyens/git/plate-2/docs/slate-v2/archive/cohesive-program-plan.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/cohesive-program-plan.md)
- [/Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/final-synthesis.md)

## Non-Goals

1. No fresh transaction-engine redesign.
2. No broad plugin/middleware API landing.
3. No wide legacy suite resurrection inside `slate-v2`.
4. No blanket “Slate fully replaced” claim.
5. No cross-browser IME heroics.
6. No geometry widening unless a curated claim actually forces it.

## Acceptance Criteria

1. `/Users/zbeyens/git/slate-v2` has one honest repo-facing explanation of:
   - the anchor surface
   - the compatibility envelope
   - the migration rule
   - the proof-lane matrix
2. Every claim in that repo-facing story maps to a current green proof lane or
   benchmark.
3. The replacement/reset contract is stated once and backed by a focused proof
   lane before broad README/package-doc publicization.
4. `replacement-compatibility.test.ts` covers every preserved-behavior claim
   made by the new repo-facing docs.
5. Maintained callsites and docs use `ready`, not transitional `waitFor*`
   aliases.
6. No new geometry proof lands unless a curated migration row exposes a real
   contract blocker.
7. `plate-2` top-level Slate v2 docs plus the Phase 7 source docs are
   resynced to the completed slice:
   - `overview.md`
   - `cohesive-program-plan.md`
   - `final-synthesis.md`
   - `phase7-compatibility-envelope.md`
   - `phase7-migration-story.md`

## Likely Failure Modes

1. README/package docs drift back toward legacy marketing or vague “beta”
   language.
2. The compatibility matrix widens faster than the migration story can stay
   honest.
3. The reset/load gate stays fuzzy and later docs freeze the wrong adoption
   contract.
4. A public claim exposes a real gap in selection restore, placeholder/IME
   behavior, or DOM boundary handling.
5. `slate-browser` API cleanup breaks useful existing proof rows because the
   migration was not staged.

## Proof Budget: Where To Be Cautious vs Direct

### Cautious proof required

- replacement/reset contract policy
- any new public behavior claim
- any `slate-browser` API removal or rename
- any change touching:
  - `Editor.replace(...)`
  - history grouping / restore
  - DOM point translation
  - IME / placeholder behavior
  - selection restore

### Direct implementation is fine

- repo-facing docs and package README work
- example catalog curation
- stale naming/path cleanup
- proof-lane matrix documentation
- public command / verification docs

## `slate-browser` Evolution During This Phase

`slate-browser` should evolve in three narrow ways only:

1. Make `ready` the canonical readiness contract.
2. Keep proving editor semantics through editor-shaped helpers, not raw
   Playwright soup.
3. Document lane ownership in the repo-facing story so it reads like part of
   the replacement-candidate proof stack, not durable product architecture.

Specifically:

- migrate remaining maintained rows away from `waitForEditable` /
  `waitForPlaceholderVisible`
- keep `openExample(...)` and the current namespaces
- avoid `openFixture(...)`, generic drivers, or fake cross-backend abstractions

## Legacy Slate Oracle Rules

Use legacy Slate from `/Users/zbeyens/git/slate` as a semantic oracle only.

Best references for this phase:

- [/Users/zbeyens/git/slate/packages/slate-history/test/history-editor-flags.js](/Users/zbeyens/git/slate/packages/slate-history/test/history-editor-flags.js)
  and
  [/Users/zbeyens/git/slate/docs/walkthroughs/06-saving-to-a-database.md](/Users/zbeyens/git/slate/docs/walkthroughs/06-saving-to-a-database.md)
  for reset/control intent:
  external replacement is a reset boundary, not ordinary history replay
- [/Users/zbeyens/git/slate/packages/slate-history/test/redo-selection.js](/Users/zbeyens/git/slate/packages/slate-history/test/redo-selection.js)
  and
  [/Users/zbeyens/git/slate/packages/slate-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js](/Users/zbeyens/git/slate/packages/slate-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js)
  for selection-restore intent
- [/Users/zbeyens/git/slate/packages/slate/test/transforms/insertFragment/of-blocks/with-inline.tsx](/Users/zbeyens/git/slate/packages/slate/test/transforms/insertFragment/of-blocks/with-inline.tsx),
  [/Users/zbeyens/git/slate/packages/slate/test/transforms/delete/selection/block-inline-across.tsx](/Users/zbeyens/git/slate/packages/slate/test/transforms/delete/selection/block-inline-across.tsx),
  and
  [/Users/zbeyens/git/slate/packages/slate/test/transforms/splitNodes/selection/inline-across.tsx](/Users/zbeyens/git/slate/packages/slate/test/transforms/splitNodes/selection/inline-across.tsx)
  for inline-boundary semantic intent
- [/Users/zbeyens/git/slate/playwright/integration/examples/search-highlighting.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/search-highlighting.test.ts)
  for highlight-result semantics
- [/Users/zbeyens/git/slate/playwright/integration/examples/shadow-dom.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/shadow-dom.test.ts)
  for nested shadow DOM reachability/editability
- [/Users/zbeyens/git/slate/playwright/integration/examples/iframe.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/iframe.test.ts)
  for iframe editability
- [/Users/zbeyens/git/slate/playwright/integration/examples/placeholder.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/placeholder.test.ts)
  for placeholder visibility and height intent
- [/Users/zbeyens/git/slate/playwright/integration/examples/select.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/select.test.ts)
  for triple-click/block-selection intent
- [/Users/zbeyens/git/slate/playwright/integration/examples/huge-document.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/huge-document.test.ts)
  only as a workload-shape reference, not a chunk-count contract to preserve
- [/Users/zbeyens/git/slate/playwright/integration/examples/paste-html.test.ts](/Users/zbeyens/git/slate/playwright/integration/examples/paste-html.test.ts)
  and
  [/Users/zbeyens/git/slate/site/examples/ts/paste-html.tsx](/Users/zbeyens/git/slate/site/examples/ts/paste-html.tsx)
  for the rule that HTML meaning stays app-owned

Do not cargo-cult:

- exact toolbar visuals
- exact chunk counts
- old example structure
- old helper APIs
- broad legacy package assumptions
- DOM-compensation hacks around inline/read-only cursor motion
- old batching internals and skipped tests

Copy the user-facing behavior or workload intent, not the old machinery.

Important gap callouts:

- controlled replacement/reset is still the most likely place where v2 should
  define a cleaner explicit contract instead of mirroring legacy ambiguity
- cross-root legacy coverage is only basic typing/newline coverage, not a full
  browser-semantics oracle

## When To Consult External Editor Sources

Do not do a fresh broad comparison pass.

Consult external sources only when answering a concrete question:

- **ProseMirror**
  when a migration row exposes a selection bookmark or undo-restore ambiguity
- **Lexical**
  when an IME/cross-browser proof question needs lane or harness guidance
- **Pretext / Premirror**
  only if inactive-region measurement re-enters the public story

If the question is not concrete, skip the external dive and keep moving.

## Recommended First Execution Tranche

### Files likely to move first

- [/Users/zbeyens/git/slate-v2/Readme.md](/Users/zbeyens/git/slate-v2/Readme.md)
- `/Users/zbeyens/git/slate-v2/packages/slate/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/README.md`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/README.md`
- [/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md](/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md)
- [/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts)

### First red tests to write

1. Add a red runtime or browser lane for replacement/reset semantics on the
   rich-inline anchor:
   history policy, selection policy, and explicit preserved/reset behavior.
2. Add a red replacement-row for the v2 placeholder surface only after the
   reset/load gate is green.
3. Add a red docs-backed assertion row only if the rewritten README claims one
   more preserved behavior beyond the current matrix.
4. If `slate-browser` removes `waitFor*` options in tranche 1, add a red test
   or failing callsite conversion that proves `ready` alone is enough for the
   maintained rows.

### First verification loop

1. `yarn workspace slate-react run test`
2. `yarn test:mocha`
3. `yarn test:replacement:compat:local`
4. rerun the targeted local browser lane for the changed example surface
5. run the relevant replacement benchmark command if the tranche touched a
   benchmark-backed public claim

Do not widen beyond this loop until the reset/load contract, repo-facing docs,
and supporting proof rows agree.

## Verification Matrix

### Package / unit

- `yarn test:mocha`
- `yarn workspace slate-dom test`
- `yarn workspace slate-react run test`

Run only the packages touched by the slice, but rerun `slate-react` whenever
the anchor surface story changes.

### Browser / harness

- `yarn workspace slate-browser test`
- `yarn test:slate-browser:e2e:local`
- `yarn test:slate-browser:ime:local`
- targeted example Playwright rows when only one surface changed

### Cross-repo replacement proof

- `yarn test:replacement:compat:local`
- `yarn bench:replacement:placeholder:local`
- `yarn bench:replacement:huge-document:local`
- one additional replacement benchmark family only if this phase introduces a
  new benchmark-backed public claim

### Doc drift

- search for stale `slate-v2-*` public naming in repo-facing docs/examples
- search for public claims without a named proof lane

## ADR

### Decision

Execute a repo-facing Phase 7 cashout on the proved anchor surface, gated by an
explicit replacement/reset contract.

### Drivers

- maximize release leverage now
- close the gap between internal proof truth and repo truth
- keep proof spend focused on adoption blockers

### Alternatives considered

1. Reopen engine/runtime architecture now.
2. Widen compatibility aggressively before publicization.
3. Keep proving more geometry.

### Why chosen

Because the replacement candidate is already credible in code and internal docs,
but the repo itself still tells a muddled story and the most load-bearing
adoption seam is still too implicit. Fixing that contract first, then closing
the repo-truth gap, is the fastest honest path toward a release-shaped Slate v2
surface.

### Consequences

- docs and proof lanes become part of the architecture, not afterthoughts
- any newly exposed seam weakness must be fixed narrowly and immediately
- broad replacement claims remain out of scope

### Follow-ups

- after this phase, reassess whether the next move is:
  - broader curated compatibility widening
  - package publishing posture
  - or a narrow engine/runtime hardening phase exposed by the new matrix

## Available-Agent-Types Roster

Recommended roster for follow-up execution:

- `explorer` for fast repo/oracle mapping
- `architect` for any seam pivot triggered by a failing curated row
- `critic` for plan and claim pressure-testing
- `executor` for repo/docs/test implementation
- `test-engineer` for replacement matrix and benchmark lane work
- `writer` for README/package-doc migration work
- `verifier` for final proof and doc-claim audit

## Follow-Up Staffing Guidance

### Ralph path

Use one sequential Ralph lane with these priorities:

1. docs/public-surface lane
2. curated proof-lane additions
3. narrow seam fix only if a curated row fails
4. internal doc sync and final verification

Suggested reasoning:

- docs lane: `medium`
- proof / seam lane: `high`
- final verification lane: `high`

### Team path

Use three workers with disjoint ownership:

1. **Docs worker**
   owns root README, package READMEs, example docs
2. **Proof worker**
   owns replacement matrix rows and any benchmark script additions
3. **Harness worker**
   owns `slate-browser` readiness cleanup and README sync

Leader keeps:

- `plate-2` doc sync
- scope control
- claim/proof audit
- final verification

## Launch Hints

### Ralph

`$ralph Execute /Users/zbeyens/git/plate-2/docs/plans/2026-04-05-slate-v2-next-major-autonomous-phase.md against /Users/zbeyens/git/slate-v2. Prioritize repo-facing public surface cashout, then only the proof rows needed to back those claims.`

### Team

`$team Execute /Users/zbeyens/git/plate-2/docs/plans/2026-04-05-slate-v2-next-major-autonomous-phase.md with docs/proof/harness lanes against /Users/zbeyens/git/slate-v2 and sync /Users/zbeyens/git/plate-2/docs/slate-v2/{overview,cohesive-program-plan,final-synthesis,phase7-compatibility-envelope,phase7-migration-story}.md before shutdown.`

## Team Verification Path

Before shutdown, the team must prove:

1. repo-facing docs match the actual anchor surface
2. every new claim is backed by a named proof lane
3. replacement compatibility rows and benchmark rows touched by the phase are
   green
4. `slate-browser` callsites used by maintained rows no longer depend on ad hoc
   readiness semantics or README examples

After team handoff, Ralph verifies:

1. final targeted package tests
2. final replacement matrix and benchmark commands
3. internal doc sync in:
   - `overview.md`
   - `cohesive-program-plan.md`
   - `final-synthesis.md`
