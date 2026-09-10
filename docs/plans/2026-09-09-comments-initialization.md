# Comments initialization

Objective:
Replace imperative demo thread replay with complete records loaded through the existing copied Comments channel. Simplify editor-ai and Discussion without changing the package ownership split.

Goal plan:
docs/plans/2026-09-09-comments-initialization.md

Template:
docs/plans/templates/task.md

Task source:
The user accepted the preceding source review with “go”. Local implementation, documentation, generated output and verification are authorized; publication is not.

Completion threshold:
Both demos load complete threads without changing users or sequencing a fake clock. Bulk replacement preserves data/anchor ownership and targeted invalidation. Existing replies, dates, excerpts, overlapping suggestions and multi-segment comment coverage remain. Focused tests, source types, registry output and real-route browser checks pass.

Verification surface:
Copied comment.tsx and its existing unit suite; discussion-demo.tsx; editor-ai/plate-editor.tsx; Comments browser suite at /blocks/discussion-demo and /view/editor-ai; EN/CN Comments reference; www typecheck, registry generation and copied editor-ai installation consumers.

Constraints:
Current checkout next; no commit, push, PR, external messages, worktrees or unrelated product edits. Keep application data/provider outside the plugin, one editor-bound anchor source, existing DiscussionSlots, styling, layout and AI lifecycle. No new package API or store.

Boundaries:
Named copied sources/tests/docs and required registry/doctrine mirrors. Plite and package Comments mechanics are unchanged. Follow Task workflow, Best API, Plate UI, Verify Plate, Testing and Autogoal. Sequential work under the user's tool mapping; Autoreview is N/A on next.

Timing:
No requested duration or token budget. Throughput checkpoint: one sequential source owner; focused channel proof first, then consumer and generated/browser gates. Avoid duplicate broad runs.

Blocked condition:
Missing capability prevents the remaining proof after concrete inspection; continue all independent work and report the precise limit. Test failures remain work to resolve.

Task state:
- current_phase: handoff
- next: retain the broader browser failures as separate follow-up work
- status: complete

Work Checklist:
- [x] Read Poteto principles, source review and relevant plans; Subtract Before You Add removes replay, Minimize Reader Load keeps setup visible, Model the Domain uses complete CommentThread records.
- [x] Capture authority, owners, hard laws and proof obligations. Sources: Task workflow; Autogoal checklist retention; Best API output and repair contract.
- [x] Implement and test setThreads through the constructor's canonical ingress: immutable body/date copies, duplicate rejection before mutation, current user/pending preservation, precise list/anchor notification, obsolete-anchor release and failed-load atomicity. Evidence: unit-handoff.log.
- [x] Adopt both demos with one stable channel/plugin initializer and fixture-local explicit ranges; no text search, impersonation, scripted clock, or partial seeding sentinel. Source audit and generated payload readback passed.
- [x] Preserve actual range coverage and display data; retain anchor cleanup across effect replay and editor replacement. Sources: accepted review; prior exact-presentation plan; Verify Plate native editor law. Evidence: native-anchor cleanup/rebind/undo/redo test, fixture-paths.log, loading-equivalence.log and browser-observations.json.
- [x] Check loading work through the existing constructor/replacement owner at 2, 100 and 1000 records; no new steady-state layer, index or subscription. Each load publishes one list/anchor notification; rebind keeps lists quiet, and clearing releases each retired handle once. No timing or speed claim.
- [x] Update EN/CN copied channel reference, smallest Best API/Plate UI teaching owner and required doctrine version/mirrors; preserve immutable history and package attestations. Sources: Best API self-maintenance; Task docs; Plate Next. Added doctrine 174; subsequent concurrent doctrine versions retained. Current validation and exact mirror checks passed.
- [x] Run focused unit tests, www source types/lint, registry generation/readback, existing Comments browser proof and inspect desktop/narrow outcomes. Run editor-ai copied installation checks for both primitive families. Evidence and wider-suite limitations are enumerated below; browser control was available.
- [x] Reconcile original checklists, inspect scoped changes and retained receipts, clean only owned runtime sessions, validate this plan and report exact local result. Source/proof fingerprint drift: none; scoped diff whitespace check passed. Temporary consumers, owned servers and tabs were removed; original www servers remain. Decision-log rows were checked against the actual source, command logs and browser actions.

Decisions and tradeoffs:
- setThreads accepts complete already-bound CommentThread records. The application binds ranges after editor creation; the package remains unaware of messages.
- Replacement is atomic at data ingress. Pending draft and current user survive. Retained handles are not released; removed handles are released once after successful publication preparation.
- Full replacement intentionally costs O(threads + message bodies); ordinary edit/reply keeps the existing keyed path. No polling, cache or runtime manager is added.
- Explicit fixture paths live beside their document values and are checked against actual loaded editor ranges. Excerpts are presentation and do not truncate range coverage.

Verification evidence:
- Baseline source review: constructor accepts complete threads, demos replay create/reply/user changes after text searches. AI range currently covers only the link text; previous value and Discussion fixture cover its following text too.
- Branch before mutation: next.
- Artifact directory: `docs/plans/artifacts/comments-initialization/`; exact source/proof hashes in `source-fingerprints.json`, decisions in `decisions.tsv`.
- `unit-handoff.log`: 30/30 tests, 221 assertions across copied Comment and Discussion suites. Includes real native handles observed through the public Comments subscription.
- `loading-equivalence.log`: 2/2 tests compare the actual EditorKit and both demo fixtures under command-based and record-based loading. Suggestion acceptance preserves identical mapped ranges, active IDs, thread counts and `overlapping` text.
- `typecheck-handoff.log`: full `pnpm --filter www typecheck` passed, including both source and package-integration graphs. The initial new test's readonly mutation was corrected to an explicit external object mutation; a later transient Find test error resolved in the concurrently edited owner before final rerun.
- `lint-handoff.log`, `registry-handoff.log`: scoped lint and registry generation passed. Generated comment and editor-ai payloads contain `setThreads`; the generated example index imports discussion-demo from its source. Registry changelog check passed.
- `browser-focused.log`: 3/3 targeted AI layout, full multi-segment paint, unboxed Discussion and narrow viewport cases passed. The whole `comment.spec.ts` run recorded 16 passed, 8 failed, 2 skipped in `browser-final.log`; it is not a green full-suite receipt.
- `create-install.log`: fresh editor-ai Base/Nova and Radix/Luma consumers both built with TypeScript checks. Both hydrated, displayed original authors and relative timestamps, accepted Alice replies and cleared their composers through real browser control. Captured console errors: zero for those two tabs.
- `browser-observations.json`: source route desktop/390px inspection, copied-consumer operations, and a same-build Base/Nova comparison at `/editor` and `/loading-baseline`. The latter recreates threads through user commands only for diagnosis; its retained source copies are artifacts, not product owners.
- Best API repair: source rules and Vision teach one application data ingress; dependent Plate/Plite plan, Plugin Creator, Task docs and Plate Next owners contain no conflicting replay recipe. Source and generated skills match. Agent Native Reviewer checked discoverability, source ownership, direct API proof and separate install/browser claims. Forward check: document-owned suggestions still use their existing editor initial value and mutation owner; the application-loading rule does not introduce a suggestion channel.
- N/A: package changeset/barrels/package typecheck (no package code or exports changed); Autoreview (next, no review/publication request); AI service execution (initialization changes no provider/API request); editor-basic copied install (unchanged consumer, while editor-ai covers both affected primitive families); generic workflow sync (project API doctrine only).

Findings and remaining work:
- The loading implementation is complete and locally verified. Broader existing browser behaviors remain outside this loading change: two composer-opening cases, three anchor-edit/history cases, two suggestion-accept popup cases, and one touch proof-route load case. The two main-baseline rows require their separate baseline environment and were skipped by the existing runner.
- Suggestion acceptance closes Floating Discussion and loses its inline paint in the fresh copied consumer under both command-based and `setThreads` loading. Native package range/active-ID results remain identical and correct in the paired tests. This points to the existing mounted view/Discussion behavior, not record ingress; no unrelated package or popup repair was made.
- The other broad failures remain recorded in `browser-first-results/` and `browser-diagnostic/`, without a pre-existing or resolved claim. No full-browser, native-device or release-quality certification is made.
- An independent fresh www dev host could not be started through the current Next configuration without colliding with existing owned cache locks; existing servers were left running. Fresh copied production consumers supplied the independent runtime comparison. Failed launch attempts are retained in the artifact logs.

Open risks:
- Full replacement clones every input body and timestamp. It is an explicit O(records + bodies) loading operation; ordinary reply/edit still uses keyed writes.
- The wider browser failures above are separate follow-up candidates. This handoff does not claim they are fixed or shipped.
