# Uncommitted product regression audit

Objective:
Audit every uncommitted path for product regressions; done when all paths are
owner-accounted and each user-visible loss has evidence plus a ranked recovery
verdict.

Flow mode:
agent-led analytical audit

Goal plan:
docs/plans/2026-09-02-uncommitted-product-regression-audit.md

Template:
docs/plans/templates/major-task.md

Applied packs:
- browser
- package-api
- docs
- agent-native
- registry-changelog
- performance-observability

Linked plans:
- N/A: prior plans are evidence only; this audit does not make their incomplete
  checklists children of the audit goal.

Completion threshold:
- Account for the complete staged, unstaged, deleted, and untracked checkout at
  a named late snapshot, with every path assigned to an owner group.
- Trace every deleted or materially weakened product action, route, copied UI,
  public package surface, and proof oracle from `HEAD` to the current checkout.
- Give every confirmed loss a P0-P3 severity, exact owner, recovery target, and
  acceptance proof.
- Separate product behavior worth recovering from internal machinery that must
  stay deleted.
- Exercise each runnable P0/P1 Comments behavior in the local app and record
  package, docs, registry, performance, and type evidence.
- Stop after the audit and recovery order. Product implementation needs a
  separate user instruction.

Verification surface:
- Baseline: `HEAD` in `/Users/zbeyens/git/plate-2`.
- Target: complete current index and worktree, including untracked files.
- Source evidence: `git diff HEAD`, `git show HEAD:<path>`, current owners,
  tests, package exports, docs routes, registry sources, generated payloads,
  changesets, benchmarks, plans, tooling, and agent rules.
- Runtime evidence: the running local www app through the in-app Browser on
  `/docs/comment`, `/blocks/comment-demo`, `/docs/discussion`,
  `/docs/suggestion`, `/cn/docs/comment`, and `/docs/code-block`.
- Scale evidence: checked-in Comments-channel, Comments-ownership, and Plite
  decoration-manager benchmarks across their declared cohorts.

Constraints:
- Analytical audit only. Do not restore, delete, stage, unstage, commit, push,
  or rewrite product files.
- Preserve the app-owned Comments truth and the accepted Plite/Plate rendering
  architecture unless evidence proves that owner wrong.
- Compilation is not proof that a product workflow survived.
- A hard cut may delete obsolete implementation, never an independent user job
  without a replacement.
- Stay on `next`; automated Autoreview is forbidden on this branch, so perform
  a manual P1 review.

Boundaries:
- Read authority: every uncommitted path and its `HEAD` baseline.
- Write authority: this audit plan only.
- In scope: Comments, Suggestions, Discussion, AI review, DOCX/static export,
  Plite decoration/annotation runtime, Plate render-contract migration,
  registry/docs/examples/tests, release artifacts, tooling, and agent doctrine.
- Non-goals: implementing recovery, preserving compatibility aliases,
  reopening settled render APIs, changing the CodeLine planning packet, or
  claiming a clean/shipped final ref.
- Current snapshot is a moving checkout because other local sessions are
  active. The final snapshot and drift check define the audited cutoff.

Blocked condition:
Block only if `HEAD` objects, the complete worktree manifest, or the local
Comments routes cannot be inspected. No such blocker occurred. Lack of product
implementation authority does not block the audit.

Current snapshot:
- Cutoff: 2026-09-02T12:02:24Z.
- Files excluding this audit plan: 744.
- Normalized manifest SHA-256:
  `556f10a3e97ec80cb14923f4a3af3dbc1407c048d483fdd13285656a5f27e148`.
- The initial 731-file snapshot was deliberately superseded after another
  local session added thirteen CodeLine-plan/docs/generated artifacts. Those
  thirteen
  paths were inspected before closeout.

Owner accounting:

| Owner group | Files | Classification |
| --- | ---: | --- |
| Agent rules and generated skills | 39 | Doctrine and mirrors; parity passed |
| Changesets | 8 | Release metadata, including deleted stale entries |
| Root config | 4 | Type/build graph |
| Plite app | 4 | Browser harness |
| www other | 49 | App/docs infrastructure |
| Generated registry payloads | 78 | Generated output; source owners audited |
| Registry infrastructure | 10 | Registry catalog and deleted Discussion items |
| Registry changelog | 42 | Source and generated release teaching |
| Editor components | 39 | Main product-risk owner |
| Examples and fixtures | 19 | Demo behavior and one new CodeLine plan test |
| Browser tests | 2 | Comments and changed Plite examples |
| Benchmarks | 7 | Comments and decoration scale proof |
| Content docs | 62 | Routes, teaching, translations, and two CodeBlock edits |
| Other docs | 8 | Architecture/research evidence |
| Plans and plan artifacts | 76 | Intent/evidence only, including nine concurrent CodeLine files |
| `platejs` package | 166 | Render hard cut and Comments package owner |
| `plitejs` package | 118 | Canonical decoration/annotation runtime |
| Other packages | 1 | Test package config |
| Tooling | 12 | Entrypoint, schema, benchmark, and release checks |
| **Total** | **744** | **100% owner-accounted** |

Facts:
- The Plite decoration/annotation layer scales and its package/browser proofs
  pass. The architectural owner change is not the regression.
- The old `discussionPlugin` mixed application records, users, rendering, and a
  document-wide index in one editor plugin. Deleting that owner was correct.
- The same cut also deleted independent product jobs: a combined review feed,
  suggestion cards/actions/comments, block counts, rich comment bodies,
  shortcut and caret creation, overlap affordances, AI review controls, export
  fidelity, static annotated rendering, and translated teaching.
- Current Comments still supports range creation, create/reply/edit/delete/
  resolve, external app-owned records, a sidebar, and a floating popover.
- The sidebar/floating selector is exclusive as requested. Floating is not yet
  behaviorally equivalent to Sidebar for exact overlaps.

Findings:

| ID | Severity | Confirmed regression and evidence | Recovery verdict |
| --- | --- | --- | --- |
| F1 | P0 | Unified Discussion disappeared. `discussion.tsx`, `block-discussion.tsx`, its index, registry items, demo, fixtures, and both docs routes were deleted. Browser returns 404 for `/docs/discussion`. Baseline merged Comments and Suggestions chronologically and exposed per-block counts. | Recover the combined Discussion product as a view-only composition over the external Comments channel and `SuggestionPlugin`. Keep one exclusive `sidebar | floating` view selector. Do not restore a Discussion editor plugin or application data store. |
| F2 | P0 | Suggestion review UI disappeared with `BlockSuggestionCard`. Baseline showed add/delete/replace summaries, author/time, nested comments, reply editing, and `SuggestionPlugin.update.accept/reject`. Current `suggestion.tsx` only paints and sets `activeId`; `/docs/suggestion` has no runnable review preview or Reject action. | Put suggestion cards and accept/reject under the Suggestion UI owner. Let the Discussion view merge those cards with comment threads for presentation only. Restore comment-on-suggestion behavior through the external Comments channel. |
| F3 | P1 | Rich comments became plain strings. Current `CommentMessage.body`, channel methods, `Textarea`, and `<p>` rendering are string-only. Baseline `TComment.contentRich: Value` used a nested Plate editor with `BasicMarksKit`. | Restore rich `Value` bodies in the registry Comments channel and composer/view. Keep storage app-owned; the package only owns anchors and active projection. |
| F4 | P1 | `mod+shift+m` creation was deleted with the old plugin shortcut. Browser select-all plus Meta-Shift-M opens no composer although the toolbar is enabled. | Add one app-owned `beginAtSelection` controller action and bind both toolbar and shortcut to it. Do not put external records in the package plugin. |
| F5 | P1 | Collapsed-caret/block comments were deleted. Current toolbar disables collapsed selections and `createAnchor` rejects collapsed ranges. Baseline expanded a caret to its containing block. | Have `beginAtSelection` normalize a caret to the containing block-content range before creating the anchor. Keep zero-width anchors rejected. |
| F6 | P1 | Exact-overlap threads are unreachable in Floating mode. Two comments on the same range produce nested `data-comment-id` elements; clicking opens only the nearest thread. The package already computes ordered `idsAt`, but its click handler selects one DOM id. | Resolve click position through `idsAt` and render every thread at that location in deterministic order in the floating Discussion view. Sidebar and Floating must expose the same records and actions. |
| F7 | P1 | Comment hover and overlap feedback regressed. The deleted `CommentLeaf` had hover plus darker multi-comment states and `annotation-hover.spec.tsx` covered them. Current decorations emit id/active/class only and editor CSS has base/active styles. | Emit overlap metadata from the segment projection, restore hover/active/overlap styling, and restore behavior/paint coverage around partial and exact overlaps. |
| F8 | P1 | DOCX code syntax fidelity lost its only serializer and assertion. `CodeSyntaxLeafDocx`, inline token colors, whitespace preservation, the configured DOCX highlight renderer, and its round-trip assertion were deleted. Current HTML carries `hljs-*` classes but no inline token colors or nonbreaking indentation guarantee for Word conversion. | Keep the canonical attribute-based text renderer. Add a DOCX-specific export adapter that maps token attributes to inline styles and preserves spaces, then restore the deleted fidelity oracle. Do not revive a generic `CodeSyntaxLeaf` render callback. |
| F9 | P1 | AI comments auto-commit. `use-chat.ts` creates a permanent external thread during streaming, while the ready-state AI Comment Accept/Reject bar and transient cleanup were deleted. | Stage an app-owned provisional thread. Accept promotes it; Reject removes it and releases its anchor. Do not restore document comment marks. |
| F10 | P2 | The installable static annotated-comment surface disappeared with `comment-static.tsx` and its registry item. No external-anchor static/read-only adapter replaces it. | Add an optional static/read-only external-anchor adapter for HTML/DOCX/read-only output. Do not restore the legacy mark component. |
| F11 | P2 | Chinese Comment, Suggestion, and Discussion docs were deleted. `/cn/docs/comment` falls back to English; Discussion is gone. | Translate the final ownership API and restored Discussion product after behavior stabilizes. |
| F12 | P2 | Outside-click cannot dismiss a pending Floating composer. `onOpenChange(false)` clears only `activeId`, while `pending` keeps `open` true. Browser reproduced it. | Outside close must call `channel.cancel()` for pending creation, then restore editor focus. |
| F13 | P2 | Clicking unmarked editor text does not clear the active comment. The package click handler returns without clearing; Browser leaves the overlap selected. | Clear active state on editor clicks outside a comment while excluding thread/popover controls. |
| F14 | P2 | The draft registry changelog says the selected view has comment creation and thread actions, but Floating cannot reach exact-overlap threads and cannot outside-dismiss a draft. | Fix product parity first, then keep the changelog claim. Generated JSON is never the source owner. |

Inference:
- The failures cluster at the product-composition boundary, not the Plite
  projection runtime. The hard cut correctly removed document-coupled state,
  then mistook the old owner's bad shape for proof that all of its user jobs
  were disposable.
- Restoring the old plugin would hide the regressions quickly but reintroduce
  full-document fan-out, editor-owned backend data, and competing state. That
  is the wrong recovery.
- A view-only Discussion owner is the smallest durable shape because Comments
  and Suggestions keep independent data/action owners while users still get
  one review experience.

Recommendation:
Treat this checkout as product-regressed and not ready to commit. Recover in
four slices:

1. Restore the unified Discussion experience and Suggestion review cards. Use
   the external Comments channel plus `SuggestionPlugin`; expose exactly one
   selected layout, Sidebar or Floating.
2. Restore Comments interaction parity: rich bodies, shortcut, caret-to-block
   creation, exact-overlap grouping, hover/overlap states, outside dismissal,
   and active-state clearing.
3. Restore AI provisional accept/reject, DOCX token/spacing fidelity, static
   annotated output, and Chinese docs.
4. Restore the deleted oracles, add exact-overlap and both-view browser rows,
   then make registry changelog claims match the proved product.

Do not recover:
- `discussionPlugin`, its document-wide index, or editor-owned users/threads.
- Legacy comment marks, mutable document comment payloads, or the deleted
  Markdown comment codec. Retain only offline legacy extraction.
- Removed Plate `render.*` paths, old Plite projection aliases/hooks, or a
  generic `CodeSyntaxLeaf` callback.
- Simultaneous Sidebar and Floating rendering.
- Duplicate app truth inside the package Comments plugin.

Options and tradeoffs:

| Option | Verdict | Reason |
| --- | --- | --- |
| Restore deleted Discussion files unchanged | Reject | Fast but restores the exact ownership/fan-out failure the architecture work fixed. |
| Ship Comments only and revisit Suggestions later | Reject | Deletes a visible collaborative-review product and contradicts the existing demo contract. |
| Build a new combined editor plugin | Reject | There is no independent editor-runtime job; it would become another application store. |
| View-only Discussion composition over Comments and Suggestions | Choose | Preserves one user workflow without merging data owners or invalidating the measured runtime. |

Acceptance proof for recovery:
- Browser: fresh `/blocks/comment-demo` runs for Sidebar and Floating covering
  create, reply, edit, delete, resolve, shortcut, caret-to-block, partial and
  exact overlap, outside close, outside active clear, suggestion accept/reject,
  comments on suggestions, and follow-up typing.
- Product route: `/docs/discussion` renders the combined demo; `/docs/comment`
  and `/docs/suggestion` link to real runnable previews.
- AI: streamed Comment remains provisional until Accept; Reject leaves no
  thread or anchor.
- Export: DOCX HTML contains inline token color and preserved indentation, with
  a round-trip assertion tied to the configured exporter.
- Static/read-only: external anchors render without a client editing store.
- Package: Comments unit/typed tests, Plate entrypoint tests, `pnpm brl` when
  the exported layout changes, package typechecks, API-reference check, and
  appropriate major changesets.
- Scale: rerun all three checked-in benchmark owners with the same cohorts and
  correctness guards; no budget loosening.
- Docs/registry: source build, source-parity checks, registry generation/check,
  English and Chinese routes, and accurate changelog source entries.

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt captured | yes | Full uncommitted audit, product regressions, and recovery target are explicit above. |
| Scope frozen | yes | Complete 744-file late snapshot excludes only this audit plan and includes concurrent CodeLine additions. |
| Baseline available | yes | `HEAD` source was read for every decision-changing deleted owner. |
| Major-task owner | yes | Mixed architecture/product analytical lane selected. |
| Browser owner | yes | In-app Browser used on live www routes and interaction states. |
| Package/API owner | yes | Exports, package checks, API manifest, changesets, and hard-cut effects audited. |
| Docs owner | yes | Docs source, translations, routes, previews, and source parity audited with `docs-creator` guidance. |
| Agent owner | yes | Changed source rules and generated skill mirrors compared with `agent-native-reviewer` guidance. |
| Registry owner | yes | Source entries, generated payloads, deleted items, and generator check audited. |
| Performance owner | yes | Existing Comments and decoration benchmarks rerun; no new runtime layer is recommended. |
| Implementation boundary | yes | Product files remained read-only; only this plan changed. |
| Release artifact | yes | Package majors and registry changelog are present; recovery needs corresponding final entries before ship. |

Work Checklist:
- [x] Captured every explicit requirement, scope boundary, deliverable, stop
  condition, verification surface, and success criterion.
- [x] Counted and owner-accounted every file in the late snapshot.
- [x] Mapped baseline and current product owners before recommending recovery.
- [x] Traced all public deletions and high-risk behavior changes to a current
  replacement or a ranked regression.
- [x] Separated source fact, runtime fact, inference, and recommendation.
- [x] Ran manual P1 pressure review because Autoreview is forbidden on `next`.
- [x] Tested the scale-sensitive current owner rather than inferring performance
  from architecture.
- [x] Exercised runnable P0/P1 Comments states in Browser and recorded exact
  gaps without claiming a fix.
- [x] Audited package exports, typechecks, tests, API reference, changesets, and
  eventual barrel requirements.
- [x] Audited docs routes, previews, translations, source parsing, and registry
  generated/source ownership.
- [x] Audited agent source/mirror parity and action discoverability.
- [x] Inspected the thirteen files added by a concurrent CodeLine planning session;
  they add planning evidence and update current CodeBlock teaching, not a new
  confirmed product regression beyond F8.
- [x] Recorded intentional hard cuts that must remain deleted.
- [x] Produced one ordered recovery shape with no competing public alternative.
- [x] Recorded incomplete proof and residual risk honestly.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Full manifest | yes | 744 paths in 19 owner groups; late normalized digest recorded. |
| Decision criteria | yes | Fourteen findings classified P0-P2 with owner and recovery verdict. |
| Options and rejection | yes | Unchanged restore, comments-only ship, and combined plugin rejected; view-only composition chosen. |
| Manual review | yes | P1 pass found product losses despite green unit/package checks. |
| Browser interactions | yes | 404, missing review UI, shortcut, caret, exact overlap, pending close, and active-clear cases exercised. |
| Browser paint artifact | N/A: no fixed paint claim | DOM and visible interaction evidence classify current regressions; recovery must add controlled paint proof for F7. |
| Console/network | N/A: not causal | Findings reproduce from source and deterministic DOM state; console/network were not used to certify a fix. |
| Retry stability | N/A: audit only | No fixed/completed native-browser claim is made; recovery requires retry-free final proof. |
| Package proof | yes | Plite strict development check, Plate/Comments tests, entrypoint tests, www TypeScript, and API-reference check pass. |
| Runtime scale | yes | Comments channel, Comments ownership, and decoration manager pass normal through pathological cohorts. |
| Release classification | yes | Published Plate/Plite hard cuts use major changesets; registry behavior uses source changelog entries. |
| Barrel generation | N/A: analysis only | No product export was edited by this audit; recovery execution reruns `pnpm brl` if topology changes. |
| Docs parser and parity | yes | `build:source`, docs parity, registry source check, and registry changelog check pass. |
| Unslop | N/A: internal audit plan | No public docs were authored by this audit. |
| Agent source/mirror sync | yes | Changed rule/skill pairs have content parity; no audit edit touched agent doctrine. |
| Implementation gates | N/A: analysis only | No product implementation was authorized or performed. |
| Clean pushed ref | N/A: dirty local audit | This is not a commit, push, release, or fixed/completed claim. |
| Output discipline | yes | One generated JSON diff exceeded the display cap; subsequent reads used source files and bounded slices. |
| Goal-plan check | yes | `check-complete.mjs` is the final mechanical gate. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and manifest | complete | Late 744-file snapshot and 19 owner groups | Source comparison |
| Source comparison | complete | Baseline/current owners and deleted jobs traced | Runtime proof |
| Runtime and scale proof | complete | Browser, tests, types, entrypoints, docs, registry, and benchmarks recorded | Verdict |
| Manual P1 review | complete | Fourteen findings and hard-cut counterfactual | Recovery plan |
| Recovery plan | complete | One four-slice target and acceptance matrix | User decision |
| Closeout | complete | No product mutation; caveats and next owner recorded | Await execution authorization |

Error attempts:

| Attempt | Result | Corrected owner path |
| --- | --- | --- |
| Direct Bun run of Plite React tests | `React is not defined` under the wrong runner | `pnpm --filter plitejs test:react` passed 1,102 tests. |
| First www TypeScript run | Node exhausted the default 4 GB heap | `NODE_OPTIONS=--max-old-space-size=8192 ... tsc` passed. |
| First API-reference check | Packed Plate could not resolve an unbuilt Plite `dist` | After the Plite package check built `dist`, the same API-reference check passed. |
| Node/tsx benchmark attempts | Workspace/module runner mismatch | Checked-in Bun runners passed. |
| One broad generated diff | Output truncated | Switched to bounded source diffs and owner counts. |
| Initial manifest | Thirteen paths arrived from another local session | Re-froze and audited the late snapshot instead of hiding drift. |

Verification evidence:
- Browser current failures:
  - `/docs/discussion` returns `404 This page could not be found`.
  - `/docs/suggestion` exposes no review preview or Reject action.
  - `/cn/docs/comment` renders English fallback content.
  - `/blocks/comment-demo`: Meta-Shift-M opens no composer; collapsed caret
    disables Comment; pending Floating composer survives outside click; active
    comment survives clicking unmarked content.
  - Two exact-overlap comments are both visible in Sidebar, but clicking the
    shared highlight in Floating opens only the nearest thread.
- Browser current successes: `/docs/comment` renders two editors and an
  exclusive Sidebar/Floating switch; creation and ordinary thread actions work;
  `/docs/code-block` renders syntax-highlighted code.
- `pnpm --filter www test:www-browser:chromium apps/www/tests/browser/comment.spec.ts`:
  5 passed. The test named keyboard creation only keyboard-operates the toolbar;
  it does not cover Meta-Shift-M. Its overlap row is partial, not exact.
- Comments unit/migration tests: 17 passed.
- `pnpm --filter plitejs test:react`: 75 files, 1,102 tests passed.
- DOCX round-trip/code-block tests: 7 passed, but the only inline token/spacing
  assertion was deleted, so green does not cover F8.
- Entrypoint tests: 38 passed. Registry changelog check: 108 events passed.
- Agent rule/skill source parity, docs source parity, registry source check, and
  editor-schema generator check passed.
- `pnpm check:plite:dev` passed package types/tests, 232 contracts, 25 benchmark
  tests, 46 benchmark targets, public types/build, and Chromium smoke.
- Focused changed-example Plite Chromium proof: 81 passed, 1 skipped across 19
  batches.
- Comments channel benchmark: 10,000 subscribers and 1,000 body edits, p95
  0.002583 ms, zero unrelated wakes.
- Comments ownership benchmark passed twice: worst distributed p95 64.344 ms
  then 76.275 ms; pathological 84.325 ms then 96.608 ms; all growth budgets and
  correctness guards passed.
- Decoration manager returned `production-scales`; normal, large, stress, and
  pathological cohorts plus cleanup/identity/update-wake guards passed.
- www `tsc --noEmit` passed with an 8 GB heap.
- `pnpm --filter www api-reference:check` passed after fresh Plite build output.
- No full clean-checkout `pnpm check`, release, or pushed-ref replay was run or
  claimed.

Review fixes:
- Rejected the tempting recovery of `discussionPlugin`; it owns no necessary
  editor-runtime law.
- Split the deleted implementation from its independent user jobs, preventing a
  valid architecture cut from laundering product loss.
- Tightened overlap proof from partial overlap to exact overlap and tested both
  selected views.
- Reclassified the initial API-reference and TypeScript failures after running
  the correct build/heap owners instead of reporting false product regressions.
- Included concurrent CodeLine artifacts and preserved their plan-only status.

Final handoff contract:
- Recommendation: do not commit the current product state; execute the four
  recovery slices in order, starting with view-only Discussion plus Suggestion
  review.
- Confidence: 96/100 on the product regression inventory; lower only because a
  dirty concurrent checkout cannot provide immutable final-ref proof.
- Evidence: complete late manifest, baseline/current source, live Browser
  interactions, package/docs/registry checks, and scale benchmarks.
- Product status: architecture direction is sound; collaborative-review product
  parity is not.
- PR/tracker: none requested or created.
- Caveats: console/network and 5/5 native stability are not needed to classify
  the current deterministic losses, but are mandatory before fixed/completed
  wording after recovery.
- Next owner: `plate-feature` for end-to-end recovery, with `plate-ui` owning
  the combined view and copied registry UI and `plate-plugin-creator` touching
  the package only where exact-overlap/metadata behavior requires it.

Timeline:
- 2026-09-02T11:24:31Z: initial 731-file snapshot frozen.
- 2026-09-02T12:02:24Z: thirteen concurrent CodeLine plan/docs/generated paths
  added, inspected, and included in a 744-file late snapshot.
- 2026-09-02T12:02:24Z: source, Browser, package, docs, registry, agent, and
  performance evidence consolidated into the recovery verdict.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Audit complete; no product implementation started. |
| Where am I going? | Await user authorization for the four recovery slices. |
| What is the goal? | Identify every product regression in all uncommitted files and prescribe one durable recovery shape. |
| What have I learned? | Runtime architecture scales; product composition and parity were over-cut. |
| What have I done? | Accounted 744 files, proved fourteen regressions, and ranked recovery without mutating product source. |

Open risks:
- Other local sessions can change the dirty checkout after the recorded cutoff;
  execution must start with a fresh manifest drift check.
- The current browser proof is diagnostic, not immutable pushed-ref proof.
- F7 needs controlled visual proof after recovery; F8 needs a restored exporter
  assertion rather than visual inference.
- A full clean-checkout root `pnpm check` remains a ship gate, not an audit gate.
