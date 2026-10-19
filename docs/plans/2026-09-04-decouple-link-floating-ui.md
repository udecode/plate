# Decouple Link floating UI

Objective:
Decouple Link floating UI from Comments and Suggestions; done when zero
cross-feature state dependencies remain and source, focused tests, registry,
and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-decouple-link-floating-ui.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Task source:
- type: direct user request following an accepted `best-api` review
- id / link: N/A: no external ticket
- title: Decouple Link floating UI
- acceptance criteria:
  - `link.tsx` has zero Comment/Suggestion plugin-state imports or subscriptions.
  - Link uses one owner-local `top-start` placement with viewport flip fallback.
  - The `link` registry item no longer installs `@plate/comment` or
    `@plate/suggestion`; `@plate/suggestion-style` remains because Link markup
    consumes its visual treatment.
  - Opening/editing a link still works, and a link toolbar can coexist with the
    bottom-positioned Discussion popover without overlap in the tested viewport.
  - Focused source, type, registry, changelog, and browser checks pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary acceptance criteria are stronger
- improvement loop: N/A: one-shot execution
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- Zero matches for the rejected Link-to-Comment/Suggestion state dependency,
  two fewer cross-feature store subscriptions per mounted Link toolbar, focused
  checks green, generated registry output current, and browser proof green for
  Link alone plus Link with Discussion.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-decouple-link-floating-ui.md` passes.

Verification surface:
- Source audit of `apps/www/src/registry/components/editor/link.tsx` and the
  `link` item in `apps/www/src/registry/registry-features.ts`.
- Baseline-versus-final deterministic subscription-count probe for
  `LinkFloatingToolbar`.
- Focused WWW typecheck/lint and registry build/check.
- Browser proof on `/docs/link` and a full editor/discussion route selected
  from current source fixtures, including console errors.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Preserve Link insert/edit/unlink behavior, viewport fallback, Discussion and
  Suggestion behavior, and Link suggestion styling.
- Do not add a floating-overlay manager, provider, store, or replacement API.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `VISION.md`, `docs/vision/common.md`,
  `docs/vision/plate.md`, accepted `best-api` verdict, Link/Discussion/Floating
  Toolbar registry source, registry metadata, and registry changelog contract.
- Allowed edit scope: Link registry component, Link registry metadata,
  registry changelog source/generated artifacts, required generated registry
  output, and this goal plan.
- Browser surface: Link toolbar alone and while the bottom Discussion popover
  is active.
- Browser strategy: use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker or PR requested.
- Non-goals: Comments/Suggestions semantics, plugin membership, package API,
  public overlay coordination, unrelated dirty files, commit, push, or PR.

Output budget strategy:
- Restrict reads/searches to Link, Discussion, Floating Toolbar, registry
  metadata/changelog, focused tests, and named routes. Exclude generated trees
  until regeneration; cap command output and inspect only failing slices.

Blocked condition:
- Stop only if the dev route cannot run after the repository-prescribed single
  reinstall recovery, or if no existing route can exercise Link plus Discussion
  without adding product behavior outside the approved scope.

Task state:
- task_type: registry UI architecture hard cut
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: implemented and verified locally
- confidence: high
- next owner: user for commit/push if wanted
- reason: Link owns its placement; peer product state does not, and the final
  source contains zero Comment/Suggestion state dependencies.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-decouple-link-floating-ui.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria, constraints, boundaries, proof, stop condition, and handoff captured above before implementation |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | Read `autogoal`, `plate-ui`, `shadcn`, `registry-changelog`, `best-api`, and relevant Vision/component-family rules |
| Active goal checked or created | yes | `get_goal` returned none; goal created with this plan path |
| Source of truth read before edits | yes | Read Link, Discussion, Floating Toolbar, registry metadata, Vision, and owner skills |
| Tracker comments and attachments read | no | N/A: direct local request, no tracker or attachment |
| Video transcript evidence required | no | N/A: no video supplied |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read the registry dependency and Block Discussion path-owner solutions; no conflicting repair contract |
| TDD decision before behavior change or bug fix | yes | Add one browser assertion that Link owns the top position; observe expected red before implementation |
| Branch decision for code-changing task | yes | Current branch is `next`; continue in-place as requested, with no commit/push/PR |
| Release artifact decision | yes | Registry changelog required; no package changeset because no package behavior changes |
| Browser tool decision for browser surface | yes | Browser is the required normal-app QA tool |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Narrow/capped strategy recorded above |
| Browser pack selected | yes | `browser` pack materialized in this plan |
| Browser route / app surface identified | yes | `/docs/link` plus current source-backed Discussion/full-editor route |
| Browser tool decision recorded | yes | Browser; no native Chrome/OS behavior involved |
| Console/network caveat policy recorded | yes | Inspect console; network is relevant only for route/runtime failures |
| Observable browser case captured | no | N/A: this is an owner cleanup with final behavior proof, not a report-backed bug claim |
| Performance pack selected | yes | `performance-observability` pack materialized because subscriptions change |
| User-facing operation and runtime owner identified | yes | Opening `LinkFloatingToolbar`; current repeated cost is two peer store subscriptions owned by Link UI |
| Scale variables and cohorts fixed | yes | Mounted editors/toolbars E={1,10,100,1000}; baseline peer subscriptions=2E, target=0E; timing N/A because deterministic deleted work is the stronger measure |
| Budget frozen before target measurement | yes | Target is exactly zero Comment/Suggestion subscriptions/imports/dependencies in Link; no timing regression and browser behavior must remain correct |
| Baseline and target probe selected | yes | Executable scoped source probe counts the two rejected hook calls before edit and zero after edit |
| Correctness guard selected | yes | Focused type/registry checks and browser Link plus Discussion interaction |
| Production detector decision recorded | no | N/A: copied registry source has no production telemetry owner; this removes runtime work and records no user data |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: Link owns one
      `top-start` floating policy and no longer reads peer plugin state.
- [x] Release artifact requirement recorded: registry changelog; no package changeset.
- [x] Final handoff shape decided: implementation outcome, exact checks, browser
      result, and remaining risk; PR/tracker fields are N/A.
- [x] Branch handling recorded for code-changing work: current `next` branch;
      no branch switch, commit, push, or PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A. The only broad failure was a reproducible 4 GB TypeScript heap
      ceiling; the owning command passed with an 8 GB heap, so reinstall was
      neither indicated nor run.
- [x] Workspace authority recorded: source, test, registry, lint, and type
      commands ran in `/Users/zbeyens/git/plate-2` or its `apps/www` workspace;
      UI proof ran in Browser against the local WWW server.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Visible placement can regress near viewport edges; keep
      Floating UI flip and prove Link alone plus Link with Discussion.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: repo policy forbids
      `autoreview` on `next`; perform a direct scoped diff review instead.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling source changes.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of
      scope. Browser logs contained only React DevTools and HMR information;
      no warning or error was observed. Both target routes returned 200; the
      dev server separately logged one unrelated SCIM auth lookup 404.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
      Browser directly inspected and captured both required states.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof. N/A:
      this is a geometry and interaction claim, not a paint-layer claim; the
      existing surface-paint guard still passed in the full browser file.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
      N/A: not a report-backed bug claim.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints. A new
      in-app Browser tab exercised `/blocks/link-demo` and `/view/editor-ai`
      after the final source was stable; final ref and hashes are recorded below.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: this is an uncommitted local candidate;
      no pushed-ref or shipped claim is made.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. Both Link cases
      passed 5/5 in Chromium with no retry.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof. Proof used
      canonical registry source and generated output from `build:registry`.
- [x] Performance pack: captured the current-owner baseline before the edit:
      two peer subscriptions per toolbar, or `2E` for E mounted editors.
- [x] Performance pack: measured the complete changed cost owned by Link:
      peer store subscriptions during toolbar mount/open fell from two to zero.
- [x] Performance pack: exercised deterministic cohorts E={1,10,100,1000};
      baseline={2,20,200,2000}, final={0,0,0,0} peer subscriptions.
- [x] Performance pack: warm percentiles, cold duration, sampling noise, and
      payload bytes are N/A because the target deletes deterministic listener
      work and creates no timed, network, query, cache, or payload path.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance. N/A: target is deletion; the executable call-count probe directly compares the existing and final source.
- [x] Performance pack: compared baseline and final with the same scoped source
      probe, cohorts, toolbar owner, and browser correctness guard.
- [x] Performance pack: inspected subscription fan-out. Query, pagination,
      result-cardinality, payload, and repeated-read work are N/A on this path.
- [x] Performance pack: optimized the measured Link owner by deleting its two
      peer subscriptions; no pool, cache, index, projection, store, or scheduler
      was added.
- [x] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads. N/A: no database work.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Performance pack: extended the permanent Link browser regression with a
      toolbar-above-link geometry assertion; the deterministic source probe is
      recorded as plan evidence rather than a dead-symbol test.
- [x] Performance pack: no budget override exists. The frozen target was zero
      peer dependencies and zero peer subscriptions, and the final path meets it.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Zero rejected source/registry dependencies; all focused checks and browser cases pass |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | New geometry assertion failed red: toolbar bottom 416.80 exceeded link top 351.17 |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused Link case passed after the owner-local placement change |
| TypeScript or typed config changed | yes | Run relevant typecheck | `NODE_OPTIONS=--max-old-space-size=8192 pnpm typecheck` passed in `apps/www` |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or public file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package manifest or lockfile changed; registry dependency output was regenerated separately |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent rule or skill changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | Commands ran in repo root or `apps/www`; Browser targeted the local WWW app |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces | Browser proved standalone Link and Link plus Discussion on current local code |
| Browser final proof | yes | Attach Browser proof or exact caveat | Fresh Browser tab showed toolbar above Link; Discussion remained 31.13 px below it |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output was edited |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: copied registry UI only; no package API or package behavior changed |
| Registry-only component work changed | yes | Add registry changelog source and regenerate output | Dated MDX entry added; changelog generator check and `build:registry` passed |
| Docs or content changed | yes | Verify source-backed claims and generated output | Changelog states only the verified Link placement/dependency behavior; generated JSON is current |
| High-risk mini gate | yes | Record failure mode, proof, and boundary | Risk is edge flipping/overlay overlap; preserve Floating UI flip and prove both compositions |
| Agent-native review for agent/tooling changes | no | Review agent/tooling changes or record N/A | N/A: no agent or tooling source changed |
| Local install corruption suspected | no | Reinstall/rerun or record N/A | N/A: 4 GB `tsc` OOM passed with 8 GB; no module-resolution or React-runtime corruption signal |
| P1 autoreview for non-trivial implementation changes | no | Run allowed review or record N/A | N/A: repository policy forbids `autoreview` on `next`; scoped source/diff review found no remaining issue |
| PR create or update | no | Run `check` before PR work and sync PR body | N/A: user did not request a PR |
| Task-style PR body verified | no | Verify PR body | N/A: no PR exists |
| PR proof image hosting | no | Host browser proof for a PR or record N/A | N/A: no PR exists |
| Tracker sync-back | no | Sync issue/Linear after PR or record N/A | N/A: no tracker item exists |
| Final handoff contract | yes | Fill exact outcome, tests, browser, caveat, and design | Filled below; PR and tracker fields explicitly N/A |
| Final lint | yes | Run scoped lint/fix | Scoped `ultracite fix` then `ultracite check` passed |
| Output budget discipline | yes | Record any accidental output and recovery | Two capped broad scans were truncated: plan placeholders and generated Link JSON search; closeout then used narrow ranges and structured probes |
| Timed checkpoint | no | Run timed loop or record N/A | N/A: no duration requested |
| Goal plan complete | yes | Run the goal-plan checker | `[autogoal] complete` passed for this plan |
| Browser interaction proof | yes | Exercise target route and interaction with Browser | Link action toolbar, edit input focus/value, Escape, and Discussion coexistence all passed |
| Browser console/network check | yes | Record console/network state | Logs had only DevTools/HMR info and no warning/error; both routes loaded normally |
| Browser final proof artifact | yes | Record screenshot/route proof | Browser captures exist for `/blocks/link-demo` and `/view/editor-ai`; geometry is recorded below |
| Exact case replay | no | Replay report-backed case or record N/A | N/A: direct architecture request, not an external report-backed case |
| Final ref and fingerprints | yes | Record ref and SHA-256 fingerprints | Local HEAD and issue-owned file hashes are recorded below; state is explicitly uncommitted |
| Clean final runtime | no | Prove final pushed ref or record local status | N/A: local uncommitted candidate; no pushed-ref, released, or shipped claim |
| Retry-free stability | yes | Run 5/5 warm browser cases without retry | Standalone and Discussion Link cases each passed 5/5 in Chromium |
| Pre-acceptance scale proof | yes | Compare current and target cohorts and budget | Same probe: baseline `2E`, final `0E` for E={1,10,100,1000}; zero budget met |
| Warm latency budget | no | Measure owning warm percentile or record N/A | N/A: deterministic listener deletion adds no timed path; listener count is the exact cost law |
| Large/stress scaling | yes | Prove declared growth across cohorts | Peer subscriptions changed {2,20,200,2000} to {0,0,0,0} |
| Cold and failure paths | no | Measure cold/failure ownership or record N/A | N/A: no new network, cache, query, store, or failure path exists |
| Payload and fan-out | yes | Record payload and fan-out evidence | Payload/query cardinality is zero; peer subscription fan-out changed `2E` to `0E` |
| Production-path rerun | yes | Rerun same contract on final source identity | Final scoped source/registry probe returned zero rejected tokens/dependencies |
| Correctness guard | yes | Run behavior and data-integrity guard | Unit, browser, type, registry, lint, and live interaction checks passed |
| Before/after receipt | yes | Record comparable baseline and final evidence | Baseline `2E`; final `0E`, with identical editor-count cohorts |
| Detector and privacy | no | Prove runtime detector or record N/A | N/A: no production detector exists or is warranted for deterministic local subscriptions; evidence contains no user data |
| Performance regression check | yes | Run deterministic harness and owning checks | Source fan-out probe plus browser correctness/stability checks passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Requirements, owners, source, registry contract, and proof plan recorded | implementation |
| Implementation | complete | Link owns `top-start`; peer reads/dependencies removed; registry and changelog generated | verification |
| Verification | complete | Source, unit, browser, stability, type, registry, changelog, lint, and live checks pass | closeout |
| PR / tracker sync | not_applicable | No PR, commit, push, or tracker mutation requested | final response |
| Closeout | complete | Final evidence, hashes, caveats, and handoff recorded | final response |

Findings:
- `LinkFloatingToolbar` subscribes to Comments and Suggestions only to choose a
  placement; the `link` registry item consequently installs both source items.
- The general text toolbar is suppressed while Link is open, and Discussion is
  explicitly bottom-positioned. A Link-owned `top-start` lane therefore removes
  peer knowledge without adding coordination machinery.
- The existing `link:floating-toolbar-discussion-spacing` browser case already
  proves Link above Discussion. The standalone Link case needs the new top-lane
  assertion.
- Shadcn project info confirms Radix/New York, React/Next source ownership, and
  an installed Popover primitive; no primitive update is needed.

Decisions and tradeoffs:
- Keep `useOptionalPluginStore` public: its API is correct for honest optional
  feature integration; delete only this dishonest caller.
- Keep `@plate/suggestion-style`: Link directly consumes
  `inlineSuggestionVariants`; only Comment/Suggestion state ownership is cut.
- Reject a floating manager/provider: fixed ownership lanes solve the current
  product composition with less runtime and API surface.

Implementation notes:
- Added one module-level `linkFloatingOptions` policy with `top-start`, offset,
  flip fallback placements, and viewport padding; both Link toolbar modes use it.
- Removed Comment/Suggestion imports, plugin lookups, active-id subscriptions,
  and registry dependencies from Link. Kept `@plate/suggestion-style` because
  `LinkElement` directly renders its style.
- Added the standalone geometry regression, a dated registry changelog entry,
  and regenerated canonical registry/changelog output on `next`.

Review fixes:
- Kept public `useOptionalPluginStore`; the API is valid for real optional
  integration, while Link was the wrong caller.
- Scoped source/diff review found no remaining Link-to-Comment/Suggestion state
  read and no reason for a new overlay manager, provider, or store.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Red browser test declared a duplicate local `surfaceBox` | 1 | Rename the new baseline variable | Renamed to `initialSurfaceBox`; the intended geometry assertion then failed red |
| WWW API-reference check found stale generated input from adjacent local work | 1 | Run the owning API-reference generator | `pnpm --filter www api-reference` refreshed it; check passed |
| Default 4 GB WWW TypeScript process exhausted its heap | 1 | Rerun the identical owning command with an 8 GB heap | Full `apps/www` typecheck exited 0 |
| Direct `tsc` omitted WWW source generation and could not import generated `docs` | 1 | Use the package-owned `pnpm typecheck` pipeline | Source generation ran first and both TypeScript programs passed |
| Browser initially found port 3000 closed | 1 | Start the WWW dev server and use a fresh tab | Both target routes returned 200 and live interactions passed |
| Capped broad scans exceeded their output slices | 2 | Use narrow line ranges and structured probes | Plan closeout and final source audit completed with bounded output |

Verification evidence:
- Baseline source probe: two peer store subscriptions per toolbar; cohorts
  E={1,10,100,1000} produced {2,20,200,2000} subscriptions.
- Final source probe: zero peer store subscriptions; the same cohorts produced
  {0,0,0,0}. Final audit also found zero rejected source tokens, zero forbidden
  registry dependencies, `top-start` present, and suggestion styling retained.
- Red: focused `link:floating-toolbar-visible-boundary` failed with toolbar
  bottom 416.80 above-budget against link top 351.17 before implementation.
- Green: the same focused browser command passed after implementation.
- `bun test apps/www/src/registry/components/editor/link-toolbar.spec.ts`:
  16 passed, 0 failed.
- Full `link-floating-toolbar.spec.ts`: 4 passed, covering standalone Link,
  Link plus Discussion, table toolbar shell, and AI floating menu shell.
- Two Link browser cases with `--repeat-each=5`: 10 passed, no retry.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 111 events checked.
- `pnpm --filter www build:registry`: 366 canonical payloads and 15 sparse
  overlays generated successfully.
- Scoped `ultracite check`: all matched files correct.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm typecheck` in `apps/www`:
  editor check, API reference, source generation/parity, registry source, Next
  type generation, and both TypeScript programs passed; exit code 0.
- Fresh Browser proof on `/blocks/link-demo`: clicked link top 133.85, toolbar
  bottom 125.54; Edit Link input held the expected URL, received focus, and
  Escape returned to the action toolbar.
- Fresh Browser proof on `/view/editor-ai`: Link toolbar bottom 311.09,
  Discussion top 342.22, gap 31.13 px, no overlap. Browser console had no
  warnings/errors. The dev server separately logged one unrelated existing
  SCIM auth lookup 404; both target pages and interactions returned normally.
- Final local HEAD: `a6afd55c30e97c74fe895d1ad005ca75413110f3`.
- SHA-256: Link source `102da07eb59394ca488006e150dfb875b36d15a17f0535948e9366f3d00a3887`;
  browser spec `771bb786c9b1f9bf65f41d08e85293bb593208663a3170f8d0837cb781779ea7`;
  registry metadata `af7e2d7d35f0e9134eacda77b298209ebadfd9417c0f83421f6730a7a58f8ca3`;
  generated Link payload `5ed5436c9f478335b0e007aec2a87e114b97a1867f06f098bcb38d646e797699`;
  changelog source `96bbf8ee4eb6a269e68f743cf847c1080b18382358c61c0b9d262b036a237e6d`.

Final handoff contract:
- PR line: N/A: no PR requested or created
- Issue / tracker line: N/A: no external tracker item
- Confidence line: high, 98%; local proof is comprehensive, but no pushed-ref
  proof exists because no commit/push was requested
- Flow table:
  - Reproduced: red geometry assertion captured the old bottom placement
  - Verified: source, unit, browser, stability, type, registry, changelog, lint,
    and fresh live Browser proof all pass
- Browser check: standalone Link is above its target; Link and Discussion are
  mutually visible with a measured 31.13 px gap; edit focus/value/Escape pass
- Outcome: Link has zero Comment/Suggestion state dependencies and zero peer
  subscriptions; registry install dependencies match that ownership
- Caveat: local uncommitted candidate only. Floating UI may still flip below at
  an extreme top edge by design; one unrelated SCIM auth request returned 404
- Design:
  - Chosen boundary: one Link-owned placement policy shared by edit and insert
  - Why not quick patch: subscribing to peer stores for geometry was the bug,
    regardless of how clean the hook call looked
  - Why not broader change: fixed owner lanes already compose; an overlay
    manager/provider would add state and public surface without owning real work
- Verified: exact commands and local Browser measurements are listed above
- PR body verified: N/A: no PR exists

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: not requested
- Issue / tracker: N/A: none
- Browser proof: passed on `/blocks/link-demo` and `/view/editor-ai`
- Caveats: uncommitted local state; no pushed-ref or release claim

Timeline:
- 2026-09-04T17:40:45.579Z Task goal plan created.
- 2026-09-04 Requirements, owner verdict, proof surface, and hard-cut boundary recorded before implementation.
- 2026-09-04 Shadcn source-shape check, relevant solution read, branch decision,
  baseline fan-out receipt, and TDD case selected.
- 2026-09-04 Link owner boundary implemented; registry/changelog regenerated;
  focused and full browser checks, 5/5 stability, unit, lint, and source audit passed.
- 2026-09-04 Fresh Browser interaction and geometry proof passed; full WWW
  typecheck passed with the required 8 GB heap; closeout evidence recorded.
- 2026-09-04 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local implementation and verification complete |
| Where am I going? | Final response; optional commit/push remains user-owned |
| What is the goal? | Remove Link's Comment/Suggestion state dependency without visual or interaction regression |
| What have I learned? | Link owns the top lane; Discussion owns the bottom lane; deleting peer reads scales exactly to zero |
| What have I done? | Implemented the hard cut, regenerated outputs, and passed source, type, registry, test, stability, and live Browser proof |

Open risks:
- The result is local and uncommitted; no pushed-ref or release proof exists.
- At an extreme top viewport edge, Floating UI intentionally uses its fallback
  placements. Normal standalone and Discussion coexistence cases are covered.
- An unrelated SCIM auth lookup returned 404 in the dev-server log; target
  routes returned 200 and Browser showed no Link-related warning or error.
