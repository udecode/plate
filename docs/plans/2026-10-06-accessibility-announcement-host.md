---
review_scopes: [accessibility]
review_basis: [2026-10-04-accessibility-audit-2]
verdict: pursue
work_kind: implementation
review_commit: 52625e85025313eebd4eeb9be2254249ded58676
review_inputs: [packages/plitejs/src/react/components/plite.tsx, packages/plitejs/src/react/hooks/use-runtime-focus-state.ts, packages/plitejs/src/core/transfer.ts, apps/www/src/registry/examples/dnd-multi-editor-demo.tsx, apps/www/src/registry/components/editor/dnd.tsx, content/docs/(plugins)/(functionality)/dnd.mdx]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Accessibility: one spoken announcement per action

Status: executed: built, verified and shipped with both guard tests; waits on your commit and your word on the dotai lesson patch
Playbook: plan

**Pursue.** One keyboard block move in the documented two-view DnD layout puts "Moved up" in two live regions, so a screen reader hears every announcement once per mounted view. Each sibling `EditorRoot` of one editor creates its own `PliteRuntimeProvider`, and each provider renders a live region that subscribes to every commit of that editor. A jsdom probe on the current tree proves it: sibling views populate two regions, nested views one. The better direction keeps the announcement effect, the application's wording, each provider's region and each provider's lifetime, and delivers each announcement through exactly one mounted region per editor. The rest of the scope holds: controls inside voids stay application focus targets, each Editable derives inactive selection paint on its own, and Tabbable stays an optional plugin whose kit owns its exclusions. This review reaffirms the 2026-10-04 Pursue, which no plan has adopted, and replaces its inferred evidence with a run.

The plan builds it in one phase under the Build playbook, `.agents/playbooks/build.md`. One private announcer per editor holds that editor's only announcement subscription, publishes commits in version order through the existing queue, and writes each message into one registered region. An audible region beats a hidden one: a region is audible when the browser shows it and no `hidden`, `inert` or `aria-hidden` ancestor in the flat tree hides it. Among audible regions, the one nearest the focused element speaks, then the earliest registered. A three-runner `architect` arena with an Opus cross-judge picked this design over focus history and over per-view or per-scope regions. Two plan panel rounds hardened the chooser against CSS-hidden panes and slotted content, and reverted a round-1 reordering that let a nearer hidden region win. The prototype passes every reproduction, premise probe and the frozen pre-acceptance budget before any production edit.

## Brief

### What will change?

Each editor message now goes into one live region, even when the page shows two views of one document. The region near the focused view gets it. The code and two guard tests are in your tree, not committed. The run's own mistakes also changed eleven workflow files here; six lessons for the shared pstack rules wait as a patch until you say to commit them in dotai.

### What could go wrong?

No screen reader ran. Old Safari, closed shadow roots and native modal dialogs can still pick a silent region. The last browser check after a small code move used scripted keys.

## Public API

No public call changes. The DnD kit's shortcut passes the same message; Plite React now writes it into one live region per editor instead of one per mounted view. Inside Plite React, each provider's region registers with a per-editor announcer instead of reading commits itself.

```ts before
// apps/www/src/registry/components/editor/dnd.tsx
moveBlockUp: {
  keys: 'mod+shift+arrowup',
  handler: ({ editor }) =>
    editor.api.transfer.move({ announce: 'Moved up', to: 'previous' })
      .status !== 'refused',
},
```

```ts after
// apps/www/src/registry/components/editor/dnd.tsx
moveBlockUp: {
  keys: 'mod+shift+arrowup',
  handler: ({ editor }) =>
    editor.api.transfer.move({ announce: 'Moved up', to: 'previous' })
      .status !== 'refused',
},
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| One announcer per editor chooses and fills one region | Plite | `plitejs/react`, `src/react/components/editor-announcement-live-region.tsx` | The editor owns its commits, and every provider of one editor shares that owner |
| Each provider keeps its empty region | Plite | `plitejs/react`, `src/react/hooks/use-plite-runtime.tsx` (unchanged) | Regions exist before a write, survive other providers and keep the server markup |
| Announcement wording and producers | Plite and Plate | `screenReaderAnnouncementEffect`, `editor.api.transfer.move` (unchanged) | Applications keep owning the words |

## Native behavior and proof

| Behavior | What changes | Where the proof ran |
| --- | --- | --- |
| Messages per action | One filled live region per editor, for nested, sibling and separate-React-root views | jsdom tests in the plitejs React suite; five real key presses on the DnD demo in the in-app Chromium browser |
| Which region speaks | An audible region (shown by `checkVisibility`, no `hidden`, `inert` or `aria-hidden` flat-tree ancestor) beats a hidden one; then the region nearest the focused element; then the earliest registered | jsdom tests for focus, `aria-hidden` and slots; Chromium reproductions for a CSS-hidden pane and the same cases |
| Modal dialogs | The Radix-style `hideOthers` keeps live regions in the accessibility tree, and focus inside a dialog makes its region the nearest; a native `showModal()` removes outside regions from Chromium's tree, which the chooser does not model | jsdom probe with `aria-hidden@1.2.6`; Chromium accessibility tree through CDP; screen reader unproven |
| Speech | Assistive technology hears one message | unproven: no screen reader available |
| Focus, selection, input, history, clipboard | Unchanged; the announcer only reads the focused element | existing suites |

## Main changes

- `EditorAnnouncementLiveRegion` renders an empty polite region and registers it with a per-editor announcer from a layout effect. The announcer holds the editor's one announcement subscription, keyed by the runtime owner in a module `WeakMap`, and is removed with its last region.
- The announcer publishes through `publishEditorCommitInVersionOrder`, reads messages with `getScreenReaderAnnouncements`, clears the previous speaker and replaces the chosen region's child with a fresh span, so a repeated message still changes the region.
- The build deletes the store, its watermark, its subscribe-time replay and the copied effect filter `getCommitAnnouncement`.
- The chooser walks the flat tree with the shared `getFlatTreeParentElement` (assigned slot, then parent element, then shadow host) for both the focused element and each region, so slotted content and open shadow roots rank and hide correctly.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Announcement delivery | Each provider's region subscribes and fills | One announcer per editor fills one region | `editor-announcement-live-region.tsx` | One action, one message | Internal; no caller changes | Tests 1 and 2, pre-acceptance probe | A region the user cannot hear wins | rearchitect |
| Region host | One region per provider | Unchanged | `PliteRuntimeProvider` | Lifetimes and server markup hold | None | Existing suite | None | keep |
| Speaker choice | None; every region speaks | Audible first, then nearest the focused element in the flat tree, then earliest registered | Announcer | A region a screen reader hears, preferring the pane the user works in when panes do not share one parent | None | Tests 2 to 4, Chromium reproductions F1, F1b and F3 | The audibility check is a proxy for the accessibility tree; native modal inertness is not modeled | rearchitect |
| Effect filter copy | `getCommitAnnouncement` | `getScreenReaderAnnouncements` | `src/core/screen-reader-announcement.ts` | One owner per rule | None | Existing suite | None | cut |
| Commit order | Per-region watermark | Existing version-order queue (diff panel round 1 swapped in a watermark for its gap tolerance; round 2 restored the queue because the watermark drops an outer message after a silent nested commit) | `src/core/commit-publication.ts` | A nested commit must not end on an older or missing message | None | Test 5 | The queue waits forever on a version gap | move |
| Region beside a dialog-hosted Editable | Absent | Absent | Open work | Additive, and a pre-existing gap | None | Screen-reader run | Outside region silent under a native modal | defer |

## Steps

- [x] 1. Rewrite the separate-roots case in `packages/plitejs/test/react/screen-reader-announcement.test.tsx` so exactly one of the two `render()` trees holds "Shared update" and the survivor holds "Still mounted" after the speaking tree unmounts. Run it at base and see both trees filled. Proof: a base run log and a passing run log in the run directory. Closed: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/build/tests-at-base.log` (both trees filled) and `build/tests-after-diff-round2.log` (passes).
- [x] 2. Add one case for the focus rule: two sibling `EditorRoot`s in two panes, focus a button in the second pane, announce, and only the second pane's region holds the message. It fails at base, with both regions filled, and under the mutation that ranks by registration order only. Proof: base, mutation and passing logs. Closed: base failure in `build/tests-at-base.log`; mutations `build/mutation3-registration-order-only.log` and, for the handoff added in diff round 1, `build/mutation3-no-speaker-clear.log`; passing in `build/tests-after-diff-round2.log`.
- [x] 3. Add one case for a hidden region: pane A holds a visible button and an `aria-hidden="true"` wrapper around its `EditorRoot`, pane B is visible, focus is on pane A's button, and only pane B's region holds the message. It fails under the mutation that drops the audibility check and under the mutation that ranks proximity before audibility. Proof: both mutation logs and a passing log. Closed: `build/mutation3-drop-audibility.log`, `build/mutation3-proximity-first.log`, passing in `build/tests-after-diff-round2.log`.
- [x] 4. Add one case for slots: two panes slotted into an open shadow root whose first slot sits under an `inert` wrapper, focus on an outside button, and only the second pane's region holds the message. It fails under the mutation that walks `parentElement` instead of the assigned slot. Proof: mutation and passing logs. Closed: `build/mutation3-parent-not-slot.log`, passing in `build/tests-after-diff-round2.log`.
- [x] 5. Add one case for nested commits: register a commit listener that runs one nested update before the `EditorRoot` mounts, announce, and the region ends on the nested message. It fails under the mutation that publishes without the queue. Proof: mutation and passing logs. Closed: `build/mutation3-no-queue.log`, passing in `build/tests-after-diff-round2.log`.
- [x] 6. Rewrite `editor-announcement-live-region.tsx` to the prototype's shape (`prototype-round2.patch`). Proof: the plitejs React announcement suite passes and the plitejs source typecheck passes. Closed: final module sha256 `7a6494e19fc8`; `build/tests-after-diff-round2.log` 10 of 10 and `build/typecheck-final.log` exit 0.
- [x] 7. Reconcile the editor-behavior law: the block-move note in `docs/editor-behavior/markdown-editing-spec.md` and its row in `docs/editor-behavior/editor-protocol-matrix.md` say the move is announced once however many views are mounted, and `docs/editor-behavior/current-evidence.md` maps the new tests. Run the `changeset` skill on the unreleased `plitejs` line that promises one `aria-live` region per logical editor. Proof: the diffs and the changeset skill's decision. Closed: the spec, protocol-matrix and evidence edits in this checkout; the `changeset` skill amended the unreleased `plitejs` line (no new changeset).
- [x] 8. Run `deslop` and `no-comments` on the product code and one `unslop` pass on the docs. Proof: the skill runs. Closed: `writing` rows in the decision log for `deslop`, `no-comments` and `unslop`.
- [x] 9. Run the panel on the diff (reviews: api-build). Proof: its decision-log rows. Closed: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/panel-diff-1/` and `panel-diff-2/` (prompts and seat answers), rows under phase `panel`.
- [x] 10. Run `pnpm exec ultracite fix`, `ultracite check` and `pnpm exec oxlint --type-aware` on the task's files. Proof: the lint logs. Closed: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/build/lint-final-2.log` and `build/oxlint-final.out` (exit 0, with a must-fail control).
- [x] 11. On the final bytes, retarget the Chromium reproductions and the enforced pre-acceptance probe from the prototype worktree to this checkout's `packages/plitejs` source and config, record the hash of the file they ran, and rerun F1, F1b and F3 plus the probe with `PROBE_ENFORCE=1` and the four frozen budgets. Proof: passing logs beside the enforced base control that fails. Closed: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/final/repro-final-3.log` and `final/bench-final-1.log`, `-2.log`; base control `bench-proto/base-enforced-control.log` fails.
- [x] 12. On the final bytes, in the in-app Chromium browser on the www DnD multi-editor demo, put the caret in the second view, press `Mod+Shift+ArrowUp`, and read every `role="status"` region: exactly one holds "Moved up". Five warm runs. Proof: a browser log and one screenshot in the run directory. Closed: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/final/browser-dnd.log` and `final/dnd-demo-after-5-runs.jpg`.

## Proof

Tests 1 to 5 run in the plitejs React suite with `pnpm exec vitest run test/react/screen-reader-announcement.test.tsx` from `packages/plitejs`. Each records a failing run, at base or under its named mutation, before its passing run. The CSS-hidden case runs only as a Chromium reproduction, because jsdom has no `checkVisibility`; no committed test guards it. The enforced pre-acceptance contract and the reproductions rerun on the final bytes, after the lint fix. The browser check proves the DOM state after the real shortcut in Chromium; speech stays unproven.

## Completion Gates

| Gate | Source | Artifact |
| --- | --- | --- |
| Execution authority | Build playbook | Autopilot after two plan panel rounds with no critical finding left: Build is a `look` default whose word is "hold" (Defaults); the user's request was `/best-api-review accessibility`, whose playbook continues a Pursue into this plan; build base `52625e8502`, and `HEAD` `da4898bb61` changes no file this build edits |
| Panel on the plan | AGENTS.md reviews list `api-plan` | Rounds 1 and 2 on frozen commits `fa1421aba4` and `daf32db403`, three seats each; decision rows under phase `panel` |
| Blast radius on a public API change | Build playbook | skip: no public API changes |
| Hard-cut sweep | Architecture reference, Hard cut | skip: no public surface is removed |
| `plate-docs` on affected pages | Build playbook | skip: no public docs page states the changed behavior; the DnD page's `announce` sentence stays true (`git grep` for announce and screen reader under `content/docs`) |
| `best-api repair` | Build playbook | skip: no reusable public API changes |
| Changeset for `plitejs` | Build playbook, `changeset` | The `changeset` skill amended the unreleased line in `.changeset/plite-react-read-only-provider.md`; no new changeset, because `plitejs` never shipped this behavior (`.changeset/pre.json`) |
| Editor-behavior law reconciliation | AGENTS.md Source authority | Block-move note in `docs/editor-behavior/markdown-editing-spec.md`, its row in `editor-protocol-matrix.md`, and the test map in `current-evidence.md` |
| Thermo-nuclear review of the shared Plite React diff | Build playbook | `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/thermo/00_summary.md`; run after the writing passes, an order slip logged with no resulting edit |
| Writing passes | AGENTS.md Writing passes | `deslop`, `no-comments` and `unslop` rows under phase `writing` |
| Panel on the diff | AGENTS.md reviews list `api-build` | Rounds 1 and 2 on frozen commits `d5d69736c5` and `3ad1c91278`, three seats each; round 2 restored the reviewed queue; the two guard tests, unreviewed, landed on your Ship answer |
| Lint fix on task files | AGENTS.md Delivery | `ultracite fix` and `check` on 2 of 2 files and `oxlint --type-aware` exit 0 (`build/lint-final-2.log`, `build/oxlint-final.out`); the docs files are outside lint |
| Scale contract rerun on the final path | Build playbook, `benchmark` | partial: `final/bench-final-1.log` and `-2.log` meet the frozen contract on the final bytes, but the run read `.agents/rules/benchmark.mdc` directly instead of invoking the `benchmark` skill first |
| Decision-trail review | AGENTS.md Decision-trail review | `codex:gpt-6.1-sol @xhigh` on frozen commit in `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/trail/`; 7 warnings and 2 nits, no critical, each answered by a `trail` row and summarized under Close |
| Ledger check and adoption | Build playbook close | `node tooling/scripts/review-ledger.mjs check` exits 0; `lookup accessibility` shows no open Pursue, so the executed Status adopts it |

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Which region speaks | A region a screen reader can see before a hidden one, then the one nearest the focused element | The region of the view that last had focus | focus history |
| Views in a dialog that share the main editor root | Keep today's region outside the dialog and track it as open work | Add a region beside each such editor now | dialog region now |
| Where the slot-aware parent walk lives | Moved into the DOM utilities at your request in this session (parent-walk plan) | Keep it private in the announcer | private walk |
| Where the scale probe runs | Accept the jsdom timing proxy | Measure browser frame time too | browser timing |
| Native modal dialogs | Leave them unmodeled; no Plate layout puts a view in one | Add the modal scope rule now, unreviewed | model modals |
| Build after two plan rounds | Build now; no critical finding remains | Hold for your review | hold |
| Scale gate proof | Accept the contract runs, though the run read the benchmark rule instead of invoking the skill | Rerun the contract through the benchmark skill | rerun scale |
| Browser proof after the parent-walk move | Accept the real-gesture run on the earlier bytes plus a synthetic-key recheck, because the moved walk is byte-identical | Rerun real key presses when the browser pane is visible | recheck browser |

## Open work

- Native modal dialogs. Chromium removes outside live regions from its accessibility tree while a `showModal()` dialog is open, and the chooser models neither that nor a modal that escapes an `inert` ancestor. A view nested under the outer provider in such a dialog has no region inside it, and a sibling view inside it loses to an outside region when focus sits outside every control. patch: stop the ancestor walk at a `dialog:modal`, make only regions inside an open modal eligible, and add a region beside an Editable portaled into a modal with the judge's fixes to candidate A. owner: zbeyens. stop: a Plate layout or an application report with a view of the editor in a native modal starts the build; otherwise the v2 release drops it as a documented limit. Tracked in `docs/plans/topics/accessibility.md` under Open work.
- A screen-reader run (NVDA with Chrome, VoiceOver with Safari) on the DnD multi-editor demo, hearing "Moved up" once per move. owner: zbeyens. stop: one recorded run, or the v2 release, which drops it as a known proof gap. Tracked in the subject file's Open work.
- A committed Chromium guard for the CSS-hidden pane, in the Plite browser lane. owner: zbeyens. stop: the next change to the chooser, or the v2 release. Tracked in the subject file's Open work.
- A region that registers while an older commit waits in the version-order queue can receive that older message, and the queue waits forever on a version gap, as when a plugin commit listener throws before notification. owner: zbeyens. stop: a report of a replayed message, or the v2 release. Tracked in the subject file's Open work.
- Focus inside a closed shadow root reads as its host, so regions inside it tie and the earliest registered speaks. A region inside an iframe document never shares an ancestor with the main document's focus path, so any main-document region beats it. owner: zbeyens. stop: a layout with two views of one editor inside a closed shadow root or an iframe, or the v2 release. Tracked in the subject file's Open work.
- The announcer keeps a release callback and a one-call wrapper (diff panel round 1); its walk moved to the DOM utilities. owner: zbeyens. stop: the next change to the announcer, or the v2 release. Tracked in the subject file's Open work.
- Closed in this session: the four private parent walks and the announcer's walk now share `getFlatTreeParentElement` ([plan](2026-10-06-plite-flat-tree-walks.md)). owner: zbeyens. stop: closed.
- Six shared-source reflect lessons wait as `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/reflect/shared/dotai-reflect-lessons.patch`, drafted against dotai `origin/main` 71ce7ed: the Panel review rule's narrow-owner fix and judge-reach-once sentences, the Todo list rule's pulled-in task prompts, the Decision-trail review's post-snapshot sweep, the `plan-page` Check bullet on stale rendered claims, and `decisions-check.mjs` `--help` with a clearer missing-`seats` refusal. None of these holds in any project until the patch lands in dotai and each project syncs. Before the dotai commit, sync-pstack's Lesson mode still needs the other managed projects' `apply --dry-run`, the smoke set, `verify` and the decision-trail review. owner: zbeyens. stop: your go on the dotai commit, or the next pstack sync, which drops the patch if you have not answered. Tracked here and in the patch's folder.

## Panel gate

Plan panel (reviews: api-plan), Opus, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh. Round 1 applied three critical findings and dismissed one. Round 2, the last allowed round, applied one critical finding by reverting round 1's reordering and dismissed two by reach; every change after it is subtractive or a narrowed claim. No critical finding remains. Diff panel: after the build (reviews: api-build).

## Close

Reversals and deviations first.

- Commit order: diff panel round 1 replaced the plan's version-order queue with a version watermark for its gap tolerance; round 2 showed the watermark drops the outer message after a silent nested commit and restored the queue. The shipped code matches the approved plan.
- Speaker ranking: plan panel round 1 ranked focus proximity first; round 2 found a nearer hidden region could then win and reverted to audible first.
- Dropped from this plan: moving `getComposedParentElement` into the DOM utilities (plan round 1). The parent-walk task in this session then moved the announcer's walk into `getFlatTreeParentElement` in `packages/plitejs/src/dom/utils/dom.ts` ([plan](2026-10-06-plite-flat-tree-walks.md)); the suite, the Chromium reproductions and the bench reran on the new bytes, and the browser check reran with synthetic keys only.
- Order slip: the thermo-nuclear review ran after the writing passes instead of before them; it changed nothing.
- Process failure: the diff-round-1 watermark swap changed an approved mechanism without stopping for the owner, as the Build playbook requires; round 2 restored the approved queue.
- The lint fix rewrote the layout effect's early return to satisfy `consistent-return`; the change is behavior-identical and had no panel review. The mutation proofs ran on the bytes before that edit, and the suite, Chromium reproductions, bench and browser check ran after it.

What landed, uncommitted in this checkout: `packages/plitejs/src/react/components/editor-announcement-live-region.tsx` (one announcer per editor, an audible-first and focus-nearest chooser, a flat-tree walk, the version-order queue, imperative writes into the provider's empty region); five new or rewritten cases in `packages/plitejs/test/react/screen-reader-announcement.test.tsx`; one-clause edits in `docs/editor-behavior/markdown-editing-spec.md`, `editor-protocol-matrix.md` and `current-evidence.md`; the amended line in `.changeset/plite-react-read-only-provider.md`. No public API changed.

Proof: the five tests fail at base or under their named mutations and pass on the final bytes (sha256 `7a6494e19fc8`, and `0f8d8be92ae2` after the parent-walk move); the plitejs typecheck and lint pass; the Chromium reproductions for the CSS-hidden, nearer-hidden and slotted cases pass; the frozen pre-acceptance contract passes twice (listeners fall from 2N to N + 1, one populated region, under budget); on the DnD multi-editor demo in Chromium, five real `Mod+Shift+Arrow` moves each fill exactly one region, in the focused view. Limits: no screen reader ran; native modal inertness, closed shadow roots, iframes and browsers without `checkVisibility` stay unmodeled; the scale gate is partial because the `benchmark` skill was read, not invoked.

Counts: 12 steps done of 12. Completion gates: 15 in all; 10 done, 1 partial (scale rerun, accepted in Defaults), 4 skipped (blast radius, hard cut, `best-api repair`, `plate-docs`). Open work: 7 open items, the shared lesson patch included, and 1 closed item.

Review inputs this work read beyond the scope's own files: `packages/plitejs/src/react/components/plite.tsx` and `packages/plitejs/src/react/hooks/use-runtime-focus-state.ts` (provider reuse and focus granularity), `packages/plitejs/src/core/transfer.ts` (the `announce` producer), `apps/www/src/registry/examples/dnd-multi-editor-demo.tsx` and `apps/www/src/registry/components/editor/dnd.tsx` (the documented two-view layout and its shortcut), and `content/docs/(plugins)/(functionality)/dnd.mdx`.

The owner answered the Ship question "Ship (Recommended)", so the two guard tests from `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/panel-diff-2/unreviewed/` are in `packages/plitejs/test/react/screen-reader-announcement.test.tsx`; no panel reviewed them, and each fails on the bytes it guards against (`build/ship-silent-on-watermark.log`, `build/ship-aria-on-case-sensitive.log`).

Side task done in this session at the owner's request: the DnD docs no longer tell readers to mount a second view with `suppressInstanceWarning`, and the API reference describes the prop as silencing the duplicate `platejs` package warning (`content/docs/(plugins)/(functionality)/dnd.mdx`, its Chinese twin, `content/docs/api/core/plate-components.mdx` and its twin); the demo and the Plite example drop the prop; `pnpm --filter www build:registry` regenerated the docs payloads, which also refreshed seven docs payloads stale from other sessions' content edits. `pnpm --filter www check:docs` stopped at `api-reference:check` on a `HistoryApi` classification error that these edits do not touch; no run at `HEAD` shows it predates them, and the docs source parity check passed on its own. Evidence: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/dnd-docs/`. The DnD chip also asked whether `suppressInstanceWarning` earns its place: it is a per-root switch for a page-level condition (two copies of the `platejs` module), so it silences nothing unless every root sets it, and outside tests only dev pages and the probes set it. The `best-api` lens points at cutting the prop and warning once from the module; that public cut belongs to a `best-api-review`, not this run.

### Decision-trail review

reviewed by codex:gpt-6.1-sol @xhigh

- Warning: the diff-round-1 watermark swap crossed the Build playbook's stop for a substituted mechanism; resolved when round 2 restored the queue.
- Warning: "final bytes" named two module versions; a superseding row maps each check to its bytes.
- Warning: the native-modal dismissal called valid markup self-contradictory; restated as a limit accepted by reach.
- Warning: the older-browser dismissal overstated its cost evidence; restated as an accepted support limit with inferred cost.
- Warning: Status said executed before the subject fold, the scale gate had no accepted narrower proof, and the docs unslop row was a pattern scan; the fold, a Defaults row and a real unslop pass close these.
- Warning: the guard-test question did not take the Ship form; it was asked again as Ship, Reviewed only, Hold or Another round, and the owner answered Ship.
- Warning: the side-task close omitted the failed `check:docs` step; the Close now names it.
- Nit: the gate count was wrong; it is 15.
- Nit: the queue's gap stall had no owner; the Open work item now carries it.

### Reflect

`/pstack:reflect` mined this session (`docs/plans/artifacts/2026-10-06-accessibility-announcement-host/reflect/synthesizer/output.md`). Accepted 23, rejected 8, backlog 6.

Applied in this checkout under the standing reflect authority:

- `verify` testing reference: a premise probe counts only once it fails with its mechanism mutated out, and a fix that swaps a mechanism or reorders a rule first adds a differential case.
- `benchmark`: time budgets follow how often the operation runs, jsdom cannot measure a style read, the probe asserts every frozen line and fails on a missing budget, and Vitest probes print through `--reporter=verbose --silent=false`.
- Build playbook: thermo runs as a fresh-context subagent and its blockers are fixed in the slice, `oxlint --type-aware` runs before the panel freeze, and an early-round panel fix lands its reproduction as a test.
- `verify`: `pnpm --filter www dev` rewrites registry output, so a proof launches `next dev` directly; source mode is the default, read from `/api/plite/ready`, and bound by an observation only the new code produces.
- `verify` command recipes: the Vitest reporter flags, a `plitejs` probe recipe for jsdom and Chromium, and the Vite reload check before a reinstall.
- `review-ledger.mjs`: the reconcile refusal names `retains`, `reopens` and `supersedes`.
- API review playbook: a Pursue publishes its page before continuing. Plan playbook: list a losing candidate's extra cases before grafting.
- `AGENTS.md` Playbooks paragraph and `best-api-review`: a direct playbook entry loads poteto-mode, runs `check-playbooks.mjs` and follows the base playbook.
- `plate-docs` description: fires before any edit under `content/docs`. Edited directly, without the description-optimization loop the routing named, so its trigger is unproven.

The six shared-source lessons wait as a patch under Open work.

Rejected: a stand-in proof logged `partial` (already the rule); evidence naming an observation (show-me-your-work already asks it); a `changeset` trigger tune (its description already fires); the ledger's "## Close does not name" message (it names the path); the www alias merge order (a config detail that drifts); a poteto-mode description tune (pstack is not edited here); a build.md pointer to the narrow-owner rule (duplicate); "no MCP lookup was missed" (an observation, not a lesson).

Backlog, each owner: zbeyens, stop: the next `/pstack:correct` or the v2 release, tracked here:

- Whether a test-only guard that fails on the regressed bytes counts as additive under the round cap, through sync-pstack.
- An accessibility-tree proof helper in `@platejs/test`, listed in `verify`'s inventory.
- A `verify` preflight for a hidden Browser pane, which breaks real clicks and keys.
- Removing the `MODULE_TYPELESS_PACKAGE_JSON` warning that oxlint and oxfmt print for the root configs.
- Splitting `check:docs` so one failing sub-check does not hide the parity check.
- A shared helper that saves a background agent's reply verbatim to the run directory.

## Evidence

Model: Claude Opus 5.5 (claude-opus-5-5)

### Requirements

- Announcements are local, ephemeral commit effects that skip history and collaboration, and the application owns the wording (`packages/plitejs/src/core/screen-reader-announcement.ts`).
- A screen reader hears each user action once, however many views of the document the page mounts.
- Each independently mounted React tree keeps a working announcement path when the others unmount, and no shared registry outlives the views that hold it.
- A message reaches a region the user can hear: a region under a hidden or inert ancestor never wins while a presented region exists, and the region nearest the focused element wins. A view nested under the main `EditorRoot` but portaled into a dialog keeps sharing the outer region; that gap predates this plan and is open work.
- Controls inside voids and content roots stay application focus targets, and focus belongs to the exact mounted view.
- Inactive selection paint derives from each Editable's own focus change, with no public toggle or second selection state ([plite.md](../vision/plite.md)).
- Tab traversal across embedded controls stays an optional product plugin whose exclusions belong to the kit.
- The fix needs no public API change, and the plan accepts none without a job that pays for it.

### Prior work and reconciliation

- [2026-10-04-accessibility-audit-2](../research/review-records/2026-10-04-accessibility-audit-2.json), the head: this review supersedes it with the same verdict and direction. It replaces its inferred sibling duplication with a jsdom run, adds the dialog requirement that decides which region speaks, and drops its stale-vocabulary flag for `docs/vision/plite.md`, which now teaches `data-editor-*`.
- [2026-10-04-accessibility-audit](../research/review-records/2026-10-04-accessibility-audit.json) and [2026-09-12-accessibility-owner-boundaries](../research/review-records/2026-09-12-accessibility-owner-boundaries.json): the head already superseded both, and this review retains that. The 2026-09-12 choice of one region per provider loses to the sibling-view requirement.
- [2026-10-01-dnd-transfer-consolidation](2026-10-01-dnd-transfer-consolidation.md), a landed plan: this review retains it, because it added `announce` to `editor.api.transfer.move` and the documented two-view DnD layout, which is where the duplicate speech now shows. It does not adopt this gap.
- [2026-09-12-plite-view-design](2026-09-12-plite-view-design.md): this review retains it for provider lifetimes. Its line "Independent layouts keep N providers/views/announcement hosts" stays true for hosts; delivery is what changes.
- Freshness since the head: `packages/plitejs/src/react/hooks/use-plite-runtime.tsx` changed only in import order (`git diff 17195da367 0dfa19ab11`); `apps/www/package.json` and the `best-api` skill changed without touching this question. `VISION.md`, `docs/vision/common.md` and `docs/vision/plite.md` moved; their current text on `EditorRoot`, providers and inactive selection was reread and agrees.
- Search: `review-ledger.mjs lookup accessibility --detail`, then `git grep` over `docs/plans` and `docs/research` for "live region", "announcement host" and `EditorAnnouncementLiveRegion`. No other plan touches announcement delivery. The 2026-10-03 autocomplete plan refused the effect for result counts and keeps its own popup region, which is outside this question.

### Census

- Probe: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/probe/sibling-views.log`, exit 0, run with the package's own vitest and jsdom setup on the current tree. Two sibling `EditorRoot`s of one editor render two `role="status"` regions, and one `screenReaderAnnouncementEffect` populates both. The control, two nested `EditorRoot`s, renders one region and populates one.
- Producers of the effect: `editor.api.transfer.move` (`packages/plitejs/src/core/transfer.ts:670`), called with `announce` from the copied `dnd`, `block-menu`, `column` and `table` components. Consumers: only `EditorAnnouncementLiveRegion`, which keeps its own copy of the effect filter instead of calling `getScreenReaderAnnouncements`.
- Sibling `EditorRoot`s of one editor: the registered `dnd-multi-editor-demo`, shown on the DnD docs page, the `plate-dnd-cross-editor` Plite example, the suggestion performance dev page and two package probes. Multi-root examples and the authored example nest their roots under one provider and are not affected.
- `useRuntimeFocusState` reads `ReactEditor.isFocused` on the shared runtime, so it cannot tell which sibling provider holds focus; a target that prefers the focused view needs a per-provider signal.

### Lanes

- **Keep one region per provider** (the incumbent, chosen 2026-09-12): loses. The probe shows two populated regions for one action in a documented layout.
- **Delete the built-in region; the app or a Plate kit mounts an announcer** (the strongest deletion): loses. Plite would stop speaking a neutral effect that every app emits through `transfer.move`, every app would have to add a host, and the copied Plate `Editor` mounts once per view, so the duplicate returns at the kit layer.
- **One region per editor in the document body, counted by mounted providers** (Lexical's shape): loses on placement. A view inside a modal dialog or a shadow root needs its region in the same subtree, which Lexical solves with an `owner` input. Here that would be a new public option with no other job.
- **Pool providers by editor**, one provider per editor per page: loses. It merges independently owned effects, caches and lifetimes, which the 2026-09-12 Plite view design rejected.
- **Merge announcements, focus and Tab traversal into one manager**: loses, as on 2026-09-12. Their lifetimes and owners differ, and the merge removes no work.
- **Editor-scoped delivery** (the target): wins. Every provider keeps its region for lifetime and placement. One private announcer per editor subscribes to commits while any region is mounted and writes each message into one region: the one beside the view that last held focus, else the earliest mounted. It deletes the per-region commit subscription and the copied effect filter. The design arena below picked the selection rule: the presented region nearest the focused element.

### Predicted benefit

One user action produces one populated live region in every layout, nested, sibling or separate React roots, and the region nearest the focused element holds it. Each announcing commit wakes N + 1 commit listeners instead of 2N and renders no React component. Held when tests 1 to 4 fail at base or under their mutations and pass after, and the production rerun of the pre-acceptance contract passes. Falsified if any layout still populates two regions or none, or a cohort misses the frozen budget.

### Design arena

- Grounding: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/how.md`, an Opus trace of delivery, providers, views and focus, and `why.md`, which finds one region per logical editor in the 2026-07-19 extraction plan and the per-provider count inherited from the 2026-09-12 lifetime cut without a speech decision.
- Runners, read-only through `cross.mjs`: Opus (candidate A), `gpt-6-astra` at xhigh (B), `gpt-6.1-sol` at xhigh (C). All three answered.
  - A kept provider regions and chose the region nearest the focused element at commit time, with no focus state, plus a region beside an Editable portaled into a dialog.
  - B moved regions to one per document, dialog or shadow scope, created by a dispatcher, with focus listeners and a focus-only host for menus.
  - C moved regions to one per mounted view, with focus history from the per-view DOM scope subscription and modal and visibility checks.
- Cross-judge, Opus, blind labels: A 20, C 17, B 15 of 24 (`arena/judge.md`). It verified the deciding citations and found false premises in B (the frozen probe cannot see body-appended regions; `getEditorDOMRoot` deletes shared state) and C (a view's React position is not its DOM position under portals; a test script that does not exist).
- Pick: A, matching the judge. Grafts from C: the version-order queue, because A's plain listener ends a nested commit on the older message, and an imperative write into the React-rendered empty span, which deletes per-region state and makes clear-then-fill synchronous across React roots. From B: the newly mounted region starts empty, kept as a premise probe. Rejected: A's Editable-level dialog region, deferred to open work because it adds machinery for a gap that predates this plan and, per the judge, mounts regions inside a parent contenteditable for content roots and sets state directly in a layout effect; B's dispatcher-created nodes inside React-owned dialogs and menus; C's region per view, which multiplies regions and moves none into a portal.

### Premise proofs

Run on the prototype, `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/prototype.patch` applied to 52625e8502, with the base as control (`premises/premises-1.log`, exit 0; `premises/premises-base-control.log`, exit 1). After panel round 1 they rerun on `prototype-round1.patch` (`premises/premises-round1.log`, 11 of 11 pass), and P4b fails under the queue-bypass mutation (`premises/p4-queue-bypass-mutation.log`).

| Premise | Prototype | Base |
| --- | --- | --- |
| Sibling views in one React root fill one region | pass | fail, two filled |
| Separate React roots fill one region; the survivor speaks after the speaker unmounts | pass | fail |
| The region nearest the focused element speaks | pass | fail, both filled |
| A region under `aria-hidden` loses to a presented one | pass | pass, both filled |
| A nested commit inside a listener registered after the region ends on the later message (P4) | pass | pass |
| A nested commit inside a listener registered before the region ends on the later message (P4b) | pass; fails under the queue-bypass mutation | not run |
| An announcement from a descendant layout effect on mount is caught | pass | pass |
| A provider re-render keeps the written message | pass | pass |
| `aria-hidden@1.2.6` `hideOthers` keeps live regions presented | pass | pass |
| Two editors keep independent regions | pass | pass |
| StrictMode leaves N + 1 commit listeners for N providers (P9; base gives 2N by design, not a leak) | pass | fail, 2N |

The existing suite on the prototype: five of six cases pass; the separate-roots case fails because it pins the duplicate (`proto-existing-tests.log`).

### Pre-acceptance probe

Contract frozen before any target ran: `docs/plans/artifacts/2026-10-06-accessibility-announcement-host/bench/contract.md`. Median ms per announcing commit, jsdom, 200 commits by 5 repeats, sibling `EditorRoot`s of one editor, focus on `body`:

| N | Baseline at 52625e8502 | Prototype, run 1 | Prototype, run 2 | Budget |
| --- | --- | --- | --- | --- |
| 1 | 0.0599 | 0.0397 | 0.0418 | 0.0859 |
| 2 | 0.0699 | 0.0339 | 0.0343 | 0.0969 |
| 8 | 0.1177 | 0.0543 | 0.0512 | 0.1495 |
| 32 | 0.3586 | 0.1188 | 0.1195 | 0.4145 |

Commit listeners fall from 2N to N + 1, and populated regions from N to 1, in every cohort (`bench-proto/baseline-worktree-1.log`, `prototype-1.log`, `prototype-2.log`, all exit 0). After panel round 1 the probe enforces the contract (`PROBE_ENFORCE=1`: one populated region, at most N + 1 listeners, zero listeners after unmount, the time budget). The round-1 prototype passes it twice, at 0.0459/0.0365, 0.0358/0.0333, 0.0445/0.0417 and 0.0781/0.0750 ms (`prototype-round1-1.log`, `prototype-round1-2.log`), and the base fails it with "expected 2 to be 1" (`base-enforced-control.log`, exit 1). The budget column applies the contract's rule to this clean-worktree baseline; the first baseline, from the shared checkout, gave 0.0608, 0.0750, 0.1212 and 0.3631. The timing is a jsdom proxy, and focus on `body` makes every region tie, so it does not time the deepest focus walk.

### Challenge delta

Improved. The review proposed the region of the provider whose view last held focus, else the earliest mounted, with a handoff on unmount. A stateless choice at commit time replaces that rule. No record of the last-focused view spans providers, so the review's rule needed new focus state shared across providers. Deleted from the target: the focus record and the handoff. Added: reuse of the commit version-order queue. Deferred: a region beside a dialog-hosted Editable. Panel round 1 added the flat-tree walk and `checkVisibility`, dropped the move of `getComposedParentElement`, and briefly ranked proximity first; round 2 reverted that ranking to audibility first and deleted the single-region fast path.

### Plan panel round 1

Seats: Opus, `gpt-6-astra` at xhigh and `gpt-6.1-sol` at xhigh, all answered, on frozen commit `fa1421aba4` (`panel-plan-1/`).

- Applied, critical: a CSS-hidden first pane won a tie and the visible pane stayed silent; a region inside a native modal under an `inert` ancestor lost to an inert outside region; the walk skipped slot assignment. Chromium reproductions F1 to F3 fail on the first prototype and pass on `prototype-round1.patch`, with must-accept cases M1 and M2 (`panel-plan-1/repro/`).
- Dismissed, critical: build a region inside a native modal that hosts a nested view now. The gap predates this plan with the same outcome, and no registry layout puts a view of the same editor in a dialog. Chromium's accessibility tree confirms that a native modal removes an outside live region (`panel-plan-1/repro/ax-modal.log`), so the open work keeps a real trigger.
- Applied, warnings: the nested-commit probe order, the step order, the enforced bench and the dialog trigger. Deferred, warnings: a per-region commit baseline and focus inside closed shadow roots or iframes.

### Plan panel round 2

Seats: the same three, all answered, on frozen commit `daf32db403` (`panel-plan-2/`), reviewing only the round-1 delta.

- Applied, critical, all three seats: ranking proximity first let a nearer `aria-hidden` region beat an audible farther one. Reverted to round 1's ranking. F1b in Chromium and R2a in jsdom fail on the round-1 bytes and pass after (`panel-plan-2/repro-round1-before-revert.log`, `repro-after-revert.log`, `premises-after-revert.log`).
- Dismissed, critical: the round-1 modal-under-`inert` case, reopened by the revert, needs markup that inerts the dialog it shows; and native modal inertness with focus outside the dialog's controls needs a native modal holding a view of the same editor, which no Plate layout has. Both go to the native-modal open work with their patch, dismissed by reach and a recoverable outcome; the modal-under-`inert` layout is valid HTML that no registry component builds.
- Applied, warnings: the `hidden` check restored for browsers without `checkVisibility` (R2b), committed tests for the hidden ranking and the slot walk, final-bytes probes retargeted to this checkout, and a bench that refuses to enforce without its budget (`bench-proto/prototype-round2-nobudget-control.log`). Deferred: a committed Chromium guard for the CSS-hidden case, and moving the flat-tree walk into the DOM utilities.
- Round-2 prototype: Chromium F1, F1b, F3, M1 and M2 pass, F2 fails as dismissed; jsdom premises 14 of 14; enforced bench passes twice at 0.0410/0.0395, 0.0386/0.0355, 0.0563/0.0566 and 0.1335/0.1338 ms (`bench-proto/prototype-round2-1.log`, `-2.log`).

### Proof limits

Source review, jsdom probes, Chromium reproductions and a prototype in a detached worktree. No screen reader ran. This plan infers from populated polite regions that a screen reader speaks twice today and once after the change; nobody listened. The CSS-hidden case has no committed test. Native modal inertness is not modeled (see Open work). CSS-hidden detection needs `checkVisibility` (Chrome 105, Firefox 106, Safari 17.4); older browsers fall back to the `hidden`, `inert` and `aria-hidden` attributes. A closed shadow root hides slot assignment, so an `inert` wrapper around a slot inside it is not seen. `getActiveElement` reads the global document and open shadow roots only. Sibling `EditorRoot`s under one parent element tie on proximity, so the first registered one speaks even when focus is in the second; both are audible there. An announcement emitted before the first region of an editor registers, such as from an earlier sibling's layout effect in the same commit, is not announced; the old store replayed the last commit on subscribe. `docs/analysis/2026-09-06-use-sync-external-store-audit.md` row SES-38 still describes the deleted `useSyncExternalStore` read; it is a dated audit and stays as history. Slate was read at `945a484df` with two uncommitted files in its checkout, so it is left out of `review_upstreams`. `TabbableEntry.slateNode` is still stale vocabulary, and it belongs to the `editor-public-naming` scope, not this one.
