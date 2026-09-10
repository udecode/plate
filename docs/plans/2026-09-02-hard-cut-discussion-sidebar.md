# hard cut discussion sidebar

Objective:
Hard-cut Discussion Sidebar and its mode API; done when per-block Floating Discussion is the only path, current interactions remain green, and no live consumer or docs teach Sidebar.

Goal plan:
docs/plans/2026-09-02-hard-cut-discussion-sidebar.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Task source:
- type: direct user product/API correction
- id / link: local conversation after per-block Discussion restoration
- title: Remove the new Discussion Sidebar
- acceptance criteria: delete Sidebar presentation, the Sidebar/Floating switch, the `CommentsProvider.view` prop and all mode state; keep per-block combined Comments/Suggestions in one Floating popover; preserve overlap, comment creation, replies, resolve, suggestion accept/reject, static/read-only paint, AI provisional behavior, and `/view/editor-ai` layout.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: hard-cut and behavior gates are binary
- improvement loop: bounded owner audit -> red surviving-product test -> hard cut -> full proof
- final score / loop closure: N/A until closeout

Completion threshold:
- Zero live `sidebar` mode, `DiscussionSidebar`, Discussion-view switch, or `CommentsProvider.view` references across registry source, current docs, examples, and browser tests.
- `createCommentsPlugin(...).configure({ slots: DiscussionSlots })` remains the complete install path; `CommentsProvider` accepts only `channel`, `plugin`, and `children`.
- Every annotated block opens its combined comments and suggestions in one Floating Discussion popover.
- Existing overlap, authoring, reply, resolve, suggestion mutation, static/read-only paint, AI provisional behavior, responsive layout, and EN/CN docs routes remain green.
- The hard cut removes runtime mode state and broad context publication without adding a replacement store, flag, alias, or compatibility path.
- Focused red/green proof, the full Comments browser suite, typecheck, lint, registry/changelog generation, fresh Browser proof, and the plan checker pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-hard-cut-discussion-sidebar.md` passes.

Verification surface:
- `apps/www/tests/browser/comment.spec.ts` first fails against the current switch/sidebar product, then covers the Floating-only surviving behavior on `/blocks/discussion-demo` and `/view/editor-ai`.
- `rg` bounded hard-cut audit over registry source, current collaboration docs, examples, and tests; historical changelog/migration prose is excluded.
- `bun test apps/www/src/registry/components/editor/comment.spec.tsx`, `pnpm --filter www typecheck`, scoped Ultracite, registry build, and changelog check.
- Fresh in-app Browser proof checks per-block contents, absence of sidebar/switch, layout, console, and failed network loads.
- Matched shared-index/keyed-dispatch scale receipt reuses 100/1,000/10,000/50,000 cohorts with a no-regression p95 budget of 1.20x the prior final receipt.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- This prompt overrides the earlier requirement to retain both presentation modes.
- Preserve the combined Discussion model; delete only Sidebar and mode selection.
- Do not create a second plugin, provider, store, component file, feature flag, or compatibility alias.
- Do not touch unrelated concurrent work in the shared checkout.

Boundaries:
- Source of truth: `comment.tsx`, `discussion.tsx`, `discussion-demo.tsx`, AI `plate-editor.tsx`, `comment.spec.ts`, current EN/CN Comments/Discussion/Suggestion docs, registry metadata, and the active Comments ownership changelog entry.
- Allowed edit scope: those named owners, their generated registry/changelog outputs, and this plan. Historical changelog and migration records remain historical.
- Browser surface: `/blocks/discussion-demo` and exact product route `/view/editor-ai`.
- Browser strategy: use the in-app Browser for normal app QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no external tracker or PR exists.
- Non-goals: no package Comments/Suggestions semantic redesign, no new UI mode, no commit/push/PR, and no cleanup outside the Discussion Sidebar deletion cone.

Output budget strategy:
- Search only named owners and exclude generated payloads, historical changelog, migrations, `.next`, templates, and dependencies unless verifying an exact generated artifact. Count/list first and parse JSON structurally.

Blocked condition:
- Stop only if Floating cannot preserve a current tested Discussion interaction without reintroducing another public mode or semantic owner; otherwise continue through proof.

Task state:
- task_type: public copied-UI hard cut
- task_complexity: normal, high product-regression risk
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: completed

Current verdict:
- verdict: hard-cut Sidebar and `view`; keep only per-block Floating Discussion
- confidence: high from current source/caller audit and the user's explicit correction
- next owner: Plate UI implementation, then Best API repair closeout
- reason: once per-block triggers exist, Sidebar has no independent required job; retaining it creates mode state, layout code, docs, and an inferior public choice.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-hard-cut-discussion-sidebar.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Captured the hard cut, surviving Floating behavior, interaction preservation, no replacement machinery, exact routes, proof, and no commit/push. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded Autogoal, Hard Cut, Best API, Plate UI, and behavior-ownership doctrine before implementation. |
| Active goal checked or created | yes | New exact objective will be activated against this plan before edits. |
| Source of truth read before edits | yes | Read provider, Discussion render branch, demo mode state/control/layout, AI responsive selection, and all browser call sites. |
| Tracker comments and attachments read | no | N/A: direct local instruction with no tracker or attachment. |
| Video transcript evidence required | no | N/A: no video supplied. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Prior per-block Discussion scale and DOM-reconciliation findings remain the governing implementation evidence. |
| TDD decision before behavior change or bug fix | yes | Rewrite the primary mode test first so current Sidebar/switch fails against the Floating-only contract. |
| Branch decision for code-changing task | yes | Stay on required `next`; no branch or worktree change. |
| Release artifact decision | yes | Registry-visible hard cut updates the active registry changelog and generated JSON; no package changeset applies. |
| Browser tool decision for browser surface | yes | Use in-app Browser after automated Chromium proof. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Narrow owner-only searches and structured generated-artifact checks are fixed above. |
| Docs pack selected | yes | Current EN/CN API examples and Discussion teaching must lose Sidebar and `view`. |
| `docs-creator` loaded | yes | Loaded in the preceding Comments repair and reuse its current-state reference law; no doctrine changed. |
| Docs lane selected | yes | Incidental docs repair inside a UI/API hard cut. |
| Target docs and nearest sibling docs read | yes | Current Comments, Discussion, and Suggestion EN/CN pages were audited in the preceding repair; exact Sidebar references are enumerated before edits. |
| Docs style doctrine read | yes | Current-state reference voice and no migration/changelog phrasing remain binding. |
| Documented source owner identified | yes | Copied `comment.tsx` owns provider props; copied `discussion.tsx` owns Floating presentation. |
| Browser pack selected | yes | Product interaction and layout change require live proof. |
| Browser route / app surface identified | yes | `/blocks/discussion-demo` and `/view/editor-ai`. |
| Browser tool decision recorded | yes | Browser is sufficient; no native browser/OS behavior exists. |
| Console/network caveat policy recorded | yes | Final fresh-tab replay must show zero relevant console warnings/errors and zero failed loads. |
| Observable browser case captured | yes | `discussion-floating-only`: current local source shows Sidebar by default and a Sidebar/Floating radio switch; target has neither and opens correct per-block combined popovers on both routes. |
| Performance pack selected | yes | The hard cut changes repeated context and list rendering. |
| User-facing operation and runtime owner identified | yes | One annotation snapshot builds the shared Discussion index; one block activation performs keyed lookup and opens one popover. |
| Scale variables and cohorts fixed | yes | Reuse 100/1,000/10,000/50,000 items, blocks, and listeners with one changed/selected block. |
| Budget frozen before target measurement | yes | No new index work; target p95 <=1.20x the prior final keyed receipt, <=2 block wakes, and zero Sidebar list render. |
| Baseline and target probe selected | yes | Baseline is the verified keyed Floating path plus Sidebar mode/context; target is the same keyed path with mode/sidebar code removed. |
| Correctness guard selected | yes | Full Comments browser suite, channel unit tests, exact per-block combined popovers, and AI layout. |
| Production detector decision recorded | no | N/A: copied demo UI has no telemetry owner; tests, source audit, Browser errors, and fingerprints are the local detectors. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Docs pack: every created or edited docs artifact completed the required `unslop` file-edit pass after claims stabilized, with protected literals and technical claims preserved.
- [x] Docs pack: requirement language, when present, separates hard compatibility, layer-specific setup, recommendations, and repo-only implementation details against live owners.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Performance pack: capture a comparable current-owner receipt before accepting a scale-sensitive target or optimizing an existing path.
- [x] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [x] Performance pack: exercise normal, large, stress, and pathological cohorts where applicable; a single convenient size cannot prove scaling.
- [x] Performance pack: record warm percentiles, cold duration, sample/warmup counts, noise, payload bytes, and deterministic work counters when the harness supports them.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [x] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [x] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [x] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [x] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [x] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Checklist evidence:
- Duration and timed checkpoint: N/A; the user set no duration.
- Video evidence: N/A; no recording was supplied.
- Branch: stayed on `next`; no branch or worktree change.
- Release artifact: registry changelog plus production and development registry payloads; no package changeset because no package source or package API changed.
- Local environment retry: N/A; no missing-module or mixed-React install failure occurred.
- Workspace authority: every command ran in `/Users/zbeyens/git/plate-2`; app tests used `apps/www` and routes on the fresh port 3017 server.
- High risk: removing `CommentsProvider.view` could strand callers or erase Discussion behavior; bounded source/generated searches, typed consumers, the complete browser suite, and live interaction replay cover that failure mode.
- P1 autoreview: N/A; repo policy forbids `autoreview` on `next`. The named owner diff received a manual source review plus lint, types, source parity, hard-cut searches, and browser proof.
- Agent-native review: N/A; no agent rules, skills, hooks, commands, prompts, or action tooling changed.
- Browser pixel controls: N/A; this hard cut makes no color or pixel-fidelity claim. DOM highlight presence, popover contents, layout geometry, interaction state, and a final screenshot are the applicable proof.
- Clean pushed-ref runtime: N/A; the user requested local implementation, not commit or push. Claims below are explicitly limited to HEAD `a6afd55c30e97c74fe895d1ad005ca75413110f3` plus the fingerprinted local files.
- Performance: the deterministic artifact exercises 100/1,000/10,000/50,000 groups with 10 warmups and 40 samples. It source-guards the production keyed path and proves zero Sidebar group visits.
- Output budget: one generated-JSON search accidentally printed a large matching line; the search was corrected to filename-only and exact-token checks for the rest of closeout.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Complete the named hard-cut, behavior, build, docs, scale, and Browser gates | All gates below pass. |
| Bug reproduced before fix | yes | Make the Floating-only contract fail on the Sidebar state | The rewritten primary browser row saw the old Sidebar/switch state before the cut. |
| Targeted behavior verification | yes | Run focused and full Comments proof | Unit 7/7, full Chromium 10/10, stability 20/20. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | N/A | No package export or package file layout changed; `pnpm brl` does not apply. |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest or install graph changed; `pnpm install` does not apply. |
| Agent rules or skills changed | no | N/A | No agent source changed; skill regeneration does not apply. |
| Workspace authority proof | yes | Run proof in the owning checkout/app/routes | All commands ran in `/Users/zbeyens/git/plate-2`; browser proof used the fresh `www` server on port 3017. |
| Browser surface changed | yes | Verify the live app with Browser | `/blocks/discussion-demo`, `/view/editor-ai`, `/docs/comment`, and `/docs/discussion` passed. |
| Browser final proof | yes | Replay final interactions and layout | No Sidebar/switch; direct block switching, overlap, reply, resolve, mixed AI items, full-width layout, and rendered docs passed. |
| CI-controlled template output changed | no | N/A | No `templates/**` source or output was edited. |
| Package behavior or public API changed | no | N/A | The cut is in copied registry UI, not package source; no package changeset applies. |
| Registry-only component work changed | yes | Update registry changelog | The 2026-09-02 Comments ownership entry describes per-block Floating Discussion; generator check passed 107/107. |
| Docs or content changed | yes | Verify source, parser, and routes | Source claims, `build:source`, EN/CN routes, and Unslop pass. |
| High-risk mini gate | yes | Prove no stranded caller or lost interaction | Zero stale mode references plus full type/browser/source proof. |
| Agent-native review for agent/tooling changes | no | N/A | No agent or action-tooling change. |
| Local install corruption suspected | no | N/A | No install-corruption signature appeared. |
| P1 autoreview for non-trivial implementation changes | no | N/A | Repo policy forbids `autoreview` on `next`; manual owner review plus the named proof gates passed. |
| PR create or update | no | N/A | The user did not request a PR. |
| Task-style PR body verified | no | N/A | No PR exists for this local task. |
| PR proof image hosting | no | N/A | No PR body exists. |
| Tracker sync-back | no | N/A | No external tracker exists. |
| Final handoff contract | yes | Record outcome, proof, and caveat | Filled below. |
| Final lint | yes | Run scoped equivalent | Ultracite passed all eight TS/TSX owners. |
| Output budget discipline | yes | Record any accidental high-volume output and recovery | One JSON match overprinted; all later searches used exact tokens and filename-only output. |
| Timed checkpoint | no | N/A | No duration was requested. |
| Goal plan complete | yes | Run the Autogoal checker | Run after this receipt is saved. |
| Docs source-backed claim audit | yes | Match claims to current owners | `DiscussionSlots`, provider props, install path, and channel behavior match source. |
| Required Unslop pass | yes | Audit four edited EN/CN files | All four returned zero findings; hashes are recorded below. |
| Requirements disclosure | yes | Separate package, copied UI, and app ownership | Docs explicitly assign package anchor projection, app data, copied channel, and copied Discussion UI. |
| Docs links / routes / previews | yes | Verify leaf routes and preview | Comment/Discussion EN/CN browser row passed; `discussion-demo` rendered. |
| Docs MDX/content parser | yes | Run `build:source` | Passed inside the full `www` typecheck. |
| Plugin page specifics | yes | Apply current kit/manual/API teaching | Comments and Discussion pages teach one `DiscussionSlots` install path and no mode choice. |
| Browser interaction proof | yes | Exercise the final live surface | Block 1, Block 2, overlap, reply, resolve, AI, and docs replayed in Browser. |
| Browser console/network check | yes | Inspect final route errors | Browser warn/error logs were empty; all manually replayed routes rendered from the fresh server. |
| Browser final proof artifact | yes | Capture final visual state | In-app Browser screenshot captured `/view/editor-ai` with the five-item Floating Discussion and full-width editor. |
| Exact case replay | yes | Replay the reported product shape | Sidebar and switch counts were zero on both product routes; exactly one Floating popover opened. |
| Final ref and fingerprints | yes | Record ref and SHA-256 | HEAD and eleven owner/harness hashes are recorded below. |
| Clean final runtime | no | N/A | Local uncommitted result only; no pushed-ref or clean-checkout claim is made. |
| Retry-free stability | yes | Run five warm repetitions | Four critical rows passed 20/20 with no retry. |
| Pre-acceptance scale proof | yes | Measure matched Sidebar versus Floating work | The deterministic artifact covers four cohorts with frozen 1.20 p95 and zero-Sidebar-visit budgets. |
| Warm latency budget | yes | Check p95 ratios | Ratios were 0.931, 0.885, 0.954, and 0.956; all below 1.20. |
| Large/stress scaling | yes | Exercise 1k/10k/50k | All cohorts passed; 50k target p95 was 19.404 ms on this machine. |
| Cold and failure paths | yes | Record cold time and application failure guard | Cold times are in the receipt; source disconnect/recovery and AI draft rejection pass in the browser suite. |
| Payload and fan-out | yes | Record bytes and list work | Payloads scale from 5,131 to 2,852,781 bytes; target Sidebar group visits stay zero and selected-group lookup stays one. |
| Production-path rerun | yes | Bind the harness to final source identity | Harness guards required/forbidden production tokens and records final `discussion.tsx` SHA-256. |
| Correctness guard | yes | Run behavior suite on measured source | Full Chromium 10/10 plus 20/20 stability passed on the same source hash. |
| Before/after receipt | yes | Compare removed Sidebar iteration with keyed target | Baseline visits every Sidebar group; target performs one keyed lookup and zero Sidebar visits. |
| Detector and privacy | yes | Keep receipt synthetic and local | Receipt contains synthetic IDs only; Browser errors and source fingerprints are local detectors. |
| Performance regression check | yes | Run final deterministic harness | `node docs/plans/artifacts/2026-09-02-hard-cut-discussion-sidebar/benchmark.mjs` passed. |
Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Owner/caller/docs/generated surfaces bounded | implementation |
| Implementation | completed | Sidebar, mode state, switch, and provider prop deleted | verification |
| Verification | completed | Unit, types, lint, registry, docs, scale, Chromium, and Browser pass | closeout |
| PR / tracker sync | N/A | No PR, push, or tracker requested | closeout |
| Closeout | completed | Hard-cut search, final fingerprints, and handoff recorded | final response |

Findings:
- The Sidebar had no independent user job after per-block triggers existed. It duplicated the same mixed review data, added a worse layout choice, and widened provider context.
- React development Strict Mode replayed the demo's effect cleanup while the component remained mounted. Calling `channel.destroy()` there erased live subscriptions and caused new comments, highlights, and AI drafts to disappear.
- AI draft threads needed to activate their comment ID explicitly so the single Floating Discussion owner opened for generated review items.
- The production registry was current, but the ignored live development registry at `public/rd` retained stale Sidebar docs until `pnpm --filter www rd` regenerated it.

Decisions and tradeoffs:
- Delete `CommentsProvider.view`, all Sidebar components, mode state, and the switch. No alias, fallback, flag, or second provider was retained.
- Keep `DiscussionSlots` as the one install contract: `wrapRoot` owns the shared index/store, `wrapNode` owns keyed block triggers, and `afterEditable` owns the one Floating popover.
- Keep comments and suggestions in one ordered Discussion model. A block trigger opens the whole block; an inline annotation opens the exact overlapping items.
- No package API or Plite/Plate package behavior changed. Best API repair therefore ends at the copied registry boundary; existing hard-cut doctrine already covers the decision, and the agent-rule audit found no stale mode teaching.
- The scale harness is a plan artifact, not production machinery. It guards the production source shape and compares removed Sidebar iteration with the surviving keyed path.

Implementation notes:
- `comment.tsx`: provider context accepts only `channel` and `plugin`; children remain the normal React prop.
- `discussion.tsx`: one shared store groups items once, block subscribers are keyed, and one Floating popover handles block, overlap, pending-comment, suggestion, and AI-draft targets.
- `discussion-demo.tsx` and AI `plate-editor.tsx`: one full-width editor path; no mode state, responsive Sidebar grid, or premature channel cleanup.
- `use-chat.ts`: successful AI comment creation activates the generated thread; failed creation releases the anchor.
- EN/CN Comments and Discussion docs, registry metadata, changelog output, `/r`, and `/rd` teach only Floating Discussion.

Review fixes:
- Direct Block 1 to Block 2 switching keeps exactly one popover and does not return focus to the editor between targets.
- Floating dismissal ignores the provisional outside-close event while an AI draft is active; Accept and Reject still own final cleanup.
- The invalid `channel.destroy()` effect cleanup was removed from both live editors.
- Narrow browser proof waits for the actual annotation before clicking, avoiding a fixture timing race.
- Temporary diagnostic logging was removed; exact debug-token search is empty.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial full browser replay lost dynamic annotations and AI popovers | 1 | Instrument channel publication and React lifetime | Found Strict effect cleanup destroying the live channel; removed the cleanup. |
| First 100-row benchmark sample exceeded the p95 ratio because each sample was below timer noise | 1 | Packet small cohorts while reporting per-operation time | Added 100/10 repetitions for 100/1k; all ratios pass. |
| Broad JSON search printed one large generated line | 1 | Switch to exact tokens and filename-only results | Final bounded search produced zero stale paths. |
| Production registry build did not refresh ignored `public/rd` | 1 | Run the explicit development-registry command | `pnpm --filter www rd` regenerated the live local payload; final search is empty. |

Verification evidence:
- Unit: `bun test apps/www/src/registry/components/editor/comment.spec.tsx` -> 7 passed, 47 assertions.
- Types/source/docs: `pnpm --filter www typecheck` -> editor generation, API reference, `build:source`, docs parity, registry-source checks, route types, and both TypeScript projects passed.
- Lint/format: scoped `pnpm exec ultracite check` -> eight owner files passed.
- Registry: `pnpm --filter www build:registry` and `pnpm --filter www rd` -> 364 canonical payloads and 15 sparse overlays each.
- Changelog: write plus final check -> 107/107 source entries.
- Automated browser: complete Comments suite -> 10/10 passed.
- Warm stability: overlap, per-block switching, AI draft lifecycle, and narrow Floating rows with `--repeat-each=5` -> 20/20 passed, retry 0.
- Fresh Browser demo: Sidebar 0, switch 0, triggers 2, comment marks 15 across interactive/read-only/static surfaces; Block 1 showed two comments; direct Block 2 handoff showed two suggestions including its attached comment; overlap opened both threads; reply and resolve updated the thread and block count.
- Fresh Browser AI: Sidebar 0, switch 0, trigger 1; the editor width matched the 1422 px viewport, document scroll width was 1422 px, and the block popover showed three suggestions plus two comments.
- Fresh Browser docs: `/docs/comment` and `/docs/discussion` rendered Floating-only teaching with zero Sidebar mentions.
- Fresh Browser logs: final warn/error list was empty. A screenshot captured the full-width AI editor with its five-item Floating Discussion.
- Hard-cut audit: zero exact Sidebar/mode/debug tokens across registry source, browser tests, current docs, production `/r`, development `/rd`, and agent rules.
- Workspace/ref: `/Users/zbeyens/git/plate-2`, branch `next`, HEAD `a6afd55c30e97c74fe895d1ad005ca75413110f3`, plus the local fingerprinted task files.

Scale receipt:
| Blocks/items | Baseline p95 | Target p95 | Ratio | Target cold | Payload | Sidebar visits before -> after | Target lookup |
|--------------|--------------|------------|-------|-------------|---------|---------------------------------|---------------|
| 100 | 0.0116 ms | 0.0108 ms | 0.931 | 0.0519 ms | 5,131 B | 100 -> 0 | 1 |
| 1,000 | 0.1177 ms | 0.1042 ms | 0.885 | 0.0926 ms | 53,281 B | 1,000 -> 0 | 1 |
| 10,000 | 2.3577 ms | 2.2484 ms | 0.954 | 1.7448 ms | 552,781 B | 10,000 -> 0 | 1 |
| 50,000 | 20.3012 ms | 19.4036 ms | 0.956 | 11.4818 ms | 2,852,781 B | 50,000 -> 0 | 1 |

- Environment: Node v22.22.1 on Darwin arm64, 10 warmups, 40 samples, packeted small cohorts, synthetic IDs.
- Budget: pass. Every target/baseline p95 ratio is below 1.20; every target has zero Sidebar group visits and one selected-group lookup.
- Production source guard: `discussion.tsx` SHA-256 `0909fa1d524c1ef9de212cd50be41d9509cbb4623ba5fcf2fe61d7e001dc725c`.

Final fingerprints:
- `comment.tsx`: `afbb5d183dcc5b487f95878b1abc6e2166b64691c3764f6e9e1d366f069c27eb`
- `discussion.tsx`: `0909fa1d524c1ef9de212cd50be41d9509cbb4623ba5fcf2fe61d7e001dc725c`
- `use-chat.ts`: `e587b02903a56554b3e6655daa529e2994566a64d2122adec707379345335fa8`
- `discussion-demo.tsx`: `594f8542f985deea14834491025a4c220dcbfd561de9fdd3c66db22f6891bb44`
- AI `plate-editor.tsx`: `d0c981274ceff93a7dba8bdbb8e7c28607164cd468eea3eb67800199d63fc7d6`
- `comment.spec.ts`: `c1661c7ad4b97c04bbae46b44630e79258882da253704aede4fc0d891fe2d4cd`
- EN Comment docs: `d7d3ed2385ae7729481e7bd1e48f2c97df38753dd65e20ff7fe5ab8845d12358`
- CN Comment docs: `187f3c319c94ef41d412aaac64be007e15a018ac618e928d1c4b78288c13b01d`
- EN Discussion docs: `3b90487cfb77108835f4a471932529c57fd53eae13739ab450997aa1fb730cba`
- CN Discussion docs: `99107bfa28bf8aed488e259ba006522b686a5ebb553e06d8faa689e6dce0db3f`
- Benchmark artifact: `3ec161a440f85103462d3d40ff4eb04db9625448a4eb9d9ef18df24b597ad226`

Final handoff contract:
- PR line: N/A; no commit, push, or PR requested.
- Issue / tracker line: N/A; no external tracker.
- Confidence line: high for the fingerprinted local tree.
- Flow table:

| Phase | Tests | Browser |
|-------|-------|---------|
| Reproduced | Floating-only row rejected the Sidebar/switch state | Old UI visibly exposed the mode choice |
| Verified | 7/7 unit, 10/10 full Chromium, 20/20 stability, types/lint/builds green | Per-block mixed Floating behavior, full-width AI layout, docs, and zero errors passed |

- Browser check: passed on the fresh port 3017 process.
- Outcome: per-block Floating Discussion is the only presentation and API path.
- Caveat: local uncommitted result on the recorded HEAD; no shipped or clean-pushed-ref claim.
- Design:
  - Chosen boundary: copied Discussion UI and provider context.
  - Why not quick patch: hiding the Sidebar would leave its API, context publication, docs, and inferior choice alive.
  - Why not broader change: package Comments anchors and Suggestions semantics already own the right editor behavior and needed no redesign.
- Verified: hard-cut search, source/build proof, deterministic scale receipt, automated browser proof, and fresh Browser replay.
- PR body verified: N/A; no PR exists.

Task-style PR body contract:
- N/A for this local task. If a PR is requested later, build its body from the final behavior and proof above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: passed.
- Caveats: local uncommitted result only.

Timeline:
- 2026-09-02T19:35:04.600Z Goal plan created and explicit cut/surviving behavior captured.
- 2026-09-02: Sidebar, switch, provider mode, and responsive Sidebar layout removed.
- 2026-09-02: Strict lifetime and AI draft regressions diagnosed and repaired.
- 2026-09-02: Unit, types, lint, docs, both registry targets, changelog, scale, full Chromium, stability, and fresh Browser proof passed.
- 2026-09-02: Final hard-cut search and fingerprints recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make per-block Floating Discussion the only presentation/API path |
| What have I learned? | Sidebar duplicated one mixed Discussion model; Strict cleanup, not plugin projection, caused the dynamic regression |
| What have I done? | Deleted the mode, repaired surviving interactions, regenerated both registries, and proved behavior/scale/docs |

Open risks:
- No known functional regression remains in the tested surface.
- The result is not committed or pushed because the user did not request either.
- The scale artifact isolates Discussion grouping and selected-group work; mounting 50,000 editor DOM blocks remains an editor virtualization concern outside this cut.
