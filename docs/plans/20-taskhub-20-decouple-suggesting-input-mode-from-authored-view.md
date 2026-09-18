# TaskHub 20 decouple suggesting input mode from authored view

Objective:
From the latest `next`, make Suggesting control only future input intent while
the mounted authored view continues to show and review existing Add, Delete and
replacement suggestions. Preserve explicit accepted-only projection, authored
identity/data, view-local state and Plate/Plite ownership.

Task source:
TaskHub #20.

Template:
.agents/skills/autogoal/assets/templates/major-task.md

Primary template:
.agents/skills/autogoal/assets/templates/major-task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)

Completion threshold:
AC1-AC8 are resolved with current source, focused package checks and fresh
Playground browser proof on the final local code state. Public API/docs and
generated registry output agree, the plan checker passes, and TaskHub #20 is
returned to `review`. Commit, push, PR, release and deployment are outside this
local-only threshold.

Verification surface:
Plite authored-view contracts and source-first typechecks; Plate suggestion
contracts and source-first typechecks; current English/Chinese Suggestion and
Authored Changes docs; Plate Next doctrine; the `apps/www` homepage Playground
and persistence demo in Chromium; generated registry output; TaskHub readback.

Constraints:
Preserve accepted canonical document data, authored IDs/authors/dependencies,
comment lifecycle, accept/reject and undo/redo semantics, IME/selection, and
per-mounted-view configuration. Do not add a second document, suggestion store,
global mode, effect replay or CSS-only workaround. Preserve behavior and
authority outside the issue.

Boundaries:
Allowed changes are the owning Plite authored view/input API and runtime, the
Plate suggestion-mode adapter, affected toolbar/browser contracts, public docs,
Vision/rules, changesets and generated registry output. Non-goals are changing
the Playground's default Suggesting value, broad Notion parity, Diff redesign,
unrelated repairs, publication, deployment or external messages.

Delivery:
Local-only. The current checkout is not committed or pushed, and no PR, release
or deployment is authorized.

Blocked condition:
None. The required package, docs, registry and browser surfaces were available
and the selected semantics follow the existing authored owner.

Work Checklist:
- [x] AC1: Existing Add/Delete/replacement suggestions, applicable marks, review
      cards and comment entry points remain visible through the fixed and
      floating mode controls.
- [x] AC2: Editing maps to `edit + markup` and writes only exact accepted
      targets directly; Suggesting remains `propose + markup`.
- [x] AC3: Toggling mode changes no serialized document/authored/comment data,
      performs no review decision and adds no document undo step.
- [x] AC4: A seeded suggestion accepts after both toggles, undo restores it,
      and direct edit history undo/redo preserves pending proposals.
- [x] AC5: Pending insertions, retained deletion fragments and mixed
      accepted/pending selections are review-only in Editing; exact accepted
      targets remain writable without accepting, duplicating or corrupting a
      proposal.
- [x] AC6: Two views over one document retain independent policy, and an
      equivalent parent rerender preserves the view-local mode.
- [x] AC7: Explicit `edit + accepted` remains available; composition defers the
      switch, selection is mapped strictly, and subsequent accepted input works.
- [x] AC8: Source-first checks, authored/suggestion/history contracts, docs,
      generated registry output and fresh Chromium proof agree.
- [x] The representative callers are both toolbar controls; the governing
      invariant is one mounted authored policy with independent intent and
      projection; the riskiest coordinate-mapping case is covered by strict
      accepted round trips and pending/mixed no-op tests.
- [x] The design reuses the existing `AuthoredView`; it deletes the fixed
      `editing => accepted` coupling without adding another owner or store.
- [x] Browser route and interaction are recorded: create a replacement on `/`,
      use fixed Suggestion→Editing, use the floating pencil twice, open review,
      accept, then undo; also save/reload on
      `/blocks/suggestion-persistence-demo`.
- [x] Browser proof uses the existing Playwright Chromium owner at
      `http://localhost:3297`; no native Chrome/OS surface is involved.
- [x] Strict browser runtime-error collection reports no page/console errors;
      network delivery is outside this local editor-state issue.
- [x] Exact visual-color/pixel classification is N/A: the claim is element
      visibility and review reachability, proved by browser layout visibility,
      authored marker attributes, deletion decoration and the live review
      action rather than custom compositor pixels.
- [x] The pre-fix failure was reproduced on `/blocks/playground`: switching the
      fixed control to Editing hid pending additions while deletion/comment
      review remained. The final exact case passes on the same local product
      sources through the homepage Playground.
- [x] Final browser proof starts a fresh Next process after registry generation;
      the test opens fresh pages and rechecks model value, history, toolbar,
      markers, review entry, accept, undo and strict runtime errors.
- [x] Clean pushed-ref proof is N/A for this authorized local-only candidate.
      Base `HEAD` and `origin/next` are both
      `8748befe14b00cc9ab554fecba467075d207ad12`; issue-owned changes are
      intentionally uncommitted and are not presented as published proof.
- [x] Five-run native paint/focus stability is N/A: no native selection paint,
      DnD, compositor or React lifecycle defect is claimed. The focused browser
      replay completed retry-free on the fresh process.
- [x] The public package delta is `EditorViewOptions.authored` accepting
      `edit + markup`, plus Plate's mode mapping. Existing branch changesets for
      `plitejs` and `platejs` contain the user-visible release lines.
- [x] `registry-changelog` is N/A because this is package behavior/API work,
      not a registry-only component change. Registry JSON is generated output.
- [x] Compatibility is intentionally widened at the Plite API and behavior is
      changed at Plate's adapter; `propose + accepted` and `edit + proposed`
      remain rejected.
- [x] Runtime-scale pack is N/A: collapsed normal input uses existing authored
      anchors; only expanded selections inspect their selected authored spans,
      with no document-wide subscription, replay or new persistent layer.
- [x] Package-owned typechecks, contract tests and React tests pass.
- [x] Barrel generation is N/A because no export or exported-file layout changed.
- [x] English/Chinese docs, API reference, Vision, research decision and Plate
      Next v200 state the same current behavior; source build and registry
      source parity pass.
- [x] TaskHub #20 is conditionally moved from `in_progress` to `review` and read
      back after all technical evidence closes.

Decisions and tradeoffs:
The hard-cut result is to keep one `AuthoredView` owner and permit
`{ intent: 'edit', projection: 'markup' }`. Plate modes choose future input
intent while markup stays mounted. Exact accepted coordinate targets are mapped
by authored anchors and round-trip validation. A target containing any pending
content fails closed, which avoids implicit decisions and preserves authorship.
The separate explicit accepted projection remains the clean-view option.

The official Notion behavior was used only as product evidence that entering or
leaving Suggesting is distinct from accepting/rejecting suggested edits:
https://www.notion.com/help/suggested-edits. Source ownership remains local.

Plite decision ledger:

| Surface | Previous | Target | Owner | Adoption | Proof | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Authored view | Editing required accepted projection | Editing may retain markup with strict accepted writes | Plite mounted view | Runtime, types, docs | 40 authored tests; typechecks | accepted |
| Suggestion mode | `editing => edit + accepted` | `editing => edit + markup` | Plate SuggestionPlugin | Both toolbar callers | 8 Plate tests; 2 toolbar tests; browser | accepted |

Verification evidence:
- Intake: `git pull --ff-only origin next` reported already up to date; both
  refs resolved to `8748befe14b00cc9ab554fecba467075d207ad12`.
- Baseline: the fixed Playground control hid pending additions in Editing on the
  original local sources, proving the reported AC1 failure before repair.
- Plite types: `typecheck:partition:core`, `typecheck:tests` and
  `typecheck:contracts` pass.
- Plite behavior: authored view plus retained-edit Bun tests pass 40/40;
  `external-text-contract.test.tsx` passes 58/58.
- Plate behavior: suggestion and suggestion-react partitions pass 2/2 and 6/6;
  both source-first typechecks pass; the affected Ultracite check passes.
- Registry toolbar: `mode-toolbar-button.spec.tsx` passes 2/2 and proves no
  document commit or authored identity/data change on mode toggle.
- Browser: a fresh Next dev process on port 3297 passes the persistence and
  homepage-mode Chromium cases 2/2 in 6.8 seconds with strict runtime errors.
- Docs/app: `www build:source`, `www build:registry`, and the full `www
  typecheck` pass, including editor generation check, API reference check, docs
  source parity, registry source check, Next typegen, app TypeScript and package
  integration TypeScript.
- Doctrine: Plate Next v200 validates with 2 active and 44 retired entries. Its
  global status retains two pre-existing stale package attestations; this task
  does not claim a package-attestation sync.
- Release metadata: `changeset status` succeeds; the existing Plite and Plate
  release entries describe the new policy and visible behavior.
- Generated output: `apps/www/public/r/{api-core-plate-components-docs,
  authored-changes-docs,registry-docs,registry,suggestion-docs}.json` was
  generated by `build:registry`; templates were not touched.
- Final checks: all changed TS/TSX files pass Ultracite, `git diff --check`
  passes, and no export layout changed.
- Final production fingerprints: `authored.ts`
  `17b40b19a9e2f1ad7eca1ac40fdbf6a1f50eb55a56a67cb9feda4478a70faf9d`,
  `editor-runtime-view.ts`
  `0d36dff8e9388bddfa5aa114ef772412dff2bae096c577171da8d2997da0af5b`,
  `BaseSuggestionPlugin.ts`
  `44597e542e6751d3bb0f6aa3e3815390702171b5817e6a089dbb2bff5284d814`.
- Final browser-test fingerprint: `suggestion.spec.ts`
  `39b05a8fcbd9cd5f01f5799a72ae446cbf056a8096f8a914004e5755d7e69c37`.
- Caller fingerprints: `mode-toolbar-button.tsx`
  `8345ffe6921131048a1f89db368a2f309e9c74cdc9ba70f7ae0a92205b0f3903`
  and `suggestion-toolbar-button.tsx`
  `39d267ea4b6b302c248aa387476939162a56bdcb46a6eb4d135ed0da473aaad9`.
- TaskHub receipt: conditional `in_progress -> review` update succeeded; final
  readback is #20, project `plate`, status `review`, `archived: false`.

Open risks:
None within the authorized local scope. Commit/push/PR/CI/release and a clean
published-ref replay remain deliberately unclaimed until separately authorized.

Next action:
Await maintainer review. Any commit, push, PR, CI or release action requires a
separate user instruction.
