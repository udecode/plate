# TaskHub 20 decouple suggesting input mode from authored view

Objective:
From the latest `next`, make Suggesting control only future input intent while
the mounted authored view continues to show and review existing Add, Delete and
replacement suggestions. Preserve explicit accepted-only projection, authored
identity/data, view-local state and Plate/Plite ownership. The 2026-09-18 user
correction additionally requires the homepage Playground to start in Editing,
not Suggesting, while retaining the seeded suggestion markup.

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
returned to `review`. The correction is complete only after the default Editing
case passes from a clean pushed ref and `origin/next` is read back at that SHA.

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
other demos' explicit authored policies, broad Notion parity, Diff redesign,
unrelated repairs, deployment or external messages. The latest user correction
supersedes the earlier default-value non-goal for the homepage Playground only.

Delivery:
The earlier same-thread instruction authorizes committing and pushing the
corrected checkout to `origin/next`. No PR, release or deployment is authorized.

Blocked condition:
None. The required package, docs, registry and browser surfaces were available
and the selected semantics follow the existing authored owner.

Correction state:
- current_phase: complete
- next: none inside the authorized scope; maintainer review owns any follow-up.
- status: complete

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
- [x] The original package packet was published and replayed from
      `b80290d0f6288c6bd4539b5ae4f4368247967f5e`; the homepage correction has its
      own final clean pushed-ref gate below.
- [x] Five-run native paint/focus stability is N/A: no native selection paint,
      DnD, compositor or React lifecycle defect is claimed. The focused browser
      replay completed retry-free on the fresh process.
- [x] The public package delta is `EditorViewOptions.authored` accepting
      `edit + markup`, plus Plate's mode mapping. Existing branch changesets for
      `plitejs` and `platejs` contain the user-visible release lines.
- [x] The original package behavior/API packet did not require a registry-only
      entry. The homepage correction adds the required `playground-demo`
      registry changelog source and generator-owned JSON.
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
- [x] AC9: a fresh homepage Playground opens with the fixed mode control showing
      Editing while all seeded Add/Delete/replacement markup and review entry
      points remain visible.
- [x] AC10: input before any toggle edits accepted content directly without a
      new pending suggestion; after explicitly choosing Suggestion, equivalent
      input creates a proposal. Mode switching remains view-local.
- [x] Record the correction RED on pushed ref `b80290d0f6`, add the smallest
      browser regression, and keep the durable owner at the homepage's explicit
      mounted authored policy rather than changing global plugin defaults.
- [x] Run focused browser, app type/lint and required root publication proof.
- [x] Commit/push the complete checkout, replay from the final pushed ref, read
      back `origin/next`, and return TaskHub #20 to `review`.

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
- Correction RED: on pushed ref `b80290d0f6`, the new homepage assertion found
  no visible Editing control because `playground-demo.tsx` explicitly mounted
  `propose + markup`.
- Regression intake: this is not a failed-fix interrupt. TaskHub #20's original
  body explicitly excluded the homepage default, so the latest user message is
  a new scope delta that supersedes that non-goal. The ordinary one-case Patch
  path remains the correct owner; no Regression workflow repair is warranted.
- Correction GREEN: a fresh Next process on port 3298 and installed Google
  Chrome pass the two exact homepage cases 2/2 retry-free in 7.1 seconds. The
  proof checks initial Editing, seeded markup visibility, direct input without
  a new authored marker, explicit Suggestion input, review, accept and undo.
- Correction registry/app proof: `build:registry`, full `www typecheck`, focused
  Ultracite and registry changelog `--check` pass. Generator-owned output
  includes the new Playground event and the already-required discussion payload.
- Correction publication gate: root `pnpm check` passes lint, type-aware lint,
  package typechecks, fast tests and slow tests with zero failures. Benchmark
  receipt files rewritten by the suite were restored to their clean baseline.
- Correction branch sync: `next` advanced during verification from
  `b80290d0f6` to `1abc74f160`; the remote delta changed only Regression
  workflow files. The correction restored without conflict, and the registry
  changelog check plus full root `pnpm check` passed again on the latest base.
- Correction pushed-ref proof: production commit
  `7ec2b4bbc6fc6ee13b3107f4748ee371cd871f40` is the exact `origin/next`
  readback. A fresh Next process at `http://localhost:3298` on that clean ref
  passes both installed-Google-Chrome homepage cases 2/2 retry-free in 7.6
  seconds.
- Correction TaskHub receipt: conditional `in_progress -> review` succeeded;
  readback is #20, project `plate`, status `review`, `archived: false`.
- Correction fingerprints: homepage owner
  `c1d9c023f94b37202facd8784498d7532797e88a52b7534d096f733e888dd814`, seeded
  value `ac864c96cb624d5a82c735b3e34cdde0d607ff0412bb7cd3224d22885b3ff5e4`,
  browser contract
  `42d04797a17da7f1a10c18e317c038f3fa0b05d1f6d79c385fcadba25c864c54`,
  Playwright harness
  `f9254fd0decdfa706134c110b239238f8efe205b0a3f8bb97782ac689b476991`, and
  registry changelog source
  `43afd72978efaafecf2cd75c1d0f0f5a83104a8e52b0fe44dcbcca4a6a3359d6`.

Open risks:
None inside the corrected homepage scope. No PR, release or deployment was
authorized or claimed.

Next action:
Maintainer review. Any PR, release or deployment requires separate authority.
