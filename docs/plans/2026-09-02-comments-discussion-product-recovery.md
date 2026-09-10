# Comments and Discussion product recovery

Objective:

Recover all fourteen audited Comments and Discussion product regressions without restoring the deleted Discussion store, document comment marks, or legacy render callbacks.

Goal plan:

`docs/plans/2026-09-02-comments-discussion-product-recovery.md`

Primary template:

`docs/plans/templates/plate-feature.md`

Applied packs:

- package-api
- docs
- browser
- registry-changelog
- plate-next-attestation
- performance-observability

Flow mode:

- existing package plus React/registry

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence; every excluded row has an exact N/A reason.
- All fourteen findings in `docs/plans/2026-09-02-uncommitted-product-regression-audit.md` have implementation and direct proof.
- Sidebar and Floating expose the same Comments and Suggestions records and actions while exactly one view is mounted.
- Focused browser behavior passes five retry-free runs, package/docs/registry checks pass, final scale stays inside frozen budgets, and both plan checkers pass.

Verification surface:

- Package: `platejs/comments/react` unit, type, entrypoint, API-reference, and affected Plite checks.
- Registry: Comments, Suggestions, Discussion, toolbar, AI, read-only/static, DOCX export, metadata, and copied demo owners.
- Browser: `/blocks/comment-demo`, `/docs/comment`, `/docs/suggestion`, `/docs/discussion`, and the three Chinese routes.
- Scale: Comments ownership, Comments channel, and Plite decoration-manager benchmarks from normal through pathological cohorts.
- Distribution: registry build/source check, docs source/parity, changelog generation, changesets, barrels, and stale-symbol searches.

Constraints:

- Keep thread truth application-owned and editor-lifetime anchor identity stable.
- Keep `SuggestionPlugin` as the only suggestion document-mutation owner.
- Keep Discussion as copied view-only composition, not a plugin or store.
- Render exactly one Sidebar or Floating surface.
- Do not restore `discussionPlugin`, legacy comment marks, old `render.*` callbacks, or annotation-store transport through copied UI.
- Preserve unrelated changes from other local sessions.
- Do not commit or push without a separate request.

Boundaries:

- Read authority: the completed regression audit, current source, `HEAD` history, package tests, benchmark receipts, and live Browser behavior.
- Write scope: `packages/platejs/src/react/features/comments/**`; directly affected registry Comments, Suggestions, Discussion, AI, static, DOCX, demo, test, metadata, docs, generated registry, changeset, changelog, benchmark artifact, and this plan.
- Runtime boundary: Plate owns anchors, range projection, decoration, hit-testing, and editor-local active state; the application owns messages, users, permissions, status, persistence, and collaboration.
- Release boundary: one major `platejs` changeset plus source registry changelog entries; generators own derived output.
- Non-goals: changing Plite's accepted decoration API, adding package-generation tooling, changing unrelated concurrent work, or making a shipped-state claim from an uncommitted checkout.

Output budget strategy:

- Read exact owners and bounded ranges. Prefer named tests and summarized receipts over generated payload bodies or broad repository diffs.

Blocked condition:

- Block only after three repetitions of the same required behavior gate with no narrower owner or safe repair remaining, or if concurrent edits repeatedly overwrite a directly owned recovery file.

Feature Manifest:

| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api / plate-plugin-creator | `createCommentsPlugin`, `idsAt`, `range`, `setActive`, typed anchor source | Plate applications | typed/unit tests and stale search | complete |
| Package | yes | plate-plugin-creator | `platejs/comments/react` and migrations entrypoints | Plate applications | package type/test/entrypoint/API-reference checks | complete |
| React adapter | yes | plate-ui / plate-plugin-creator | source-scoped decorations and click activation | copied registry UI | React tests and Browser replay | complete |
| Registry UI | yes | plate-ui | rich Comment cards, Suggestion review, view-only Discussion, toolbar, AI, static, and DOCX adapters | copied registry users | component tests and Browser replay | complete |
| Composition | yes | plate-ui | editor kits and `comment-demo` | docs and demo users | combined review with one mounted layout | complete |
| Scale proof | yes | benchmark | Comments ownership/channel and decoration-manager receipts | users and maintainers | frozen cohorts, budgets, counters, and correctness guards | complete |
| Registry metadata/examples | yes | plate-ui / registry owners | item metadata, demo, fixtures, and generated payloads | CLI and registry users | registry build and source check | complete |
| Docs | yes | docs-creator | Comment, Suggestion, and Discussion pages in English and Chinese | docs users | source/parity checks and route replay | complete |
| Release artifacts | yes | changeset / registry-changelog | major Plate changeset and source/generated registry changelog | package and registry users | manifest and generator checks | complete |
| Proof | yes | plate-feature | command, Browser, and benchmark receipts | maintainers | selected gates plus feature checker | complete |
| Plate Next attestation | no | plate-next | N/A: focused recovery is not a package-wide review | maintainers | N/A: do not advance package status from a focused change | N/A: no mass attestation |
| Review/handoff | yes | plate-feature manual P1 | bounded source, test, browser, and plan review | user | manual P1 because `autoreview` is forbidden on `next`; goal checker | complete |

Package file evidence:

- Package: `platejs`, focused changed-owner review only.
- Manifest command / file count: N/A: full package attestation does not apply.
- Package fingerprint: N/A: this plan does not advance package-wide Plate Next status.
- [x] N/A: focused Comments owners received direct package proof and manual P1 review; no package-wide score is claimed.

Package boundary contract:

| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | keep `packages/platejs` | no package was added |
| Plite ownership | keep the internal annotation adapter | copied UI does not import a Plite store |
| external dependencies | add none for Comments | existing Plate and registry dependencies cover the feature |
| entrypoint direction | expose client-only `platejs/comments/react` | projection and hit-testing require React/editor events |
| exported topology | hard-cut singular `comment` to plural `comments/react` | package manifest, generated task graph, public type build, and `pnpm brl` pass |
| Oxlint coverage | keep existing `packages/platejs/src/**` coverage | no source root was added |

Phase state:

- current phase: handoff
- status: complete
- next phase: N/A: every selected phase is closed

Phase / pass table:

| Phase | Status | Evidence |
| --- | --- | --- |
| Package semantics | complete | Comments package tests and typecheck pass. |
| React and registry composition | complete | Rich Comments, suggestion review, unified Discussion, exclusive layouts, AI drafts, static projection, and DOCX fidelity are wired. |
| Docs and release | complete | Six EN/ZH pages, the Plate changeset, and registry changelog pass their owner checks. |
| Browser proof | complete | Six stories pass 30/30 across five retry-free Chromium repetitions; a fresh in-app Browser page is visually clean. |
| Scale proof | complete | Final serial receipts pass every frozen Comments ownership, channel, and decoration-manager cohort, budget, counter, and correctness guard. |
| Review and handoff | complete | Bounded manual P1 review found no unresolved P1 issue. |

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Feature Manifest complete before source writes | yes | Every surface was assigned an owner, artifact, consumer, proof, and N/A boundary before implementation. |
| Flow mode selected | yes | Existing package plus React/registry. |
| Public API decision owner selected | yes | `best-api` and `plate-plan` retained one Comments plugin and rejected a Discussion plugin, combined store, or second projection layer. |
| Runtime scale applicability resolved | yes | Anchor projection, click hit-testing, and decoration refresh are hot paths, so performance proof applies. |
| Pre-acceptance receipt selected | yes | Frozen Comments ownership and decoration-manager baselines cover normal, large, stress, and pathological cohorts. |
| Package boundary selected | yes | Plate owns editor integration; registry application code owns thread records and review presentation. |
| Conditional packs selected | yes | package-api, docs, browser, registry-changelog, plate-next-attestation, and performance-observability. |
| Active goal linked | yes | The active Autogoal names this plan and all product/proof requirements. |
| Changeset owner loaded | yes | `.changeset/comment-v54-runtime.md` follows the `changeset` contract. |
| Barrel impact resolved | yes | The public entrypoint topology changed; `pnpm brl` completed successfully. |
| Docs owner loaded | yes | `docs-creator` plugin/style guidance and `unslop` file audits were applied to all six pages. |
| Browser route selected | yes | The standalone demo is primary; six docs routes are route-parity coverage. |
| Browser tool selected | yes | In-app Browser covers the ordinary web surface; no native Chrome/OS boundary applies. |
| Registry changelog owner loaded | yes | Source entries are generated and checked; generated JSON was not hand-edited. |
| Plate Next scope resolved | yes | Focused recovery cannot advance package-wide attestation. |

Work Checklist:

- [x] F1 restore view-only unified Discussion with chronological Comment and Suggestion rows plus block counts.
- [x] F2 restore suggestion summaries, authorship, nested replies, and Accept/Reject actions.
- [x] F3 restore rich Plate `Value` comment bodies with Basic Marks editing and rendering.
- [x] F4 route `mod+shift+m` and the toolbar through the same application-owned begin action.
- [x] F5 expand a collapsed caret to the containing block-content range before anchor creation.
- [x] F6 activate every comment at the clicked overlap point in deterministic source order.
- [x] F7 restore hover, active, and overlap paint with unit and Browser coverage.
- [x] F8 preserve DOCX token color and significant whitespace through the DOCX export adapter.
- [x] F9 stage streamed AI comments as drafts with explicit Accept and Reject.
- [x] F10 render external anchors in read-only and static editors without legacy marks.
- [x] F11 teach Comment, Suggestion, and Discussion consistently in English and Chinese.
- [x] F12 cancel and release a Floating draft on outside close while preserving focus behavior.
- [x] F13 clear active comment state when unmarked editor content is clicked.
- [x] F14 describe only the final registry behavior after implementation exists.
- [x] Keep Discussion view-only and `SuggestionPlugin` as the only suggestion mutation owner.
- [x] Keep Sidebar and Floating mutually exclusive over the same records and actions.
- [x] Prove package semantics, copied UI, kits, metadata, examples, docs, release artifacts, and generated output.
- [x] Finish the uncontended decoration-manager timing rerun against the final measured source identity.
- [x] Complete a bounded manual P1 review because `autoreview` must not run on `next`.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run the Plate feature checker | Every applicable manifest row is complete and every excluded row has an exact N/A reason. |
| Selected pack closure | yes | Close every selected pack | All six selected packs are closed with evidence below. |
| Package proof | yes | Run owner-selected package proof | `comments-react` typecheck and 10-test partition pass; the broader affected Plite gate also passed. |
| Package boundary proof | yes | Check manifests, lint, exports, and generated task graph | Workspace manifest check, Ultracite, public package type build, entrypoint contracts, and `pnpm brl` pass. |
| Scale proof | yes | Rerun frozen production cohorts and correctness guards | All three final receipts pass; decoration passes all normal, large, stress, and pathological timing and deterministic checks. |
| Registry/browser proof | yes | Verify copied UI and public routes | Registry build/source checks pass; browser suite is 30/30 and fresh Browser state is clean. |
| Docs/release proof | yes | Verify source, parity, changeset, and changelog | Docs/API reference, manifest, and changelog checks pass. |
| Plate Next attestation | no | Keep package-wide status unchanged | N/A: this is focused recovery, not a complete package audit. |
| P1 autoreview | yes | Perform the allowed P1-equivalent review | Manual P1 source/diff/browser review found no unresolved P1 issue; `autoreview` was not run on `next`. |
| Goal plan complete | yes | Run the Autogoal completion checker after every gate closes | Every behavioral and proof gate is recorded; the exact checker result is appended below. |
| Public API proof | yes | Audit calls, inference, exports, and deleted alternatives | Typed API test, package typecheck, entrypoint contracts, docs check, and stale-symbol search pass. |
| Release artifact classification | yes | Classify package and registry deltas independently | Published Plate API/runtime uses a major changeset; copied registry behavior uses the registry changelog. |
| Barrel/export generation | yes | Run `pnpm brl` | Four package barrel tasks pass. |
| Required Unslop pass | yes | Audit every edited docs artifact | Six EN/ZH files were audited; every reported prose/formatting finding was fixed while API literals were preserved. |
| Browser console/network check | yes | Inspect fresh final page logs | Fresh `/blocks/comment-demo` logs contain only React DevTools and HMR connection messages; no product error is present. |
| Browser final proof artifact | yes | Capture and inspect the overlap state | Fresh Floating capture shows one popover, two ordered thread cards, two active overlap decorations, and the read-only control below. |
| Exact case replay | yes | Exercise all fourteen reporter-visible outcomes | Six Browser stories cover combined review, creation/actions, suggestions, paint/static/recovery/scale, AI drafts, and EN/ZH routes. |
| Final ref and fingerprints | yes | Record source/test/fixture/harness hashes | Final `HEAD` and SHA-256 list are recorded below after the last source-affecting command. |
| Clean final runtime | no | Use a clean pushed ref for shipped wording | N/A: the recovery is local and uncommitted; this plan makes no shipped-state claim. |
| Retry-free stability | yes | Run native interaction stories 5/5 without retry | 30/30 Chromium executions pass with `--repeat-each=5` and no retry. |
| Registry changelog generation | yes | Generate and check registry changelog output | Write was run from source; `--check` passes with 107 events. |
| Registry generator test | no | Test generator only when its code/schema changes | N/A: generator code and schema were unchanged. |
| Package review | no | Run full Plate Next package review only for attestation | N/A: focused owners were reviewed; no package-wide score is claimed. |
| Production-path rerun | yes | Measure final owners with matched scripts and frozen budgets | Final Comments and decoration receipts are green against measured source identities. |
| Correctness guard | yes | Prove behavior and deterministic work counts | Package/browser behavior passes; decoration uses zero transient renderer calls and wakes only affected nodes. |
| Detector and privacy | yes | Keep aggregate local metrics free of protected data | Receipts contain generated fixtures, counters, timings, environment metadata, and source hashes only. |

Findings:

- The architectural cut was right; the product cut was not. Deleting a second Discussion store did not justify deleting the combined review experience.
- A single DOM `data-comment-id` cannot represent overlap activation. Exact point hit-testing must return the ordered full group.
- Suggestion actions previously relied on stale editor selection. The clicked suggestion range must be resolved and passed to the mutation owner.
- Plain string bodies destroyed rich replies and AI review state. The application channel needs rich `Value` bodies and explicit draft status.
- Static and DOCX outputs need dedicated projection/export adapters; live editor styling is not export fidelity.
- The public singular-to-plural entrypoint cut required generated task/barrel/API state and changeset target cleanup beyond the visible demo files.

Decisions and tradeoffs:

- Keep one `createCommentsPlugin({ anchors })`. It owns anchors, projection, decorations, exact point queries, and editor-local activation only.
- Keep `createCommentsChannel` as copied application reference code. It owns thread records and fine-grained subscriptions, not editor rendering.
- Keep `Discussion` as view-only composition over Comments and `SuggestionPlugin`. Adding a plugin or combined store would duplicate ownership and make updates broader.
- Keep one controlled `view: 'sidebar' | 'floating'`; both layouts expose the same records/actions but never mount together.
- Use the existing Comments channel for AI draft records. A second AI-comment store would create competing truth for Accept/Reject.
- Preserve the hard cut: no compatibility alias, legacy mark runtime, or old renderer path is restored.

Review fixes:

- Resolved suggestion Accept/Reject against the clicked suggestion range instead of ambient selection.
- Added the missing slow-test mocks for copied Comment UI and Lucide actions.
- Fixed stale workspace changeset package names uncovered by the final manifest gate.
- Regenerated stale entrypoint, API-reference, registry, editor-kit, and barrel outputs from their owners.
- Fixed sentence-case docs headings while preserving API literals.
- Tightened the Comments channel benchmark receipt with measured source identities and mutation-during-run protection.

Error attempts:

| Error or failed attempt | Count | Different move | Resolution |
| --- | --- | --- | --- |
| Package wrapper received a repo-relative test path after changing directory | 1 | Run the named partition/direct root path | resolved: focused package tests pass |
| Rich-body cut exposed string fixtures and plugin API inference loss | 1 | Migrate fixtures and preserve inference through typed plugin extension | resolved: www typecheck passes |
| Portal lookup assumed `useEditorPlugin` returned an editor | 1 | Read the editor with canonical `useEditor()` | resolved: slow AI tests pass |
| Workspace manifest gate found changesets targeting deleted package names | 1 | Point the existing changesets at current `platejs` and `plitejs` packages | resolved: manifest check passes |
| Affected Plite gate saw a concurrent generated-state write | 1 | Regenerate the task graph, rerun the isolated monitor, then rerun the whole gate | resolved: full affected gate passes |
| Decoration timing ran while other sessions saturated the host with Playwright/build work | 3 | Wait for five quiet samples, then run the same frozen harness serially | resolved: the quiet-window run passes all cohorts and budgets |

Verification evidence:

- `pnpm --filter platejs typecheck:partition:comments-react`: pass.
- `pnpm --filter platejs test:partition:comments-react`: 10 tests, 44 assertions, 0 failures.
- Focused fast package/registry/DOCX suite: 22 tests, 108 assertions, 0 failures.
- `pnpm test:slow -- ai-menu.slow.tsx suggestion.slow.tsx`: 7 tests, 15 assertions, 0 failures.
- `NODE_OPTIONS=--max-old-space-size=8192 pnpm --filter www exec tsc --noEmit`: pass.
- `pnpm check:plite:dev`: 85 typecheck tasks, app/www integration types, 134 test tasks, 232 contracts, 25 benchmark contracts, 46 target declarations, public package build/types, and Chromium smoke pass.
- `pnpm --filter www check:docs`: API reference, MDX source, and source parity pass.
- `pnpm --filter www build:registry`, registry source check, changelog check, and editor-kit check: pass; changelog contains 107 generated events.
- `node tooling/scripts/check-workspace-package-manifests.mjs`: pass.
- Final registry changelog check: 107 source events and generated indexes are current.
- `pnpm brl`: four package tasks pass.
- Bounded Ultracite and whole-checkout `git diff --check`: pass.
- Six docs files completed the Unslop audit; all actionable prose findings were fixed.
- `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-09-02-comments-discussion-product-recovery.md`: complete, 12 surfaces.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-02-comments-discussion-product-recovery.md`: complete.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www exec playwright test tests/browser/comment.spec.ts --project=chromium --repeat-each=5`: 30 passed, 0 failed, 0 retries.
- Fresh in-app Browser proof on `/blocks/comment-demo`: Sidebar starts with 3 comments and 2 suggestions; Floating mounts no Sidebar and opens one popover with 2 ordered overlap threads and 2 active decorations; console is clean.
- Comments ownership receipt: `benchmark-comments-ownership-recovery-final.json`, decision `accept-production-owner`, 0 correctness failures, no red production row, all growth/overhead/body-isolation checks pass.
- Comments channel receipt: `benchmark-comments-channel-recovery-final.json`, 10,000 subscribers and 1,000 edits, p95 0.003292 ms against 5 ms, exactly 1,000 target wakes and zero unrelated/current-user/pending/visible-list wakes.
- Decoration receipt: `decoration-manager-benchmark-recovery-final.json`, decision `production-scales`; normal/large/stress/pathological pass every timing and deterministic check. Production p95 is 38.397833 ms for stress mount and 92.545958 ms for pathological mount, within 50 ms and 100 ms budgets; pathological read is 4.158875 ms and update is 0.913333 ms.
- Final receipt-integrity check: all three decisions are green and every embedded source hash matches the current file bytes.

Final fingerprints:

- Ref: `a6afd55c30e97c74fe895d1ad005ca75413110f3` plus the local uncommitted files below.
- Production: `CommentsPlugin.ts` `e00e792d28de93a9107872c4b52ddb67920d98b1783cfc7bbbc66ee376467637`; `comment.tsx` `894ce31090679e775864e2c4abcb76dfa105b8a27c68d067e5c8ff5250a68439`; `discussion.tsx` `5899603b066ce61443611e09d60e6ab2e5aa4f85df2d30a8336eea90ebe05bae`; `suggestion.tsx` `b1feca261b43711b2bcaff54f682161c49b42a3489a1e568c85703b375d9aaf7`.
- AI/export: `use-chat.ts` `839b2d8a4920376cd0497545073b567cc335295f0b1225eda8c5b2e2b234a7bb`; `ai-menu.tsx` `c79767675d225f57563ee67cb9bdd0c1fe4193e75367d7b8e456bcb9e3d30296`; `DocxExportPlugin.tsx` `1316caf9235021ddc35b85947e5cf815e84660f3bdc449cbfa517cb9e62f7b30`.
- Fixture: `comment-demo.tsx` `07131bb68e575e371d61eb1d7f157e5ffc0a912b99e52174b89e1e5876069d27`.
- Tests: `CommentsPlugin.spec.tsx` `ec0ac9773ab19f1736aafc6ee86fcbad05545551be628cb55b1e109b63a4eff3`; `comment.spec.tsx` `d2767f85658e777c3c19e3a3936aa0fa26e62c584390f8dd5140dbf32203b811`; browser `comment.spec.ts` `b36e1376f3f02dd2051d76cfaa71a56cba3532f261364bdcd41dd39abba3a5d0`.
- Slow fixtures: `suggestion.slow.tsx` `5f5a2fe5ef1aa7314af4904febecfe253a314a30c53ece57fccf6de55aece8bd`; `ai-menu.slow.tsx` `e3e38c2db227d7a619bdc30a8b192468819cc78a780f8917b0318449f54fa18a`.
- Harnesses: ownership `00814c2faf626a04d142921209a084494a061e29d10c02949260a1394a385619`; channel `3bbfb5946c958dfea458065eb51068b277c2ba74e3c0fa686143ff3ef4581f4e`; decoration `64203a2da589003ab3494f5c4cd0b7a288f2e9a166078fd4e3c62e08aff9882f`.
- Receipts: ownership `d1ecff1051c6173b547e224d9e3c40d91ef6ca4f92b9052a3cd838052299457d`; channel `bbb197bc69d6c9bbe9e493ec398ed307417c035c99e9e188331e67b8d55c0544`; decoration `b5a73ada8d3c41b38ceeaf431e2de97d9f490df90c04a9b95decc587d9bb586b`.

Reboot status:

- No reboot was needed. The active goal, plan, fourteen-finding audit, and final owner set were re-read during closeout.

Open risks:

- The checkout is shared, dirty, local, and uncommitted. Product and browser proof is current for the bounded Comments owner set, but nothing is shipped until a later commit/push request replays the clean-ref gate.
- Three loaded-host decoration attempts were correctly rejected. The final quiet-window run passed without changing code, cohorts, samples, or budgets; future timing runs still need an unloaded host.

Final handoff contract:

- Outcome: all fourteen product behaviors and every selected proof gate are complete locally.
- Evidence: package, registry, docs, release, component, browser, and scale gates pass.
- Browser proof: 30/30 retry-free Chromium runs plus a clean fresh Browser interaction.
- Scale receipt: Comments ownership, channel, and decoration-manager final receipts pass.
- Release artifacts: major `platejs` changeset plus generated registry changelog output.
- Residual risk: local uncommitted state cannot support shipped wording.
- Next owner: the user decides whether to commit and push the shared checkout later.

Timeline:

- 2026-09-02: audited fourteen regressions, restored product behavior without restoring deleted architecture, completed package/docs/registry/browser proof, and entered scale closeout.
