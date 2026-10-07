# Repo mistake-proofing

Page: https://claude.ai/artifact/YBVq3869gJQV496PfvYKUM

Mistakes agents keep repeating in plate-2, and the checks that stop each one. Every `/pstack:correct` run is one iteration of this subject. `AGENTS.md`'s `## Rules and enforcement` table pairs each code rule with what enforces it.

## Main changes

- `tooling/scripts/check.mjs` owns the 22 blocking steps. `pnpm check` and the CI job run it, and `pnpm generate` runs each step's writer. CI runs on every push and pull request, generates barrels only on a push, and hands the push or pull request base to the baseline check.
- `tooling/scripts/ci-workflow.test.mjs` fails when `ci.yml` runs any other lint, test, typecheck or check command, and when a check, test or typecheck script in the root or www `package.json` is neither a step nor listed in `manualOnly` with its reason.
- `tooling/scripts/finding-baseline.mjs` owns shrink-only finding baselines. It lists each finding by rule, file and the trimmed text of the line it flags. A finding it does not list fails, `--check` also fails on a listed finding the tree no longer holds, and the copy at the base commit bounds each rule it lists.
- `tooling/oxlint/plate-plugin.mjs` holds 9 `plate/*` rules. Seven run through `tooling/oxlint/plate-baseline.json`, which lists 202 existing findings in 103 files. `plate/mock-spreads-module` fails a test that mocks a `platejs` or `@platejs/*` module without spreading the real module. An exception names its reason, an expiry at most 90 days out and an approver.
- The Plate schema adoption audit passes with its 46 findings from before 2026-10-05 listed in `tooling/scripts/plate-schema-adoption-baseline.json`, which contains that debt and fixes none of it.
- 61 of the 91 `as never` casts in plitejs and platejs source are gone, all type-only. The 10 annotated editor callbacks are gone; the untyped history helpers type their editor as `Editor<Value, readonly [HistoryPlugin]>`, and the hyperscript fixture reader narrows with `isEditor`.
- The two DOCX benchmarks keep their correctness and work-count assertions in the blocking lane. Their wall-clock and memory budgets, and the rewrite of their tracked results, run only under `pnpm bench:docx`.
- The slice fitter keeps an identical replacement whole instead of trimming it to an empty change, which the range guard refused when a paste filled a non-rectangular table fragment.
- `tooling/config/bunTestSetup.ts` sets `_FUMADOCS_MDX=1`, so no Bun test process runs fumadocs codegen into `apps/www/.source` while other test files read it.
- Type-aware lint is clean, with unawaited `editor.api.history.undo()` and `redo()` promises marked `void`.
- Regenerated stale output: `packages/platejs/turbo.json`, `packages/test/turbo.json`, and `plugins.generated.ts` and `plugins.schema.json` under `apps/www/src/registry/components/editor/`.
- `AGENTS.md`'s `## Rules and enforcement` table pairs 28 code rules with their enforcers.

## Open work

- Sync ellie from dotai `b031f2f`, which holds the 11 pstack reflect lessons, once the session that synced it from `a75b503` delivers its commit. owner: zbeyens; tracked: here.
- Codex never routes a twice-corrected mistake to `/pstack:correct` and names a retired Maintain Workflow skill, so it misses every correction rule in the block. owner: sync-pstack; tracked: here.
- Focus and selection ownership plan, then a baseline `plate/*` rule for raw `.focus()` and `removeAllRanges` outside the owner module. owner: next Plan playbook run, started with the word `focus here`; tracked: here.
- Most of `packages/plitejs/test/**` sits outside every typecheck gate (913 errors under `tsconfig.test.json`). owner: verify; tracked: here.
- Untrack `apps/plite/next-env.d.ts` once apps/plite typecheck runs `next typegen`. owner: next correct pass; tracked: here.
- The 5 relative plitejs imports need a facade or `plitejs/internal` export. owner: plate-next; tracked: here.
- Convert the 23 source-text audit reads to lint rules or check scripts. owner: verify through test-audit; tracked: here.
- Move `plugins-static.spec.ts`'s import ban. owner: plate-ui; tracked: here.
- The no-one-off-editor-type baseline holds `BaseEditor`, the React `Editor` and `DOMEditor` definitions. owner: next correct pass; tracked: here.
- Route the docx result writes through `benchmark-artifact.ts`, split `plate-plugin.mjs` before it nears 1,000 lines, and fold timeout constants through identifiers. owner: next correct pass; tracked: here.
- `plite:browser:test:selection` runs in no CI job. owner: verify; tracked: here.
- Prove in the browser that the four undo retry loops catch a batching regression. owner: verify; tracked: here.
- The baseline base check fails open. In CI, `PLATE_BASELINE_BASE` falls back to `github.event.before`, which is all zeros on a new-branch push. owner: next correct pass; tracked: here.
- A baseline keys findings by path, so a moved or split file loses its entries. owner: next correct pass; tracked: here.
- `plate/exception-format` compares expiry against the wall clock, so a green commit can turn red with no code change. owner: zbeyens, who picks changed lines only or a scheduled report; tracked: here.
- A test that fails when a `plate/*` rule has no row in `AGENTS.md`'s rules table, or a row names a rule or step that does not exist. owner: next correct pass; tracked: here.
- Snapshot every path a review prompt names at seat launch, and extract subagent replies with a shared helper. owner: sync-pstack in dotai; tracked: here.
- Record a hash of each evidence file a decision row cites, so a rerun cannot overwrite a receipt unnoticed. owner: sync-pstack in dotai; tracked: here.
- `decisions-check.mjs --help` should print usage, the status words and the `scope:` rule. owner: sync-pstack in dotai; tracked: here.
- `plan-open.mjs` accepts any `owner:` text; require a named owner and a tracked target outside the plan. owner: sync-pstack in dotai; tracked: here.
- A Bash PreToolUse hook that rejects an unquoted word starting with `=`, which zsh expands; it recurred again on 2026-10-05. owner: zbeyens, because it is persistent config; tracked: here.
- A `tooling/scripts` helper that adds a detached base worktree, installs, builds `@platejs/cli`, refuses a dirty tree, runs a command and removes the worktree. owner: next correct pass; tracked: here.
- Update the Plate v2 workflow guide with the plan playbook's Build now control and the build playbook's deviation rule, in a session where its owner can approve reading it. owner: zbeyens, next session; tracked: here.
- Fix the 46 baselined schema adoption findings, starting with the 14 new plugin `.extend()` chains. owner: plate-next; tracked: here.
- Restate the retained-DOCX exact-export p95 budget against its baseline. owner: benchmark; tracked: here.
- Spread the real module in the 35 baselined partial mocks, and give registry specs one editor stub whose `read` is callable. owner: next correct pass; tracked: here.
- Name the code-unit comparator that six files copy, `markdownAttributes.ts` and five in plitejs. owner: next correct pass; tracked: here.
- Sort a sample of the 212 `as unknown as` hits in 91 files under `packages/*/src` into mistakes and deliberate boundary code, then land a baselined `plate/*` lint or record why AGENTS.md's unknown-cast row stays rule-only. owner: next correct pass; tracked: here; stop: that lint lands or the row records why it stays rule-only.
- Ship a disposition checker that takes its files from the run's diff, finds a row for every normative sentence a changed file lost, re-finds every home quote at the end of the run and refuses a delete while a row from that file is unconfirmed. owner: sync-pstack in dotai; tracked: here; stop: the checker ships in dotai and an Audit run uses it, or the owner drops it.
- Count typed uses across every checkout with the same git remote, per argument-hint mode and per plain trigger word, in `audit.mjs`. owner: sync-pstack in dotai; tracked: here; stop: `audit.mjs` prints those counts, or the owner drops it.
- `decisions-check.mjs` refuses a fixed, verified or proven row whose evidence names only session scratch or the transcript. owner: sync-pstack in dotai; tracked: here; stop: the refusal ships, or the owner drops it.
- A helper that prints the typed user messages and the `AskUserQuestion` answers of a session, for the trail brief and the reread of the user's asks. owner: sync-pstack in dotai; tracked: here; stop: the helper ships in `.agents/pstack/`, or the owner drops it.
- `tooling/oxlint/plate-baseline.mjs` and `tooling/scripts/check-plate-schema-adoption.mjs` exit non-zero on an unknown argument, so a bare `check` cannot rewrite a baseline. owner: next correct pass; tracked: here; stop: both scripts exit non-zero on a bare `check`.
- `plan-open.mjs` takes the run's recorded base ref instead of `HEAD`, so an owner commit mid-run cannot hide a closed box. owner: sync-pstack in dotai; tracked: here; stop: `plan-open.mjs` takes a base ref, or the owner drops it.
- `plan-page.mjs` renders a plan that lives outside the repository against the repository's subject files and playbooks, for a read-only stop. owner: sync-pstack in dotai; tracked: here; stop: the renderer accepts such a plan, or the owner drops it.
- `sync-pstack smoke` prints the blob of each instruction file it read, and a row that cites a smoke whose blobs changed reopens. owner: sync-pstack in dotai; tracked: here; stop: smoke prints the blobs, or the owner drops it.
- A check fails when `AGENTS.md`, a playbook or a rule names a dated plan as where work is tracked. owner: next correct pass; tracked: here; stop: the check runs in `pnpm check`, or the owner drops it.
- plan-page says how to republish over a page the session has not read, since the Artifact tool asks for a read first and plan-page forbids reading the published page. owner: sync-pstack in dotai; tracked: here; stop: plan-page says how to republish over an unread page.
- Refresh `tooling/entrypoints/platejs-entrypoint-sizes.json`, which lacks `platejs/combobox/react`, with `pnpm plite:entrypoint-sizes:update` before the next release. owner: release-lanes; tracked: here.
- Pasting `<blockquote><div>First</div><div>Second</div></blockquote>` gives one paragraph, "FirstSecond", and a deliberate spec, `HtmlPlugin.mapping.spec.ts:167`, locks that in. owner: plate-plugins, HTML; tracked: here.
- `TocElementDocx` and `HeadingElementDocx` have no importers since `3e0ab4dd7d`. owner: plate-ui; tracked: here.
- Add a contract test that pastes identical content over a range, so the slice fitter fix cannot regress unnoticed. owner: plitejs slice-fit; tracked: here.
- A baseline's base-commit bound covers only the rules its base copy lists, so hand-added entries for a brand-new rule go unchecked until that rule reaches the base. owner: next correct pass; tracked: here.
