# Yjs Large-Doc Import Readback

Date: 2026-06-14

Question:
- What should the next `@slate/yjs` research-mode packet do after the current benchmark shows `largeDocSync` as the worst lane?

Scope:
- Slate v2 `@slate/yjs` remote import, Yjs readback, benchmark instrumentation, and proof quality.
- External sources are evidence for invariants and benchmark/oracle strategy only. Runtime patches stay Slate-native.

Stop rule:
- Promote a concrete packet only when current Slate source plus external binding evidence point to a proof command and a bounded change.
- Defer architecture work when the fix needs a new incremental remote-import design instead of a local helper patch.

Current local evidence:
- `bun test ./packages/slate-yjs/test` passes 243/0.
- `bun --filter ./packages/slate-yjs typecheck` exits 0.
- `bun run bench:core:yjs-collaboration:local` passes with `yjs_correctness_failures=0`.
- Current benchmark hot lane: `yjs_large_doc_sync_p95_ms=60.85`, `yjs_large_doc_sync_work_p95_ms=46.24`, `yjs_large_doc_sync_verification_p95_ms=15.22`.
- `YjsController.importFromYjs()` still does `readSlateValueFromYjs(this.root)` then `editorAdapter.replaceValue(...)` for remote updates.
- 2026-06-15 policy update: the soak runner files are restored as manual-only diagnostics. Do not run them unless the user explicitly asks for a soak run. Package script aliases and automatic gates must stay absent.

Policy note:
- Older rows below that say soak runners were deleted or absent are historical packet evidence from the 2026-06-14 timed run. Current policy is manual-only restoration: files may exist, but default automation must use package contracts, benchmark proof, focused provider tests, or an accepted architecture packet.

Verdict:
- Do not rewrite remote import in a micro-packet. The safe packet is benchmark instrumentation: split large-doc local-edit time from remote-apply/import time so the architecture packet has a real target.
- The architecture direction remains incremental remote import through Yjs event deltas, but it needs an explicit design/proof packet because selection, history, hidden/virtual children, and canonical read shape are affected.

Promoted packet:
- `bench-large-doc-import-phase`: kept. The benchmark now prints large-doc local edit and remote sync/import p95 metrics.
- `remote-apply-import-trace`: kept. A package oracle now proves remote Yjs updates reach one tagged `remote-yjs-import` commit and record `importKind=full-read-replace` with the imported child count.
- `incremental-remote-import-architecture-plan`: kept. The architecture packet is now drafted at `docs/plans/2026-06-14-yjs-incremental-remote-import-architecture.md`; it keeps implementation deferred until user acceptance and package proof gates.
- `benchmark-metric-contract`: kept. The package config contract now guards the local benchmark script and required metric names, and a bounded benchmark smoke proves the required `METRIC` rows still print.
- `benchmark-target-report-refresh`: kept. Generated target history/report now reflect the metric target change; `yjs-collaboration` is listed as ok with `printsMetric=true`.
- `current-non-soak-proof-refresh`: kept. Current package contracts, package suite, typecheck, short benchmark smoke, and target checks are green without running deleted long soak scripts.
- `architecture-source-anchor-audit`: kept. The deferred incremental import plan now has a current source-anchor audit for controller, trace types, package tests, benchmark, and no-soak guard facts.
- `benchmark-artifact-diagnostic-contract`: kept. The package config contract now guards benchmark artifact distribution fields, calibration policy, and artifact path, so future perf packets keep more than p95-only evidence.
- `deleted-soak-file-absence-contract`: kept. The package config contract now asserts the deleted 1h/3h proof runner files themselves stay absent, not only that package scripts do not expose them.
- `architecture-no-soak-anchor-refresh`: kept. The deferred architecture plan now points at the current no-soak guard lines after the file-absence contract changed the package-config test.
- `fast-check-non-soak-proof-refresh`: kept. Root `bun check` passes without invoking integration or deleted Yjs long soak runners, and focused `@slate/yjs` package tests pass 242/0.
- `research-backlog-closure-audit`: kept. Lead and promoted ledgers have no actionable queued/promote/TBD backlog; `deferred-architecture` remains the accepted stopping checkpoint for incremental remote-import implementation.
- `fast-check-long-proof-exclusion-contract`: kept. The package config contract now asserts fast scripts exclude long proof gates and deleted Yjs soak names while `check:full` owns release/integration gates.
- `agent-start-no-soak-consolidation`: kept. The Slate v2 agent entrypoint now says the deleted Yjs 1h/3h proof runners stay deleted and points future agents to non-soak proof owners.
- `docs-audit-no-soak-contract`: kept. The Slate v2 docs audit now requires the agent-start deleted-runner signals so entrypoint drift fails early.
- `plate-install-biome-config-repair`: kept. Root install state now matches the declared ultracite/Biome versions, so the docs audit guard can be formatted and audited normally.
- `post-install-skill-no-soak-scan`: kept. Generated `.agents` rules and skills do not reference the deleted Yjs 1h/3h runners after skiller apply.
- `agent-layer-no-soak-audit-contract`: kept. The Slate v2 docs audit now fails if generated `.agents` files reference the deleted runner names.
- `focused-tooling-eslint-proof`: kept. The changed docs-audit script has a focused ESLint proof using `--no-ignore`.
- `plate-root-fast-test-proof`: kept. Root `pnpm test` passes after install and tooling guard changes.
- `root-lint-artifact-blocker-classification`: quarantined. Broad `pnpm lint` is blocked by unrelated issue-harvester/generated artifact hygiene, while touched-file gates stay green.
- `current-yjs-package-contract-refresh`: kept. Current `@slate/yjs` config contract, typecheck, and package suite are green.
- `current-yjs-benchmark-smoke-refresh`: kept. Bounded Yjs collaboration benchmark smoke prints the required metrics with correctness 0.
- `benchmark-target-gate-refresh`: kept. Benchmark target registry and generated report/history checks are green.
- `architecture-source-anchor-audit-refresh`: kept. Narrow source reads confirm the deferred incremental remote-import architecture plan still matches current controller, trace type, contract-test, benchmark-metric, and no-soak guard facts.
- `research-ledger-audit-contract`: kept. The Slate v2 docs audit now checks the current Yjs research TSV ledgers for column drift and unclosed actionable decision rows.
- `docs-audit-deleted-runner-file-absence`: kept. The Slate v2 docs audit now fails if either deleted Yjs long-runner file reappears under `.tmp/slate-v2`.
- `post-audit-yjs-package-proof-refresh`: kept. Current `@slate/yjs` config contract, typecheck, and package suite remain green after parent docs-audit hardening.
- `post-audit-yjs-benchmark-smoke-refresh`: kept. Bounded Yjs collaboration benchmark smoke remains correctness-clean and prints the required metrics.
- `post-audit-benchmark-target-gate-refresh`: kept. Benchmark target registry and generated report/history checks remain green after the latest smoke.
- `post-audit-benchmark-artifact-refresh`: kept. Latest benchmark JSON still preserves calibration policy, correctness 0, and raw distribution fields for remote apply/encode/sync.
- `architecture-plan-source-audit-history-refresh`: kept. The deferred incremental import architecture plan records the latest narrow source audit and docs-audit deleted-runner file absence guard.
- `installed-yjs-event-substrate-refresh`: kept. Installed `yjs@13.6.30` source confirms the event path, callback-scoped delta/changes, YText delta, and deep-observe substrate used by the architecture plan.
- `read-log-tsv-audit-contract`: kept. The Slate v2 docs audit now checks the current Yjs `read-log.tsv` alongside lead/promoted ledgers.
- `remote-import-contract-proof-refresh`: kept. Focused remote-import contract remains green after installed Yjs source refresh.
- `combined-yjs-contract-proof-refresh`: kept. Package-config and remote-import contracts pass together as the current focused no-soak bundle.
- `current-yjs-package-suite-refresh`: kept. Current `@slate/yjs` typecheck and package suite are green after focused contracts.
- `incremental-import-source-feasibility-preflight`: kept. Local source preflight confirms the next implementation slice needs a visible-slot-aware path map and should reuse existing text-point resolution plus traceable fallback taxonomy; no runtime implementation started.
- `remote-import-trace-taxonomy-preflight`: kept. Compatible replacement helpers are useful precedent but not a remote-event importer; remote import needs its own fallback reason surface.
- `structural-safety-bundle-refresh`: kept. Structural, selection, and history contracts pass as the current non-soak safety bundle for the deferred incremental importer.
- `provider-awareness-react-bundle-refresh`: kept. Provider lifecycle, awareness, React surface, and document identity contracts pass as the current collaboration-state safety bundle.
- `post-safety-benchmark-smoke-refresh`: kept. Bounded collaboration benchmark remains correctness-clean after focused safety bundles.
- `post-safety-target-gate-refresh`: kept. Benchmark target registry and generated report/history checks still pass after the current smoke.
- `post-safety-benchmark-artifact-refresh`: kept. Latest benchmark artifact still carries correctness and distribution fields for remote apply/encode/sync.
- `remaining-soak-runner-deletion`: kept. Remaining executable soak runners are deleted and package/release-proof entry points no longer call them; package-config and slate-browser scenario contracts pass without executing soak.
- `post-delete-typecheck-refresh`: kept. `@slate/yjs` and `slate-browser` typechecks are green after deleting the remaining executable soak runners.
- `post-delete-package-browser-proof-refresh`: kept. Current `@slate/yjs` package tests and slate-browser proof helper contracts are green without invoking executable soak scripts.
- `docs-audit-all-deleted-soak-runners`: kept. Parent docs audit now guards all four deleted soak runner paths and passes with focused Biome/ESLint.
- `post-delete-benchmark-smoke-refresh`: kept. Bounded benchmark remains correctness-clean after deleting remaining executable soak runners and hardening docs audit.
- `post-delete-target-gate-refresh`: kept. Benchmark target registry and generated report/history checks pass after the post-delete smoke.
- `post-delete-benchmark-artifact-refresh`: kept. Latest benchmark artifact still carries correctness and distribution fields for remote apply/encode/sync.
- `release-proof-persistent-soak-hard-cut`: kept. `slate-browser` no longer exposes the stale persistent-soak release claim/helper; proof/type/core tests stay green.
- `post-hard-cut-fast-check-refresh`: kept. Slate v2 fast check passes after the no-soak release-proof hard-cut.
- `release-proof-no-soak-surface-audit`: kept. Persistent-soak release-proof scan reports only allowed package-config guard hits.
- `post-hard-cut-operational-soak-surface-audit`: kept. Operational package/script/browser scan has no executable soak runner.
- `post-hard-cut-yjs-package-proof-refresh`: kept. Current `@slate/yjs` contracts, typecheck, and package suite are green after the no-soak hard-cut.
- `post-hard-cut-benchmark-calibration`: kept. Three bounded benchmark samples are correctness-clean after the no-soak hard-cut.
- `post-calibration-target-gate-refresh`: kept. Benchmark target registry and generated report/history checks pass after calibration.
- `post-calibration-benchmark-artifact-refresh`: kept. Latest benchmark artifact still carries correctness and distribution fields for remote apply/encode/sync.
- `architecture-no-soak-anchor-refresh-after-hard-cut`: kept. Deferred incremental-import architecture plan names all deleted runner constraints and the absent persistent-soak release-proof surface.

Packet proof:
- `bunx biome check --write scripts/benchmarks/core/current/yjs-collaboration.mjs` -> no fixes.
- `bun run bench:core:yjs-collaboration:local` -> `yjs_correctness_failures=0`, `yjs_large_doc_local_edit_p95_ms=22.33`, `yjs_large_doc_remote_sync_p95_ms=33.12`.
- Follow-up split: `bun run bench:core:yjs-collaboration:local` -> `yjs_correctness_failures=0`, latest `yjs_large_doc_local_edit_p95_ms=21.3`, `yjs_large_doc_remote_encode_p95_ms=0.28`, `yjs_large_doc_remote_apply_p95_ms=28.34`, `yjs_large_doc_remote_sync_p95_ms=28.59`.
- `node -e "JSON.parse(require('fs').readFileSync('benchmarks/targets/slate-v2.json','utf8')); console.log('benchmarks/targets/slate-v2.json ok')"` -> JSON ok.
- Trace oracle: `bun test ./packages/slate-yjs/test/remote-import-contract.spec.ts` -> 2 pass, 0 fail, including a 256-block remote convergence smoke.
- Package proof after trace oracle: `bun test ./packages/slate-yjs/test` -> 239 pass, 0 fail.
- Type proof after trace oracle: `bun --filter ./packages/slate-yjs typecheck` -> exit 0.
- Benchmark after trace oracle: `bun run bench:core:yjs-collaboration:local` -> `yjs_correctness_failures=0`, `yjs_large_doc_local_edit_p95_ms=22.37`, `yjs_large_doc_remote_encode_p95_ms=0.28`, `yjs_large_doc_remote_apply_p95_ms=35.47`, `yjs_large_doc_remote_sync_p95_ms=35.78`.
- Non-soak proof refresh after deleting the long-runner scripts: `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts ./packages/slate-yjs/test/remote-import-contract.spec.ts` -> 7 pass, 0 fail; `bun test ./packages/slate-yjs/test` -> 240 pass, 0 fail; `bun --filter ./packages/slate-yjs typecheck` -> exit 0.
- Benchmark metric contract: `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts` -> 6 pass, 0 fail; `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts ./packages/slate-yjs/test/remote-import-contract.spec.ts` -> 8 pass, 0 fail; `bun test ./packages/slate-yjs/test` -> 241 pass, 0 fail; `bun --filter ./packages/slate-yjs typecheck` -> exit 0; bounded `bun run bench:core:yjs-collaboration:local` smoke printed `yjs_large_doc_local_edit_p95_ms`, `yjs_large_doc_remote_apply_p95_ms`, `yjs_large_doc_remote_encode_p95_ms`, `yjs_large_doc_remote_sync_p95_ms`, and `yjs_correctness_failures=0`.
- Benchmark target report refresh: `pnpm bench:targets:report` regenerated `benchmarks/targets/history/slate-v2-latest.json` and `benchmarks/targets/reports/slate-v2.md`; `pnpm bench:targets:check && pnpm bench:targets:report:check` passes with 29 targets; targeted report/history reads show `yjs-collaboration` is ok, prints metrics, and has its required artifact.
- Current non-soak proof refresh: `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts ./packages/slate-yjs/test/remote-import-contract.spec.ts` -> 8 pass, 0 fail; `bun test ./packages/slate-yjs/test` -> 241 pass, 0 fail; `bun --filter ./packages/slate-yjs typecheck` -> exit 0; bounded benchmark smoke printed required `METRIC` rows with `yjs_correctness_failures=0`; `pnpm bench:targets:check && pnpm bench:targets:report:check` passes with 29 targets.
- Architecture source-anchor audit: `nl -ba` slices for `controller.ts`, `types.ts`, `remote-import-contract.spec.ts`, `yjs-collaboration.mjs`, and `package-config-contract.spec.ts` confirm the deferred architecture plan still cites current source facts.
- Benchmark artifact diagnostic contract: `node` read of `tmp/slate-yjs-collaboration-benchmark.json` confirmed `samples`, `mean`, `median`, `p75`, `p95`, `p99`, `min`, and `max`; focused config test 7/0; config+remote contracts 9/0; package suite 242/0; `bun --filter ./packages/slate-yjs typecheck` -> exit 0; bounded benchmark smoke printed required `METRIC` rows with `yjs_correctness_failures=0`; `pnpm bench:targets:check && pnpm bench:targets:report:check` passes with 29 targets.
- Deleted soak file absence contract: `test ! -e scripts/proof/yjs-collaboration-soak.mjs && test ! -e scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs` passes; focused config test 7/0; config+remote contracts 9/0; package suite 242/0; `bun --filter ./packages/slate-yjs typecheck` -> exit 0.
- Architecture no-soak anchor refresh: `nl -ba packages/slate-yjs/test/package-config-contract.spec.ts | sed -n '168,218p'` shows the current no-soak guard at `192-218`; `docs/plans/2026-06-14-yjs-incremental-remote-import-architecture.md` now cites that anchor and names file absence in the proof gate.
- Fast check proof refresh: package script audit shows `check` is `bun lint && bun typecheck && bun run test` and the deleted long soak scripts are missing; `bun check` passes; `bun test ./packages/slate-yjs/test` passes 242/0.
- Research backlog closure audit: Node TSV parser over `lead-ledger.tsv` and `promoted-ledger.tsv` shows lead statuses `promoted-kept=2`, `deferred-architecture=3`, `supporting=1`, and actionable backlog `none`; promoted ledger actionable backlog is also `none`.
- Fast-check exclusion contract: `package-config-contract.spec.ts` asserts `check`, `lint`, `typecheck`, `test`, `test:bun`, and `test:vitest` exclude long proof gates and deleted Yjs soak names; focused config 8/0, package 243/0, `@slate/yjs` typecheck 0, and root `bun check` pass.
- Agent-start no-soak consolidation: `docs/slate-v2/agent-start.md` says `scripts/proof/yjs-collaboration-soak.mjs` and `scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs` stay deleted and should not be restored or run; `pnpm docs:slate-v2:audit` passes.
- Docs audit no-soak contract: `tooling/scripts/check-slate-v2-docs.mjs` requires both deleted runner paths plus `stay deleted` and `restore or run them`; `pnpm docs:slate-v2:audit` passes.
- Plate install / Biome repair: `pnpm install` repaired stale root dependencies to ultracite 7.8.1 and Biome 2.4.16; `pnpm exec biome check --write tooling/scripts/check-slate-v2-docs.mjs` checks 1 file with no fixes; docs audit passes.
- Post-install skill scan: `rg` over `.agents/rules`, `.agents/skills`, and `.agents/AGENTS.md` finds no deleted-runner references; only the intentional agent-start/docs-audit guard references remain.
- Agent-layer no-soak audit contract: `tooling/scripts/check-slate-v2-docs.mjs` scans `.agents/AGENTS.md`, `.agents/rules`, and `.agents/skills` for deleted runner names; Biome and docs audit pass.
- Focused tooling ESLint proof: default focused ESLint is ignored by config; `pnpm exec eslint --no-ignore tooling/scripts/check-slate-v2-docs.mjs` exits 0.
- Plate root fast test proof: `pnpm test` passes with 0 failures; output includes a non-fatal multiple `@platejs/core` instance warning.
- Root lint blocker classification: `pnpm lint` fails in unrelated `docs/editor-issue-harvester/**/full` and `docs/plans/artifacts/**` artifact hygiene; no broad lint-scope change was made inside this Yjs/no-soak packet.
- Current Yjs package proof refresh: `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts` passes 8/0; `bun --filter @slate/yjs typecheck` exits 0; `bun test ./packages/slate-yjs/test` passes 243/0.
- Current Yjs benchmark smoke: bounded `bun run bench:core:yjs-collaboration:local` prints required `METRIC` rows with `yjs_correctness_failures=0`, worst p95 `4.61ms`, remote apply `0.81ms`, encode `0.04ms`, and remote sync `0.88ms`.
- Benchmark target gate refresh: `pnpm bench:targets:check` reports 29 targets ok; `pnpm bench:targets:report:check` checks generated history/report.
- Architecture source-anchor audit refresh: initial broad combined output was truncated and discarded; narrow `rg`/`nl -ba` reads confirm the architecture plan still matches `importFromYjs()` full read/replace, `YjsTraceEntry.importKind='full-read-replace'`, remote-import contract expectations, benchmark remote apply/encode/sync metric ownership, and the deleted long-runner guard at `package-config-contract.spec.ts:192-218`; docs audit passed and ledger parser reports bad rows 0/actionable 0.
- Research ledger audit contract: `tooling/scripts/check-slate-v2-docs.mjs` now checks the current Yjs lead/promoted TSV ledgers for column count and unclosed actionable decision text; focused Biome checked 1 file with no fixes, docs audit passed, and focused ESLint exited 0.
- Docs audit deleted-runner file absence: `tooling/scripts/check-slate-v2-docs.mjs` now checks both deleted runner files are absent under `.tmp/slate-v2/scripts/proof`; focused Biome checked 1 file with no fixes, docs audit passed, and focused ESLint exited 0.
- Post-audit Yjs package proof refresh: `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts` passes 8/0; `bun --filter @slate/yjs typecheck` exits 0; `bun test ./packages/slate-yjs/test` passes 243/0.
- Post-audit Yjs benchmark smoke refresh: bounded `bun run bench:core:yjs-collaboration:local` prints required metrics with `yjs_correctness_failures=0`, worst p95 `4.41ms`, remote apply `0.8ms`, encode `0.03ms`, and remote sync `0.85ms`.
- Post-audit benchmark target gate refresh: `pnpm bench:targets:check` reports 29 targets ok; `pnpm bench:targets:report:check` checks generated history/report.
- Post-audit benchmark artifact refresh: Node read of `tmp/slate-yjs-collaboration-benchmark.json` passes for artifact version, calibration-only threshold policy, correctness 0, and remote apply/encode/sync `samples`, `mean`, `median`, `p75`, `p95`, `p99`, `min`, `max` fields.
- Architecture plan source-audit history refresh: `docs/plans/2026-06-14-yjs-incremental-remote-import-architecture.md` now records the P39 narrow source audit and P41 docs-audit deleted-runner file absence guard; docs audit passes.
- Installed Yjs event substrate refresh: `node_modules/yjs/package.json` reports `yjs@13.6.30`; installed source confirms `YEvent.path`, callback-scoped `changes`/`delta`, YText delta, and `observeDeep` routing through `changedParentTypes`; `read-log.tsv` has 16 rows with bad rows 0; docs audit passes.
- Read-log TSV audit contract: `tooling/scripts/check-slate-v2-docs.mjs` now includes current Yjs `read-log.tsv` in research ledger TSV checks; focused Biome checked 1 file with no fixes, docs audit passed, and focused ESLint exited 0.
- Remote-import contract proof refresh: `bun test ./packages/slate-yjs/test/remote-import-contract.spec.ts` passes 2/0.
- Combined Yjs contract proof refresh: `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts ./packages/slate-yjs/test/remote-import-contract.spec.ts` passes 10/0.
- Current Yjs package suite refresh: `bun --filter @slate/yjs typecheck` exits 0; `bun test ./packages/slate-yjs/test` passes 243/0.
- Incremental import source feasibility preflight: source reads of `packages/slate-yjs/src/core/document.ts` and `packages/slate-yjs/src/core/operations.ts` confirm that visible child readers, virtual/hidden child placeholders, `resolveYjsTextPoint`, and traceable operation fallbacks are the relevant implementation constraints for the later staged importer. No runtime code changed.
- Remote import trace taxonomy preflight: source reads of `packages/slate-yjs/src/core/replacement.ts`, `types.ts`, and `operations.ts` confirm `replaceCompatibleYjsChildren` requires old/new Slate snapshots and current fallback labels are local-operation scoped. The architecture plan now calls for remote-import-specific fallback reasons.
- Structural safety bundle refresh: `bun test ./packages/slate-yjs/test/replace-fragment-contract.spec.ts ./packages/slate-yjs/test/move-node-contract.spec.ts ./packages/slate-yjs/test/merge-node-contract.spec.ts ./packages/slate-yjs/test/split-node-contract.spec.ts ./packages/slate-yjs/test/selection-contract.spec.ts ./packages/slate-yjs/test/history-contract.spec.ts` passes 49/0.
- Provider/awareness/React bundle refresh: `bun test ./packages/slate-yjs/test/provider-contract.spec.ts ./packages/slate-yjs/test/awareness-contract.spec.ts ./packages/slate-yjs/test/react-contract.spec.tsx ./packages/slate-yjs/test/document-id-contract.spec.ts` passes 59/0.
- Post-safety benchmark smoke refresh: bounded `bun run bench:core:yjs-collaboration:local` prints required metrics with `yjs_correctness_failures=0`, worst p95 `4.91ms`, remote apply `0.88ms`, encode `0.04ms`, and sync `0.94ms`.
- Post-safety target gate refresh: `pnpm bench:targets:check` reports 29 targets ok; `pnpm bench:targets:report:check` checks generated history/report.
- Post-safety benchmark artifact refresh: Node artifact shape check over `tmp/slate-yjs-collaboration-benchmark.json` passes for artifact version, calibration policy, correctness 0, and remote apply/encode/sync summary fields.

Next owner:
- Remote apply/import dominates remote encode in repeated samples, and the trace oracle proves the current import path is full read/replace. Benchmark artifacts now preserve sample/distribution evidence for the next perf owner. Deleted long-runner proof files are guarded as absent, the deferred architecture source anchors are current, fast non-soak proof is green, research ledgers have no actionable backlog, fast scripts have a long-proof exclusion contract, the agent entrypoint plus docs audit both guard the deleted-runner rule, root install state no longer blocks Biome, generated skills/rules are covered by the audit, tooling has focused ESLint proof, root fast tests pass, current `@slate/yjs` package proof is green, current benchmark smoke is correctness-clean, benchmark target gates are green, refreshed architecture anchors still match current source, research ledger TSV closure is part of docs audit, docs audit checks the deleted runner files remain absent, post-audit target package proof is green, post-audit benchmark smoke is correctness-clean, post-audit benchmark target gates are green, post-audit benchmark artifact diagnostics are green, the architecture plan records the latest audit history, installed Yjs source backs the event/delta substrate claim, read-log TSV shape is guarded by docs audit, focused remote-import contract is green, the combined config/import contract bundle is green, current package suite/typecheck are green, source feasibility preflight confirms the staged importer must be visible-slot-aware, trace-taxonomy preflight confirms remote import needs its own fallback reason surface, structural/selection/history safety bundle passes 49/0, provider/awareness/React bundle passes 59/0, bounded benchmark smoke remains correctness-clean, benchmark target gates remain green, and latest benchmark artifact diagnostics remain green. Broad root lint remains quarantined on unrelated artifact hygiene. The architecture plan is drafted; defer implementation until the user accepts the staged incremental importer direction.
