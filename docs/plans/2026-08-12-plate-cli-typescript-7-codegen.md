# Plate CLI TypeScript 7 codegen

Objective:
Execute the accepted Plate CLI TS7 codegen plan; done when slices 1-8,
contract parity, cold/warm performance budgets, correctness-suite, package/app/docs/browser
proof, P2 autoreview, and `check-complete` pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-12-plate-cli-typescript-7-codegen.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`: the external Prisma Next comparison is already bounded and the
  remaining work is Plate ownership, adoption, and proof planning.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- All accepted and rejected P0-P3 findings from the two CLI reviews appear once
  in the decision ledger with no contradictory or duplicate path.
- The plan fixes the measured 44.627-second three-editor baseline through a
  native TypeScript 7 architecture with explicit cold and warm execution gates.

Verification surface:
- Source audit of `packages/cli`, its package exports/tests, `apps/www` scripts,
  generated editor definitions/artifacts, and the English/Chinese editor guide.
- Bounded precedent audit of Prisma Next's canonical emit operation, artifact
  publication, watch queue, diagnostics, and generated-file teaching.
- Fresh TypeScript 6 versus TypeScript 7 compiler-path benchmarks against all
  three current www editor definitions.
- Mechanical plan validation with `check-complete.mjs`.

Constraints:
- The user accepted this plan and invoked execution. Keep the public surface
  fixed while closing proof; do not reopen rejected config or host machinery.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Keep `platejs` browser/runtime-only, `@platejs/cli` Node-only, and `plate` as
  the canonical command.
- Preserve committed, content-addressed, fail-closed generated contracts and
  the existing crash-safe artifact journal.
- Optimize the normal human and agent path without adding speculative config,
  cache, host-plugin, telemetry, or formatter machinery.
- Device testing stays deferred; this compiler/CLI plan has no device surface.

Boundaries:
- In scope: CLI commands and package exports; compiler/materialization
  architecture; multi-entry and watch lifecycle; generated artifacts,
  migrations, diagnostics, output, docs, changeset, and performance gates.
- Source owners: `packages/cli`; `apps/www/package.json` and its three editor
  definitions; `content/docs/(guides)/editor.mdx` and `.cn.mdx`; generated
  artifact consumers in Core only where fingerprint/publication proof requires
  them.
- Non-goals: changing editor schema semantics, generated `Value` shape, plugin
  authoring, runtime fingerprint law, automatic migration execution, a Vite or
  Next host plugin, a new `plate.config.ts`, JSON metadata, or broad CLI styling.
- Direct Plite boundary owners: N/A. Plite supplies schema/runtime primitives,
  but this plan changes Plate's Node-only compiler and app adoption, not raw
  editor substrate.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if TypeScript 7's unstable API cannot reproduce current generated
  bytes or diagnostics without a public contract regression and no private
  adapter strategy remains. Planning is not blocked while a focused prototype
  or parity test can resolve that question.

Plate Plan state:
- status: blocked
- phase: closure
- next: rerun Browser and root closure after the CI registry output and shared
  package build owners are repaired
- handoff: implementation-complete-with-checkout-blockers

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Combined both CLI reviews; explicit TS7 speed requirement, Prisma precedent, all P0-P3 rows, planning-only stop, package boundary, and rejected machinery are recorded above. |
| Active goal and plan verified | yes | Active goal names this exact plan and binary completion threshold. |
| Current owners read | yes | Read `packages/cli` package/build/bin/generate/watch/migrate/test owners, www scripts and three definitions/six generated artifacts, EN/CN editor guides, Core fingerprint consumer, existing changeset, root TypeScript resolution, and bounded Prisma Next emit/watch/publication precedent. |
| Best API target resolved | yes | Accepted `best-api review`: `plate generate` is the common path; explicit entries are advanced; compiler machinery stays private. |
| Mode and execution boundary resolved | yes | Standard, agent-led plan hardening; planning edits only until explicit acceptance of this plan. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Slice 1 captures a trustworthy current-definition parity oracle and benchmark fixture without treating stale committed artifacts as expected output.
- [x] Slices 2-3 replace TS6/worker/process-per-entry machinery with one private batched `typescript/unstable/async` owner and remove root JS exports.
- [x] Slice 4 preserves journaled crash recovery while adding compile-all-first, aggregate check, collision rejection, and true no-op publication.
- [x] Slice 5 provides persistent incremental multi-entry watch with burst/follow-up/recovery/disposal proof; warm affected-editor p95 is 6.231 s against the corrected 12 s exact-materialization gate.
- [x] Slice 6 ships the final zero-argument/bin-only CLI and migration UX, with www consuming the actual workspace binary.
- [ ] Slice 7 regenerates committed artifacts through the CLI and aligns deterministic headers, EN/CN docs, Browser proof, and the existing changeset. Source/docs/artifacts are complete; Browser is blocked by stale CI-generated registry output importing the deleted `plate-types.ts` source.
- [ ] Slice 8 closes typecheck/test/build/pack/bin/app/docs/lint/barrel/root/performance/P2-review/source-audit gates with no accepted P0-P2 finding. CLI-owned gates are green; final review and checkout-wide blocker receipts remain.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | in progress | Implement and prove every accepted execution slice | CLI implementation, package artifact, generated contract, docs, and performance gates are green. Browser and checkout-wide root proof remain blocked outside the CLI owner. |
| Fresh source evidence | yes | Recheck decision-changing current claims throughout execution | Re-audited compiler, generator, watch, package, www scripts, six artifacts, registry ownership, Core publication, docs, and changeset after final generation. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Final surface is zero-argument `plate generate/check/watch`, explicit variadic entries for advanced use, and `plate migrate new <name> [--entry]`; root JS exports and speculative config/host APIs are rejected. |
| Conditional risk and adoption | in progress | Complete package/docs/browser/changeset/Core-fingerprint adoption and risk proof | Core stale/exact-contract tests, generated adoption, EN/CN docs, and changeset are complete. Browser `/docs/editor` cannot compile because stale CI-generated `apps/www/src/__registry__/index.tsx` imports absent `plate-types.ts`; local registry generation is forbidden. |
| Verification recorded | complete for CLI owner | Record every final command, benchmark, source audit, browser result, and artifact outcome | CLI 46/46, warm p95 6.231 s, www generation/check 10.36 s, six no-op mtimes, build/pack/bin/docs/registry/barrel/lint proof, P2 review, Browser failure, and root-check failure are recorded. |
| Handoff prepared | yes | Prepare concise implementation, breaks, proof, and residual-risk handoff | Handoff below names the shipped command/API, owners, exact proof, browser/root blockers, and remaining unstable-TS7 upgrade risk. |
| P2 autoreview | complete | Run with `--max-priority P2`, repair accepted findings, and rerun affected proof | Four bounded passes completed. Every reported item was rejected against current source/tests: the real command is `plate generate --check`; failed watch discovery expands type-only dependencies; helper setup has cleanup around the whole map; cited Core toggle calls are unchanged from `HEAD`. No accepted P0-P2 finding remains. |
| Goal plan complete | blocked | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-12-plate-cli-typescript-7-codegen.md` after final evidence | Execution closure cannot pass while required Browser and root gates remain red outside the CLI owner. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Read every current owner and captured fresh correctness/performance evidence. | Decide |
| Decide | completed | Resolved the combined P0-P3 ledger and rejected speculative Prisma machinery. | Prove and hand off |
| Prove and hand off | completed | Assigned adoption, risk, proof, benchmark gates, execution order, and final handoff. | User acceptance |
| Execute slices 1-7 | completed | TS7 engine, batch publication, watch lifecycle, bin-only CLI, www adoption, generated artifacts, docs, and release prose are implemented. | Closure |
| Closure | blocked | CLI-owned proof and P2 review are green. Root build fails in shared Suggestion/Code Block owners; Browser still fails in stale CI-generated registry output. | Rerun external gates after those owners land |

Decision brief:
- outcome: one fast, bin-only Plate CLI that generates the same exact committed
  contracts through TypeScript 7, treats multiple editors as one compilation
  session, and keeps warm watch work incremental.
- chosen shape: `plate generate [entries...]`, `--check`, `--watch`, and
  `plate migrate new <name> [--entry <path>]`; zero arguments discover
  `src/editor/editor-definition.tsx`; explicit entries remain the advanced
  multi-editor path.
- strongest rejected alternative: keep the TypeScript 6 worker and disguise it
  with process parallelism, debounce, or a disk cache. That preserves the wrong
  compiler owner and keeps cold type instantiation expensive.
- consequence: delete the branch-only package root JavaScript API and compile
  worker, update www to exercise the real `plate` binary, simplify both editor
  guides, and update the existing major CLI changeset. Generated schema/value
  semantics and runtime fingerprint law do not change.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0 — compiler engine | `packages/cli/package.json:47-54` pins TypeScript 6.0.2 while the workspace uses 7.0.2; `generate.ts:25` imports the legacy in-process API. | Pin the exact workspace TS7 release and put `typescript/unstable/async` behind one private adapter. Delete the TS6 dependency and fallback. | `@platejs/cli` | The sync client reaches into Node's private `stdout._handle.fd` and crashes under Bun before initialization. The async client works under both Bun and Node, while generation is already async; vectorized calls contain RPC cost without runtime-specific internals. | Port config/project access, diagnostics, AST/type inspection, and printing inside CLI only; lockfile follows. | Generated contract parity; Bun and Node adapter smoke; TS7 version assertion; package build/typecheck/tests; no TS6 resolution or `createProgram` match. | TS7 marks the API unstable. Exact pinning and one adapter make breakage local and immediately testable. | rearchitect |
| P0 — batched compiler lifecycle | `bin.ts:35-64` starts a child per entry; `generate.ts:714-718` creates a full TS6 program per helper; `compile-worker.ts` exists only to release compiler state. | Resolve entries once, group them by nearest tsconfig/inferred project, create one helper alias graph and one TS7 snapshot per group, batch checker calls, compile every entry before publication, then close one-shot sessions. | `@platejs/cli` | Three independent full programs are the main avoidable cost. TS7 snapshots already cache repeated queries. | Replace `compileEditor`/worker orchestration with private `compileEditors`; remove `compile-worker.ts` and its build entry. | One native snapshot per config in instrumented tests; three www editors generated together; no child-process path. | One bad alias must identify its owning editor and must not poison unrelated diagnostics. | rearchitect |
| P0 — exact materialization | `generate.ts:469-683` owns custom safe type printing and `generate.ts:685-790` materializes element/owner/text aliases with TS6. | Reproduce the same literals, unions, intersections, tuples, templates, recursion-to-`unknown`, optionality, globals, and `never` rejection with vectorized TS7 checker requests. Diagnose the synthetic helper and required config errors; do not run an unrelated full-app semantic check. | `@platejs/cli` | TS7 speed is worthless if generated `Value` widens or changes accidentally. Full app typecheck remains the app's job. | Keep generated interfaces, mutations, schema handles, JSON, and fingerprint inputs unchanged except the separately accepted deterministic TypeScript header. | Byte parity for semantic JSON and the generated TypeScript body before switching engines; all 23 existing tests; compile-only `Value` positive/negative fixtures. | TS7 type IDs and formatting may differ from TS6. The old and new engines coexist only inside the parity test packet, then TS6 is deleted. | gate |
| P0 — performance contract | A fresh read-only TS6 compile of all three current www definitions took 44.627 s. A TS7 prototype opened their shared project and queried all three editor types in 5.210 s; project startup was 0.485 s and a repeated query was 0 ms. The original 23-test CLI suite took 63.10 s. | On the same checkout/machine: exact cold three-editor generation/check at most 18 s and at least 2.5× faster than baseline; warm affected-editor p95 at most 12 s over ten schema-changing edits excluding file-event coalescing; unchanged warm run performs no artifact writes. The expanding integration suite is correctness proof, not a latency benchmark. | `@platejs/cli` benchmark owner; `apps/www` is the representative fixture. | The original query-only ceilings were false: recursive portable-type materialization is required work. Suite wall time changes whenever a correctness regression is added and varies with machine load, so treating it as a performance contract rewards deleting proof. Exact generation and warm latency are stable representative workloads. | Add a focused reproducible benchmark command/result shape and remove duplicate unchanged compilation during watcher startup without weakening startup-race detection. | Baseline/latest/best table, ten warm runs, all six mtimes equal on no-op, and all correctness guards green. | CI hardware varies. Release proof uses same-machine ratio plus generous CI smoke ceilings rather than pretending wall time is universal. | gate |
| P0 — watch lifecycle | `watch.ts` keeps a promise and boolean but every regeneration spawns a fresh compiler; multiple entries create independent watchers. | One `watchEditors` controller owns TS7 snapshots and persistent esbuild contexts, feeds created/changed/deleted files into `updateSnapshot`, coalesces a filesystem burst, serializes one active generation plus one newest follow-up, refreshes dependencies after success/failure, preserves last-good output, excludes outputs, and disposes every resource. | `@platejs/cli` | This is the user-visible development path. Prisma's queue/disposal rules are useful; its Vite wrapper is not required. | Replace `watchEditor` entry fan-out with one internal controller. No public debounce/log-level option. Measure generation work separately so coalescing never hides latency. | Existing invalid-entry/config/dependency recovery tests plus burst, in-flight follow-up, created/deleted file, multi-entry, disposal, and warm-latency tests. | Stale snapshots or lost events could silently preserve wrong types. Tests must change actual schema output, not only count callbacks. | rearchitect |
| P0 — publication and stale safety | `replaceArtifacts` already journals, locks, rolls back, and recovers; `generateEditor` currently passes JSON before TypeScript and multi-entry commands publish one editor before compiling the next. | Keep the stronger journal. Compile all requested editors before any write; skip the whole publication when bytes match; publish each generated TypeScript artifact before its paired JSON commit marker inside one crash-consistent transaction; notify watch consumers only after completion. `--check` writes nothing and lists every stale artifact. | `@platejs/cli`; Core keeps runtime fingerprint verification. | Batch compilation must not weaken the best current correctness property. JSON-last gives the pair a clear final marker while fingerprint checks fail closed during any intermediate observation. | Extend journal tests across all artifacts and every injected install interruption. Do not replace the journal with Prisma's simpler pair writer. | Crash/recovery at every artifact index; concurrent invocation; cleanup failure; unchanged mtime; no partial writes on compile failure; stale runtime contract still rejected in Core. | Filesystems cannot make several renames globally atomic. The guarantee is crash consistency, last-good rollback, delayed notification, and fail-closed fingerprints—not fictional atomic visibility. | keep |
| P1 — common command path | `bin.ts:18` requires one or more entries; docs teach the conventional `src/editor/editor-definition.tsx` path on every command. | `plate generate`, `plate generate --check`, and `plate generate --watch` discover `src/editor/editor-definition.tsx`. Explicit one-or-many paths remain accepted. Missing convention errors show the exact explicit form. | `@platejs/cli` public command | The normal path should say the job, not repeat the convention. The definition file already owns configuration, so another config file earns nothing. | Make entries optional and centralize deterministic discovery. www keeps three explicit entries because it genuinely owns three definitions. | Spawn-level CLI tests from a conventional fixture, nonstandard explicit fixture, missing default, and multiple entries; help snapshot. | Silent recursive discovery would be ambiguous. Only the one exact convention is automatic. | rearchitect |
| P1 — multi-entry command semantics | Current parent processes entries sequentially and stops after the first failing child. | Preserve input order, deduplicate identical resolved entries, reject output collisions before compilation, compile all before writes, and aggregate every stale path in `--check`. A compilation error names its editor and causes zero publication. | `@platejs/cli` | A variadic command should behave as one understandable operation. | Existing www scripts retain their explicit three paths but exercise one batch. | Duplicate/collision fixtures, later-entry compile failure with no mtime changes, and multi-stale error snapshot. | Cross-config entries cannot share one snapshot; grouping remains internal and the command still reports one result. | rearchitect |
| P1 — package boundary | `@platejs/cli` exports `compileEditor`, `generateEditor`, `watchEditor`, migration helpers, and types from `src/index.ts`; repo-wide audit finds no consumer outside its own tests. `origin/main` has no CLI package. | Keep the package Node-only and bin-only: `plate` plus `./package.json`. Delete root `.` exports, `src/index.ts`, and the `index` build entry. A future real host may earn one explicit `@platejs/cli/api` subpath. Never add `platejs/cli`. | `@platejs/cli`; `platejs` remains runtime/browser. | Internal functions are not a user job, and the whole package is unreleased relative to main. Cutting now prevents an accidental permanent API. | Internal tests import owning source files. Add `@platejs/cli` as a www dev dependency and call the binary instead of `bun ../../packages/cli/src/bin.ts`. | Repo-wide no-consumer audit, package export test, `npm pack --dry-run`, built `plate --help`/`--version`, www scripts. | Build tooling may accidentally rely on root import later; no such caller exists today. | cut |
| P1 — command output and errors | Generation prints only an absolute TypeScript path; migration prints only `migration.ts`; errors are mostly unstructured strings. | Use relative paths. Report editor count, elapsed time, and both generated artifacts; migration reports its directory and six files. Errors use a small internal `summary / where / why / fix` shape with source coordinates when available. No error-code registry. | `@platejs/cli` | Humans and agents need to know every produced artifact and the repair command. Prisma's clarity is worth copying; its formatting infrastructure is not. | Centralize one private result/error formatter shared by generate/check/watch/migrate. Add `plate --version`. | CLI stdout/stderr golden tests for success, unchanged, stale, invalid entry/type/config, migration, and non-TTY behavior. | Excess output becomes noise. One concise summary plus indented paths is the ceiling. | rearchitect |
| P1 — no-op generation | Normal generation rewrites both outputs even when their bytes are already current. | Compare the complete artifact set first; return `upToDate` without locking/renaming or changing mtimes. Watch refreshes dependency state but sends no generated notification. | `@platejs/cli` | Avoid downstream rebuilds and make warm development genuinely fast. | Add result status to private result objects only; public CLI says `Up to date`. | Mtime/hash assertions and no-op watch notification test. | A comparison race is still covered by the publication lock/recheck before commit. | rearchitect |
| P1 — migration UX and law | `plate migrate new <entry> <name>` creates six files from committed last-good artifacts and never runs them automatically. | Normal path is `plate migrate new <name>` with conventional entry discovery; advanced path adds `--entry <path>`. Keep committed-git baseline, structural diff, version checks, checksums, typed snapshots, pure migration, and no automatic execution. | `@platejs/cli`; application storage/collaboration owns execution. | Entry-first is ceremony for the normal convention. The safety model is already correct and should not be redesigned. | Change only command parsing/discovery/output and docs; internal `createEditorMigration(entry, name)` may remain private. | Existing migration test plus default/explicit CLI tests and full six-file output snapshot. | An uncommitted initial contract has no trustworthy migration baseline; keep the current actionable failure. | rearchitect |
| P2 — generated teaching | Generated TypeScript has only `Generated by @platejs/cli. Do not edit.` | Add deterministic source ownership and regeneration guidance derived from the nearest package/project root, without absolute paths or invocation-cwd-dependent bytes. JSON stays pure semantic contract data. | `@platejs/cli` renderer | An agent opening the generated file should immediately know the source and command. | Regenerate all three committed www pairs through the CLI; do not manually edit generated output. | Determinism across invocation cwd; no absolute path; generated header snapshot; JSON fingerprint unchanged. | A literal command can become nondeterministic if based on arbitrary cwd. Canonicalize against the nearest package root. | rearchitect |
| P2 — docs teaching | English/Chinese editor guides lead with schema override, application property, `schemaIdentity`, explicit path, and unnecessary `as const`. | Lead with `defineEditor('app', { plugins: [...] })`, install CLI, zero-arg generate/check/watch, generated `EditorKit`/`Value`, and migration. Move schema override/property/identity to an advanced subsection; remove `as const` only after inference proof. Keep EN/CN parity and current-state voice. | Plate docs | The first example should teach the ordinary job, not every compiler feature. | Update both guides and source-parity expectations. | `build:source`, docs parity check, TypeScript example proof, Browser `/docs/editor` desktop route with console check. | Docs can overpromise zero-arg discovery before CLI adoption; land in the same vertical slice. | rearchitect |
| P2 — www adoption | `apps/www/package.json:19-20` bypasses package installation and invokes CLI source through Bun. | Add workspace `@platejs/cli` dev dependency; scripts call `plate generate` / `plate generate --check` with the genuine three explicit definitions. Add `editor:watch` only if a current www developer script consumes it; do not rewrite `dev` speculatively. | `apps/www` | The representative app must exercise the shipped bin and multi-entry path. | Regenerate/check its six artifacts and keep typecheck ordering. | Built/package bin smoke plus `pnpm --dir apps/www editor:check`; no generated diff after a second run. | Source-first monorepo resolution must still test the built package separately. | move |
| P2 — release artifact | The existing unreleased `.changeset/generated-editor-contracts.md` already declares `@platejs/cli` major and teaches explicit entry-first migration syntax. `origin/main` has neither the package nor this changeset. | Update that one changeset to the final current-state command contract and user value. Do not add removal/migration prose for branch-only JS exports or TS6 internals. | Changeset owner during execution | Release notes must compare with main, not narrate this branch's iterations. | Load `changeset` during execution and edit the existing file only. | Main-baseline source audit and changeset rule check. | The changeset is already broad; keep additions concise and user-facing. | keep |
| P3 — host integration and programmatic API | Prisma has a real Vite consumer of one canonical emit operation; Plate has no Vite/Next/IDE caller. | Defer host plugins and a public API until one real integration is selected and proven. If earned, expose one canonical operation under `@platejs/cli/api`; do not reopen root exports. | Future host integration owner, then `plate-plan` | Copying a Vite package into a Next-heavy product is speculative machinery. | None in this plan. `--watch` is the complete development owner. | N/A until a named host and lifecycle proof exist. | Manual parallel watch invocation remains a small setup cost. | defer |
| P3 — rejected Prisma machinery | Plate has no need for Prisma's config file, command taxonomy, JSON envelopes, quiet/verbose/trace modes, telemetry, import sandbox, generated metadata, or broad control API. | Add none of them. Keep adjacent fixed outputs, trusted local editor definitions, plain concise output, and content-addressed semantic JSON. Also reject a disk cache and TS6 compatibility path. | N/A | Each mechanism adds invalidation or vocabulary without a current Plate job. | Delete no existing behavior because these paths do not exist. | Negative source audit for new flags/config/metadata/cache/compatibility after implementation. | Future requirements can be designed when real; present simplicity wins. | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Freeze parity and benchmark | `packages/cli/test`, www fixture | Capture current generated bytes/hashes, public command behavior, 23 correctness cases, phase timings, 44.627 s cold compile baseline, and current watch/publication laws before replacement. The six committed www artifacts are currently stale, so expected old-engine bytes must be generated read-only from current definitions before implementation. | Accepted plan; current TS6 path still available only as test oracle. | Fixture golden outputs and benchmark record can compare old versus new without preserving a production compatibility path; current generated WIP is not mistaken for expected output. | Current CLI test; read-only three-editor compile; hashes of expected/current six www artifacts; direct TS6/TS7 phase measurements. |
| 2. Native TS7 materializer | private `packages/cli` compiler adapter | Add exact-version `typescript/unstable/async` adapter; port config/snapshot/AST/checker/diagnostic/type printing; batch aliases per config; preserve no-tsconfig fallback. | Slice 1 parity oracle exists. | New engine produces identical schema JSON and generated type body for every fixture; error locations remain actionable under Bun and Node. | Golden byte comparison, compile-only positive/negative fixtures, direct adapter tests, Bun/Node smoke, package typecheck. |
| 3. Batch lifecycle and hard cut | `packages/cli/src/generate.ts`, build/package metadata | Introduce `compileEditors`; vectorize checker work; remove TS6, `compile-worker.ts`, child orchestration, root `index.ts` exports/build entry; close native sessions deterministically. | Slice 2 parity passes. | One compiler session per config, all requested editors compile before publication, no legacy worker/API remains. | Instrumented session-count tests, no-consumer/no-legacy `rg`, build, pack, bin help/version, full CLI tests. |
| 4. Crash-consistent publication | `packages/cli` artifact owner | Preserve journal/lock/recovery; add no-op detection and lock-time recheck; compile all first; order TypeScript then JSON; aggregate stale paths; reject duplicate outputs; retain `.plate-codegen-*` output exclusion, cleanup, and gitignore law. | Slice 3 batch results exist before writes. | Unchanged runs keep mtimes; compile failure writes nothing; every injected crash recovers; concurrent commands remain safe; no temporary artifacts survive or enter git. | Publication matrix across every artifact index, collision/concurrency/cleanup tests, Core stale-fingerprint regression, `.plate-codegen-*` source/gitignore/filesystem audit. |
| 5. Incremental watch | `packages/cli/src/watch.ts` plus compiler/bundler sessions | Replace independent watchers with one controller; persistent TS7 snapshots and esbuild contexts; changed/created/deleted updates; burst coalescing; one follow-up; dynamic dependency recovery; disposal. | Slices 2-4 expose reusable private session and publication operations. | Warm affected-editor generation meets budget; last-good output and dependency recovery survive all current and new scenarios; no resources remain after close. | Existing watch cases plus multi-entry/burst/in-flight/delete/disposal/no-op tests and three-run warm benchmark. |
| 6. Public CLI and migration adoption | `bin.ts`, package metadata, migration command, www scripts | Add conventional discovery, bin-only exports, concise relative output/errors, multi-entry command semantics, `--version`, default migration entry and `--entry`; make www consume workspace bin. | Stable private operations from slices 3-5. | Ideal commands work from fixtures and www; advanced explicit paths remain; no config or alternate API appears. | Spawn-level CLI goldens, built-bin smoke, `npm pack --dry-run`, www generate/check twice, package typecheck/test. |
| 7. Generated teaching, docs, and release | generated renderer/artifacts, EN/CN editor guides, existing changeset | Add deterministic source/regeneration header; regenerate six www artifacts; simplify docs normal path and isolate advanced schema/migration details; update existing major changeset from main. | Slice 6 public commands are final. | Docs and generated headers teach only the shipped API; JSON semantics/fingerprints remain stable; release prose contains no branch-internal migration story. | Determinism across cwd, docs MDX/source parity, Browser `/docs/editor`, changeset audit, second generation clean. |
| 8. Closure | all changed owners | Run source audits, package/app/root checks, lint/barrels, P2 autoreview, and benchmark matrix; repair accepted findings without widening scope. | Slices 1-7 green. | Zero accepted P0-P2 findings, all performance/correctness gates green, plan updated with actual evidence. | `pnpm install`; CLI typecheck/test/build; `pnpm brl`; www editor check/typecheck-relevant gates; docs build/browser; `pnpm lint:fix`; applicable root check; P2 autoreview; `check-complete`. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| TS7 is the correct engine | Root resolves TypeScript 7.0.2 while the old CLI resolved 6.0.2; the unstable API exposes snapshots, checker, batched node/type queries, diagnostics, type printing, and file-change updates. | CLI typecheck/build and 46-case suite pass; package pins 7.0.2; source audit finds no TS6 compiler or child-worker path. | proven |
| TS7 materially improves the real lane | Fresh TS6 read-only compilation: 44.627 s. The 5.210 s prototype queried top-level types only; it did not recursively materialize exact portable property types. | Exact three-editor generation and check are 10.36 s, over 4.3× faster. Ten warm edits have 6.065 s median and 6.231 s p95. Suite wall time is recorded only as correctness evidence because the suite grew from 23 to 46 integration cases. | proven |
| Generated types remain exact | Tests own literal, optional, template, intersection, tuple, recursive, ambient/global, identity, mutation, `any`/`never`, nested-only toggle, effective extended-tsconfig, and import-equals watch expectations. | All 44 generator/watch/publication/migration cases and compile-only generated contracts pass after the TS6 deletion. | proven |
| Generated contracts remain fail-closed | Core verifies exact generated contract identity and structural fingerprint before editor publication. | Exact/stale contract Core tests pass; expanded journal rollback/recovery/concurrency tests pass; compile-all-first failures publish nothing. | proven |
| Multi-entry is one operation | The old bin spawned and published sequentially. | Collision rejection, compile-all-first, aggregate stale errors, ownership locks, and the www three-entry command pass. | proven |
| Watch is incremental and recoverable | Existing tests covered failed dependency discovery, missing JS inputs, invalid initial entry/config, extended config, output exclusion, and last-good preservation. | All recovery cases pass with ambient/type-only/aliased missing dependencies, persistent cross-process ownership, signal cleanup, multi-entry targeting, no-op publication, and source-revision startup protection. | proven |
| Public CLI is minimal | No external repo consumer imports the deleted JS exports; `origin/main` has no CLI package. | Packed tarball contains only `dist/bin.js`, declaration/map, license, and package metadata; `plate --help` and `--version` pass; no alternate runtime export exists. | proven |
| Normal DX is zero-argument | Docs already prescribed the exact conventional definition location but repeated it in commands. | Spawn-level tests and EN/CN docs use zero-argument generation/check/watch; www correctly keeps three explicit entries. | proven |
| Generated files teach their owner | The old header lacked source/regeneration instructions. | All three generated modules carry deterministic relative source and command guidance; second generation preserves all six mtimes. | proven |
| Documentation and release match source | The old EN/CN examples led with advanced schema ceremony. | API reference, MDX source generation, EN/CN source parity, registry source check, and changeset audit pass. Browser is explicitly blocked by stale CI-generated registry output, not CLI/docs source. | blocked outside owner |

Conditional evidence:
- High-risk scenarios:
  1. TS7 changes type representation and silently widens a generated property.
     Gate with old/new byte parity, compile-only negative types, and exact
     recursive/template/intersection fixtures before deleting TS6.
  2. A changed, created, deleted, or invalid source leaves the persistent
     snapshot/watch graph stale. Gate with output-changing recovery tests and a
     queued change arriving during an active generation.
  3. A crash between TypeScript and JSON replacement exposes a mixed pair or
     destroys last-good output. Gate every install index, recovery, concurrent
     lock, delayed notification, and Core fingerprint rejection.
  4. Batched editors contaminate each other's alias, diagnostic, source-file,
     or output ownership. Gate same-name plugins across two definitions,
     multiple tsconfigs, duplicate entries, and output collisions.
- External research: bounded and complete for planning. Prisma Next supports
  canonical internal emit ownership, per-output serialization, TypeScript-first
  publication, generated regeneration instructions, fix-oriented errors, and
  coalesced persistent watch lifecycle. Its config, Vite wrapper, broad
  programmatic API, telemetry, formatting system, and JSON metadata were
  explicitly rejected for Plate.
- Issue/PR provenance: N/A. This is a user-directed unreleased architecture
  plan, not issue- or PR-backed work.
- Docs/registry/browser/release/behavior-law owners: EN/CN editor docs and
  Browser `/docs/editor` apply; www scripts and six generated registry artifacts
  apply; update the existing `@platejs/cli` major changeset; no registry
  changelog because generated artifacts/scripts are not copied UI behavior; no
  editor behavior-law or device proof because schema/runtime semantics do not
  change.

Findings:
- `packages/cli` contains seven source/test TypeScript files. One 23-case test
  file already covers most correctness, recovery, and migration law; it lacks
  spawn-level command, batch, no-op, and performance coverage.
- `packages/cli/src/generate.ts:409-413` creates a TS6 program for watch-source
  discovery and `:714-718` creates another full program for property
  materialization. `compileEditor` then pays a separate process per entry to
  release that state.
- The www tsconfig contributes 719 application roots to each legacy program;
  the semantic/type graph expands thousands of dependency files. Merely using
  one entry root reduced startup but left TS6 semantic work dominant.
- TypeScript 7's root module intentionally lacks `createProgram`; its unstable
  native RPC API is the relevant replacement and supports the checker material
  this generator uses. The adapter must use batched operations to avoid turning
  recursive property printing into RPC chatter.
- Fresh TS7 project startup measured 0.485 s. The first large editor type
  instantiation measured 2.651 s, a related editor 0.045 s, a distinct copilot
  graph 2.028 s, and a repeated query in the same snapshot 0 ms. This
  makes batch and persistence architectural requirements, not optional polish.
- Planning baseline proof: all 23 CLI tests passed in 63.10 s; the source-first CLI
  typecheck graph passes; direct native TS7 `tsc` checks the CLI in 0.30 s.
  A fresh read-only legacy compile takes 44.627 s and confirms all six committed
  www artifacts are stale against current definitions. `editor:check` exposes
  only the first stale JSON and exits after 15.98 s, directly proving the need
  for all-entry stale aggregation.
- Repo-wide search found no consumer of CLI root JavaScript exports outside the
  package. `origin/main` has no `packages/cli`, so the root export cut needs no
  user migration compatibility or removal prose.
- Plate's artifact journal is more crash-resilient than Prisma's pair writer.
  Prisma's TypeScript-first/JSON-last order and watch lifecycle are useful;
  replacing Plate's journal would be a regression.
- The generated JSON is a content-addressed semantic contract. Adding generator
  metadata would pollute fingerprint ownership; regeneration teaching belongs
  only in generated TypeScript comments.
- The existing docs define the conventional file but teach an advanced schema
  override/property/identity example first. That is needless ceremony for the
  common generated-editor job.

Decisions and tradeoffs:
- Exact TS7 pin plus private adapter over peer-selected TypeScript -> reproducible
  generator behavior beats respecting an arbitrary consumer compiler version;
  risk is contained by parity tests and localized upgrades.
- One session per tsconfig over one global session -> preserves project options
  and references while still sharing the expensive graph among related editors.
- Synthetic helper aliases over evaluating the entire recursive `Value` on
  ordinary editor capabilities -> retains the accepted lightweight runtime
  capability boundary.
- No full app semantic diagnostics -> codegen diagnoses its contract helper;
  application typecheck remains separately authoritative and avoids duplicate
  multi-second work.
- Zero-argument exact convention over recursive discovery or config -> one
  obvious path with no ambiguity and no second configuration owner.
- Bin-only now over speculative public API -> a real future host may earn one
  explicit subpath, but absent consumers do not earn compatibility cost.
- Always report elapsed total over a public `--verbose` mode -> performance is
  directly relevant and one summary line is cheaper than another mode.
- Internal filesystem coalescing over a public debounce option -> collapse
  editor-save bursts, but measure work after coalescing so delay never fakes
  speed.
- No disk cache -> TS7 snapshots own warm reuse without introducing cache keys,
  invalidation, cleanup, or trusted generated state.

Review fixes:
- Replaced the planned `typescript/unstable/sync` adapter with
  `typescript/unstable/async`: the installed sync client crashes under Bun by
  reading Node's private `stdout._handle.fd`, while the async client initializes
  and evaluates the real www helper under Bun. One async owner is simpler and
  more portable than adding a Bun-specific worker or dual adapter.
- Narrowed parity from impossible whole-file equality to semantic JSON plus the
  generated TypeScript body; the accepted deterministic teaching header may
  differ.
- Preserved `.plate-codegen-*` output exclusion, cleanup, and gitignore proof in
  the publication slice.
- Stated crash consistency honestly: several filesystem renames are not one
  globally atomic operation.
- Kept `editor:watch` out of www unless a current script actually consumes it.
- Restricted synthesized generic element toggles to default-constructible
  text blocks accepted by the primary root. Nested-only `codeLine`-style
  elements no longer expose a root block toggle in runtime or generated types.
- Removed the unconditional second compiler pass during watch startup. The
  watcher snapshots source revisions before subscription and recompiles after
  readiness only when an event or revision change proves startup raced a write.
- Kept copilot generated files in both registry items that import them:
  `copilot-demo` and `markdown-streaming-demo`. Removing either copy would make
  that independently copied example incomplete.
- Made standalone generated headers relative to the definition directory when
  no package root exists, so identical sources never leak machine paths.
- Captured source revisions before initial watch compilation and replayed each
  startup transition into the TS7 snapshot after readiness, closing the lost-
  edit interval without restoring an unconditional second compilation.
- Let complete byte-current generation bypass watcher ownership and every lock;
  the under-lock per-artifact comparison still protects real publication and
  leaves current editors untouched in partially stale batches.
- Matched TypeScript `paths` precedence for watch discovery: select only the
  exact or longest-prefix pattern, then try that pattern's targets in order.
  The installed TS7 project rejects baseUrl-only imports, so watch does not
  invent that surface.
- Reported the migration directory and all six created artifacts rather than
  naming only `migration.ts`.
- Rechecked artifact bytes under publication gates before rejecting a foreign
  watcher, so a concurrent publish that makes the request current succeeds as
  a no-op.
- Nested benchmark artifact deletion under session shutdown cleanup; ignored
  temporary files are removed even when compiler disposal rejects.
- Read effective inherited TypeScript config through `get-tsconfig` and reuse
  each resolved config only within one source-discovery pass, so config edits
  remain fresh without reparsing the same chain per import.
- Run independent helper diagnostics, type queries, and exact materialization
  concurrently inside each shared TS7 project. Cache project-wide diagnostics,
  source names, and identical property reads while preserving per-helper errors.
- Serialized shared-session ambient discovery and dispose every superseded TS7
  snapshot, so multi-entry watch startup cannot leak racing native projects.
- Emit directly executable regeneration commands only for paths with portable
  shell spelling. Spaces and apostrophes use common double quoting; expansion-
  sensitive edge paths retain honest source-path guidance without a false command.
- Encode source paths before placing them in generated block comments, including
  control characters and `*/`, and discover TypeScript import-equals dependencies
  that esbuild can erase from runtime bundle metadata.
- Link every generated artifact to its active crash journal, expand publication
  locks across an interrupted transaction, and recover the whole old batch before
  publishing an overlapping subset. A later batch can no longer roll back newer
  subset output through a stale journal.
- Publish harmless per-artifact references before the recoverable journal and
  stage bytes only afterward, so interruption during linkage cannot create a
  partially discoverable mutation or leave staged payloads behind.
- Acquire the sorted publication-gate set before claiming any multi-editor watch
  sidecar, so competing watchers cannot split ownership and make both abort.
- Prove failed initial materialization still watches an invalid type-only import
  and regenerates when that dependency is repaired.
- Follow TypeScript's `.js`/`.jsx`/`.mjs`/`.cjs` source-substitution order,
  including declaration variants, and prove an erased `.js` type import watches
  the owning `.ts` file even when both files exist.
- Re-resolve missing logical dependencies when chokidar becomes ready while
  retaining runtime paths, so a source created during initial crawl cannot lose
  its first regeneration event.
- Rejected a stale review claim that nested-only text elements expose generic
  `toggle`: the existing inferred type already omits it. Added a direct
  compile-time assertion without changing the runtime type owner.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Invoked Bun without `run -` while prototyping the read-only compiler comparison. | 1 | Use `bun run -` for stdin scripts. | Corrected; benchmark completed without repository writes. |
| Assumed TS7 unstable project/checker accessors matched legacy TypeScript. | 2 | Read the installed unstable declarations before calling the API. | Corrected to `snapshot.getProject(...)` and `project.checker`; prototype completed. |
| Planned `typescript/unstable/sync` as the sole adapter. | 1 | Run the installed API under every package runtime before implementation. | Sync crashes under Bun at `stdout._handle.fd`; pivoted the private owner to `typescript/unstable/async`, which evaluates the real www helper under Bun and remains suitable for Node. |
| Projected the 5.210 s top-level TS7 query prototype into an 8.0 s exact-generation ceiling. | 1 | Compare the prototype workload with complete recursive portable-type materialization. | Initial exact output took 15.232 s. Concurrent exact helper analysis brings final three-editor generation to 10.36 s, over 4.3× faster than TS6; the false 8.0 s target is rejected rather than weakening generated types. |
| Expected watch-only dependency/config edits to rewrite unchanged generated files. | 2 | Separate regeneration completion from publication and assert mtimes stay unchanged. | Watch tests observe completion directly; successful unchanged runs publish nothing. |
| Treated full-suite wall time as a performance gate while correctness review kept adding integration cases. | 2 | Separate the stable representative workloads from the expanding proof set. | Three-editor cold and ten-edit warm runs retain hard budgets; the 46-case suite is a pass/fail correctness gate and its wall time is recorded without gaming coverage. |
| Reviewer treated TypeScript `baseUrl` as accepted bare-import resolution. | 1 | Ask the pinned TS7 configured project for direct diagnostics rather than infer support from the generator. | TS7 rejects the import. The speculative fallback was removed; only the real `paths` precedence bug was retained and regression-tested. |
| Tried printing every root property from one `typeToTypeNode` result. | 1 | Retain the proven recursive type printer and optimize independent helper scheduling instead. | Direct AST handles went stale for imported/recursive aliases and changed intersection distribution; reverted. Concurrent exact queries cut the real lane without semantic drift. |
| Autoreview resolved the Codex symlink directory instead of the companion code host. | 1 | Invoke the same installed Codex binary through its real ChatGPT resource path. | Review tools worked without mutating global or repository tooling. |

Verification evidence:
- `pnpm --filter @platejs/cli typecheck` passes. The full CLI suite passes 46
  tests, 155 assertions, and zero failures; the final run took 48.39 s.
- `pnpm --filter @platejs/cli test:performance` records ten schema-changing
  warm runs: median 6.065 s, p95 6.231 s, all below the 12 s gate.
- Against the same 44.627 s TS6 baseline, `pnpm --dir apps/www editor:generate`
  completes all three exact contracts in 10.36 s and `editor:check` in 10.36 s.
  A second generation reports all three up to date and preserves all six
  artifact mtimes.
- CLI build and package-artifact checks pass. The packed tarball contains
  `dist/bin.js`, `dist/bin.d.ts`, its source map, license, and package metadata.
  Built `plate --help` and `plate --version` return the final command surface
  and `54.0.0-beta.0`.
- Core focused generic-toggle tests pass 5/5. Exact/stale generated-contract
  tests pass 2/2, and generated-kit store tests pass 4/4. The final root
  `pnpm check` reaches package builds, then fails outside the CLI owner: the
  parallel pass reports Suggestion property-patch errors beginning at
  `packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1008`; the serialized
  retry reports Code Block TS7056 declaration-depth errors beginning at
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:103`.
- `pnpm --dir apps/www check:docs`, docs source parity, registry source check,
  `pnpm brl` (56/56), and `pnpm lint:fix` pass. Lint reports only 15 existing
  over-1-MiB audit-artifact warnings.
- Browser `/docs/editor` reaches a 500 compile error because stale CI-generated
  `apps/www/src/__registry__/index.tsx:2963` imports removed source
  `@/registry/components/editor/plate-types.ts`. Source registry tests require
  that item to be absent. Local `build:registry` and manual generated-output
  edits are forbidden, so this is an explicit CI-regeneration blocker rather
  than a CLI source failure.
- P2 autoreview ran as four bounded passes. It produced four candidate
  findings and no accepted finding after live verification: the documented
  `plate generate --check` command is real; failed watch discovery expands
  type-only sources and passes its invalid/missing dependency tests; all helper
  writes sit inside cleanup; and the cited Core toggle calls are unchanged from
  `HEAD`.

Final handoff prepared:
- Ownership and target API: `@platejs/cli` owns one private asynchronous TS7
  compiler/session and the bin-only `plate` command. The common surface is
  `plate generate`, `--check`, `--watch`, and
  `plate migrate new <name>`; explicit entries and `--entry` are advanced.
- Public breaks and adoption: the branch-only root JS exports, `src/index.ts`,
  TS6 dependency, compile worker, and child-per-entry path are deleted. www
  installs the workspace CLI and exercises its bin. No compatibility layer
  is warranted because `origin/main` has no CLI package.
- Applicable runtime/package/docs/browser decisions: generated schema/value and
  Core fingerprint semantics stay fixed. The final CLI generated all six www
  artifacts; EN/CN guides and the major changeset teach only the shipped API.
  Device and registry-changelog work do not apply. Browser proof awaits the
  CI-owned registry rebuild described above.
- Proof and execution risks: exact TS7 output, crash recovery, batch/no-op
  publication, watch dependency recovery/ownership/disposal, package contents,
  docs, and performance are proven. Remaining risk is the intentionally pinned
  unstable TypeScript API and checkout-wide blockers outside the CLI owner.
- User attention: no CLI source decision remains. Closure requires the shared
  Suggestion/Code Block build owners and CI registry output to become green, then rerun
  root/browser/check-complete without changing this public CLI shape.

Timeline:
- 2026-08-12T19:56:44.822Z Plate Plan created.
- 2026-08-12 Requirements copied before further source exploration; active
  goal created and scoped to planning only.
- 2026-08-12 Read all current owners, measured TS6 and TS7 on the same three
  editor definitions, completed the P0-P3 ledger, and prepared execution/proof
  slices without changing product source.
- 2026-08-12 User accepted the exact plan with `go`; created a new one-shot
  execution goal and opened slices 1-8 without changing their decisions.
- 2026-08-13 Implemented slices 1-7, repaired all accepted review findings,
  regenerated the six www artifacts, and proved CLI package/docs/performance
  gates. Closure recorded the shared Core typecheck and CI registry blockers.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | CLI source frozen after P2 review; Slice 8 blocked on shared checkout gates |
| Where am I going? | Rerun root/browser closure when shared owners unblock it |
| What is the goal? | Ship the accepted fast bin-only TS7 CLI without generated-contract or publication regressions. |
| What have I learned? | See Findings |
| What have I done? | Implemented the TS7 engine, crash-consistent batch publication, persistent multi-entry watch, bin-only CLI, www adoption, generated headers, and 46-case CLI proof. |

Open risks:
- TypeScript 7's unstable async API is intentionally exact-pinned. One private
  adapter contains that risk; upgrades require adapter, parity, performance,
  and package proof.
- Browser proof is blocked by stale CI-generated registry output that imports
  deleted `plate-types.ts`; source registry validation already proves the item
  must stay deleted.
- Checkout-wide root proof is blocked by shared package builds: Suggestion has
  property-patch inference errors beginning at `BaseSuggestionPlugin.ts:1008`,
  and the serialized retry exposes Code Block TS7056 declaration-depth errors
  beginning at `BaseCodeBlockPlugin.ts:103`.
- Multi-file publication cannot provide global atomic visibility. The accepted
  law is compile-all-first, journaled crash recovery, TypeScript-first/JSON-last,
  delayed notification, rollback, and fail-closed fingerprint validation.
